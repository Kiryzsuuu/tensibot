# /new-migration
# Buat Prisma migration untuk perubahan: $ARGUMENTS

Langkah:
1. Update `backend/prisma/schema.prisma` dengan model/field baru
2. Pastikan semua relasi benar (onDelete, onUpdate)
3. Tambahkan index yang dibutuhkan untuk query yang sering
4. Jalankan: `cd backend && npx prisma migrate dev --name <nama-migration>`
5. Update `backend/prisma/seed.ts` jika perlu data awal
6. Update TypeScript types di `shared/types/api.types.ts` jika ada model baru

Konvensi Prisma untuk Tensi-Bot:
- Primary key: `id String @id @default(cuid())`
- Timestamps: `createdAt DateTime @default(now())` dan `updatedAt DateTime @updatedAt`
- Soft delete: `isDeleted Boolean @default(false)`
- Semua model pakai nama PascalCase singular
- Field relasi foreign key: `userId String` + `user User @relation(fields: [userId], references: [id])`
