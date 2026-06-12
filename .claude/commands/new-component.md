# /new-component
# Buat React component baru untuk: $ARGUMENTS

Buat komponen dengan ketentuan:
1. Gunakan TypeScript dengan interface props yang eksplisit
2. File di `frontend/components/<folder>/<NamaKomponen>.tsx`
3. Gunakan Tailwind CSS dengan palet warna biru Tensi-Bot:
   - Primary: `blue-700` (#1565A0)
   - Light bg: `blue-50` (#E3F2FD)
   - Accent: `blue-500` (#1E88E5)
   - Teks: `slate-800`
4. Jika ada data dari API, gunakan React Query (`useQuery` / `useMutation`)
5. Jika ada form, gunakan React Hook Form + Zod
6. Tambahkan loading state dan error state
7. Komponen harus accessible (aria-label, role, dll. jika diperlukan)
8. Sertakan export default di akhir file

Contoh struktur:
```tsx
interface Props { ... }

export default function NamaKomponen({ ... }: Props) {
  // hooks
  // handlers
  // render
}
```
