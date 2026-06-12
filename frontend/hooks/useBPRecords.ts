'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { BPRecord, BPInput, ApiResponse, PaginatedResponse, BPStats } from '@/types';

const QUERY_KEY = 'bp-records';

export function useBPRecords(page = 1, limit = 20) {
  return useQuery({
    queryKey: [QUERY_KEY, page, limit],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<BPRecord>>>(
        `/blood-pressure?page=${page}&limit=${limit}`
      );
      return res.data.data;
    },
  });
}

export function useBPRecords7Days() {
  return useQuery({
    queryKey: [QUERY_KEY, '7days'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<BPRecord[]>>('/blood-pressure?days=7&limit=7');
      return res.data.data ?? [];
    },
  });
}

export function useBPStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<BPStats>>('/blood-pressure/stats');
      return res.data.data;
    },
  });
}

export function useCreateBPRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BPInput) => {
      const res = await api.post<ApiResponse<BPRecord>>('/blood-pressure', input);
      return res.data.data!;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
