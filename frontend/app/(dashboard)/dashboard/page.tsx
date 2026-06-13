'use client';

import { Activity, Heart, TrendingUp, Calendar, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { BPHeroCard } from '@/components/dashboard/BPHeroCard';
import { BPTrendChart } from '@/components/dashboard/BPTrendChart';
import { HeroBanner } from '@/components/dashboard/HeroBanner';
import { MedicationList } from '@/components/dashboard/MedicationList';
import { StatCard } from '@/components/dashboard/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuthStore } from '@/store/authStore';
import { useBPRecords, useBPRecords7Days, useBPStats } from '@/hooks/useBPRecords';
import { useTodayMedications } from '@/hooks/useMedications';
import { useHeroPublic } from '@/hooks/useHero';
import { getGreeting } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: bpPaginated, isLoading: bpLoading } = useBPRecords(1, 1);
  const { data: bp7Days = [], isLoading: chartLoading } = useBPRecords7Days();
  const { data: bpStats } = useBPStats();
  const { data: todayMeds = [], isLoading: medsLoading } = useTodayMedications();
  const { data: heroes = [] } = useHeroPublic();

  const lastRecord = bpPaginated?.items?.[0] ?? null;
  const firstName = user?.fullName?.split(' ')[0] ?? 'Pengguna';

  // Compliance stat
  const totalMeds = todayMeds.length;
  const takenMeds = todayMeds.filter((m) => m.todayLogs.some((l) => l.status === 'TAKEN')).length;
  const compliancePct = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A2A3A]">
          {getGreeting()}, {firstName}! 👋
        </h1>
        <p className="text-[#5D8AA8] text-sm mt-1">
          Berikut ringkasan kesehatan Anda hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Banner */}
          {heroes.length > 0 && <HeroBanner heroes={heroes} />}

          {/* BP Hero Card */}
          {bpLoading ? (
            <div className="h-48 bg-[#EAF4FB] rounded-2xl animate-pulse" />
          ) : (
            <BPHeroCard record={lastRecord} />
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={<Activity size={20} className="text-[#2E86C1]" />}
              value={
                bpStats
                  ? `${bpStats.avgSystolic}/${bpStats.avgDiastolic}`
                  : '–'
              }
              label="Rata-rata 30 Hari"
              iconBg="bg-[#EAF4FB]"
              change={bpStats ? `${bpStats.totalRecords} pengukuran` : undefined}
              changeType="neutral"
            />
            <StatCard
              icon={<Heart size={20} className="text-green-600" />}
              value={`${compliancePct}%`}
              label="Kepatuhan Obat Hari Ini"
              iconBg="bg-green-50"
              change={`${takenMeds}/${totalMeds} obat`}
              changeType={compliancePct >= 80 ? 'up' : compliancePct >= 50 ? 'neutral' : 'down'}
            />
            <StatCard
              icon={<TrendingUp size={20} className="text-[#F5A623]" />}
              value={
                bpStats
                  ? `${bpStats.minSystolic}–${bpStats.maxSystolic}`
                  : '–'
              }
              label="Range Sistolik 30 Hari"
              iconBg="bg-yellow-50"
            />
          </div>

          {/* Trend chart */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title">Tren Tekanan Darah</h2>
                <p className="text-xs text-[#5D8AA8] mt-0.5">7 hari terakhir</p>
              </div>
              <Link
                href="/monitoring"
                className="text-xs text-[#2E86C1] hover:underline font-medium"
              >
                Lihat semua
              </Link>
            </div>
            {chartLoading ? (
              <div className="h-[220px] bg-[#EAF4FB] rounded-xl animate-pulse" />
            ) : (
              <BPTrendChart data={bp7Days} />
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Chat CTA */}
          <div className="bg-gradient-to-br from-[#2E86C1] to-[#154360] rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">Asisten Tensi-Bot</p>
                <p className="text-xs text-[#AED6F1]">Tanya apa saja</p>
              </div>
            </div>
            <p className="text-[#AED6F1] text-xs mb-4 leading-relaxed">
              Ada pertanyaan tentang hipertensi atau tekanan darah Anda? Asisten AI kami siap
              membantu 24/7.
            </p>
            <Link
              href="/chat"
              className="block text-center bg-white text-[#2E86C1] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#EAF4FB] transition-colors"
            >
              Mulai Konsultasi
            </Link>
          </div>

          {/* Today's medications */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title">Obat Hari Ini</h2>
                <p className="text-xs text-[#5D8AA8] mt-0.5">
                  {takenMeds}/{totalMeds} sudah diminum
                </p>
              </div>
              <Link href="/obat" className="text-xs text-[#2E86C1] hover:underline font-medium">
                Kelola
              </Link>
            </div>
            {medsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 bg-[#EAF4FB] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <MedicationList medications={todayMeds} />
            )}
          </div>

          {/* Calendar reminder */}
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-[#EAF4FB] rounded-xl flex items-center justify-center">
                <Calendar size={18} className="text-[#2E86C1]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1A2A3A]">Jadwal Pengukuran</p>
                <p className="text-xs text-[#5D8AA8]">Rekomendasi: 2x sehari</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              {['Pagi (07:00)', 'Malam (20:00)'].map((t) => (
                <div
                  key={t}
                  className="bg-[#EAF4FB] rounded-lg py-2 px-3 text-xs font-medium text-[#1A5276]"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
