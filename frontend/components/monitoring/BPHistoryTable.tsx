'use client';

import { formatDateWIB } from '@/lib/utils';
import { getBPCategoryDef } from '@/constants/bp-categories';
import type { BPRecord } from '@/types';

interface BPHistoryTableProps {
  records: BPRecord[];
  isLoading?: boolean;
}

export function BPHistoryTable({ records, isLoading }: BPHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-[#EAF4FB] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-[#AED6F1]">
        <p className="text-sm">Belum ada riwayat pengukuran</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[540px]">
        <thead>
          <tr className="border-b border-[#D6E8F5]">
            <th className="text-left py-3 px-3 text-[#5D8AA8] font-semibold text-xs uppercase tracking-wide">
              Waktu
            </th>
            <th className="text-center py-3 px-3 text-[#5D8AA8] font-semibold text-xs uppercase tracking-wide">
              Sistolik
            </th>
            <th className="text-center py-3 px-3 text-[#5D8AA8] font-semibold text-xs uppercase tracking-wide">
              Diastolik
            </th>
            <th className="text-center py-3 px-3 text-[#5D8AA8] font-semibold text-xs uppercase tracking-wide">
              Nadi
            </th>
            <th className="text-center py-3 px-3 text-[#5D8AA8] font-semibold text-xs uppercase tracking-wide">
              Status
            </th>
            <th className="text-left py-3 px-3 text-[#5D8AA8] font-semibold text-xs uppercase tracking-wide hidden md:table-cell">
              Catatan
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => {
            const catDef = getBPCategoryDef(record.category);
            return (
              <tr
                key={record.id}
                className={`border-b border-[#F4F8FC] hover:bg-[#EAF4FB] transition-colors ${
                  idx % 2 === 0 ? '' : 'bg-[#F4F8FC]/50'
                }`}
              >
                <td className="py-3 px-3 text-[#1A2A3A] whitespace-nowrap">
                  {formatDateWIB(record.measuredAt, {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Jakarta',
                  })}
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#C0392B]">
                  {record.systolic}
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#2E86C1]">
                  {record.diastolic}
                </td>
                <td className="py-3 px-3 text-center text-[#1A2A3A]">
                  {record.pulse ?? '–'}
                </td>
                <td className="py-3 px-3 text-center">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: catDef.bgColor,
                      color: catDef.textColor,
                    }}
                  >
                    {catDef.labelShort}
                  </span>
                </td>
                <td className="py-3 px-3 text-[#5D8AA8] text-xs hidden md:table-cell max-w-[160px] truncate">
                  {record.notes ?? '–'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
