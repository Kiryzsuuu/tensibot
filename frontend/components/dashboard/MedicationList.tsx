'use client';

import { Check, Clock, X, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLogMedication } from '@/hooks/useMedications';
import type { MedicationWithStatus } from '@/types';

interface MedicationListProps {
  medications: MedicationWithStatus[];
}

export function MedicationList({ medications }: MedicationListProps) {
  const { mutate: logMed, isPending } = useLogMedication();

  if (medications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-[#AED6F1]">
        <Pill size={32} className="mb-2 opacity-50" />
        <p className="text-sm">Belum ada jadwal obat hari ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {medications.map((med) => {
        const takenLog = med.todayLogs.find((l) => l.status === 'TAKEN');
        const skippedLog = med.todayLogs.find((l) => l.status === 'SKIPPED');
        const isTaken = !!takenLog;
        const isSkipped = !!skippedLog;

        return (
          <div
            key={med.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl border transition-all',
              isTaken
                ? 'bg-green-50 border-green-200'
                : isSkipped
                ? 'bg-gray-50 border-gray-200 opacity-60'
                : 'bg-white border-[#D6E8F5] hover:border-[#AED6F1]'
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                isTaken
                  ? 'bg-green-100'
                  : isSkipped
                  ? 'bg-gray-100'
                  : 'bg-[#EAF4FB]'
              )}
            >
              <Pill
                size={18}
                className={cn(
                  isTaken ? 'text-green-600' : isSkipped ? 'text-gray-400' : 'text-[#2E86C1]'
                )}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm font-semibold truncate',
                  isTaken
                    ? 'text-green-800 line-through'
                    : isSkipped
                    ? 'text-gray-500 line-through'
                    : 'text-[#1A2A3A]'
                )}
              >
                {med.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-[#5D8AA8]">{med.dosage}</span>
                {med.times.length > 0 && (
                  <>
                    <span className="text-[#D6E8F5]">·</span>
                    <span className="flex items-center gap-1 text-xs text-[#5D8AA8]">
                      <Clock size={11} />
                      {med.times.join(', ')}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {!isTaken && !isSkipped && (
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => logMed({ medicationId: med.id, status: 'TAKEN' })}
                  disabled={isPending}
                  className="w-8 h-8 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Tandai sudah diminum"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => logMed({ medicationId: med.id, status: 'SKIPPED' })}
                  disabled={isPending}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Lewati"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {isTaken && (
              <span className="shrink-0 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                Diminum
              </span>
            )}
            {isSkipped && (
              <span className="shrink-0 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Dilewati
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
