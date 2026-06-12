'use client';

import { Activity, Heart, Pill, Info } from 'lucide-react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useAuthStore } from '@/store/authStore';
import { useBPRecords } from '@/hooks/useBPRecords';
import { useTodayMedications } from '@/hooks/useMedications';
import { getBPCategoryDef } from '@/constants/bp-categories';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { data: bpPaginated } = useBPRecords(1, 1);
  const { data: todayMeds = [] } = useTodayMedications();

  const lastRecord = bpPaginated?.items?.[0];
  const catDef = lastRecord ? getBPCategoryDef(lastRecord.category) : null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#1A2A3A]">Chatbot AI</h1>
        <p className="text-sm text-[#5D8AA8] mt-0.5">
          Tanyakan apa saja tentang hipertensi kepada asisten AI kami
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Chat window — takes most space */}
        <div className="lg:col-span-3 card overflow-hidden flex flex-col">
          <ChatWindow />
        </div>

        {/* Right panel — health info */}
        <div className="hidden lg:flex flex-col gap-4">
          {/* Last BP */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-[#2E86C1]" />
              <p className="text-sm font-semibold text-[#1A2A3A]">Tensi Terakhir</p>
            </div>
            {lastRecord ? (
              <div>
                <p className="text-2xl font-bold text-[#1A2A3A] bp-number">
                  {lastRecord.systolic}
                  <span className="text-[#AED6F1] font-normal text-lg">/</span>
                  {lastRecord.diastolic}
                </p>
                <p className="text-xs text-[#5D8AA8]">mmHg</p>
                {catDef && (
                  <span
                    className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: catDef.bgColor, color: catDef.textColor }}
                  >
                    {catDef.label}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#AED6F1]">Belum ada data</p>
            )}
          </div>

          {/* Today's meds */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Pill size={16} className="text-[#2E86C1]" />
              <p className="text-sm font-semibold text-[#1A2A3A]">Obat Hari Ini</p>
            </div>
            {todayMeds.length === 0 ? (
              <p className="text-xs text-[#AED6F1]">Tidak ada obat terjadwal</p>
            ) : (
              <div className="space-y-2">
                {todayMeds.slice(0, 4).map((m) => {
                  const taken = m.todayLogs.some((l) => l.status === 'TAKEN');
                  return (
                    <div key={m.id} className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          taken ? 'bg-green-500' : 'bg-[#AED6F1]'
                        }`}
                      />
                      <p className="text-xs text-[#1A2A3A] truncate">{m.name}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="card p-4 bg-[#EAF4FB] border-[#AED6F1]">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-[#2E86C1] shrink-0 mt-0.5" />
              <p className="text-xs text-[#1A5276] leading-relaxed">
                Tensi-Bot adalah asisten informasi. Bukan pengganti konsultasi dokter. Selalu
                hubungi tenaga medis untuk penanganan medis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
