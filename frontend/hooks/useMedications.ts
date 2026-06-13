'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  Medication,
  MedicationWithStatus,
  MedicationLog,
  ApiResponse,
  MedStatus,
} from '@/types';

const QUERY_KEY = 'medications';

// Backend TodayScheduleItem shape
interface TodayScheduleItem {
  medication: Medication & { id: string };
  scheduledTime: string;
  log: {
    id: string;
    medicationId: string;
    userId: string;
    scheduledTime: string;
    status: MedStatus;
    takenAt?: string | null;
    notes?: string | null;
    createdAt: string;
  } | null;
}

interface TodayResponse {
  schedule: TodayScheduleItem[];
  compliance: { total: number; taken: number; skipped: number; pending: number };
}

function transformScheduleToMedWithStatus(schedule: TodayScheduleItem[]): MedicationWithStatus[] {
  // Group by medication id so each med appears once with all its logs
  const map = new Map<string, MedicationWithStatus>();

  for (const item of schedule) {
    const { medication, log } = item;
    if (!map.has(medication.id)) {
      map.set(medication.id, {
        ...medication,
        todayLogs: [],
      });
    }
    if (log) {
      const entry = map.get(medication.id)!;
      // Normalise log field names (backend uses scheduledTime, frontend uses scheduledAt)
      const normLog: MedicationLog = {
        id: log.id,
        medicationId: log.medicationId,
        userId: log.userId,
        scheduledAt: log.scheduledTime ?? item.scheduledTime,
        takenAt: log.takenAt ?? undefined,
        status: log.status,
      };
      // Avoid duplicate logs
      if (!entry.todayLogs.find(l => l.id === normLog.id)) {
        entry.todayLogs.push(normLog);
      }
    }
  }

  return Array.from(map.values());
}

export function useMedications() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Medication[]>>('/medications');
      const data = res.data.data;
      if (Array.isArray(data)) return data;
      return [];
    },
  });
}

export function useTodayMedications() {
  return useQuery<MedicationWithStatus[]>({
    queryKey: [QUERY_KEY, 'today'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TodayResponse | MedicationWithStatus[]>>('/medications/today');
      const data = res.data.data;
      if (!data) return [];
      // Backend returns { schedule, compliance }
      if ('schedule' in (data as TodayResponse)) {
        return transformScheduleToMedWithStatus((data as TodayResponse).schedule ?? []);
      }
      // Fallback: already an array
      if (Array.isArray(data)) return data as MedicationWithStatus[];
      return [];
    },
  });
}

interface CreateMedicationInput {
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
}

export function useCreateMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMedicationInput) => {
      const res = await api.post<ApiResponse<Medication>>('/medications', payload);
      return res.data.data!;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useLogMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      medicationId,
      status,
    }: {
      medicationId: string;
      status: MedStatus;
    }) => {
      const res = await api.post<ApiResponse<unknown>>(`/medications/${medicationId}/log`, {
        status,
        takenAt: new Date().toISOString(),
      });
      return res.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
