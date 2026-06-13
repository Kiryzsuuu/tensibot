'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { LoginPayload, RegisterPayload, ApiResponse, AuthResponse } from '@/types';

export function useAuth() {
  const router = useRouter();
  const { user, token, setAuth, clearAuth, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (payload: LoginPayload): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
        const data = res.data;
        if (data.success && data.data) {
          setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
          router.push('/dashboard');
          return true;
        }
        setError(data.error?.message ?? 'Login gagal');
        return false;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
            ?.error?.message ?? 'Terjadi kesalahan. Coba lagi.';
        setError(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router, setAuth]
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
        const data = res.data;
        if (data.success && data.data) {
          setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
          router.push('/dashboard');
          return true;
        }
        setError(data.error?.message ?? 'Registrasi gagal');
        return false;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
            ?.error?.message ?? 'Terjadi kesalahan. Coba lagi.';
        setError(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router, setAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
    router.push('/');
  }, [clearAuth, router]);

  return {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
  };
}
