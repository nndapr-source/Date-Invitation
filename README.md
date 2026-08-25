# A Little Invitation

A one-page, interactive "will you go on a date with me" website. Mobile-first,
no backend framework, no build step — just HTML/CSS/JS plus a free Google
Sheet as the response database.

---

## 1. What's in here

```
/
├── index.html                 the whole site (one page, several scroll sections)
├── style.css                  all styling
├── script.js                  all interaction logic — you shouldn't need to touch this
├── config.js                  ← EDIT THIS to make the site yours
├── assets/
│   ├── images/                drop photos here, reference them in config.js
│   ├── videos/
│   └── music/                 optional background track (mp3)
├── google-apps-script/
│   └── Code.gs                backend that writes responses into a Google Sheet
├── .github/workflows/deploy.yml   auto-deploy to GitHub Pages on push
└── README.md
```

## 2. Make it yours — `config.js`

Everything you'd want to change (names, the ask, the calendar, the venue,
the activities, all the copy) lives in **`config.js`**. Open it and edit the
values — you don't need to know JavaScript beyond changing text inside
quotes.

Key sections to fill in:

- `person` — your name.
- `availability` — every date you're offering, and whether it's
  `"available"` (pick a day + time), `"maybe"`, or `"unavailable"`. Only
  `"available"` days need a `times` array.
- `venue` — name, address, and a short description of the spot.
- `activities` — the date ideas shown as cards. Add, remove, or edit freely.
- `googleAppsScriptUrl` — see step 3 below.
- `music` — set `enabled: true` and point `file` at an mp3 in
  `assets/music/` if you want a soundtrack. Autoplay-with-sound is blocked
  by mobile browsers, so this is a toggle button, not autoplay.

## 3. Set up the response database (Google Sheets + Apps Script)

Every submission (name, response, chosen date/time, activity, message) gets
appended as a new row to a Google Sheet you own. No paid service required.

**Step 1 — Create the sheet**
Go to [sheets.google.com](https://sheets.google.com) and create a new,
blank spreadsheet.

**Step 2 — Add headers**
In row 1, add these column headers exactly:

```
Timestamp | Name | Response | Selected Date | Selected Time | Activities | Venue | Message
```

(The script will also create these automatically the first time it runs, if
you skip this step.)

**Step 3 — Open the script editor**
In the sheet, go to **Extensions → Apps Script**. Delete the placeholder
`function myFunction() {}` code, and paste in the full contents of
`google-apps-script/Code.gs` from this repo.

**Step 4 — Deploy as a web app**
Click **Deploy → New deployment**. Choose type **Web app**, then set:

- **Execute as:** Me
- **Who has access:** Anyone

Click **Deploy** and authorize the script when prompted (it only needs
access to this one spreadsheet).

**Step 5 — Copy the URL**
After deploying, copy the **web app URL** it gives you
(`https://script.google.com/macros/s/XXXXXXXX/exec`).

**Step 6 — Paste it into `config.js`**

```javascript
googleAppsScriptUrl: "https://script.google.com/macros/s/XXXXXXXX/exec",
```

**Step 7 — Test it**
Open the site, fill out the response section, and submit. Check the sheet —
a new row should appear within a few seconds.

> If you ever update `Code.gs`, you need to create a **new deployment** (or
> deploy a new version of the existing one) for the changes to go live —
> saving the script alone isn't enough.

## 4. Add photos or music (optional)

Drop image files into `assets/images/` and video into `assets/videos/`,
then reference their paths from `config.js` under `media`. Keep file sizes
reasonable (compress photos, keep videos short) since everything loads over
mobile data too.

## 5. Deploy it (GitHub Pages)

1. Create a new GitHub repository and push this folder to it.
2. In the repo, go to **Settings → Pages**, and under **Build and
   deployment → Source**, choose **GitHub Actions**.
3. Push to `main` — the included workflow
   (`.github/workflows/deploy.yml`) will build and publish the site
   automatically. Your URL will look like
   `https://<username>.github.io/<repo-name>/`.

No server, no build tools, no environment variables required — it's a
static site.

## 6. Security notes

- The Google Apps Script URL is meant to be public — the browser needs it
  to submit data. It only allows writing new rows, never reading the
  sheet back.
- Never put real credentials, API keys, or OAuth secrets in `config.js` —
  none are needed for this project.
- The script does basic validation (name, response, and timestamp are
  required) and sanitizes fields so they can't be used to inject
  spreadsheet formulas.

## 7. Local preview

No build step needed — just open `index.html` in a browser, or serve the
folder locally:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.
