'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { HeroContent, ApiResponse } from '@/types';

// ─── Public: active heroes (all users) ───────────────────────────────────────

export function useHeroPublic() {
  return useQuery<HeroContent[]>({
    queryKey: ['hero', 'active'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<HeroContent[]>>('/hero/active');
      return res.data.data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ─── Admin: all heroes ────────────────────────────────────────────────────────

export function useHeroAdmin() {
  return useQuery<HeroContent[]>({
    queryKey: ['hero', 'all'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<HeroContent[]>>('/hero');
      return res.data.data ?? [];
    },
  });
}

// ─── Create hero ──────────────────────────────────────────────────────────────

export interface HeroPayload {
  title: string;
  subtitle: string;
  description?: string;
  imageBase64?: string;
  imageAlt?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  order: number;
}

export function useCreateHero() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: HeroPayload) => {
      const res = await api.post<ApiResponse<HeroContent>>('/hero', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero'] });
    },
  });
}

// ─── Update hero ──────────────────────────────────────────────────────────────

export function useUpdateHero() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<HeroPayload> }) => {
      const res = await api.put<ApiResponse<HeroContent>>(`/hero/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero'] });
    },
  });
}

// ─── Delete hero ──────────────────────────────────────────────────────────────

export function useDeleteHero() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/hero/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero'] });
    },
  });
}
