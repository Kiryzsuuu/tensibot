'use client';

import { useState } from 'react';
import { Plus, Pill, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useMedications, useLogMedication } from '@/hooks/useMedications';
import { formatDateWIB } from '@/lib/utils';
import type { MedicationWithStatus } from '@/types';
import { cn } from '@/lib/utils';

function MedCard({ med }: { med: MedicationWithStatus }) {
  const { mutate: logMed, isPending } = useLogMedication();
  const takenToday = med.todayLogs.filter((l) => l.status === 'TAKEN').length;
  const skippedToday = med.todayLogs.filter((l) => l.status === 'SKIPPED').length;
  const compliancePct = med.complianceRate ?? 0;

  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#EAF4FB] rounded-xl flex items-center justify-center shrink-0">
            <Pill size={20} className="text-[#2E86C1]" />
          </div>
          <div>
            <p className="font-semibold text-[#1A2A3A]">{med.name}</p>
            <p className="text-xs text-[#5D8AA8]">{med.dosage}</p>
          </div>
        </div>
        <span
          className={cn(
            'shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full',
            med.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          )}
        >
          {med.isActive ? 'Aktif' : 'Selesai'}
        </span>
      </div>

      {/* Schedule info */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div className="flex items-center gap-2 text-[#5D8AA8]">
          <Clock size={12} className="shrink-0" />
          <span>{med.frequency}</span>
        </div>
        <div className="flex items-center gap-2 text-[#5D8AA8]">
          <span className="text-[#AED6F1]">Jam:</span>
          <span className="text-[#1A2A3A] font-medium">{med.times.join(', ')}</span>
        </div>
        {med.startDate && (
          <div className="flex items-center gap-2 text-[#5D8AA8]">
            <span className="text-[#AED6F1]">Mulai:</span>
            <span>
              {formatDateWIB(med.startDate, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                timeZone: 'Asia/Jakarta',
              })}
            </span>
          </div>
        )}
        {med.endDate && (
          <div className="flex items-center gap-2 text-[#5D8AA8]">
            <span className="text-[#AED6F1]">Selesai:</span>
            <span>
              {formatDateWIB(med.endDate, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                timeZone: 'Asia/Jakarta',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Compliance bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-[#5D8AA8]">Kepatuhan 7 hari</span>
          <span className="text-xs font-semibold text-[#1A2A3A]">{compliancePct}%</span>
        </div>
        <div className="h-2 bg-[#EAF4FB] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${compliancePct}%`,
              backgroundColor:
                compliancePct >= 80 ? '#16a34a' : compliancePct >= 50 ? '#F5A623' : '#C0392B',
            }}
          />
        </div>
      </div>

      {/* Today's status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle size={12} />
            {takenToday} diminum
          </span>
          <span className="flex items-center gap-1 text-gray-400">
            <XCircle size={12} />
            {skippedToday} dilewati
          </span>
        </div>

        {med.isActive && (
          <div className="flex gap-1.5">
            <button
              onClick={() => logMed({ medicationId: med.id, status: 'TAKEN' })}
              disabled={isPending}
              className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Diminum
            </button>
            <button
              onClick={() => logMed({ medicationId: med.id, status: 'SKIPPED' })}
              disabled={isPending}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Lewati
            </button>
          </div>
        )}
      </div>

      {/* Notes */}
      {med.notes && (
        <div className="mt-3 pt-3 border-t border-[#F4F8FC] flex items-start gap-2">
          <AlertCircle size={12} className="text-[#AED6F1] shrink-0 mt-0.5" />
          <p className="text-xs text-[#5D8AA8]">{med.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function ObatPage() {
  const { data: medications = [], isLoading } = useMedications();
  const activeMeds = medications.filter((m) => m.isActive);
  const inactiveMeds = medications.filter((m) => !m.isActive);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Pengingat Obat"
        subtitle="Kelola jadwal dan kepatuhan minum obat Anda"
        actions={
          <button className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} />
            Tambah Obat
          </button>
        }
      />

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Obat Aktif',
            value: activeMeds.length,
            color: 'text-[#2E86C1]',
            bg: 'bg-[#EAF4FB]',
          },
          {
            label: 'Diminum Hari Ini',
            value: activeMeds.filter((m) => m.todayLogs.some((l) => l.status === 'TAKEN')).length,
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
          {
            label: 'Belum Diminum',
            value: activeMeds.filter(
              (m) => !m.todayLogs.some((l) => l.status === 'TAKEN' || l.status === 'SKIPPED')
            ).length,
            color: 'text-[#F5A623]',
            bg: 'bg-yellow-50',
          },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-[#5D8AA8] mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-[#EAF4FB] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : medications.length === 0 ? (
        <div className="card p-12 text-center">
          <Pill size={40} className="text-[#AED6F1] mx-auto mb-3" />
          <p className="text-[#1A2A3A] font-semibold">Belum ada data obat</p>
          <p className="text-[#5D8AA8] text-sm mt-1 mb-4">
            Tambahkan obat yang Anda konsumsi untuk mendapatkan pengingat
          </p>
          <button className="btn-primary mx-auto">Tambah Obat Pertama</button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeMeds.length > 0 && (
            <div>
              <h2 className="section-title mb-4">Obat Aktif ({activeMeds.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeMeds.map((m) => (
                  <MedCard key={m.id} med={m} />
                ))}
              </div>
            </div>
          )}
          {inactiveMeds.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-[#5D8AA8] mb-4">
                Riwayat Obat ({inactiveMeds.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {inactiveMeds.map((m) => (
                  <MedCard key={m.id} med={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
