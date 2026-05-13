// ================================================================
// TalentTrack ATS — Apps Script REST API
// Deploy as Web App: Execute as "Me", Access: "Anyone"
// ================================================================

const CONFIG = {
  SS_ID:      "15fIhJZL3GhgfLEYVJCW1r7B7ipYq1sRHnAFz1mXRKWE",
  SHEET_NAME: "row",
  SECRET:     "GANTI_DENGAN_TOKEN_RAHASIA_KAMU", // sama dengan APPS_SCRIPT_SECRET di .env
};

const COLUMN_MAP = {
  "Screening CV":    6,
  "Submitted Test":  17,
  "Recap to User":   25,
  "User 1 Response": 29,
  "User Interview":  45,
  "Offering":        52,
};

const COL = {
  email:       0,  // A
  name:        1,  // B
  position:    2,  // C
  source:      3,  // D
  pic:         4,  // E
  scr:         5,  // F
  test:        16, // Q
  rcp:         24, // Y
  u1res:       28, // AC
  usri:        44, // AS
  offr:        51, // AZ
  finalStatus: 55, // BD
  whatsapp:    59, // BH
  status:      60, // BI
};

// ── Helpers ────────────────────────────────────────────────────
function getSheet() {
  return SpreadsheetApp.openById(CONFIG.SS_ID).getSheetByName(CONFIG.SHEET_NAME);
}

function json(data, status) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function cors(output) {
  // Apps Script doesn't support custom headers on GET/POST fully,
  // but returning JSON is enough for same-origin Next.js API proxy calls.
  return output;
}

function checkSecret(params) {
  return params.secret === CONFIG.SECRET;
}

function fmtDate(v) {
  if (!v || !(v instanceof Date)) return "";
  const m = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return v.getDate() + " " + m[v.getMonth()];
}

// ── GET dispatcher ─────────────────────────────────────────────
function doGet(e) {
  const p = e.parameter || {};
  if (!checkSecret(p)) return json({ error: "Unauthorized" });

  switch (p.action) {
    case "getCandidates": return json(getCandidates());
    case "getConfig":     return json(getConfig());
    default:              return json({ error: "Unknown action" });
  }
}

// ── POST dispatcher ────────────────────────────────────────────
function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch(_) {}

  if (body.secret !== CONFIG.SECRET) return json({ error: "Unauthorized" });

  switch (body.action) {
    case "updateStatus":   return json(updateStatus(body));
    case "addCandidates":  return json(addCandidates(body));
    case "updateFinal":    return json(updateFinal(body));
    case "sendEmail":      return json(sendEmail(body));
    default:               return json({ error: "Unknown action" });
  }
}

// ── Actions ────────────────────────────────────────────────────

function getCandidates() {
  try {
    const sheet   = getSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow < 3) return { success: true, data: [] };

    const data = sheet.getRange(3, 1, lastRow - 2, 61).getValues();

    const candidates = data.map((r, i) => {
      if (!r[COL.name]) return null;
      return {
        no:          i + 1,
        email:       String(r[COL.email]       || "").trim(),
        name:        String(r[COL.name]        || "").trim(),
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
      };
    }).filter(Boolean).reverse();

    return { success: true, data: candidates };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function getConfig() {
  return {
    success:    true,
    statusList: Object.keys(COLUMN_MAP),
  };
}

function updateStatus({ email, newStatus }) {
  try {
    const sheet    = getSheet();
    const emailCol = sheet.getRange("A:A").getValues();
    const now      = new Date();
    for (let i = 2; i < emailCol.length; i++) {
      if (String(emailCol[i][0]).trim() === String(email).trim()) {
        const row = i + 1;
        sheet.getRange(row, COL.status + 1).setValue(newStatus);
        if (COLUMN_MAP[newStatus]) {
          sheet.getRange(row, COLUMN_MAP[newStatus]).setValue(now);
        }
        return { success: true };
      }
    }
    return { success: false, error: "Email not found" };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function updateFinal({ email, finalStatus }) {
  try {
    const sheet    = getSheet();
    const emailCol = sheet.getRange("A:A").getValues();
    for (let i = 2; i < emailCol.length; i++) {
      if (String(emailCol[i][0]).trim() === String(email).trim()) {
        sheet.getRange(i + 1, COL.finalStatus + 1).setValue(finalStatus);
        return { success: true };
      }
    }
    return { success: false, error: "Email not found" };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function addCandidates({ candidates }) {
  try {
    const sheet = getSheet();
    const now   = new Date();
    candidates.forEach(c => {
      const row = new Array(61).fill("");
      row[COL.email]    = (c.email    || "").trim();
      row[COL.name]     = (c.name     || "").trim();
      row[COL.position] = (c.position || "").trim();
      row[COL.source]   = (c.source   || "").trim();
      row[COL.pic]      = (c.pic      || "").trim();
      row[COL.scr]      = now;
      row[COL.whatsapp] = (c.whatsapp || "").trim();
      row[COL.status]   = "Screening CV";
      sheet.appendRow(row);
    });
    return { success: true, added: candidates.length };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function sendEmail({ recipients }) {
  // recipients = [{ email, name, position, subject, body }]
  const errors = [];
  recipients.forEach(r => {
    try {
      if (!r.email) return;
      const body = (r.body || "")
        .replace(/\[Candidate Name\]/gi, r.name || "")
        .replace(/\[Position\]/gi, r.position || "");
      GmailApp.sendEmail(r.email, r.subject, body);
    } catch(e) {
      errors.push({ email: r.email, error: e.toString() });
    }
  });
  return { success: true, errors };
}
