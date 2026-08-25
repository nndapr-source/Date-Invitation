/**
 * ============================================================
 *  CONFIG.JS — edit this file, nothing else, to make this
 *  invitation your own.
 * ============================================================
 *
 *  Everything visible on the site — names, copy, the calendar,
 *  the venue, the music — is pulled from this one object.
 *  You do not need to touch index.html, style.css or script.js.
 * ============================================================
 */

const CONFIG = {

  // ----------------------------------------------------------
  // WHO
  // ----------------------------------------------------------
  person: {
    inviterName: "Nanda",     // you
    guestName: "Tya" ,          // leave blank to just ask for it on the page
  },

  // ----------------------------------------------------------
  // OPENING SCREEN
  // ----------------------------------------------------------
  opening: {
    eyebrow: "A little invitation",
    line1: "Hello, Tya.",
    line2: "I have a question for you.",
    buttonLabel: "Okay, I'm curious",
  },

  // ----------------------------------------------------------
  // THE ASK
  // ----------------------------------------------------------
  invitation: {
    title: "So... I was thinking.",
    message: "We should probably go on a date.",
    subtitle: "What do you think?",
    buttonLabel: "Keep going",
  },

  // ----------------------------------------------------------
  // AVAILABILITY CALENDAR
  // status: "available" | "maybe" | "unavailable"
  // only "available" days need a `times` array
  // ----------------------------------------------------------
  availability: {
    "2026-08-28": { status: "unavailable" },
    "2026-08-29": { status: "unavailable", 
    "2026-08-30": { status: "available" }, times: ["09:00", "10:00", "11:00"] },
    "2026-08-31": { status: "unavailable",
    "2026-09-01": { status: "unavailable" },
    "2026-09-02": { status: "unavailable" },
    "2026-09-03": { status: "unavailable" },
    "2026-09-04": { status: "available", times: ["17:30", "19:30"] },
    "2026-09-05": { status: "available" }, times: ["09:00", "10:00", "11:00"] },
    "2026-09-06": { status: "available" }, times: ["09:00", "10:00", "11:00"] },
  },

  calendarCopy: {
    title: "When are you free?",
    subtitle: "Pick a day that works for you.",
    pickedLine: "Looks like we have a date 👀",
    legend: {
      available: "free",
      maybe: "maybe",
      unavailable: "busy",
    },
    timeTitle: "What time works for you?",
  },

  // ----------------------------------------------------------
  // ACTIVITIES
  // set `multiSelect: true` to allow choosing more than one
  // ----------------------------------------------------------
  activitiesCopy: {
    title: "What should we do?",
    subtitle: "Pick your kind of date.",
    multiSelect: false,
  },

  activities: [
    {
      id: "coffee",
      title: "Coffee",
      icon: "☕",
      description: "Grab some coffee and talk about random things.",
    },
    {
      id: "dinner",
      title: "Dinner",
      icon: "🍝",
      description: "Find somewhere actually good to eat.",
    },
    {
      id: "walk",
      title: "Walk",
      icon: "🌆",
      description: "No particular destination. Just vibes.",
    },
    {
      id: "movie",
      title: "Movie",
      icon: "🎬",
      description: "A movie and questionable snack choices.",
    },
    {
      id: "surprise",
      title: "Surprise",
      icon: "✨",
      description: "You won't know until we get there.",
    },
  ],

  // ----------------------------------------------------------
  // VENUE
  // ----------------------------------------------------------
  venue: {
    title: "Where are we going?",
    name: "Tanamera Coffee, SCBD",
    address: "Jl. Jend. Sudirman Kav 52-53, Jakarta Selatan",
    description: "Quiet corner table, good light, better coffee. I already have a spot in mind.",
  },

  // ----------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------
  summaryCopy: {
    title: "Our Date",
    confirmLabel: "Yes, this sounds good",
    changeLabel: "Change something",
  },

  // ----------------------------------------------------------
  // GOOGLE CALENDAR EVENT
  // ----------------------------------------------------------
  calendar: {
    titleTemplate: "A date with {inviterName}",   // {inviterName} gets replaced
    durationMinutes: 120,
    description: "Looking forward to seeing you.",
    buttonLabel: "Save our date to Google Calendar",
  },

  // ----------------------------------------------------------
  // RESPONSE / "RSVP"
  // ----------------------------------------------------------
  responseCopy: {
    title: "So... are you in?",
    nameTitle: "First things first... what's your name?",
    namePlaceholder: "Your name",
    messageTitle: "Anything you want to say?",
    messagePlaceholder: "Leave me a little message...",
    submitLabel: "Send it",
  },

  responseOptions: [
    { id: "in", icon: "🤝", title: "I'm in", description: "Yes, let's do this." },
    { id: "maybe", icon: "👀", title: "Maybe", description: "Let me check my schedule." },
    { id: "out", icon: "🥲", title: "Can't make it", description: "Unfortunately, I can't this time." },
  ],

  // ----------------------------------------------------------
  // CONFIRMATION SCREEN
  // ----------------------------------------------------------
  confirmation: {
    titleIn: "It's a date. ✨",
    lineIn: "See you soon. I'm looking forward to it.",
    titleMaybe: "Noted. 👀",
    lineMaybe: "Let me know when you figure out your schedule.",
    titleOut: "No worries at all.",
    lineOut: "Thanks for letting me know — the offer stands whenever.",
    calendarButtonLabel: "Save it to Google Calendar",
    restartButtonLabel: "Back to the beginning",
  },

  // ----------------------------------------------------------
  // BACKEND — Google Apps Script Web App URL
  // (see README.md for how to set this up)
  // ----------------------------------------------------------
  googleAppsScriptUrl: "YOUR_GOOGLE_APPS_SCRIPT_URL",

  // ----------------------------------------------------------
  // MUSIC
  // ----------------------------------------------------------
  music: {
    enabled: false,
    file: "assets/music/background.mp3",
  },

  // ----------------------------------------------------------
  // MEDIA (optional hero / gallery images)
  // add file paths here if you drop images into assets/images
  // ----------------------------------------------------------
  media: {
    heroImage: "",       // e.g. "assets/images/hero.jpg"
    gallery: [],          // e.g. ["assets/images/1.jpg", "assets/images/2.jpg"]
  },
};
