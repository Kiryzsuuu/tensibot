# API Endpoints Reference — Tensi-Bot
# Base URL: http://localhost:4000/api

## Auth (/api/auth)

| Method | Endpoint              | Auth | Body                              | Deskripsi                    |
|--------|-----------------------|------|-----------------------------------|------------------------------|
| POST   | /auth/register        | -    | email, password, fullName         | Daftar akun baru             |
| POST   | /auth/login           | -    | email, password                   | Login, dapat access+refresh token |
| POST   | /auth/refresh         | -    | refreshToken                      | Perbarui access token        |
| POST   | /auth/logout          | ✓    | -                                 | Invalidasi refresh token     |
| POST   | /auth/verify-email    | -    | token                             | Verifikasi email             |
| POST   | /auth/forgot-password | -    | email                             | Kirim email reset password   |
| POST   | /auth/reset-password  | -    | token, newPassword                | Reset password dengan token  |

## User & Profile (/api/users)

| Method | Endpoint              | Auth | Role  | Deskripsi                        |
|--------|-----------------------|------|-------|----------------------------------|
| GET    | /users/me             | ✓    | USER  | Ambil profil pengguna sendiri    |
| PUT    | /users/me             | ✓    | USER  | Update profil (nama, BB, dll.)   |
| PUT    | /users/me/password    | ✓    | USER  | Ganti password                   |
| PUT    | /users/me/notification-prefs | ✓ | USER | Update preferensi notifikasi   |
| DELETE | /users/me             | ✓    | USER  | Hapus akun (soft delete)         |

## Blood Pressure (/api/blood-pressure)

| Method | Endpoint              | Auth | Body/Query                        | Deskripsi                        |
|--------|-----------------------|------|-----------------------------------|----------------------------------|
| POST   | /blood-pressure       | ✓    | systolic, diastolic, pulse?, measuredAt, notes? | Catat pengukuran baru |
| GET    | /blood-pressure       | ✓    | ?from=&to=&limit=&page=           | Riwayat pengukuran dengan paginasi |
| GET    | /blood-pressure/latest | ✓   | -                                 | Pengukuran terakhir              |
| GET    | /blood-pressure/stats | ✓    | ?period=7d|30d|3m|6m|1y           | Statistik: avg, min, max, trend  |
| GET    | /blood-pressure/chart | ✓    | ?period=7d|30d                    | Data untuk grafik (format chart-friendly) |
| PUT    | /blood-pressure/:id   | ✓    | systolic?, diastolic?, notes?     | Update catatan (hanya notes)     |
| DELETE | /blood-pressure/:id   | ✓    | -                                 | Hapus catatan (soft delete)      |
| GET    | /blood-pressure/export | ✓   | ?from=&to=&format=pdf             | Export laporan PDF               |

## Chat / Chatbot AI (/api/chat)

| Method | Endpoint              | Auth | Body/Query                        | Deskripsi                        |
|--------|-----------------------|------|-----------------------------------|----------------------------------|
| POST   | /chat/sessions        | ✓    | -                                 | Mulai sesi chat baru             |
| GET    | /chat/sessions        | ✓    | ?limit=&page=                     | Daftar riwayat sesi chat         |
| GET    | /chat/sessions/:id    | ✓    | -                                 | Detail sesi + semua pesan        |
| POST   | /chat/sessions/:id/messages | ✓ | message                        | Kirim pesan, dapat respons AI    |
| PUT    | /chat/sessions/:id/rating | ✓ | rating (1-5)                    | Beri rating sesi                 |
| DELETE | /chat/sessions/:id    | ✓    | -                                 | Hapus sesi chat                  |

**Catatan Chat API:**
- Endpoint `/messages` melakukan streaming response (SSE) untuk UX yang lebih baik
- Setiap request ke Claude API menyertakan: system prompt + profil pengguna + riwayat BP terbaru + 10 pesan terakhir sesi
- Rate limit: 10 pesan/menit per pengguna

## Medications (/api/medications)

| Method | Endpoint                        | Auth | Body/Query                        | Deskripsi                          |
|--------|---------------------------------|------|-----------------------------------|------------------------------------|
| GET    | /medications/reference          | ✓    | ?search=                          | Database referensi obat            |
| GET    | /medications/my                 | ✓    | ?isActive=true                    | Daftar obat pengguna               |
| POST   | /medications/my                 | ✓    | medicationId, dose, frequency, scheduleTimes[] | Tambah obat  |
| PUT    | /medications/my/:id             | ✓    | dose?, frequency?, scheduleTimes? | Update jadwal obat                 |
| DELETE | /medications/my/:id             | ✓    | -                                 | Nonaktifkan obat (soft delete)     |
| GET    | /medications/logs               | ✓    | ?from=&to=                        | Riwayat log kepatuhan              |
| POST   | /medications/logs/:logId/confirm | ✓   | status, takenAt?, skipReason?     | Konfirmasi minum/skip obat         |
| GET    | /medications/compliance         | ✓    | ?period=7d|30d                    | Statistik kepatuhan (%)            |

## Content & Edukasi (/api/content)

| Method | Endpoint              | Auth | Query                             | Deskripsi                        |
|--------|-----------------------|------|-----------------------------------|----------------------------------|
| GET    | /content/articles     | -    | ?category=&type=&search=&page=    | Daftar artikel publik            |
| GET    | /content/articles/:slug | -  | -                                 | Detail artikel                   |
| POST   | /content/bookmarks/:articleId | ✓ | -                            | Bookmark artikel                 |
| DELETE | /content/bookmarks/:articleId | ✓ | -                            | Hapus bookmark                   |
| GET    | /content/bookmarks    | ✓    | -                                 | Daftar artikel yang di-bookmark  |

## Notifications (/api/notifications)

| Method | Endpoint                    | Auth | Body/Query    | Deskripsi                           |
|--------|-----------------------------|------|---------------|-------------------------------------|
| POST   | /notifications/subscribe    | ✓    | endpoint, p256dh, auth | Daftarkan Web Push subscription |
| GET    | /notifications              | ✓    | ?isRead=&limit= | Daftar notifikasi pengguna        |
| PUT    | /notifications/:id/read     | ✓    | -             | Tandai notifikasi sudah dibaca      |
| PUT    | /notifications/read-all     | ✓    | -             | Tandai semua sudah dibaca           |

## Admin (/api/admin) — Butuh role ADMIN_HEALTH atau SUPER_ADMIN

| Method | Endpoint                    | Auth | Role          | Deskripsi                           |
|--------|-----------------------------|------|---------------|-------------------------------------|
| GET    | /admin/dashboard            | ✓    | ADMIN+        | KPI utama: DAU, MAU, total user, dll. |
| GET    | /admin/users                | ✓    | ADMIN+        | Daftar semua pengguna dengan filter |
| GET    | /admin/users/:id            | ✓    | ADMIN+        | Detail lengkap pengguna tertentu    |
| PUT    | /admin/users/:id/status     | ✓    | ADMIN+        | Aktif/suspend akun pengguna         |
| GET    | /admin/health-data          | ✓    | ADMIN+        | Agregat data BP seluruh pengguna    |
| GET    | /admin/reports/daily        | ✓    | ADMIN+        | Laporan harian                      |
| GET    | /admin/reports/weekly       | ✓    | ADMIN+        | Laporan mingguan                    |
| GET    | /admin/reports/monthly      | ✓    | ADMIN+        | Laporan bulanan                     |
| GET    | /admin/reports/at-risk      | ✓    | ADMIN+        | Pengguna dengan BP konsisten tinggi |
| POST   | /admin/broadcast            | ✓    | ADMIN+        | Kirim notifikasi ke semua/segmen user |
| GET    | /admin/content              | ✓    | ADMIN_CONTENT | Daftar semua konten (termasuk draft)|
| POST   | /admin/content              | ✓    | ADMIN_CONTENT | Buat artikel/konten baru            |
| PUT    | /admin/content/:id          | ✓    | ADMIN_CONTENT | Update artikel                      |
| PUT    | /admin/content/:id/publish  | ✓    | ADMIN_CONTENT | Publish / unpublish artikel         |
| GET    | /admin/logs                 | ✓    | SUPER_ADMIN   | Audit trail aksi admin              |
| GET    | /admin/settings             | ✓    | SUPER_ADMIN   | Konfigurasi sistem                  |
| PUT    | /admin/settings             | ✓    | SUPER_ADMIN   | Update konfigurasi sistem           |

---

## Format Response

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Opsional pesan sukses",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Sistolik harus antara 60-300 mmHg"
  },
  "details": [ ... ]
}
```

### Error Codes
| Code | HTTP Status | Deskripsi |
|------|-------------|-----------|
| `VALIDATION_ERROR` | 400 | Input tidak valid |
| `UNAUTHORIZED` | 401 | Tidak ada / token tidak valid |
| `FORBIDDEN` | 403 | Tidak punya akses (role kurang) |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `CONFLICT` | 409 | Duplikat data (email sudah terdaftar) |
| `RATE_LIMITED` | 429 | Terlalu banyak request |
| `AI_ERROR` | 502 | Error dari Claude API |
| `INTERNAL_ERROR` | 500 | Error server internal |
