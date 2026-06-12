# Custom Commands untuk Tensi-Bot
# Simpan file ini di: .claude/commands/
# Panggil di Claude Code dengan: /[nama-command]

# ─────────────────────────────────────────
# /new-api-route
# ─────────────────────────────────────────
Buat API route baru untuk fitur: $ARGUMENTS

Ikuti pola ini:
1. Buat file route di `backend/src/routes/<nama>.routes.ts`
2. Buat file controller di `backend/src/controllers/<nama>.controller.ts`
3. Buat file service di `backend/src/services/<nama>.service.ts`
4. Daftarkan route di `backend/src/app.ts`
5. Tambahkan Zod validation schema di controller
6. Pastikan ada auth middleware untuk endpoint yang perlu login
7. Pastikan ada role middleware untuk endpoint admin
8. Buat test dasar di `backend/tests/<nama>.test.ts`

Format response API: `{ success: true, data: <payload> }` atau `{ success: false, error: { code, message } }`
Semua async handler dibungkus dengan `asyncHandler()`.
