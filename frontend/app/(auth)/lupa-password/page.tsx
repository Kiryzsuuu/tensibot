'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
});
type FormData = z.infer<typeof schema>;

export default function LupaPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSent(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Terjadi kesalahan. Coba lagi.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#154360] via-[#1A5276] to-[#2E86C1] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#154360] to-[#2E86C1] px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 shadow">
              <Mail size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Lupa Password</h1>
            <p className="text-[#AED6F1] text-sm mt-1">
              Masukkan email untuk reset password
            </p>
          </div>

          <div className="px-8 py-8">
            {/* Back link */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-[#5D8AA8] hover:text-[#2E86C1] transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              Kembali ke Login
            </Link>

            {sent ? (
              /* Success state */
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-[#1A2A3A] mb-2">Email Terkirim!</h2>
                <p className="text-sm text-[#5D8AA8] mb-1">
                  Kami telah mengirim link reset password ke:
                </p>
                <p className="font-semibold text-[#1A5276] mb-6">{getValues('email')}</p>
                <div className="bg-[#EAF4FB] rounded-xl p-4 text-left space-y-2 mb-6">
                  <p className="text-xs font-semibold text-[#1A5276]">Langkah selanjutnya:</p>
                  {[
                    'Buka kotak masuk email Anda',
                    'Klik link reset password dalam email',
                    'Buat password baru yang kuat',
                    'Login dengan password baru Anda',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[#2E86C1] text-white text-xs flex items-center justify-center font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-xs text-[#1A5276]">{step}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#5D8AA8]">
                  Tidak menerima email?{' '}
                  <button
                    onClick={() => setSent(false)}
                    className="text-[#2E86C1] font-semibold hover:underline"
                  >
                    Kirim ulang
                  </button>
                </p>
              </div>
            ) : (
              /* Form state */
              <>
                <h2 className="text-lg font-bold text-[#1A2A3A] mb-1">Reset Password</h2>
                <p className="text-sm text-[#5D8AA8] mb-6">
                  Masukkan alamat email yang terdaftar. Kami akan mengirimkan link untuk membuat password baru.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        {...register('email')}
                        placeholder="nama@email.com"
                        autoComplete="email"
                        className={cn('input-field pl-10', errors.email && 'border-red-400')}
                      />
                      <Mail
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AED6F1]"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-3"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Mengirim...
                      </span>
                    ) : (
                      'Kirim Link Reset'
                    )}
                  </button>
                </form>

                <p className="text-center text-xs text-[#AED6F1] mt-6">
                  Link reset password berlaku selama{' '}
                  <span className="text-[#2E86C1] font-medium">1 jam</span>
                </p>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-[#AED6F1] text-xs mt-5">
          Pantau tekanan darah, tingkatkan kualitas hidup.
        </p>
      </div>
    </div>
  );
}
