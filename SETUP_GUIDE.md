# 🚀 Panduan Setup Claude Code di VSCode — Tensi-Bot

## 1. Prasyarat

Pastikan sudah terinstall:
- **Node.js 20+** → `node --version`
- **VSCode 1.85+** → `code --version`
- **Git** → `git --version`
- **Akun Anthropic** dengan API Key aktif → https://console.anthropic.com

---

## 2. Install Claude Code

### Cara A: Via VSCode Extension (Paling Mudah)
1. Buka VSCode
2. Tekan `Ctrl+Shift+X` (Extensions)
3. Search: **"Claude Code"**
4. Install ekstensi dari **Anthropic** (publisher terverifikasi, 2M+ installs)
5. Setelah install, panel Claude Code muncul di sidebar kiri

### Cara B: Via Terminal (CLI)
```bash
npm install -g @anthropic-ai/claude-code
```

---

## 3. Login / Autentikasi

Setelah install, jalankan di terminal VSCode:
```bash
claude
```

Claude Code akan meminta autentikasi. Pilih salah satu:
- **OAuth (Rekomendasi):** Login via browser, lebih aman
- **API Key:** Masukkan `ANTHROPIC_API_KEY` secara manual

Atau set environment variable:
```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
```

Tambahkan ke `~/.bashrc` atau `~/.zshrc` agar permanen.

---

## 4. Setup Project Tensi-Bot

### Clone / buat project
```bash
git clone <repo-url> tensibot
cd tensibot
code .   # Buka di VSCode
```

### Salin file konfigurasi dari paket ini
```bash
# Dari folder tensibot-claude-code/, salin ke root project:
cp CLAUDE.md /path/to/tensibot/
cp .claudeignore /path/to/tensibot/
cp -r .vscode /path/to/tensibot/
cp -r .claude /path/to/tensibot/
cp docs/schema.prisma /path/to/tensibot/backend/prisma/schema.prisma
```

### Install extensions yang direkomendasikan
VSCode akan otomatis menawarkan install extensions dari `.vscode/extensions.json`.
Klik **"Install All"** saat muncul notifikasi.

---

## 5. Cara Menggunakan Claude Code

### Buka Panel Claude Code
- Klik ikon Claude di sidebar kiri VSCode, **atau**
- Tekan `Ctrl+Shift+P` → ketik **"Claude Code: Open"**

### Mode yang Tersedia

| Mode | Cara Aktifkan | Kapan Digunakan |
|------|--------------|-----------------|
| **Default** | Sudah aktif | Untuk semua task — Claude minta persetujuan sebelum edit |
| **Plan Mode** | Ketik `/plan` | Untuk fitur besar — Claude analisis dulu, baru implementasi |
| **Auto-accept** | Ketik `/accept-edits` | Saat sudah yakin — Claude langsung edit tanpa tanya |
| **Sandbox** | Ketik `/sandbox` | Isolasi bash command dari sistem utama |

> ⚠️ **Rekomendasi:** Gunakan **Plan Mode** untuk fitur baru yang menyentuh banyak file.
> Selalu cek `git diff` sebelum commit saat pakai auto-accept.

---

## 6. Workflow Harian dengan Claude Code

### A. Mulai Fitur Baru
```
# Di panel Claude Code, ketik:
Saya ingin membuat fitur pengingat obat. 
Buat API endpoint, service, dan komponen frontend-nya.

# Claude akan:
# 1. Baca CLAUDE.md untuk konteks project
# 2. Analisis file yang sudah ada
# 3. Buat implementation plan
# 4. Minta persetujuan sebelum mulai
# 5. Implementasi file per file
```

### B. Fix Bug
```
# Tandai baris yang bermasalah, lalu di Claude Code:
@bp.service.ts ada bug di fungsi calculateBPCategory, 
nilai ELEVATED tidak terdeteksi dengan benar. Fix ini.
```

### C. Referensi File Spesifik
```
# Pakai @ untuk mention file:
@CLAUDE.md     → Claude baca konteks project
@schema.prisma → Claude lihat database schema
@API_REFERENCE.md → Claude lihat daftar endpoint
```

### D. Gunakan Custom Commands
```
/new-api-route fitur laporan mingguan pengguna
/new-component komponen grafik tren tekanan darah bulanan
/new-migration tambah field lastLoginAt ke tabel users
/review backend/src/services/chat.service.ts
```

### E. Refactor dan Optimasi
```
# Highlight kode, lalu:
Refactor fungsi ini agar lebih efisien dan tambahkan error handling yang proper
```

---

## 7. Tips & Best Practices

### ✅ DO
- Selalu biarkan Claude baca `CLAUDE.md` di awal sesi (otomatis)
- Gunakan `/plan` dulu untuk fitur yang menyentuh >5 file
- Reference file spesifik dengan `@namafile.ts` untuk konteks tepat
- Review setiap perubahan sebelum approve, terutama yang menyangkut auth/security
- Commit setelah setiap fitur selesai dan berfungsi
- Gunakan `/review` sebelum push ke main branch

### ❌ DON'T
- Jangan pakai auto-accept untuk perubahan di file auth, middleware, atau security
- Jangan biarkan Claude edit `.env` file
- Jangan skip review untuk perubahan database schema
- Jangan lupa update `CLAUDE.md` kalau ada keputusan arsitektur baru

### 💡 Prompt yang Efektif
```
# Kurang spesifik (hindari):
"Buat fitur chat"

# Lebih baik:
"Buat ChatService di backend/src/services/chat.service.ts yang:
- Menerima sessionId dan message dari pengguna
- Ambil profil pengguna dan 10 pesan terakhir dari database
- Kirim ke Claude API dengan system prompt medis
- Simpan respons ke database
- Return respons dalam format { role: 'assistant', content: string }"
```

---

## 8. Perintah Terminal Berguna

```bash
# Jalankan semua service
npm run dev

# Backend saja
cd backend && npm run dev

# Frontend saja
cd frontend && npm run dev

# Database
cd backend && npx prisma studio          # GUI database di browser
cd backend && npx prisma migrate dev     # Jalankan migration baru
cd backend && npx prisma db seed         # Isi data awal
cd backend && npx prisma generate        # Generate ulang Prisma client

# Test
npm test                                 # Semua test
cd backend && npm test                   # Test backend saja
cd frontend && npm test                  # Test frontend saja

# Lint & Format
npm run lint                             # Check ESLint
npm run format                           # Auto-format dengan Prettier
npm run type-check                       # TypeScript check tanpa build
```

---

## 9. Troubleshooting

### Claude Code tidak muncul di VSCode
- Pastikan workspace **tidak** dalam Restricted Mode
- `Ctrl+Shift+P` → "Workspaces: Trust Workspace"

### Context tidak terbaca
- Pastikan `CLAUDE.md` ada di root project yang dibuka di VSCode
- Cek `.claudeignore` tidak memblokir file penting

### Error autentikasi
```bash
# Reset auth
claude auth logout
claude auth login
```

### Claude edit file yang salah
- Gunakan Plan Mode (`/plan`) agar Claude konfirmasi dulu
- Spesifikkan path file dengan lebih jelas di prompt

---

## 10. Struktur Referensi Cepat

```
Yang paling sering diakses Claude:
├── CLAUDE.md              ← Konteks utama project
├── docs/API_REFERENCE.md  ← Semua endpoint API
├── docs/schema.prisma     ← Database schema
├── .claude/commands/      ← Custom commands (/new-api-route, dll.)
└── .vscode/settings.json  ← Konfigurasi VSCode
```

---

> 📚 Dokumentasi resmi Claude Code: https://docs.claude.com/en/docs/claude-code/overview
