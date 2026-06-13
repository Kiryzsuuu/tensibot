'use client';

import { Activity, Pill } from 'lucide-react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useBPRecords } from '@/hooks/useBPRecords';
import { useTodayMedications } from '@/hooks/useMedications';
import { getBPCategoryDef } from '@/constants/bp-categories';

export default function ChatPage() {
  const { data: bpPaginated } = useBPRecords(1, 1);
  const { data: todayMeds = [] } = useTodayMedications();

  const lastRecord = bpPaginated?.items?.[0];
  const catDef = lastRecord ? getBPCategoryDef(lastRecord.category) : null;

  return (
    /*
     * Escape the dashboard padding so chat fills edge-to-edge like WhatsApp.
     * -m-4 md:-m-6 lg:-m-8 cancels the parent padding in layout.tsx
     */
    <div className="-m-4 md:-m-6 lg:-m-8 flex h-[calc(100vh-64px)]">

      {/* ── Desktop side panel ─────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-r border-[#D6EAF8] bg-white shrink-0">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#D6EAF8]">
          <p className="text-base font-bold text-[#1A2A3A]">Chatbot AI</p>
          <p className="text-xs text-[#5D8AA8] mt-0.5">Asisten kesehatan hipertensi</p>
        </div>

        {/* Health summary */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Last BP */}
          <div className="bg-[#F4F8FC] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={15} className="text-[#2E86C1]" />
              <p className="text-xs font-semibold text-[#5D8AA8] uppercase tracking-wide">Tensi Terakhir</p>
            </div>
            {lastRecord ? (
              <div>
                <p className="text-3xl font-bold text-[#1A2A3A] tracking-tight">
                  {lastRecord.systolic}
                  <span className="text-[#AED6F1] font-normal text-xl">/</span>
                  {lastRecord.diastolic}
                  <span className="text-sm font-normal text-[#5D8AA8] ml-1">mmHg</span>
                </p>
                {catDef && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: catDef.bgColor, color: catDef.textColor }}>
                    {catDef.label}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#AED6F1]">Belum ada data</p>
            )}
          </div>

          {/* Today meds */}
          <div className="bg-[#F4F8FC] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Pill size={15} className="text-[#2E86C1]" />
              <p className="text-xs font-semibold text-[#5D8AA8] uppercase tracking-wide">Obat Hari Ini</p>
            </div>
            {todayMeds.length === 0 ? (
              <p className="text-sm text-[#AED6F1]">Tidak ada obat terjadwal</p>
            ) : (
              <div className="space-y-2">
                {todayMeds.slice(0, 5).map((m) => {
                  const taken = m.todayLogs.some((l) => l.status === 'TAKEN');
                  return (
                    <div key={m.id} className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${taken ? 'bg-green-500' : 'bg-[#AED6F1]'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1A2A3A] truncate">{m.name}</p>
                        <p className="text-xs text-[#AED6F1]">{m.dosage}</p>
                      </div>
                      {taken && <span className="text-xs text-green-600 font-medium shrink-0">✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3">
            <p className="text-xs text-yellow-800 leading-relaxed">
              ⚠️ Tensi-Bot adalah asisten informasi, bukan pengganti dokter. Selalu konsultasikan kondisi Anda dengan tenaga medis.
            </p>
          </div>
        </div>
      </aside>

      {/* ── Chat area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow />
      </div>
    </div>
  );
}
