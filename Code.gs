// ================================================================
// TalentTrack ATS — Apps Script (Email only)
// Deploy sebagai Web App: Execute as "Me", Access: "Anyone"
// ================================================================

const SECRET = "ats2026secret"; // Ganti, harus sama dengan APPS_SCRIPT_SECRET di Vercel

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch(_) {}

  if (body.secret !== SECRET) {
    return ContentService.createTextOutput(JSON.stringify({ success:false, error:"Unauthorized" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (body.action === "sendEmail") {
    return ContentService.createTextOutput(JSON.stringify(sendEmails(body.recipients)))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ success:false, error:"Unknown action" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendEmails(recipients) {
  // recipients: [{ email, name, position, subject, body }]
  const errors = [];
  (recipients || []).forEach(function(r) {
    try {
      if (!r.email) return;
      var body = (r.body || "")
        .replace(/\[Candidate Name\]/gi, r.name || "")
        .replace(/\[Position\]/gi, r.position || "");
      GmailApp.sendEmail(r.email, r.subject || "(no subject)", body);
    } catch(e) {
      errors.push({ email: r.email, error: e.toString() });
    }
  });
  return { success: true, sent: (recipients||[]).length - errors.length, errors: errors };
}

// doGet diperlukan agar Apps Script tidak error saat diakses via browser
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ status:"ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
