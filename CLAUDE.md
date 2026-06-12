# Tensi-Bot — CLAUDE.md
> File ini dibaca otomatis oleh Claude Code di setiap sesi. Jangan hapus.

## 🩺 Deskripsi Proyek

**Tensi-Bot** (Teman Kendali Hipertensi) adalah platform kesehatan digital berbasis AI untuk membantu penderita hipertensi memantau tekanan darah, meningkatkan kepatuhan pengobatan, dan mengakses edukasi kesehatan.

- **Fase 1:** Web Application (React + Next.js)
- **Fase 2:** Android App (React Native) — belum dimulai
- **AI Engine:** Claude API (Anthropic) dengan system prompt medis
- **Target pengguna:** Penderita hipertensi dewasa ≥18 tahun di Indonesia

---

## 🏗️ Arsitektur & Tech Stack

```
tensibot/
├── frontend/          # Next.js 14 (App Router)
├── backend/           # Node.js + Express + Prisma
├── shared/            # Types & utilities bersama
└── docs/              # Dokumentasi teknis
```

### Frontend (`/frontend`)
- **Framework:** Next.js 14 dengan App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v3 + shadcn/ui
- **State:** Zustand (global) + React Query v5 (server state)
- **Form:** React Hook Form + Zod validation
- **Charts:** Recharts
- **HTTP Client:** Axios dengan interceptors

### Backend (`/backend`)
- **Runtime:** Node.js 20+ (LTS)
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma v5 (PostgreSQL)
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **Validation:** Zod
- **AI:** Anthropic SDK (`@anthropic-ai/sdk`)
- **Email:** Nodemailer + SendGrid
- **Push Notif:** web-push (Web Push API)
- **Cache:** ioredis (Redis)

### Database
- **Primary:** PostgreSQL 15
- **Cache:** Redis 7
- **ORM:** Prisma (schema di `backend/prisma/schema.prisma`)

---

## 📁 Struktur File Lengkap

```
tensibot/
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Layout dengan sidebar
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── chat/page.tsx
│   │   │   ├── monitoring/page.tsx
│   │   │   ├── obat/page.tsx
│   │   │   ├── edukasi/page.tsx
│   │   │   └── profil/page.tsx
│   │   ├── (admin)/
│   │   │   ├── layout.tsx          # Layout admin
│   │   │   ├── admin/dashboard/page.tsx
│   │   │   ├── admin/users/page.tsx
│   │   │   ├── admin/health-data/page.tsx
│   │   │   ├── admin/reports/page.tsx
│   │   │   └── admin/content/page.tsx
│   │   ├── api/                    # Next.js API routes (proxy ke backend)
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── dashboard/
│   │   │   ├── BPHeroCard.tsx
│   │   │   ├── BPTrendChart.tsx
│   │   │   ├── MedicationList.tsx
│   │   │   └── StatCard.tsx
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── QuickReplies.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── monitoring/
│   │   │   ├── BPInputForm.tsx
│   │   │   ├── BPHistoryTable.tsx
│   │   │   └── BPChart30Days.tsx
│   │   ├── medication/
│   │   │   ├── MedScheduleCard.tsx
│   │   │   └── MedComplianceChart.tsx
│   │   └── shared/
│   │       ├── Sidebar.tsx
│   │       ├── Topbar.tsx
│   │       └── PageHeader.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useBPRecords.ts
│   │   ├── useMedications.ts
│   │   └── useChat.ts
│   ├── lib/
│   │   ├── api.ts                  # Axios instance
│   │   ├── auth.ts                 # Auth helpers
│   │   └── utils.ts
│   ├── store/
│   │   ├── authStore.ts            # Zustand auth store
│   │   └── uiStore.ts
│   ├── types/
│   │   └── index.ts                # Semua TypeScript types
│   └── constants/
│       └── bp-categories.ts        # Kategori BP (Normal, Stage 1, dll.)
│
├── backend/
│   ├── src/
│   │   ├── index.ts                # Entry point Express
│   │   ├── app.ts                  # Express app setup
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── bp.routes.ts        # Blood pressure routes
│   │   │   ├── chat.routes.ts
│   │   │   ├── medication.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── content.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── bp.controller.ts
│   │   │   ├── chat.controller.ts
│   │   │   ├── medication.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── bp.service.ts
│   │   │   ├── chat.service.ts     # Integrasi Claude API
│   │   │   ├── medication.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── report.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # JWT verification
│   │   │   ├── role.middleware.ts  # Role-based access
│   │   │   ├── rateLimit.middleware.ts
│   │   │   └── validate.middleware.ts
│   │   ├── lib/
│   │   │   ├── prisma.ts           # Prisma client singleton
│   │   │   ├── redis.ts            # Redis client
│   │   │   ├── anthropic.ts        # Claude API client
│   │   │   └── email.ts
│   │   └── utils/
│   │       ├── bp-calculator.ts    # Kalkulasi kategori BP
│   │       ├── jwt.ts
│   │       └── logger.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── tests/
│       ├── auth.test.ts
│       ├── bp.test.ts
│       └── chat.test.ts
│
└── shared/
    └── types/
        └── api.types.ts            # Types kondivikan frontend-backend
```

---

## 🗄️ Database Schema (Prisma)

Schema lengkap ada di `backend/prisma/schema.prisma`. Tabel utama:

| Model | Deskripsi |
|-------|-----------|
| `User` | Akun pengguna (email, password, role) |
| `UserProfile` | Data pribadi & kesehatan pengguna |
| `BloodPressureRecord` | Riwayat pengukuran tekanan darah |
| `UserMedication` | Obat yang diresepkan ke pengguna |
| `MedicationLog` | Log kepatuhan minum obat harian |
| `ChatSession` | Sesi percakapan dengan AI |
| `ChatMessage` | Pesan individual dalam sesi chat |
| `ContentArticle` | Artikel edukasi |
| `HealthGoal` | Target kesehatan pengguna |
| `Notification` | Log notifikasi |
| `AdminLog` | Audit trail aksi admin |

**Enum penting:**
- `Role`: `USER | ADMIN_HEALTH | ADMIN_CONTENT | SUPER_ADMIN`
- `BPCategory`: `NORMAL | ELEVATED | STAGE_1 | STAGE_2 | CRISIS`
- `MedStatus`: `TAKEN | SKIPPED | PENDING`

---

## 🔑 Variabel Environment

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=Tensi-Bot
NEXTAUTH_SECRET=<secret>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<vapid-public-key>
```

### Backend (`.env`)
```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/tensibot
REDIS_URL=redis://localhost:6379
JWT_SECRET=<jwt-secret-min-32-chars>
JWT_REFRESH_SECRET=<jwt-refresh-secret>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d
ANTHROPIC_API_KEY=<claude-api-key>
CLAUDE_MODEL=claude-sonnet-4-20250514
SENDGRID_API_KEY=<sendgrid-key>
VAPID_PUBLIC_KEY=<vapid-public>
VAPID_PRIVATE_KEY=<vapid-private>
VAPID_EMAIL=mailto:admin@tensibot.id
FRONTEND_URL=http://localhost:3000
```

---

## 🤖 Chatbot AI — System Prompt

System prompt untuk Claude API ada di `backend/src/services/chat.service.ts`.

**Konteks yang disertakan dalam setiap request ke Claude:**
1. Role dan batasan bot (bukan dokter, selalu saran ke dokter)
2. Data profil pengguna: usia, berat, tinggi, diagnosis, obat aktif
3. Riwayat tekanan darah 7 hari terakhir
4. Status kepatuhan obat hari ini
5. Riwayat chat sesi ini (context window)

**Batasan wajib yang harus ada di system prompt:**
- Tidak memberikan diagnosis
- Tidak mengubah dosis/jenis obat
- Selalu sertakan disclaimer medis
- Deteksi krisis (BP >180/120) → arahkan ke IGD

---

## 📐 Konvensi Koding

### TypeScript
- Strict mode aktif (`"strict": true` di tsconfig)
- Gunakan `interface` untuk object shapes, `type` untuk unions/primitives
- Semua function harus punya return type eksplisit
- Hindari `any` — gunakan `unknown` jika tipe tidak pasti

### Penamaan
- **File:** kebab-case (`bp-calculator.ts`, `chat-window.tsx`)
- **Komponen React:** PascalCase (`BPInputForm`, `ChatWindow`)
- **Fungsi/variabel:** camelCase (`getUserProfile`, `bpRecords`)
- **Konstanta:** UPPER_SNAKE_CASE (`MAX_SYSTOLIC`, `JWT_SECRET`)
- **Database field:** snake_case (di Prisma schema)
- **API endpoint:** kebab-case (`/api/blood-pressure`, `/api/chat-sessions`)

### React & Next.js
- Gunakan Server Components untuk halaman yang tidak butuh interaktivitas
- Gunakan Client Components (`'use client'`) hanya jika ada state/event
- Semua data fetching di Server Component atau React Query
- Jangan fetch data langsung di Client Component tanpa React Query

### API Response Format
```typescript
// Sukses
{ success: true, data: <payload>, message?: string }

// Error
{ success: false, error: { code: string, message: string }, details?: any }
```

### Error Handling
- Gunakan custom error class `AppError` di backend
- Semua async route handler dibungkus `asyncHandler` wrapper
- Error logging dengan `logger.error()` — jangan pakai `console.log` di production

---

## 🔐 Keamanan — Hal Wajib

- **JANGAN** hardcode API key atau secret di kode — selalu dari `.env`
- **JANGAN** log data sensitif (password, token, data kesehatan pengguna)
- Semua input pengguna harus divalidasi dengan Zod sebelum diproses
- JWT harus diverifikasi di middleware, bukan di controller
- Rate limiting wajib di endpoint: `/api/auth/*` (5/menit), `/api/chat` (10/menit)
- Data kesehatan pengguna hanya boleh diakses oleh pengguna itu sendiri atau admin

---

## 🧪 Testing

- **Unit test:** Vitest (backend) + React Testing Library (frontend)
- **E2E test:** Playwright (Fase 2)
- Test file: `*.test.ts` di folder `tests/` dekat file yang ditest
- Jalankan: `npm test` di root atau folder masing-masing

---

## 🚀 Cara Menjalankan

```bash
# Install semua dependency
npm install

# Jalankan database migration
cd backend && npx prisma migrate dev

# Seed data awal
cd backend && npx prisma db seed

# Jalankan development (concurrently)
npm run dev          # Jalankan frontend + backend sekaligus

# Atau pisah:
cd frontend && npm run dev    # http://localhost:3000
cd backend && npm run dev     # http://localhost:4000
```

---

## ⚠️ Hal Penting untuk Claude Code

1. **Medical safety:** Chatbot AI adalah fitur kritis — selalu tambahkan disclaimer medis dan deteksi krisis BP
2. **Data privacy:** Jangan buat endpoint yang mengekspos data kesehatan tanpa autentikasi
3. **BP Validation:** Sistolik harus 60–300, diastolik 40–200, dan sistolik > diastolik
4. **Role check:** Admin routes HARUS diproteksi dengan `roleMiddleware(['ADMIN_HEALTH', 'SUPER_ADMIN'])`
5. **Soft delete:** Jangan `DELETE` data kesehatan dari database — gunakan field `isDeleted: true`
6. **Claude API cost:** Batasi context window chatbot — maksimal 10 pesan terakhir + profil pengguna
7. **Timezone:** Semua timestamp disimpan dalam UTC, ditampilkan dalam WIB (UTC+7) di frontend
