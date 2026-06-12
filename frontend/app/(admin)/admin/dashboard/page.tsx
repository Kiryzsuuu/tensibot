'use client';

import Link from 'next/link';
import { Image, LayoutDashboard, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const adminModules = [
  {
    href: '/admin/hero',
    label: 'Kelola Hero Banner',
    description: 'Tambah, edit, dan hapus banner hero yang tampil di halaman utama pengguna.',
    icon: Image,
    color: 'bg-[#EAF4FB]',
    iconColor: 'text-[#2E86C1]',
  },
  {
    href: '/admin/content',
    label: 'Kelola Konten Edukasi',
    description: 'Manajemen artikel dan konten edukasi kesehatan hipertensi.',
    icon: FileText,
    color: 'bg-green-50',
    iconColor: 'text-green-600',
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <LayoutDashboard size={22} className="text-[#2E86C1]" />
          <h1 className="text-2xl font-bold text-[#1A2A3A]">Admin Dashboard</h1>
        </div>
        <p className="text-[#5D8AA8] text-sm">
          Selamat datang, {user?.fullName}. Pilih modul yang ingin dikelola.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {adminModules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#D6EAF8] hover:shadow-md hover:border-[#2E86C1] transition-all group"
          >
            <div
              className={`w-11 h-11 ${mod.color} rounded-xl flex items-center justify-center mb-4`}
            >
              <mod.icon size={22} className={mod.iconColor} />
            </div>
            <h2 className="font-bold text-[#1A2A3A] text-base mb-1 group-hover:text-[#2E86C1] transition-colors">
              {mod.label}
            </h2>
            <p className="text-sm text-[#5D8AA8] leading-relaxed">{mod.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
