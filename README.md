# TalentTrack ATS — Next.js + Apps Script

Arsitektur: **Next.js (Vercel)** sebagai frontend + **Apps Script** sebagai JSON API backend + email sender.

---

## Step 1 — Setup Apps Script

1. Buka spreadsheet kamu di Google Sheets
2. **Extensions → Apps Script**
3. Hapus semua code yang ada, paste isi `Code.gs` dari folder ini
4. **Ganti** `CONFIG.SECRET` dengan token rahasia buatan kamu sendiri (contoh: `"ats2026-rahasia-xyz"`)
5. Klik **Deploy → New Deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Klik **Deploy** → copy URL-nya (format: `https://script.google.com/macros/s/XXXX/exec`)

> ⚠️ Setiap kali kamu edit Code.gs, kamu harus **New Deployment** (bukan edit existing) supaya perubahan berlaku.

---

## Step 2 — Setup Next.js lokal

```bash
cd ats-vercel
npm install
```

Buat file `.env.local` (sudah ada template-nya):
```
APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
APPS_SCRIPT_SECRET=token-rahasia-yang-sama-dengan-Code.gs
```

Jalankan dev server:
```bash
npm run dev
# buka http://localhost:3000
```

---

## Step 3 — Deploy ke Vercel

### Opsi A: Via GitHub (recommended)
1. Push folder `ats-vercel` ke GitHub repo baru
2. Buka [vercel.com](https://vercel.com) → **New Project** → import repo
3. Di bagian **Environment Variables**, tambahkan:
   - `APPS_SCRIPT_URL` = URL dari Step 1
   - `APPS_SCRIPT_SECRET` = token rahasia kamu
4. Klik **Deploy** — selesai!

### Opsi B: Via Vercel CLI
```bash
npm i -g vercel
cd ats-vercel
vercel
# ikuti instruksinya, masukkan env vars saat diminta
```

---

## Catatan penting

- **Email** dikirim dari akun Google yang men-deploy Apps Script. Pastikan akun itu punya akses Gmail.
- **Secret token** di `Code.gs` dan `.env.local` harus **sama persis**.
- **Kolom sheet** (konfirmasi di Code.gs bagian `const COL`):
  - A = Email, B = Name, C = Position, D = Source, E = PIC
  - F = Screening date, Q = Test, Y = Recap, AC = U1 Res, AS = Interview, AZ = Offering
  - BD = Final Status, BH = WhatsApp, BI = Current Stage
- Kalau kolom beda, tinggal update angkanya di `const COL` (0-based index).
