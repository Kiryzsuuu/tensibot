'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Image, LayoutDashboard, FileText, Users, ScrollText, Activity, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalBPRecords: number;
  totalChatSessions: number;
  crisisEventsLast7Days: number;
}

const adminModules = [
  {
    href: '/admin/users',
    label: 'Kelola Pengguna',
    description: 'Lihat daftar pengguna, aktifkan/nonaktifkan akun, dan lihat data kesehatan.',
    icon: Users,
    color: 'bg-[#EAF4FB]',
    iconColor: 'text-[#2E86C1]',
  },
  {
    href: '/admin/hero',
    label: 'Kelola Hero Banner',
    description: 'Tambah, edit, dan hapus banner hero yang tampil di halaman utama pengguna.',
    icon: Image,
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    href: '/admin/content',
    label: 'Kelola Konten Edukasi',
    description: 'Manajemen artikel dan konten edukasi kesehatan hipertensi.',
    icon: FileText,
    color: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    href: '/admin/logs',
    label: 'Log Aktivitas',
    description: 'Audit trail semua aksi admin — lihat siapa melakukan apa dan kapan.',
    icon: ScrollText,
    color: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
      return res.data.data!;
    },
  });

  const statCards = stats
    ? [
        { label: 'Total Pengguna', value: stats.totalUsers, icon: Users, color: 'text-[#2E86C1]', bg: 'bg-[#EAF4FB]' },
        { label: 'Pengguna Aktif', value: stats.activeUsers, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Total Rekam BP', value: stats.totalBPRecords, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Krisis 7 Hari', value: stats.crisisEventsLast7Days, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
      ]
    : [];

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <LayoutDashboard size={22} className="text-[#2E86C1]" />
          <h1 className="text-2xl font-bold text-[#1A2A3A]">Admin Dashboard</h1>
        </div>
        <p className="text-[#5D8AA8] text-sm">
          Selamat datang, {user?.fullName ?? user?.email}. Pilih modul yang ingin dikelola.
        </p>
      </div>

      {/* Stats */}
      {statCards.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[#5D8AA8] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {adminModules
          .filter(m => m.href !== '/admin/logs' || user?.role === 'SUPER_ADMIN')
          .map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#D6EAF8] hover:shadow-md hover:border-[#2E86C1] transition-all group"
            >
              <div className={`w-11 h-11 ${mod.color} rounded-xl flex items-center justify-center mb-4`}>
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
