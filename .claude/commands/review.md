# /review
# Review kode yang baru ditulis atau file: $ARGUMENTS

Cek hal-hal berikut secara menyeluruh:

## Keamanan (KRITIS)
- [ ] Tidak ada API key / secret hardcoded
- [ ] Semua input divalidasi dengan Zod
- [ ] JWT middleware terpasang di route yang perlu auth
- [ ] Role middleware terpasang di route admin
- [ ] Tidak ada data kesehatan yang bisa diakses tanpa auth
- [ ] Rate limiting terpasang di endpoint sensitif

## Kualitas Kode
- [ ] TypeScript strict — tidak ada `any`
- [ ] Semua fungsi punya return type
- [ ] Error handling lengkap (try/catch atau asyncHandler)
- [ ] Tidak ada `console.log` yang tertinggal (gunakan logger)
- [ ] Penamaan konsisten dengan konvensi proyek

## Logika Bisnis
- [ ] Validasi BP range (sistolik 60–300, diastolik 40–200)
- [ ] Kategori BP dihitung dengan benar (NORMAL/ELEVATED/STAGE_1/STAGE_2/CRISIS)
- [ ] Chatbot response selalu sertakan disclaimer medis
- [ ] Soft delete digunakan, bukan hard delete
- [ ] Timestamp disimpan UTC, ditampilkan WIB

## Performance
- [ ] Query database efisien (gunakan select, include yang spesifik)
- [ ] Tidak ada N+1 query problem
- [ ] Data besar dipaginasi
- [ ] Response besar di-cache jika perlu

## Testing
- [ ] Test case untuk happy path
- [ ] Test case untuk error/edge case
- [ ] Test untuk validasi input

Berikan summary: apa yang bagus, apa yang perlu diperbaiki, dan prioritas perbaikannya.
