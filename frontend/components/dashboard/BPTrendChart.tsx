'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { formatDateWIB } from '@/lib/utils';
import type { BPRecord } from '@/types';

interface BPTrendChartProps {
  data: BPRecord[];
}

interface ChartDataPoint {
  date: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#D6E8F5] rounded-xl shadow-lg p-3 text-sm">
        <p className="text-[#1A5276] font-semibold mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[#5D8AA8] capitalize">{entry.name}:</span>
            <span className="text-[#1A2A3A] font-semibold">{entry.value} mmHg</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function BPTrendChart({ data }: BPTrendChartProps) {
  const safeData: BPRecord[] = Array.isArray(data) ? data : [];
  const chartData: ChartDataPoint[] = [...safeData]
    .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
    .map((r) => ({
      date: formatDateWIB(r.measuredAt, {
        day: '2-digit',
        month: 'short',
        timeZone: 'Asia/Jakarta',
      }),
      systolic: r.systolic,
      diastolic: r.diastolic,
      pulse: r.pulse,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-[#AED6F1]">
        <p className="text-sm">Belum ada data untuk ditampilkan</p>
        <p className="text-xs mt-1">Mulai catat tekanan darah Anda</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center gap-5 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-[#C0392B] inline-block rounded" />
          <span className="text-[#5D8AA8]">Sistolik</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-[#2E86C1] inline-block" />
          <span className="text-[#5D8AA8]">Diastolik</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-3 h-3 rounded-full border-2 border-[#F5A623] bg-[#F5A623]/20 inline-block" />
          <span className="text-[#5D8AA8]">Normal &lt; 120/80</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EAF4FB" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#5D8AA8' }}
            axisLine={{ stroke: '#D6E8F5' }}
            tickLine={false}
          />
          <YAxis
            domain={[40, 200]}
            tick={{ fontSize: 11, fill: '#5D8AA8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Reference lines for normal range */}
          <ReferenceLine
            y={120}
            stroke="#2E86C1"
            strokeDasharray="4 4"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
          <ReferenceLine
            y={80}
            stroke="#2E86C1"
            strokeDasharray="4 4"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
          <Line
            type="monotone"
            dataKey="systolic"
            name="sistolik"
            stroke="#C0392B"
            strokeWidth={2.5}
            dot={{ fill: '#C0392B', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#C0392B' }}
          />
          <Line
            type="monotone"
            dataKey="diastolic"
            name="diastolik"
            stroke="#2E86C1"
            strokeWidth={2.5}
            strokeDasharray="6 3"
            dot={{ fill: '#2E86C1', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#2E86C1' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
