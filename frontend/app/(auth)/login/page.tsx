'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Activity } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await login(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#154360] via-[#1A5276] to-[#2E86C1] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#154360] to-[#2E86C1] px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 shadow">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M3 16 L7 7 L12 19 L16 11 L21 20 L25 13 L29 16"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Tensi-Bot</h1>
            <p className="text-[#AED6F1] text-sm mt-1">Teman Kendali Hipertensi Anda</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-bold text-[#1A2A3A] mb-1">Masuk ke Akun</h2>
            <p className="text-sm text-[#5D8AA8] mb-6">
              Belum punya akun?{' '}
              <Link href="/register" className="text-[#2E86C1] font-semibold hover:underline">
                Daftar sekarang
              </Link>
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className={cn('input-field', errors.email && 'border-red-400')}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    className={cn('input-field pr-11', errors.password && 'border-red-400')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AED6F1] hover:text-[#2E86C1] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Link
                  href="/lupa-password"
                  className="text-xs text-[#2E86C1] hover:underline"
                >
                  Lupa password?
                </Link>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Masuk...
                  </span>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            <p className="text-center text-xs text-[#AED6F1] mt-6">
              Dengan masuk, Anda menyetujui{' '}
              <span className="text-[#2E86C1] cursor-pointer hover:underline">
                Syarat & Ketentuan
              </span>{' '}
              kami.
            </p>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-[#AED6F1] text-xs mt-5">
          Pantau tekanan darah, tingkatkan kualitas hidup.
        </p>
      </div>
    </div>
  );
}
