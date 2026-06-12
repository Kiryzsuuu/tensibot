'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  Medication,
  MedicationWithStatus,
  ApiResponse,
  MedStatus,
} from '@/types';

const QUERY_KEY = 'medications';

export function useMedications() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const res = await api.get<ApiResponse<MedicationWithStatus[]>>('/medications');
      return res.data.data ?? [];
    },
  });
}

export function useTodayMedications() {
  return useQuery({
    queryKey: [QUERY_KEY, 'today'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<MedicationWithStatus[]>>('/medications/today');
      return res.data.data ?? [];
    },
  });
}

export function useCreateMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Medication, 'id' | 'userId' | 'isActive'>) => {
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
