/**
 * Code.gs — backend for the date invitation site.
 *
 * SETUP
 * 1. Create a Google Sheet.
 * 2. In row 1, add these headers exactly:
 *    Timestamp | Name | Response | Selected Date | Selected Time | Activities | Venue | Message
 * 3. Extensions -> Apps Script, delete the placeholder code, paste this file in.
 * 4. Deploy -> New deployment -> Web app.
 *      Execute as: Me
 *      Who has access: Anyone
 * 5. Copy the deployment URL into config.js as `googleAppsScriptUrl`.
 *
 * See README.md for the full walkthrough.
 */

const SHEET_NAME = "Responses"; // change if your sheet tab has a different name
const REQUIRED_FIELDS = ["name", "response", "timestamp"];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: "No data received." });
    }

    const data = JSON.parse(e.postData.contents);

    const missing = REQUIRED_FIELDS.filter((field) => !data[field] || String(data[field]).trim() === "");
    if (missing.length) {
      return jsonResponse({ ok: false, error: `Missing required field(s): ${missing.join(", ")}` });
    }

    const sheet = getOrCreateSheet();

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      sanitize(data.name),
      sanitize(data.response),
      sanitize(data.selectedDate),
      sanitize(data.selectedTime),
      sanitize(data.activities),
      sanitize(data.venue),
      sanitize(data.message),
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// Allows a simple GET health check, e.g. visiting the deployment URL directly.
function doGet(e) {
  return jsonResponse({ ok: true, message: "Date invitation endpoint is live." });
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Timestamp",
      "Name",
      "Response",
      "Selected Date",
      "Selected Time",
      "Activities",
      "Venue",
      "Message",
    ]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sanitize(value) {
  if (value === undefined || value === null) return "";
  // Strip characters that could trigger spreadsheet formula injection.
  const str = String(value);
  return /^[=+\-@]/.test(str) ? `'${str}` : str;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
