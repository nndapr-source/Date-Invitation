/**
 * script.js — all interaction logic.
 * Reads content and data from CONFIG (config.js). You should not
 * need to edit this file to customize the invitation.
 */

(() => {
  "use strict";

  const STORAGE_KEY = "date-invitation:submission";
  const SCREEN_ORDER = [
    "opening",
    "invitation",
    "calendar",
    "activities",
    "venue",
    "summary",
    "response",
    "confirmation",
  ];

  /** ----------------------------------------------------------
   *  STATE
   *  ---------------------------------------------------------- */
  const state = {
    selectedDate: null,       // "YYYY-MM-DD"
    selectedTime: null,
    selectedActivities: [],   // array of activity ids
    responseId: null,
    guestName: "",
    guestMessage: "",
    submitted: false,
  };

  /** ----------------------------------------------------------
   *  HELPERS
   *  ---------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function fillText(selector, text) {
    $$(selector).forEach((el) => (el.textContent = text));
  }

  function setPlaceholder(selector, text) {
    $$(selector).forEach((el) => (el.placeholder = text));
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function dateKey(y, m, d) {
    return `${y}-${pad(m + 1)}-${pad(d)}`;
  }

  function formatFriendlyDate(key) {
    const [y, m, d] = key.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  }

  function formatTime12(t) {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${pad(m)} ${period}`;
  }

  function todayKey() {
    const d = new Date();
    return dateKey(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /** ----------------------------------------------------------
   *  RENDER STATIC COPY FROM CONFIG
   *  ---------------------------------------------------------- */
  function renderStaticCopy() {
    const c = CONFIG;

    fillText("[data-eyebrow]", c.opening.eyebrow);
    fillText("[data-line1]", c.opening.line1);
    fillText("[data-line2]", c.opening.line2);
    fillText("[data-btn-label]", c.opening.buttonLabel);

    fillText("[data-inv-title]", c.invitation.title);
    fillText("[data-inv-message]", c.invitation.message);
    fillText("[data-inv-subtitle]", c.invitation.subtitle);

    fillText("[data-cal-title]", c.calendarCopy.title);
    fillText("[data-cal-subtitle]", c.calendarCopy.subtitle);
    fillText("[data-time-title]", c.calendarCopy.timeTitle);

    fillText("[data-act-title]", c.activitiesCopy.title);
    fillText("[data-act-subtitle]", c.activitiesCopy.subtitle);

    fillText("[data-venue-title]", c.venue.title);
    fillText("[data-venue-name]", c.venue.name);
    fillText("[data-venue-address]", c.venue.address);
    fillText("[data-venue-desc]", c.venue.description);

    fillText("[data-summary-title]", c.summaryCopy.title);
    fillText("[data-summary-confirm-label]", c.summaryCopy.confirmLabel);
    fillText("[data-summary-change-label]", c.summaryCopy.changeLabel);

    fillText("[data-name-title]", c.responseCopy.nameTitle);
    setPlaceholder("[data-name-placeholder]", c.responseCopy.namePlaceholder);
    fillText("[data-response-title]", c.responseCopy.title);
    fillText("[data-message-title]", c.responseCopy.messageTitle);
    setPlaceholder("[data-message-placeholder]", c.responseCopy.messagePlaceholder);
    fillText("[data-submit-label]", c.responseCopy.submitLabel);

    fillText("[data-confirm-calendar-label]", c.confirmation.calendarButtonLabel);
    fillText("[data-confirm-restart-label]", c.confirmation.restartButtonLabel);

    // legend
    const legend = $("[data-legend]");
    const items = [
      ["available", c.calendarCopy.legend.available],
      ["maybe", c.calendarCopy.legend.maybe],
      ["unavailable", c.calendarCopy.legend.unavailable],
    ];
    legend.innerHTML = items
      .map(([key, label]) => {
        const color =
          key === "available" ? "var(--pine)" : key === "maybe" ? "var(--maybe)" : "var(--busy)";
        return `<span><i style="background:${color}"></i>${label}</span>`;
      })
      .join("");
  }

  /** ----------------------------------------------------------
   *  CALENDAR
   *  ---------------------------------------------------------- */
  let calCursor = null; // {year, month} currently displayed

  function getAvailableMonths() {
    const keys = Object.keys(CONFIG.availability).sort();
    if (!keys.length) return [{ year: new Date().getFullYear(), month: new Date().getMonth() }];
    const months = new Set();
    keys.forEach((k) => {
      const [y, m] = k.split("-").map(Number);
      months.add(`${y}-${m - 1}`);
    });
    return Array.from(months)
      .map((s) => {
        const [y, m] = s.split("-").map(Number);
        return { year: y, month: m };
      })
      .sort((a, b) => (a.year - b.year) || (a.month - b.month));
  }

  function initCalendar() {
    const months = getAvailableMonths();
    calCursor = { ...months[0] };
    renderCalendar();

    $("#cal-prev").addEventListener("click", () => shiftMonth(-1));
    $("#cal-next").addEventListener("click", () => shiftMonth(1));
  }

  function shiftMonth(dir) {
    const months = getAvailableMonths();
    const idx = months.findIndex((m) => m.year === calCursor.year && m.month === calCursor.month);
    const next = months[idx + dir];
    if (next) {
      calCursor = { ...next };
      renderCalendar();
    }
  }

  function renderCalendar() {
    const months = getAvailableMonths();
    const idx = months.findIndex((m) => m.year === calCursor.year && m.month === calCursor.month);
    $("#cal-prev").disabled = idx <= 0;
    $("#cal-next").disabled = idx >= months.length - 1;

    const label = new Date(calCursor.year, calCursor.month, 1).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    $("#cal-month-label").textContent = label;

    const grid = $("#calendar-grid");
    grid.innerHTML = "";

    const dowNames = ["S", "M", "T", "W", "T", "F", "S"];
    dowNames.forEach((d) => {
      const el = document.createElement("div");
      el.className = "cal-dow";
      el.textContent = d;
      grid.appendChild(el);
    });

    const firstDow = new Date(calCursor.year, calCursor.month, 1).getDay();
    const daysInMonth = new Date(calCursor.year, calCursor.month + 1, 0).getDate();
    const today = todayKey();

    for (let i = 0; i < firstDow; i++) {
      const filler = document.createElement("div");
      filler.className = "cal-day is-empty";
      grid.appendChild(filler);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const key = dateKey(calCursor.year, calCursor.month, d);
      const entry = CONFIG.availability[key];
      const status = entry ? entry.status : "unavailable";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `cal-day status-${status}`;
      btn.textContent = String(d);
      btn.setAttribute("role", "gridcell");

      if (key < today) {
        btn.classList.add("status-past");
        btn.disabled = true;
      }

      if (status === "available" && key >= today) {
        btn.addEventListener("click", () => selectDate(key, entry));
      } else {
        btn.disabled = btn.disabled || status !== "available";
        btn.setAttribute("aria-disabled", "true");
      }

      if (key === state.selectedDate) btn.classList.add("is-selected");

      grid.appendChild(btn);
    }
  }

  function selectDate(key, entry) {
    state.selectedDate = key;
    state.selectedTime = null;
    renderCalendar();

    $("#picked-line").textContent = CONFIG.calendarCopy.pickedLine;

    const timeSelect = $("#time-select");
    const timeOptions = $("#time-options");
    timeOptions.innerHTML = "";

    (entry.times || []).forEach((t) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "time-pill";
      pill.textContent = formatTime12(t);
      pill.addEventListener("click", () => selectTime(t, pill));
      timeOptions.appendChild(pill);
    });

    timeSelect.hidden = false;
    $("#calendar-continue").hidden = true;
  }

  function selectTime(t, pillEl) {
    state.selectedTime = t;
    $$(".time-pill").forEach((p) => p.classList.remove("is-selected"));
    pillEl.classList.add("is-selected");
    $("#calendar-continue").hidden = false;
  }

  /** ----------------------------------------------------------
   *  ACTIVITIES
   *  ---------------------------------------------------------- */
  function initActivities() {
    const grid = $("#activity-grid");
    grid.innerHTML = "";

    CONFIG.activities.forEach((act) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "activity-card";
      card.dataset.id = act.id;
      card.innerHTML = `
        <span class="icon">${act.icon}</span>
        <span class="title">${act.title}</span>
        <span class="desc">${act.description}</span>
      `;
      card.addEventListener("click", () => toggleActivity(act.id, card));
      grid.appendChild(card);
    });
  }

  function toggleActivity(id, cardEl) {
    const multi = CONFIG.activitiesCopy.multiSelect;

    if (multi) {
      const i = state.selectedActivities.indexOf(id);
      if (i >= 0) {
        state.selectedActivities.splice(i, 1);
        cardEl.classList.remove("is-selected");
      } else {
        state.selectedActivities.push(id);
        cardEl.classList.add("is-selected");
      }
    } else {
      state.selectedActivities = [id];
      $$(".activity-card").forEach((c) => c.classList.remove("is-selected"));
      cardEl.classList.add("is-selected");
    }

    $("#activities-continue").disabled = state.selectedActivities.length === 0;
  }

  /** ----------------------------------------------------------
   *  RESPONSE OPTIONS
   *  ---------------------------------------------------------- */
  function initResponses() {
    const grid = $("#response-grid");
    grid.innerHTML = "";

    CONFIG.responseOptions.forEach((opt) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "response-card";
      card.dataset.id = opt.id;
      card.innerHTML = `
        <span class="icon">${opt.icon}</span>
        <span class="title">${opt.title}</span>
        <span class="desc">${opt.description}</span>
      `;
      card.addEventListener("click", () => {
        state.responseId = opt.id;
        $$(".response-card").forEach((c) => c.classList.remove("is-selected"));
        card.classList.add("is-selected");
      });
      grid.appendChild(card);
    });
  }

  /** ----------------------------------------------------------
   *  SUMMARY
   *  ---------------------------------------------------------- */
  function updateSummary() {
    $("#summary-date").textContent = state.selectedDate
      ? formatFriendlyDate(state.selectedDate)
      : "—";
    $("#summary-time").textContent = state.selectedTime
      ? formatTime12(state.selectedTime)
      : "—";

    const activityTitles = state.selectedActivities
      .map((id) => CONFIG.activities.find((a) => a.id === id))
      .filter(Boolean);

    $("#summary-activity-icon").textContent = activityTitles[0]?.icon || "✨";
    $("#summary-activity").textContent =
      activityTitles.length ? activityTitles.map((a) => a.title).join(" + ") : "—";

    $("#summary-venue").textContent = CONFIG.venue.name;
  }

  /** ----------------------------------------------------------
   *  GOOGLE CALENDAR LINK
   *  ---------------------------------------------------------- */
  function buildGoogleCalendarUrl() {
    if (!state.selectedDate || !state.selectedTime) return "#";

    const [y, m, d] = state.selectedDate.split("-").map(Number);
    const [h, min] = state.selectedTime.split(":").map(Number);

    const start = new Date(y, m - 1, d, h, min);
    const end = new Date(start.getTime() + CONFIG.calendar.durationMinutes * 60000);

    const fmt = (dt) =>
      `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(
        dt.getMinutes()
      )}00`;

    const title = CONFIG.calendar.titleTemplate.replace(
      "{inviterName}",
      CONFIG.person.inviterName
    );

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      dates: `${fmt(start)}/${fmt(end)}`,
      details: CONFIG.calendar.description,
      location: CONFIG.venue.address || CONFIG.venue.name,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /** ----------------------------------------------------------
   *  FORM SUBMISSION
   *  ---------------------------------------------------------- */
  function checkPriorSubmission() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function initResponseSection() {
    const prior = checkPriorSubmission();
    if (prior) {
      $("#already-answered").hidden = false;
      $("#already-answered").textContent = "Looks like you've already answered 👀";
      $("#guest-name").value = prior.name || "";
      $("#guest-message").value = prior.message || "";
    }

    $("#submit-response").addEventListener("click", handleSubmit);
  }

  async function handleSubmit() {
    const nameInput = $("#guest-name");
    const errorEl = $("#form-error");
    errorEl.hidden = true;

    state.guestName = nameInput.value.trim();
    state.guestMessage = $("#guest-message").value.trim();

    if (!state.guestName) {
      errorEl.textContent = "I need your name first.";
      errorEl.hidden = false;
      nameInput.focus();
      return;
    }
    if (!state.responseId) {
      errorEl.textContent = "Pick one of the options above.";
      errorEl.hidden = false;
      return;
    }

    const submitBtn = $("#submit-response");
    submitBtn.disabled = true;

    const activityTitles = state.selectedActivities
      .map((id) => CONFIG.activities.find((a) => a.id === id)?.title)
      .filter(Boolean)
      .join(", ");

    const payload = {
      name: state.guestName,
      response: state.responseId,
      selectedDate: state.selectedDate || "",
      selectedTime: state.selectedTime || "",
      activities: activityTitles,
      venue: CONFIG.venue.name,
      message: state.guestMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      if (CONFIG.googleAppsScriptUrl && CONFIG.googleAppsScriptUrl !== "YOUR_GOOGLE_APPS_SCRIPT_URL") {
        await fetch(CONFIG.googleAppsScriptUrl, {
          method: "POST",
          mode: "no-cors", // Apps Script web apps don't return readable CORS headers by default
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      state.submitted = true;
      showConfirmation();
    } catch (err) {
      errorEl.textContent = "Something went wrong sending that — mind trying again?";
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
    }
  }

  function showConfirmation() {
    const c = CONFIG.confirmation;
    let title = c.titleIn;
    let line = c.lineIn;

    if (state.responseId === "maybe") {
      title = c.titleMaybe;
      line = c.lineMaybe;
    } else if (state.responseId === "out") {
      title = c.titleOut;
      line = c.lineOut;
    }

    $("#confirm-title").textContent = title;
    $("#confirm-line").textContent = line;

    const calBtn = $("#confirm-calendar-btn");
    calBtn.style.display = state.responseId === "out" ? "none" : "inline-flex";

    goToSection("confirmation");
  }

  /** ----------------------------------------------------------
   *  WIRING: nav buttons, music, scroll reveal, progress thread
   *  ---------------------------------------------------------- */
  /** ----------------------------------------------------------
   *  SCREEN NAVIGATION (click-through, not scroll-through)
   *  ---------------------------------------------------------- */
  let currentScreenId = "opening";

  function goToSection(targetId) {
    if (targetId === currentScreenId) return;
    const current = document.getElementById(currentScreenId);
    const target = document.getElementById(targetId);
    if (!target) return;

    if (targetId === "summary") updateSummary();

    if (current) current.classList.remove("is-active");
    target.classList.add("is-active");
    currentScreenId = targetId;

    // (re)play the entrance animation on this screen's content
    $$(".reveal, .reveal-on-scroll", target).forEach((el) => {
      el.classList.remove("is-visible");
      // force reflow so the transition replays every visit
      void el.offsetWidth;
      el.classList.add("is-visible");
    });

    updateStepDots();

    // keep any inner scroll (e.g. a tall calendar) reset to the top
    target.scrollTop = 0;

    // move focus to the new screen's heading for keyboard/screen-reader users
    const heading = target.querySelector("h1, h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }

  function initScrollButtons() {
    $$("[data-goto]").forEach((btn) => {
      btn.addEventListener("click", () => {
        goToSection(btn.getAttribute("data-goto"));
      });
    });

    $("[data-open-next]")?.addEventListener("click", () => goToSection("invitation"));
    $("#calendar-continue").addEventListener("click", () => goToSection("activities"));
    $("#activities-continue").addEventListener("click", () => goToSection("venue"));

    $("#confirm-calendar-btn").addEventListener("click", () => {
      const url = buildGoogleCalendarUrl();
      window.open(url, "_blank", "noopener");
    });

    $("#confirm-restart-btn").addEventListener("click", () => goToSection("opening"));
  }

  /** ----------------------------------------------------------
   *  STEP DOTS (signature progress indicator)
   *  ---------------------------------------------------------- */
  const DOT_SCREENS = SCREEN_ORDER.filter((id) => id !== "confirmation");

  function initStepDots() {
    const wrap = $("#step-dots");
    wrap.innerHTML = DOT_SCREENS.map((id) => `<span class="dot" data-dot="${id}"></span>`).join("");
    updateStepDots();
  }

  function updateStepDots() {
    const wrap = $("#step-dots");
    if (!wrap) return;
    wrap.hidden = currentScreenId === "confirmation";
    const currentIdx = DOT_SCREENS.indexOf(currentScreenId);
    $$(".dot", wrap).forEach((dot, i) => {
      dot.classList.toggle("is-current", i === currentIdx);
      dot.classList.toggle("is-done", i < currentIdx);
    });
  }

  function initMusic() {
    const cfg = CONFIG.music;
    const toggle = $("#music-toggle");
    const audio = $("#bg-music");

    if (!cfg || !cfg.enabled || !cfg.file) {
      toggle.hidden = true;
      return;
    }

    audio.src = cfg.file;
    let playing = false;

    toggle.addEventListener("click", () => {
      if (playing) {
        audio.pause();
      } else {
        audio.play().catch(() => {
          /* autoplay / play blocked — user can try again */
        });
      }
      playing = !playing;
      toggle.setAttribute("aria-pressed", String(playing));
    });
  }

  function initRevealAnimations() {
    // The opening screen is visible on first paint, so trigger its
    // entrance animation immediately. Every other screen's animation
    // is (re)triggered inside goToSection() when it becomes active.
    requestAnimationFrame(() => {
      $$(".reveal, .reveal-on-scroll", document.getElementById("opening")).forEach((el) =>
        el.classList.add("is-visible")
      );
    });
  }

  /** ----------------------------------------------------------
   *  INIT
   *  ---------------------------------------------------------- */
  function init() {
    if (typeof CONFIG === "undefined") {
      console.error("config.js failed to load before script.js");
      return;
    }
    document.getElementById("opening").classList.add("is-active");
    renderStaticCopy();
    initCalendar();
    initActivities();
    initResponses();
    initResponseSection();
    initScrollButtons();
    initStepDots();
    initMusic();
    initRevealAnimations();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
