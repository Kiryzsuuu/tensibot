'use client';

import { useState } from 'react';
import { Plus, Pill, Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/shared/PageHeader';
import { useTodayMedications, useLogMedication, useCreateMedication } from '@/hooks/useMedications';
import { formatDateWIB } from '@/lib/utils';
import type { MedicationWithStatus } from '@/types';
import { cn } from '@/lib/utils';

// ─── Add Medication Modal ─────────────────────────────────────────────────────

const addSchema = z.object({
  name: z.string().min(1, 'Nama obat wajib diisi').max(100),
  dosage: z.string().min(1, 'Dosis wajib diisi').max(100),
  frequency: z.string().min(1, 'Frekuensi wajib diisi'),
  times: z.string().min(1, 'Waktu minum wajib diisi'),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
  endDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});
type AddForm = z.infer<typeof addSchema>;

function AddMedModal({ onClose }: { onClose: () => void }) {
  const { mutate: createMed, isPending, error } = useCreateMedication();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddForm>({ resolver: zodResolver(addSchema) });

  const onSubmit = (data: AddForm) => {
    const times = data.times
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    createMed(
      {
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        times,
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        notes: data.notes,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F4F8FC]">
          <h2 className="text-lg font-bold text-[#1A2A3A]">Tambah Obat Baru</h2>
          <button onClick={onClose} className="text-[#AED6F1] hover:text-[#5D8AA8] transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              Gagal menyimpan. Coba lagi.
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Nama Obat</label>
            <input {...register('name')} className="input-field" placeholder="Amlodipine" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Dosis</label>
            <input {...register('dosage')} className="input-field" placeholder="5 mg" />
            {errors.dosage && <p className="text-red-500 text-xs mt-1">{errors.dosage.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Frekuensi</label>
            <select {...register('frequency')} className="input-field">
              <option value="">-- Pilih --</option>
              <option value="Sekali sehari">Sekali sehari</option>
              <option value="Dua kali sehari">Dua kali sehari</option>
              <option value="Tiga kali sehari">Tiga kali sehari</option>
              <option value="Setiap 8 jam">Setiap 8 jam</option>
              <option value="Setiap 12 jam">Setiap 12 jam</option>
              <option value="Jika diperlukan">Jika diperlukan</option>
            </select>
            {errors.frequency && <p className="text-red-500 text-xs mt-1">{errors.frequency.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
              Waktu Minum <span className="font-normal text-[#5D8AA8]">(pisah koma, format HH:MM)</span>
            </label>
            <input {...register('times')} className="input-field" placeholder="08:00, 20:00" />
            {errors.times && <p className="text-red-500 text-xs mt-1">{errors.times.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Mulai</label>
              <input type="date" {...register('startDate')} className="input-field" />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Selesai <span className="font-normal text-[#5D8AA8]">(opsional)</span></label>
              <input type="date" {...register('endDate')} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Catatan <span className="font-normal text-[#5D8AA8]">(opsional)</span></label>
            <textarea
              {...register('notes')}
              className="input-field resize-none"
              rows={2}
              placeholder="Minum setelah makan..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">
              Batal
            </button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1 py-2.5">
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </span>
              ) : (
                'Simpan Obat'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Med Card ─────────────────────────────────────────────────────────────────

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
        <span className={cn('shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full', med.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
          {med.isActive ? 'Aktif' : 'Selesai'}
        </span>
      </div>

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
            <span>{formatDateWIB(med.startDate, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })}</span>
          </div>
        )}
        {med.endDate && (
          <div className="flex items-center gap-2 text-[#5D8AA8]">
            <span className="text-[#AED6F1]">Selesai:</span>
            <span>{formatDateWIB(med.endDate, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })}</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-[#5D8AA8]">Kepatuhan 7 hari</span>
          <span className="text-xs font-semibold text-[#1A2A3A]">{compliancePct}%</span>
        </div>
        <div className="h-2 bg-[#EAF4FB] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${compliancePct}%`, backgroundColor: compliancePct >= 80 ? '#16a34a' : compliancePct >= 50 ? '#F5A623' : '#C0392B' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-600"><CheckCircle size={12} />{takenToday} diminum</span>
          <span className="flex items-center gap-1 text-gray-400"><XCircle size={12} />{skippedToday} dilewati</span>
        </div>
        {med.isActive && (
          <div className="flex gap-1.5">
            <button onClick={() => logMed({ medicationId: med.id, status: 'TAKEN' })} disabled={isPending} className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50">
              Diminum
            </button>
            <button onClick={() => logMed({ medicationId: med.id, status: 'SKIPPED' })} disabled={isPending} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50">
              Lewati
            </button>
          </div>
        )}
      </div>

      {med.notes && (
        <div className="mt-3 pt-3 border-t border-[#F4F8FC] flex items-start gap-2">
          <AlertCircle size={12} className="text-[#AED6F1] shrink-0 mt-0.5" />
          <p className="text-xs text-[#5D8AA8]">{med.notes}</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ObatPage() {
  const [showModal, setShowModal] = useState(false);
  const { data: medications = [], isLoading } = useTodayMedications();
  const activeMeds = medications.filter((m) => m.isActive);
  const inactiveMeds = medications.filter((m) => !m.isActive);

  return (
    <div className="max-w-7xl mx-auto">
      {showModal && <AddMedModal onClose={() => setShowModal(false)} />}

      <PageHeader
        title="Pengingat Obat"
        subtitle="Kelola jadwal dan kepatuhan minum obat Anda"
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} />
            Tambah Obat
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Obat Aktif', value: activeMeds.length, color: 'text-[#2E86C1]', bg: 'bg-[#EAF4FB]' },
          { label: 'Diminum Hari Ini', value: activeMeds.filter((m) => m.todayLogs.some((l) => l.status === 'TAKEN')).length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Belum Diminum', value: activeMeds.filter((m) => !m.todayLogs.some((l) => l.status === 'TAKEN' || l.status === 'SKIPPED')).length, color: 'text-[#F5A623]', bg: 'bg-yellow-50' },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-[#5D8AA8] mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-[#EAF4FB] rounded-2xl animate-pulse" />)}
        </div>
      ) : medications.length === 0 ? (
        <div className="card p-12 text-center">
          <Pill size={40} className="text-[#AED6F1] mx-auto mb-3" />
          <p className="text-[#1A2A3A] font-semibold">Belum ada data obat</p>
          <p className="text-[#5D8AA8] text-sm mt-1 mb-4">Tambahkan obat yang Anda konsumsi untuk mendapatkan pengingat</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">Tambah Obat Pertama</button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeMeds.length > 0 && (
            <div>
              <h2 className="section-title mb-4">Obat Aktif ({activeMeds.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeMeds.map((m) => <MedCard key={m.id} med={m} />)}
              </div>
            </div>
          )}
          {inactiveMeds.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-[#5D8AA8] mb-4">Riwayat Obat ({inactiveMeds.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {inactiveMeds.map((m) => <MedCard key={m.id} med={m} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
