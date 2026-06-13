'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';
import { cn } from '@/lib/utils';

interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details?: Record<string, unknown>;
  createdAt: string | { _seconds: number };
}

const ACTION_COLORS: Record<string, string> = {
  ACTIVATE_USER: 'bg-green-100 text-green-700',
  DEACTIVATE_USER: 'bg-red-100 text-red-600',
  VIEW_USER_HEALTH_DATA: 'bg-blue-100 text-blue-700',
  CREATE_HERO: 'bg-purple-100 text-purple-700',
  DELETE_HERO: 'bg-orange-100 text-orange-700',
};

function toDateTime(val: string | { _seconds: number }): string {
  const d = typeof val === 'object' && '_seconds' in val ? new Date(val._seconds * 1000) : new Date(val as string);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminLogsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-logs', page],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ logs: AdminLog[]; total: number; totalPages: number }>>(`/admin/logs?page=${page}&limit=20`);
      return res.data.data!;
    },
  });

  const logs = data?.logs ?? [];

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ScrollText size={20} className="text-[#2E86C1]" />
          <h1 className="text-xl font-bold text-[#1A2A3A]">Log Aktivitas Admin</h1>
        </div>
        <p className="text-sm text-[#5D8AA8]">Total {data?.total ?? 0} entri log</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-14 bg-[#EAF4FB] rounded-xl animate-pulse" />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D6EAF8] p-12 text-center">
          <ScrollText size={36} className="text-[#AED6F1] mx-auto mb-3" />
          <p className="font-semibold text-[#1A2A3A]">Belum ada log aktivitas</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#D6EAF8] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F4F8FC] border-b border-[#D6EAF8]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D8AA8]">Aksi</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D8AA8] hidden sm:table-cell">Target</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D8AA8]">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F8FC]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAFCFF]">
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600')}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <p className="text-xs text-[#AED6F1] mt-1 font-mono truncate max-w-[120px]">{log.adminId}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {log.targetType && <p className="text-xs font-medium text-[#1A2A3A]">{log.targetType}</p>}
                      {log.targetId && <p className="text-xs text-[#AED6F1] font-mono truncate max-w-[140px]">{log.targetId}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5D8AA8] whitespace-nowrap">
                      {toDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(data?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-[#5D8AA8]">Halaman {page} dari {data?.totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-[#D6E8F5] text-[#5D8AA8] hover:bg-[#EAF4FB] disabled:opacity-40">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= (data?.totalPages ?? 1)} className="p-2 rounded-lg border border-[#D6E8F5] text-[#5D8AA8] hover:bg-[#EAF4FB] disabled:opacity-40">
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
