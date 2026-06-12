'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Shield, ShieldOff, ChevronLeft, ChevronRight, Eye, X, Activity } from 'lucide-react';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string | { _seconds: number };
  profile?: { fullName?: string; phone?: string } | null;
}

interface UserHealthData {
  id: string;
  email: string;
  role: string;
  profile?: { fullName?: string; age?: number; diagnosis?: string } | null;
  bpRecords: { systolic: number; diastolic: number; measuredAt: string | { _seconds: number } }[];
  medications: { name: string; dosage: string; isActive: boolean }[];
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  DOKTER: 'bg-teal-100 text-teal-700',
  PROFESIONAL: 'bg-cyan-100 text-cyan-700',
  FARMASI: 'bg-green-100 text-green-700',
  STAF: 'bg-gray-100 text-gray-600',
  PASIEN: 'bg-[#EAF4FB] text-[#2E86C1]',
};

function toDate(val: string | { _seconds: number } | undefined): string {
  if (!val) return '—';
  if (typeof val === 'object' && '_seconds' in val) {
    return new Date(val._seconds * 1000).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return new Date(val as string).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Health Data Modal ──────────────────────────────────────────────────────

function HealthModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-health', userId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<UserHealthData>>(`/admin/users/${userId}/health-data`);
      return res.data.data!;
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F4F8FC] sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[#2E86C1]" />
            <h2 className="font-bold text-[#1A2A3A]">Data Kesehatan</h2>
          </div>
          <button onClick={onClose} className="text-[#AED6F1] hover:text-[#5D8AA8]"><X size={18} /></button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-[#2E86C1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <p className="p-6 text-[#5D8AA8] text-sm">Data tidak ditemukan.</p>
        ) : (
          <div className="p-6 space-y-5">
            <div className="bg-[#F4F8FC] rounded-xl p-4">
              <p className="text-xs text-[#5D8AA8] mb-1">Email</p>
              <p className="font-semibold text-[#1A2A3A] text-sm">{data.email}</p>
              {data.profile?.fullName && <p className="text-xs text-[#5D8AA8] mt-1">{data.profile.fullName}</p>}
              {data.profile?.diagnosis && <p className="text-xs text-[#5D8AA8]">Diagnosis: {data.profile.diagnosis}</p>}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1A2A3A] mb-3">
                Riwayat Tekanan Darah ({data.bpRecords.length} data)
              </h3>
              {data.bpRecords.length === 0 ? (
                <p className="text-xs text-[#5D8AA8]">Belum ada data tekanan darah.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data.bpRecords.slice(0, 10).map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-[#F4F8FC] rounded-lg px-3 py-2">
                      <span className="font-mono font-semibold text-[#1A2A3A]">{r.systolic}/{r.diastolic} mmHg</span>
                      <span className="text-xs text-[#AED6F1]">{toDate(r.measuredAt)}</span>
                    </div>
                  ))}
                  {data.bpRecords.length > 10 && (
                    <p className="text-xs text-[#AED6F1] text-center">+{data.bpRecords.length - 10} data lainnya</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1A2A3A] mb-3">
                Obat Aktif ({data.medications.filter(m => m.isActive).length})
              </h3>
              {data.medications.filter(m => m.isActive).length === 0 ? (
                <p className="text-xs text-[#5D8AA8]">Tidak ada obat aktif.</p>
              ) : (
                <div className="space-y-2">
                  {data.medications.filter(m => m.isActive).map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-[#F4F8FC] rounded-lg px-3 py-2">
                      <span className="font-medium text-[#1A2A3A]">{m.name}</span>
                      <span className="text-[#5D8AA8] text-xs">{m.dosage}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ users: AdminUser[]; total: number; totalPages: number }>>(`/admin/users?page=${page}&limit=20`);
      return res.data.data!;
    },
  });

  const { mutate: toggleStatus, isPending: toggling } = useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.patch<ApiResponse<{ isActive: boolean }>>(`/admin/users/${userId}/toggle-status`);
      return res.data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const users = data?.users ?? [];
  const filtered = search
    ? users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.profile?.fullName ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  return (
    <div>
      {viewUserId && <HealthModal userId={viewUserId} onClose={() => setViewUserId(null)} />}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Users size={20} className="text-[#2E86C1]" />
          <h1 className="text-xl font-bold text-[#1A2A3A]">Kelola Pengguna</h1>
        </div>
        <p className="text-sm text-[#5D8AA8]">Total {data?.total ?? 0} pengguna terdaftar</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AED6F1]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari email atau nama..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#D6E8F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E86C1]/30 bg-white"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#EAF4FB] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#D6EAF8] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F4F8FC] border-b border-[#D6EAF8]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D8AA8]">Pengguna</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D8AA8] hidden sm:table-cell">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D8AA8] hidden md:table-cell">Terdaftar</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D8AA8]">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D8AA8]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F8FC]">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FAFCFF] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1A2A3A] truncate max-w-[160px]">{user.email}</p>
                      {user.profile?.fullName && (
                        <p className="text-xs text-[#5D8AA8]">{user.profile.fullName}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-600')}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5D8AA8] hidden md:table-cell">
                      {toDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                        {user.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewUserId(user.id)}
                          className="p-1.5 text-[#AED6F1] hover:text-[#2E86C1] hover:bg-[#EAF4FB] rounded-lg transition-colors"
                          title="Lihat data kesehatan"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => toggleStatus(user.id)}
                          disabled={toggling}
                          className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            user.isActive
                              ? 'text-red-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-green-500 hover:text-green-700 hover:bg-green-50',
                          )}
                          title={user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {user.isActive ? <ShieldOff size={15} /> : <Shield size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Users size={32} className="text-[#AED6F1] mx-auto mb-2" />
                <p className="text-[#5D8AA8] text-sm">Tidak ada pengguna ditemukan</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!search && (data?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-[#5D8AA8]">
                Halaman {page} dari {data?.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-[#D6E8F5] text-[#5D8AA8] hover:bg-[#EAF4FB] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= (data?.totalPages ?? 1)}
                  className="p-2 rounded-lg border border-[#D6E8F5] text-[#5D8AA8] hover:bg-[#EAF4FB] disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
