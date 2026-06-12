'use client';

import { useState } from 'react';
import { Plus, BarChart2, List } from 'lucide-react';
import { BPInputForm } from '@/components/monitoring/BPInputForm';
import { BPHistoryTable } from '@/components/monitoring/BPHistoryTable';
import { BPTrendChart } from '@/components/dashboard/BPTrendChart';
import { PageHeader } from '@/components/shared/PageHeader';
import { useBPRecords, useBPRecords7Days, useBPStats } from '@/hooks/useBPRecords';
import { getBPCategoryDef } from '@/constants/bp-categories';
import type { BPCategory } from '@/types';

type View = 'form' | 'history';

const CATEGORY_COLORS: Record<BPCategory, string> = {
  NORMAL: '#16a34a',
  ELEVATED: '#ca8a04',
  STAGE_1: '#ea580c',
  STAGE_2: '#dc2626',
  CRISIS: '#7f1d1d',
};

export default function MonitoringPage() {
  const [view, setView] = useState<View>('form');
  const { data: bpPaginated, isLoading: tableLoading } = useBPRecords(1, 30);
  const { data: bp7Days = [] } = useBPRecords7Days();
  const { data: stats } = useBPStats();

  const records = bpPaginated?.items ?? [];

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Monitoring Tekanan Darah"
        subtitle="Pantau dan catat tekanan darah Anda secara rutin"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setView('form')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'form'
                  ? 'bg-[#2E86C1] text-white'
                  : 'bg-white text-[#5D8AA8] border border-[#D6E8F5] hover:bg-[#EAF4FB]'
              }`}
            >
              <Plus size={15} />
              Catat Baru
            </button>
            <button
              onClick={() => setView('history')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'history'
                  ? 'bg-[#2E86C1] text-white'
                  : 'bg-white text-[#5D8AA8] border border-[#D6E8F5] hover:bg-[#EAF4FB]'
              }`}
            >
              <List size={15} />
              Riwayat
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: form or history table */}
        <div className="lg:col-span-2 space-y-6">
          {view === 'form' ? (
            <div className="card p-6">
              <h2 className="section-title mb-5">Catat Tekanan Darah</h2>
              <BPInputForm onSuccess={() => setView('history')} />
            </div>
          ) : (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Riwayat Pengukuran</h2>
                <span className="text-xs text-[#5D8AA8]">{records.length} data</span>
              </div>
              <BPHistoryTable records={records} isLoading={tableLoading} />
            </div>
          )}

          {/* 30-day trend */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={18} className="text-[#2E86C1]" />
              <h2 className="section-title">Tren 7 Hari Terakhir</h2>
            </div>
            <BPTrendChart data={bp7Days} />
          </div>
        </div>

        {/* Right: stats */}
        <div className="space-y-4">
          {/* Stats cards */}
          <div className="card p-5">
            <h3 className="font-semibold text-[#1A2A3A] text-sm mb-4">Statistik 30 Hari</h3>
            {stats ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[#F4F8FC]">
                  <span className="text-xs text-[#5D8AA8]">Rata-rata Sistolik</span>
                  <span className="font-bold text-[#C0392B]">{stats.avgSystolic} mmHg</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#F4F8FC]">
                  <span className="text-xs text-[#5D8AA8]">Rata-rata Diastolik</span>
                  <span className="font-bold text-[#2E86C1]">{stats.avgDiastolic} mmHg</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#F4F8FC]">
                  <span className="text-xs text-[#5D8AA8]">Sistolik Min/Maks</span>
                  <span className="font-bold text-[#1A2A3A]">
                    {stats.minSystolic}/{stats.maxSystolic}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-[#5D8AA8]">Total Pengukuran</span>
                  <span className="font-bold text-[#1A2A3A]">{stats.totalRecords}x</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#AED6F1]">Belum ada data statistik</p>
            )}
          </div>

          {/* Category distribution */}
          {records.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-[#1A2A3A] text-sm mb-4">
                Distribusi Kategori
              </h3>
              <div className="space-y-2.5">
                {(['NORMAL', 'ELEVATED', 'STAGE_1', 'STAGE_2', 'CRISIS'] as BPCategory[]).map(
                  (cat) => {
                    const count = records.filter((r) => r.category === cat).length;
                    if (count === 0) return null;
                    const pct = Math.round((count / records.length) * 100);
                    const def = getBPCategoryDef(cat);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-[#1A2A3A]">{def.labelShort}</span>
                          <span className="text-xs text-[#5D8AA8]">
                            {count}x ({pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#EAF4FB] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: CATEGORY_COLORS[cat],
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="card p-5 bg-[#EAF4FB] border-[#AED6F1]">
            <h3 className="font-semibold text-[#1A5276] text-sm mb-3">Tips Pengukuran</h3>
            <ul className="space-y-2">
              {[
                'Ukur setelah istirahat 5 menit',
                'Hindari kafein 30 menit sebelumnya',
                'Duduk dengan punggung tegak',
                'Lengan sejajar dengan jantung',
                'Ukur 2x dengan jeda 1-2 menit',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs text-[#1A5276]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E86C1] shrink-0 mt-1" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
