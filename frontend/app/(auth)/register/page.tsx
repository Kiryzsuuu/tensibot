'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, CheckCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const ROLES = [
  { value: 'PASIEN', label: 'Pasien', desc: 'Penderita hipertensi yang ingin memantau kesehatan' },
  { value: 'DOKTER', label: 'Dokter', desc: 'Dokter yang mengelola pasien hipertensi' },
  { value: 'PROFESIONAL', label: 'Profesional Kesehatan', desc: 'Tenaga kesehatan profesional' },
  { value: 'STAF', label: 'Staf', desc: 'Staf administrasi klinik/rumah sakit' },
  { value: 'FARMASI', label: 'Farmasi', desc: 'Apoteker atau tenaga farmasi' },
] as const;

const schema = z
  .object({
    fullName: z.string().min(2, 'Nama minimal 2 karakter').max(100),
    email: z.string().email('Email tidak valid'),
    role: z.string().min(1, 'Pilih peran Anda'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

const STRENGTH_LABELS = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
const STRENGTH_COLORS = ['#C0392B', '#ea580c', '#F5A623', '#16a34a', '#166534'];

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function RegisterPage() {
  const { register: registerUser, isLoading, error, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwStrength, setPwStrength] = useState(0);

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: 'PASIEN' } });

  const passwordValue = watch('password', '');

  useEffect(() => {
    setPwStrength(getPasswordStrength(passwordValue));
  }, [passwordValue]);

  const onSubmit = async (data: FormData) => {
    await registerUser({ ...data, role: data.role as import('@/types').Role });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#154360] via-[#1A5276] to-[#2E86C1] flex items-center justify-center p-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#154360] to-[#2E86C1] px-8 py-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-3 shadow">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
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
            <h1 className="text-xl font-bold text-white">Daftar ke Tensi-Bot</h1>
            <p className="text-[#AED6F1] text-xs mt-1">Mulai pantau kesehatan Anda hari ini</p>
          </div>

          <div className="px-8 py-7">
            <p className="text-sm text-[#5D8AA8] mb-5">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-[#2E86C1] font-semibold hover:underline">
                Masuk di sini
              </Link>
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full name */}
              <div>
                <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  {...register('fullName')}
                  placeholder="Budi Santoso"
                  autoComplete="name"
                  className={cn('input-field', errors.fullName && 'border-red-400')}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                )}
              </div>

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

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
                  Peran / Role
                </label>
                <div className="relative">
                  <select
                    {...register('role')}
                    className={cn(
                      'input-field appearance-none pr-10 cursor-pointer',
                      errors.role && 'border-red-400',
                    )}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D8AA8] pointer-events-none"
                  />
                </div>
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
                )}
                <p className="text-xs text-[#5D8AA8] mt-1">
                  {ROLES.find((r) => r.value === watch('role'))?.desc}
                </p>
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
                    placeholder="Min. 8 karakter"
                    autoComplete="new-password"
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
                {passwordValue && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor:
                              i < pwStrength
                                ? STRENGTH_COLORS[pwStrength - 1]
                                : '#D6E8F5',
                          }}
                        />
                      ))}
                    </div>
                    <p
                      className="text-xs font-medium"
                      style={{ color: STRENGTH_COLORS[pwStrength - 1] ?? '#AED6F1' }}
                    >
                      {STRENGTH_LABELS[pwStrength - 1] ?? 'Masukkan password'}
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    placeholder="Ulangi password"
                    autoComplete="new-password"
                    className={cn('input-field pr-11', errors.confirmPassword && 'border-red-400')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AED6F1] hover:text-[#2E86C1] transition-colors"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Benefits */}
              <div className="bg-[#EAF4FB] rounded-xl p-4 space-y-2">
                {[
                  'Pantau tekanan darah Anda secara berkala',
                  'Chatbot AI siap menjawab pertanyaan kesehatan Anda',
                  'Pengingat minum obat otomatis',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-[#2E86C1] shrink-0" />
                    <span className="text-xs text-[#1A5276]">{item}</span>
                  </div>
                ))}
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mendaftar...
                  </span>
                ) : (
                  'Buat Akun Gratis'
                )}
              </button>
            </form>

            <p className="text-center text-xs text-[#AED6F1] mt-5">
              Dengan mendaftar, Anda menyetujui{' '}
              <span className="text-[#2E86C1] cursor-pointer hover:underline">
                Syarat & Ketentuan
              </span>{' '}
              dan{' '}
              <span className="text-[#2E86C1] cursor-pointer hover:underline">
                Kebijakan Privasi
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
