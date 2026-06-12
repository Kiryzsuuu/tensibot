'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBPCategory, getBPCategoryDef } from '@/constants/bp-categories';
import { useCreateBPRecord } from '@/hooks/useBPRecords';
import type { BPCategory } from '@/types';

const schema = z
  .object({
    systolic: z
      .number({ invalid_type_error: 'Harus angka' })
      .min(60, 'Min 60 mmHg')
      .max(300, 'Maks 300 mmHg'),
    diastolic: z
      .number({ invalid_type_error: 'Harus angka' })
      .min(40, 'Min 40 mmHg')
      .max(200, 'Maks 200 mmHg'),
    pulse: z
      .number({ invalid_type_error: 'Harus angka' })
      .min(30, 'Min 30 bpm')
      .max(300, 'Maks 300 bpm')
      .optional(),
    measuredAt: z.string().min(1, 'Waktu harus diisi'),
    notes: z.string().max(300).optional(),
  })
  .refine((d) => d.systolic > d.diastolic, {
    message: 'Sistolik harus lebih besar dari diastolik',
    path: ['systolic'],
  });

type FormData = z.infer<typeof schema>;

interface BPInputFormProps {
  onSuccess?: () => void;
}

const SCALE_SEGMENTS = [
  { label: 'Normal', color: '#16a34a', widthPct: 25 },
  { label: 'Meningkat', color: '#ca8a04', widthPct: 15 },
  { label: 'Stage 1', color: '#ea580c', widthPct: 20 },
  { label: 'Stage 2', color: '#dc2626', widthPct: 25 },
  { label: 'Krisis', color: '#7f1d1d', widthPct: 15 },
];

export function BPInputForm({ onSuccess }: BPInputFormProps) {
  const { mutateAsync: createRecord, isPending } = useCreateBPRecord();
  const [previewCategory, setPreviewCategory] = useState<BPCategory | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      measuredAt: new Date().toISOString().slice(0, 16),
    },
  });

  const systolicVal = watch('systolic');
  const diastolicVal = watch('diastolic');

  useEffect(() => {
    if (systolicVal >= 60 && diastolicVal >= 40) {
      setPreviewCategory(getBPCategory(systolicVal, diastolicVal));
    } else {
      setPreviewCategory(null);
    }
  }, [systolicVal, diastolicVal]);

  const onSubmit = async (data: FormData) => {
    try {
      await createRecord({
        systolic: data.systolic,
        diastolic: data.diastolic,
        pulse: data.pulse,
        measuredAt: new Date(data.measuredAt).toISOString(),
        notes: data.notes,
      });
      setSubmitSuccess(true);
      reset({ measuredAt: new Date().toISOString().slice(0, 16) });
      setTimeout(() => setSubmitSuccess(false), 3000);
      onSuccess?.();
    } catch {
      // error handled by react-query
    }
  };

  const catDef = previewCategory ? getBPCategoryDef(previewCategory) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Success message */}
      {submitSuccess && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
          <CheckCircle size={16} />
          <span>Tekanan darah berhasil disimpan!</span>
        </div>
      )}

      {/* Preview category */}
      {catDef && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 border text-sm"
          style={{
            backgroundColor: catDef.bgColor + '40',
            borderColor: catDef.borderColor,
          }}
        >
          {catDef.urgency === 'critical' ? (
            <AlertTriangle size={18} style={{ color: catDef.textColor }} className="shrink-0 mt-0.5" />
          ) : (
            <Activity size={18} style={{ color: catDef.textColor }} className="shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold" style={{ color: catDef.textColor }}>
              {catDef.label}
            </p>
            <p className="text-xs mt-0.5 opacity-80" style={{ color: catDef.textColor }}>
              {catDef.description}
            </p>
          </div>
        </div>
      )}

      {/* BP Scale bar */}
      <div>
        <p className="text-xs text-[#5D8AA8] mb-2 font-medium">Skala Tekanan Darah</p>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {SCALE_SEGMENTS.map((seg) => (
            <div
              key={seg.label}
              className="h-full rounded-sm"
              style={{
                width: `${seg.widthPct}%`,
                backgroundColor: seg.color,
                opacity:
                  catDef && catDef.label === seg.label ? 1 : 0.3,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {SCALE_SEGMENTS.map((seg) => (
            <span
              key={seg.label}
              className="text-[9px] text-[#5D8AA8]"
              style={{ width: `${seg.widthPct}%`, textAlign: 'center' }}
            >
              {seg.label}
            </span>
          ))}
        </div>
      </div>

      {/* Systolic / Diastolic */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
            Sistolik <span className="text-[#C0392B]">*</span>
            <span className="text-xs text-[#5D8AA8] font-normal ml-1">(mmHg)</span>
          </label>
          <input
            type="number"
            {...register('systolic', { valueAsNumber: true })}
            placeholder="120"
            className={cn(
              'input-field text-center text-xl font-bold',
              errors.systolic && 'border-red-400 ring-red-200'
            )}
          />
          {errors.systolic && (
            <p className="text-red-500 text-xs mt-1">{errors.systolic.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
            Diastolik <span className="text-[#C0392B]">*</span>
            <span className="text-xs text-[#5D8AA8] font-normal ml-1">(mmHg)</span>
          </label>
          <input
            type="number"
            {...register('diastolic', { valueAsNumber: true })}
            placeholder="80"
            className={cn(
              'input-field text-center text-xl font-bold',
              errors.diastolic && 'border-red-400 ring-red-200'
            )}
          />
          {errors.diastolic && (
            <p className="text-red-500 text-xs mt-1">{errors.diastolic.message}</p>
          )}
        </div>
      </div>

      {/* Pulse + DateTime */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
            Denyut Nadi
            <span className="text-xs text-[#5D8AA8] font-normal ml-1">(bpm)</span>
          </label>
          <input
            type="number"
            {...register('pulse', { valueAsNumber: true })}
            placeholder="72"
            className={cn('input-field', errors.pulse && 'border-red-400')}
          />
          {errors.pulse && (
            <p className="text-red-500 text-xs mt-1">{errors.pulse.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
            Waktu Pengukuran <span className="text-[#C0392B]">*</span>
          </label>
          <input
            type="datetime-local"
            {...register('measuredAt')}
            className={cn('input-field', errors.measuredAt && 'border-red-400')}
          />
          {errors.measuredAt && (
            <p className="text-red-500 text-xs mt-1">{errors.measuredAt.message}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
          Catatan <span className="text-xs text-[#5D8AA8] font-normal">(opsional)</span>
        </label>
        <textarea
          {...register('notes')}
          rows={2}
          placeholder="Kondisi saat pengukuran, gejala, dll..."
          className="input-field resize-none"
        />
      </div>

      {/* Submit */}
      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? 'Menyimpan...' : 'Simpan Catatan Tensi'}
      </button>
    </form>
  );
}
