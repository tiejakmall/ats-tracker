# TalentTrack ATS — Setup Guide

## Arsitektur
- **Vercel (Next.js)** → baca/tulis Google Sheet via Google Sheets API (cepat, no cold start)
- **Apps Script** → kirim email via GmailApp (tetap pakai akun Google kamu)

---

## STEP 1 — Google Cloud Console (Service Account)

### 1.1 Buat Project
1. Buka https://console.cloud.google.com
2. Klik dropdown project (pojok kiri atas) → **New Project**
3. Nama bebas, misal `ats-tracker` → **Create**

### 1.2 Enable Google Sheets API
1. Di menu kiri: **APIs & Services → Library**
2. Search "Google Sheets API" → klik → **Enable**

### 1.3 Buat Service Account
1. Di menu kiri: **APIs & Services → Credentials**
2. Klik **+ Create Credentials → Service Account**
3. Isi nama, misal `ats-service` → **Create and Continue → Done**

### 1.4 Download JSON Key
1. Di halaman Credentials, klik service account yang baru dibuat
2. Tab **Keys → Add Key → Create new key → JSON → Create**
3. File JSON otomatis terdownload — **simpan baik-baik!**

### 1.5 Share spreadsheet ke Service Account
1. Buka file JSON yang didownload, cari field `"client_email"` — copy emailnya
   (formatnya: `ats-service@your-project.iam.gserviceaccount.com`)
2. Buka Google Spreadsheet kamu → klik **Share**
3. Paste email service account → pilih role **Editor** → **Send**

---

## STEP 2 — Apps Script (untuk email)

1. Buka spreadsheet → **Extensions → Apps Script**
2. Hapus semua code, paste isi `Code.gs`
3. Ganti `SECRET` dengan string bebas, misal `ats2026secret`
4. **Deploy → New Deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Klik **Deploy** → authorize → copy URL-nya

---

## STEP 3 — Upload ke GitHub & Deploy Vercel

### Upload ke GitHub
Sama seperti sebelumnya — pakai GitHub Desktop, copy semua file ke folder repo, commit & push.

### Environment Variables di Vercel
Buka project di Vercel → **Settings → Environment Variables**, tambahkan:

| Name | Value | Cara dapat |
|------|-------|------------|
| `SHEET_ID` | `15fIhJZL3GhgfLEY...` | Dari URL spreadsheet: `/d/XXXX/edit` |
| `SHEET_NAME` | `row` | Nama tab sheet kamu |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `ats-service@....iam.gserviceaccount.com` | Field `client_email` di JSON key |
| `GOOGLE_PRIVATE_KEY` | `-----BEGIN RSA PRIVATE KEY-----\nXXXX...` | Field `private_key` di JSON key — copy apa adanya termasuk `\n` |
| `APPS_SCRIPT_URL` | `https://script.google.com/macros/s/XXX/exec` | URL dari Step 2 |
| `APPS_SCRIPT_SECRET` | `ats2026secret` | Harus sama persis dengan yang di Code.gs |

> ⚠️ Untuk `GOOGLE_PRIVATE_KEY`: copy nilai field `private_key` dari JSON **termasuk tanda kutip di awal dan akhir**. Vercel akan handle newline-nya otomatis.

Setelah semua env vars diisi → **Redeploy** (atau push commit baru ke GitHub).

---

## Catatan kolom sheet
Konfirmasi di `lib/types.ts` bagian `COL` — index 0-based:
- A(0)=Email, B(1)=Name, C(2)=Position, D(3)=Source, E(4)=PIC
- F(5)=Screening, Q(16)=Test, Y(24)=Recap, AC(28)=U1Res, AS(44)=Interview, AZ(51)=Offering
- BD(55)=Final Status, BH(59)=WhatsApp, BI(60)=Current Stage

Kalau kolom beda, ubah angkanya di `lib/types.ts`.
