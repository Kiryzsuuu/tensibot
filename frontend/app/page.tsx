import Link from 'next/link';
import { Activity, Heart, Bell, BookOpen, Shield, TrendingDown, ChevronRight, AlertTriangle } from 'lucide-react';

const FEATURES = [
  {
    icon: Activity,
    title: 'Pantau Tekanan Darah',
    desc: 'Catat dan visualisasikan riwayat tekanan darah Anda dalam grafik interaktif 30 hari.',
    color: '#2E86C1',
    bg: '#EAF4FB',
  },
  {
    icon: Bell,
    title: 'Pengingat Obat',
    desc: 'Jadwalkan obat dan dapatkan pengingat agar tidak ada dosis yang terlewat.',
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    icon: Heart,
    title: 'Chat AI Medis',
    desc: 'Konsultasi kapan saja dengan asisten AI yang memahami kondisi hipertensi Anda.',
    color: '#C0392B',
    bg: '#fef2f2',
  },
  {
    icon: BookOpen,
    title: 'Edukasi Kesehatan',
    desc: 'Akses artikel terverifikasi tentang diet, olahraga, dan gaya hidup sehat.',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    icon: TrendingDown,
    title: 'Statistik & Tren',
    desc: 'Lihat pola tekanan darah Anda dan pantau progres menuju target kesehatan.',
    color: '#0891b2',
    bg: '#ecfeff',
  },
  {
    icon: Shield,
    title: 'Data Aman & Privat',
    desc: 'Data kesehatan Anda terenkripsi dan hanya bisa diakses oleh Anda sendiri.',
    color: '#F5A623',
    bg: '#fffbeb',
  },
];

const BP_CATEGORIES = [
  { label: 'Normal', range: '< 120/80', color: '#16a34a', bg: '#f0fdf4' },
  { label: 'Elevasi', range: '120–129/<80', color: '#F5A623', bg: '#fffbeb' },
  { label: 'Stage 1', range: '130–139/80–89', color: '#ea580c', bg: '#fff7ed' },
  { label: 'Stage 2', range: '≥ 140/90', color: '#C0392B', bg: '#fef2f2' },
  { label: 'Krisis', range: '> 180/120', color: '#7f1d1d', bg: '#fee2e2' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ─── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#D6EAF8] px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#2E86C1] rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <path d="M2 11 L5 5 L8 13 L11 8 L14 14 L17 9 L20 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <span className="font-bold text-[#1A2A3A] text-lg tracking-tight">Tensi-Bot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-[#5D8AA8] hover:text-[#2E86C1] transition-colors px-3 py-2">
              Masuk
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-[#2E86C1] hover:bg-[#2471A3] text-white px-4 py-2 rounded-lg transition-colors">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#EAF4FB] via-white to-[#F4F8FC] pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 bg-[#2E86C1]/10 text-[#2E86C1] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Heart size={12} className="fill-current" />
              Platform Kesehatan Digital
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1A2A3A] leading-tight mb-6">
              Kendalikan Hipertensi,{' '}
              <span className="text-[#2E86C1]">Raih Hidup Lebih Sehat</span>
            </h1>
            <p className="text-lg text-[#5D8AA8] mb-8 leading-relaxed max-w-2xl mx-auto">
              Tensi-Bot membantu Anda memantau tekanan darah, mematuhi jadwal obat, dan berkonsultasi dengan AI medis — semuanya dalam satu platform yang mudah digunakan.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#2E86C1] hover:bg-[#2471A3] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#2E86C1]/25 hover:shadow-xl"
              >
                Mulai Sekarang — Gratis
                <ChevronRight size={18} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-[#D6E8F5] text-[#2E86C1] font-semibold px-6 py-3 rounded-xl hover:border-[#2E86C1] transition-colors"
              >
                Sudah Punya Akun
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto">
            {[
              { value: '1 dari 3', label: 'Orang dewasa Indonesia berisiko hipertensi' },
              { value: '80%', label: 'Kasus dapat dicegah dengan gaya hidup sehat' },
              { value: '< 5 mnt', label: 'Waktu untuk catat dan analisis data Anda' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[#2E86C1]">{s.value}</p>
                <p className="text-xs text-[#5D8AA8] mt-1 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A2A3A] mb-3">Semua yang Anda Butuhkan</h2>
            <p className="text-[#5D8AA8] max-w-xl mx-auto">
              Fitur lengkap untuk mendukung perjalanan kesehatan Anda setiap hari
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-[#D6EAF8] rounded-2xl p-6 hover:shadow-lg hover:border-[#AED6F1] transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: f.bg }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-[#1A2A3A] mb-2">{f.title}</h3>
                <p className="text-sm text-[#5D8AA8] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BP Reference ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F4F8FC]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1A2A3A] mb-2">Klasifikasi Tekanan Darah</h2>
            <p className="text-sm text-[#5D8AA8]">Berdasarkan pedoman ACC/AHA 2017</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {BP_CATEGORIES.map((c) => (
              <div key={c.label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: c.bg }}>
                <p className="text-xs font-bold mb-1" style={{ color: c.color }}>{c.label}</p>
                <p className="text-xs font-mono font-semibold text-[#1A2A3A]">{c.range}</p>
                <p className="text-[10px] text-[#5D8AA8] mt-0.5">mmHg</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#1A4A7A] to-[#2E86C1]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Mulai Pantau Kesehatan Anda Hari Ini</h2>
          <p className="text-[#AED6F1] mb-8">
            Daftar gratis dan mulai lacak tekanan darah Anda dalam hitungan menit.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-[#2E86C1] font-bold px-8 py-3.5 rounded-xl hover:bg-[#EAF4FB] transition-colors shadow-lg"
          >
            Buat Akun Gratis
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* ─── Disclaimer ───────────────────────────────────────────────────── */}
      <footer className="bg-[#1A2A3A] text-[#5D8AA8] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-3 bg-[#0f1c28] rounded-xl p-4 mb-8">
            <AlertTriangle size={16} className="text-[#F5A623] shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              <span className="text-[#F5A623] font-semibold">Disclaimer Medis: </span>
              Tensi-Bot adalah alat bantu pemantauan, bukan pengganti dokter. Informasi dalam aplikasi ini bersifat edukatif dan tidak merupakan saran medis. Selalu konsultasikan kondisi Anda dengan dokter atau tenaga medis profesional. Jika tekanan darah Anda &gt; 180/120 mmHg atau Anda mengalami gejala darurat, segera hubungi layanan gawat darurat (119) atau kunjungi IGD terdekat.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#2E86C1] rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                  <path d="M2 11 L5 5 L8 13 L11 8 L14 14 L17 9 L20 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm">Tensi-Bot</span>
            </div>
            <p className="text-xs text-center">© 2026 Tensi-Bot. Platform kesehatan digital untuk penderita hipertensi di Indonesia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
