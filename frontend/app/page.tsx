import Link from 'next/link';
import { Activity, Heart, Bell, BookOpen, Shield, TrendingDown, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: Activity, title: 'Pantau Tekanan Darah', desc: 'Catat dan visualisasikan riwayat tekanan darah dalam grafik interaktif 30 hari.', color: '#2E86C1', bg: '#EAF4FB' },
  { icon: Bell, title: 'Pengingat Obat', desc: 'Jadwalkan obat dan dapatkan pengingat otomatis agar tidak ada dosis yang terlewat.', color: '#16a34a', bg: '#f0fdf4' },
  { icon: Heart, title: 'Asisten AI Nara', desc: 'Konsultasi 24/7 dengan Nara, asisten AI yang memahami kondisi hipertensi Anda secara personal.', color: '#C0392B', bg: '#fef2f2' },
  { icon: BookOpen, title: 'Edukasi Kesehatan', desc: 'Akses ratusan artikel terverifikasi tentang diet, olahraga, dan gaya hidup sehat.', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: TrendingDown, title: 'Statistik & Tren', desc: 'Lihat pola tekanan darah dan pantau progres menuju target kesehatan Anda.', color: '#0891b2', bg: '#ecfeff' },
  { icon: Shield, title: 'Data Aman & Privat', desc: 'Data kesehatan Anda terenkripsi dan hanya bisa diakses oleh Anda sendiri.', color: '#F5A623', bg: '#fffbeb' },
];

const BP_CATEGORIES = [
  { label: 'Normal', range: '< 120/80', color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
  { label: 'Elevasi', range: '120–129/<80', color: '#ca8a04', bg: '#fef9c3', border: '#fde047' },
  { label: 'Stage 1', range: '130–139/80–89', color: '#ea580c', bg: '#ffedd5', border: '#fdba74' },
  { label: 'Stage 2', range: '≥ 140/90', color: '#C0392B', bg: '#fee2e2', border: '#fca5a5' },
  { label: 'Krisis', range: '> 180/120', color: '#7f1d1d', bg: '#fecaca', border: '#ef4444' },
];

const DEFAULT_SETTINGS = {
  hero: {
    badge: 'Platform Kesehatan Digital #1 di Indonesia',
    title: 'Kendalikan Hipertensi,',
    titleHighlight: 'Raih Hidup Lebih Sehat',
    subtitle: 'Tensi-Bot membantu Anda memantau tekanan darah, mematuhi jadwal obat, dan berkonsultasi dengan AI medis — semuanya dalam satu platform yang mudah digunakan.',
    ctaPrimary: 'Mulai Sekarang',
    ctaSecondary: 'Sudah Punya Akun',
  },
  stats: [
    { value: '1 dari 3', label: 'Orang dewasa Indonesia berisiko hipertensi' },
    { value: '80%', label: 'Kasus dapat dicegah dengan gaya hidup sehat' },
    { value: '< 5 mnt', label: 'Waktu untuk catat dan analisis data Anda' },
  ],
  benefits: [
    'Gratis selamanya untuk fitur dasar',
    'Tidak perlu perangkat khusus',
    'Data tersimpan aman di cloud',
    'Tersedia 24/7, kapan saja',
  ],
  cta: {
    title: 'Mulai Pantau Kesehatan Anda Hari Ini',
    subtitle: 'Bergabung dengan ribuan pengguna yang sudah mengelola hipertensi mereka dengan lebih baik.',
    buttonText: 'Buat Akun Gratis',
  },
};

async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      next: { revalidate: 60 }, // cache 60 detik, ISR
    });
    if (!res.ok) return DEFAULT_SETTINGS;
    const json = await res.json();
    return { ...DEFAULT_SETTINGS, ...json.data };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default async function LandingPage() {
  const settings = await getSettings();
  const { hero, stats, benefits, cta } = settings;

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ─── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D6EAF8] px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2E86C1] to-[#154360] rounded-xl flex items-center justify-center shadow-md">
              <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
                <path d="M2 11 L5 5 L8 13 L11 8 L14 14 L17 9 L20 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <span className="font-bold text-[#1A2A3A] text-lg tracking-tight">Tensi-Bot</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-medium text-[#5D8AA8] hover:text-[#2E86C1] transition-colors px-4 py-2 rounded-lg hover:bg-[#EAF4FB]">
              Masuk
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-[#2E86C1] hover:bg-[#2471A3] text-white px-5 py-2 rounded-xl transition-all shadow-md shadow-[#2E86C1]/20 hover:shadow-lg">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#EAF4FB] via-[#F4F8FC] to-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2E86C1]/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#2E86C1]/5 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 bg-[#2E86C1]/10 text-[#2E86C1] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 border border-[#2E86C1]/20">
              <Heart size={11} className="fill-current" />
              {hero.badge}
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A2A3A] leading-[1.15] mb-6 tracking-tight">
              {hero.title}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E86C1] to-[#154360]">
                {hero.titleHighlight}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#5D8AA8] mb-10 leading-relaxed max-w-2xl mx-auto">
              {hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#2E86C1] to-[#2471A3] hover:from-[#2471A3] hover:to-[#1a5c8a] text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-[#2E86C1]/30 hover:shadow-2xl hover:-translate-y-0.5 text-base"
              >
                {hero.ctaPrimary}
                <ChevronRight size={18} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-[#D6E8F5] text-[#2E86C1] font-semibold px-8 py-3.5 rounded-xl hover:border-[#2E86C1] hover:bg-[#EAF4FB] transition-all text-base"
              >
                {hero.ctaSecondary}
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {benefits.map((b: string) => (
                <span key={b} className="flex items-center gap-1.5 text-xs text-[#5D8AA8]">
                  <CheckCircle size={13} className="text-[#16a34a]" />
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {stats.map((s: { value: string; label: string }) => (
              <div key={s.label} className="text-center bg-white/70 backdrop-blur-sm rounded-2xl py-5 px-3 border border-white shadow-sm">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#2E86C1]">{s.value}</p>
                <p className="text-xs text-[#5D8AA8] mt-1.5 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-[#2E86C1] uppercase tracking-widest bg-[#EAF4FB] px-3 py-1 rounded-full">Fitur Unggulan</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A2A3A] mt-4 mb-3 tracking-tight">Semua yang Anda Butuhkan</h2>
            <p className="text-[#5D8AA8] max-w-xl mx-auto text-lg">Fitur lengkap untuk mendukung perjalanan kesehatan Anda setiap hari</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="group bg-white border border-[#E8F4FD] rounded-2xl p-6 hover:shadow-xl hover:border-[#2E86C1]/30 hover:-translate-y-1 transition-all duration-200">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: f.bg }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-[#1A2A3A] text-base mb-2">{f.title}</h3>
                <p className="text-sm text-[#5D8AA8] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BP Reference ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F4F8FC]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-[#2E86C1] uppercase tracking-widest bg-[#EAF4FB] px-3 py-1 rounded-full">Referensi Medis</span>
            <h2 className="text-3xl font-extrabold text-[#1A2A3A] mt-4 mb-2 tracking-tight">Klasifikasi Tekanan Darah</h2>
            <p className="text-sm text-[#5D8AA8]">Berdasarkan pedoman ACC/AHA 2017</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {BP_CATEGORIES.map((c) => (
              <div key={c.label} className="rounded-2xl p-5 text-center border-2 transition-transform hover:-translate-y-1" style={{ backgroundColor: c.bg, borderColor: c.border }}>
                <p className="text-sm font-extrabold mb-2" style={{ color: c.color }}>{c.label}</p>
                <p className="text-xs font-mono font-bold text-[#1A2A3A] leading-snug">{c.range}</p>
                <p className="text-[10px] text-[#5D8AA8] mt-1 font-medium">mmHg</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#0F2D45] via-[#154360] to-[#2E86C1]">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/10 text-[#AED6F1] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 border border-white/20">
            <Heart size={11} className="fill-current text-red-400" />
            Gratis, Mudah, dan Terpercaya
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">{cta.title}</h2>
          <p className="text-[#AED6F1] mb-10 text-lg max-w-xl mx-auto leading-relaxed">{cta.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-[#2E86C1] font-bold px-8 py-3.5 rounded-xl hover:bg-[#EAF4FB] transition-all shadow-2xl hover:-translate-y-0.5 text-base">
              {cta.buttonText}
              <ChevronRight size={18} />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all text-base">
              Sudah punya akun? Masuk
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#0F1E2D] text-[#5D8AA8] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-3 bg-[#1A2A3A] border border-[#F5A623]/20 rounded-2xl p-5 mb-8">
            <AlertTriangle size={16} className="text-[#F5A623] shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-[#AED6F1]">
              <span className="text-[#F5A623] font-semibold">Disclaimer Medis: </span>
              Tensi-Bot adalah alat bantu pemantauan, bukan pengganti dokter. Informasi dalam aplikasi ini bersifat edukatif dan tidak merupakan saran medis. Selalu konsultasikan kondisi Anda dengan dokter atau tenaga medis profesional. Jika tekanan darah Anda &gt; 180/120 mmHg atau mengalami gejala darurat, segera hubungi layanan gawat darurat (119) atau kunjungi IGD terdekat.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1A2A3A]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-[#2E86C1] to-[#154360] rounded-lg flex items-center justify-center shadow">
                <svg width="13" height="13" viewBox="0 0 22 22" fill="none">
                  <path d="M2 11 L5 5 L8 13 L11 8 L14 14 L17 9 L20 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <span className="text-white font-bold text-sm">Tensi-Bot</span>
            </div>
            <p className="text-xs text-center text-[#5D8AA8]">© 2026 Tensi-Bot. Platform kesehatan digital untuk penderita hipertensi di Indonesia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
