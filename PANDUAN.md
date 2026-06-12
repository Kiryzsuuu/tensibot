# Panduan Menjalankan Tensi-Bot

## Prasyarat

Pastikan sudah terinstall:
- **Node.js** v18+ (cek: `node --version`)
- **npm** v9+ (cek: `npm --version`)
- **Git** (cek: `git --version`)

---

## Langkah 1 — Clone & Install

```bash
git clone https://github.com/Kiryzsuuu/tensibot.git
cd tensibot
npm install
npm run install:all
```

> `npm run install:all` menginstall dependency backend dan frontend sekaligus.

---

## Langkah 2 — Setup Environment

### Backend (`backend/.env`)

Buat file `backend/.env` dengan isi berikut:

```env
NODE_ENV=development
PORT=4000

# Firebase — ambil dari Firebase Console > Project Settings > Service Accounts
FIREBASE_PROJECT_ID=tensi-bot
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@tensi-bot.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# JWT — bisa pakai string random apa saja, minimal 32 karakter
JWT_SECRET=isi_dengan_string_random_panjang_min_32_karakter
JWT_REFRESH_SECRET=isi_dengan_string_random_lain_min_32_karakter
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d

# AI — pilih salah satu (Groq gratis, Anthropic berbayar)
# Groq: daftar di https://console.groq.com → API Keys → Create
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# Anthropic (opsional, fallback jika GROQ_API_KEY tidak diset)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
CLAUDE_MODEL=claude-sonnet-4-6

FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

Buat file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=Tensi-Bot
```

---

## Langkah 3 — Setup Firebase

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Pilih project **tensi-bot**
3. Klik **Firestore Database** di sidebar kiri
4. Klik **Create database**
5. Pilih **Start in test mode**
6. Pilih region **asia-southeast1 (Jakarta)**
7. Klik **Enable**

---

## Langkah 4 — Buat Akun Admin

Jalankan perintah ini **sekali saja** untuk membuat akun admin pertama:

```bash
cd backend
npm run seed:admin
```

Output yang diharapkan:
```
✅ Admin berhasil dibuat!
   Email   : maskiryz23@gmail.com
   Password: opet123
   Role    : SUPER_ADMIN
```

> Setelah login, segera ganti password melalui halaman Profil.

---

## Langkah 5 — Jalankan Aplikasi

Kembali ke folder root, lalu:

```bash
cd ..        # kembali ke root jika masih di folder backend
npm run dev
```

Tunggu hingga muncul:
```
[backend]  Server running on port 4000
[frontend] ✓ Ready on http://localhost:3000
```

Buka browser: **http://localhost:3000**

---

## Akun Default

| Role | Email | Password |
|------|-------|----------|
| Super Admin | maskiryz23@gmail.com | opet123 |

---

## Struktur URL Aplikasi

| URL | Keterangan |
|-----|------------|
| `http://localhost:3000` | Halaman utama (redirect ke login) |
| `http://localhost:3000/login` | Login |
| `http://localhost:3000/register` | Daftar akun baru |
| `http://localhost:3000/lupa-password` | Lupa password |
| `http://localhost:3000/dashboard` | Dashboard pengguna |
| `http://localhost:3000/monitoring` | Input & riwayat tekanan darah |
| `http://localhost:3000/obat` | Manajemen obat & kepatuhan |
| `http://localhost:3000/chat` | Chatbot AI Tensi-Bot |
| `http://localhost:3000/edukasi` | Artikel edukasi kesehatan |
| `http://localhost:3000/profil` | Profil pengguna |
| `http://localhost:3000/admin/dashboard` | Panel admin |
| `http://localhost:3000/admin/hero` | Kelola hero banner |
| `http://localhost:4000/api/health` | Cek status backend |

---

## Role Pengguna

| Role | Akses |
|------|-------|
| `PASIEN` | Dashboard, monitoring, obat, chat, edukasi, profil |
| `DOKTER` | Sama dengan Pasien |
| `PROFESIONAL` | Sama dengan Pasien |
| `STAF` | Sama dengan Pasien |
| `FARMASI` | Sama dengan Pasien |
| `ADMIN` | Semua fitur + panel admin (hero, konten) |
| `SUPER_ADMIN` | Semua fitur + manajemen pengguna + log admin |

> Role selain `ADMIN` dan `SUPER_ADMIN` tidak melihat menu admin di sidebar.

---

## Perintah Berguna

```bash
# Jalankan dev (frontend + backend sekaligus)
npm run dev

# Install ulang semua dependency
npm run install:all

# Cek error TypeScript
cd backend  && npx tsc --noEmit
cd frontend && npx tsc --noEmit

# Buat ulang akun admin
cd backend && npm run seed:admin

# Build production
npm run build
```

---

## Troubleshooting

### `concurrently is not recognized`
```bash
npm install   # install dari root folder dulu
npm run dev
```

### Backend tidak bisa connect ke Firebase
- Pastikan `FIREBASE_PRIVATE_KEY` di `.env` menggunakan tanda kutip ganda `"..."` dan `\n` tidak diganti newline sungguhan.
- Pastikan Firestore sudah diaktifkan di Firebase Console (Langkah 3).

### Port sudah dipakai
```bash
# Matikan proses di port 3000 atau 4000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <nomor_pid> /F
```

### Login gagal meski password benar
- Pastikan sudah menjalankan `npm run seed:admin`
- Pastikan Firestore sudah aktif

### Chatbot tidak merespons
- Pastikan `GROQ_API_KEY` sudah diisi di `backend/.env`
- Dapatkan API key gratis di [console.groq.com](https://console.groq.com)
