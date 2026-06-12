'use client';

import { Activity, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDateWIB } from '@/lib/utils';
import { getBPCategoryDef } from '@/constants/bp-categories';
import type { BPRecord } from '@/types';

interface BPHeroCardProps {
  record: BPRecord | null;
}

export function BPHeroCard({ record }: BPHeroCardProps) {
  if (!record) {
    return (
      <div className="bg-gradient-to-br from-[#154360] to-[#1A5276] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Activity size={22} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#AED6F1]">Tekanan Darah Terakhir</p>
            <p className="text-xs text-[#5D8AA8]">Belum ada data</p>
          </div>
        </div>
        <p className="text-[#AED6F1] text-sm mb-4">
          Anda belum mencatat tekanan darah. Mulai catat sekarang!
        </p>
        <Link
          href="/monitoring"
          className="inline-flex items-center gap-2 bg-[#2E86C1] hover:bg-[#2980B9] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          Catat Sekarang
        </Link>
      </div>
    );
  }

  const catDef = getBPCategoryDef(record.category);
  const isCrisis = record.category === 'CRISIS';

  return (
    <div
      className={cn(
        'rounded-2xl p-6 text-white shadow-lg relative overflow-hidden',
        isCrisis
          ? 'bg-gradient-to-br from-[#7f1d1d] to-[#991b1b]'
          : 'bg-gradient-to-br from-[#154360] to-[#1A5276]'
      )}
    >
      {/* Decorative circle */}
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-white/5" />

      {/* Crisis warning */}
      {isCrisis && (
        <div className="flex items-center gap-2 bg-red-500/30 rounded-lg px-3 py-2 mb-4 border border-red-400/30">
          <AlertTriangle size={16} className="text-red-200 shrink-0" />
          <p className="text-red-100 text-xs font-semibold">
            KRISIS HIPERTENSI — Segera ke IGD!
          </p>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 relative">
        <div>
          <p className="text-sm font-semibold text-[#AED6F1] mb-1">Tekanan Darah Terakhir</p>

          {/* Big numbers */}
          <div className="flex items-end gap-3 my-3">
            <div className="text-center">
              <p className="text-[56px] font-bold leading-none bp-number drop-shadow">
                {record.systolic}
              </p>
              <p className="text-[#AED6F1] text-xs mt-1">Sistolik</p>
            </div>
            <span className="text-[#AED6F1] text-3xl font-light mb-4">/</span>
            <div className="text-center">
              <p className="text-[40px] font-bold leading-none bp-number drop-shadow text-[#AED6F1]">
                {record.diastolic}
              </p>
              <p className="text-[#5D8AA8] text-xs mt-1">Diastolik</p>
            </div>
            <span className="text-[#5D8AA8] text-sm ml-1 mb-2">mmHg</span>
          </div>

          {/* Pulse */}
          {record.pulse && (
            <div className="flex items-center gap-1.5 text-[#AED6F1] text-sm">
              <span className="text-lg">♥</span>
              <span>{record.pulse} bpm</span>
            </div>
          )}

          {/* Time */}
          <div className="flex items-center gap-1.5 mt-2 text-[#5D8AA8] text-xs">
            <Clock size={12} />
            <span>{formatDateWIB(record.measuredAt)}</span>
          </div>
        </div>

        {/* Category badge */}
        <div className="shrink-0">
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border"
            style={{
              backgroundColor: catDef.bgColor + '33',
              color: catDef.bgColor,
              borderColor: catDef.bgColor + '55',
            }}
          >
            {catDef.label}
          </span>
        </div>
      </div>

      {/* Recommendation */}
      <p className="text-[#AED6F1] text-xs mt-4 relative leading-relaxed">
        {catDef.description}
      </p>
    </div>
  );
}
