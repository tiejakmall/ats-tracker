// Server-side only — Google Sheets API via Service Account
import { google } from "googleapis";
import { COL, STAGE_COL_MAP, type Candidate } from "./types";

const SHEET_ID   = process.env.SHEET_ID!;
const SHEET_NAME = process.env.SHEET_NAME || "row";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const key   = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  return new google.auth.JWT(email, undefined, key, [
    "https://www.googleapis.com/auth/spreadsheets",
  ]);
}

function getSheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

function fmtDate(v: unknown): string {
  if (!v) return "";
  // Sheets returns serial numbers for dates
  if (typeof v === "number") {
    // Google Sheets date serial → JS Date
    const date = new Date(Math.round((v - 25569) * 86400 * 1000));
    const m = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    return date.getUTCDate() + " " + m[date.getUTCMonth()];
  }
  if (typeof v === "string" && v.trim()) {
    const d = new Date(v);
    if (!isNaN(d.getTime())) {
      const m = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
      return d.getDate() + " " + m[d.getMonth()];
    }
  }
  return "";
}

// ── Read all candidates ────────────────────────────────────────
export async function getCandidates(): Promise<Candidate[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A3:BI`,
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "SERIAL_NUMBER",
  });

  const rows = res.data.values || [];
  const candidates: Candidate[] = [];

  rows.forEach((r, i) => {
    const name = String(r[COL.name] || "").trim();
    if (!name) return;
    candidates.push({
      no:          i + 1,
      email:       String(r[COL.email]       || "").trim(),
      name,
      position:    String(r[COL.position]    || "").trim(),
      source:      String(r[COL.source]      || "").trim(),
      pic:         String(r[COL.pic]         || "").trim(),
      scr:         fmtDate(r[COL.scr]),
      test:        fmtDate(r[COL.test]),
      rcp:         fmtDate(r[COL.rcp]),
      u1res:       fmtDate(r[COL.u1res]),
      usri:        fmtDate(r[COL.usri]),
      offr:        fmtDate(r[COL.offr]),
      finalStatus: String(r[COL.finalStatus] || "").trim(),
      whatsapp:    String(r[COL.whatsapp]    || "").trim(),
      status:      String(r[COL.status]      || "Screening CV").trim(),
    });
  });

  return candidates.reverse();
}

// ── Find row number by email (1-based, row 3+) ────────────────
async function findRowByEmail(email: string): Promise<number | null> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:A`,
  });
  const rows = res.data.values || [];
  for (let i = 2; i < rows.length; i++) {
    if (String(rows[i][0] || "").trim() === email.trim()) {
      return i + 1; // 1-based row number
    }
  }
  return null;
}

// ── Update current stage ───────────────────────────────────────
export async function updateStage(email: string, newStatus: string) {
  const sheets = getSheets();
  const row = await findRowByEmail(email);
  if (!row) throw new Error("Email not found");

  const now = new Date();
  // Sheets API uses 1-based column index
  const statusCol = COL.status + 1; // BI
  const dateCol   = STAGE_COL_MAP[newStatus];

  const requests = [
    // Update status column (BI)
    sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!${colLetter(statusCol)}${row}`,
      valueInputOption: "RAW",
      requestBody: { values: [[newStatus]] },
    }),
  ];

  if (dateCol) {
    // Stamp today's date on the pipeline column
    requests.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!${colLetter(dateCol)}${row}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[now.toLocaleDateString("en-GB")]] },
      })
    );
  }

  await Promise.all(requests);
}

// ── Update final status (BD) ───────────────────────────────────
export async function updateFinalStatus(email: string, finalStatus: string) {
  const sheets = getSheets();
  const row = await findRowByEmail(email);
  if (!row) throw new Error("Email not found");

  const col = COL.finalStatus + 1; // BD
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!${colLetter(col)}${row}`,
    valueInputOption: "RAW",
    requestBody: { values: [[finalStatus]] },
  });
}

// ── Add multiple candidates ────────────────────────────────────
export async function addCandidates(candidates: Array<{
  name: string; email: string; whatsapp: string;
  position: string; source: string; pic: string;
}>) {
  const sheets = getSheets();
  const today  = new Date().toLocaleDateString("en-GB");

  const rowsToAppend = candidates.map(c => {
    const row = new Array(61).fill("");
    row[COL.email]    = c.email.trim();
    row[COL.name]     = c.name.trim();
    row[COL.position] = c.position.trim();
    row[COL.source]   = c.source.trim();
    row[COL.pic]      = c.pic.trim();
    row[COL.scr]      = today;           // F — screening date
    row[COL.whatsapp] = c.whatsapp.trim();
    row[COL.status]   = "Screening CV";  // BI
    return row;
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:BI`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: rowsToAppend },
  });
}

// ── Column letter helper (1-based → "A", "B", ..., "BI") ──────
function colLetter(n: number): string {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
