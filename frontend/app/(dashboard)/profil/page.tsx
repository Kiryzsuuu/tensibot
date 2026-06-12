'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  User,
  Mail,
  Calendar,
  Shield,
  LogOut,
  CheckCircle,
  Edit3,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { UserProfile, ApiResponse } from '@/types';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Minimal 2 karakter'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  weight: z.number().min(20).max(300).optional(),
  height: z.number().min(50).max(300).optional(),
  diagnosis: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilPage() {
  const { user, updateUser, logout } = useAuth();
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<UserProfile>>('/users/profile');
      return res.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      phone: profile?.phone ?? '',
      dateOfBirth: profile?.dateOfBirth?.split('T')[0] ?? '',
      gender: profile?.gender,
      weight: profile?.weight,
      height: profile?.height,
      diagnosis: profile?.diagnosis ?? '',
    },
  });

  const { mutateAsync: updateProfile, isPending } = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const res = await api.patch<ApiResponse<{ user: typeof user; profile: UserProfile }>>(
        '/users/profile',
        data
      );
      return res.data.data;
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      const result = await updateProfile(data);
      if (result?.user) updateUser(result.user);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // handle error
    }
  };

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'U';

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Profil Saya"
        subtitle="Kelola informasi akun dan data kesehatan Anda"
      />

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm mb-5">
          <CheckCircle size={16} />
          Profil berhasil diperbarui!
        </div>
      )}

      {/* Avatar card */}
      <div className="card p-6 mb-5 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2E86C1] to-[#154360] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {initials}
        </div>
        <div className="flex-1">
          <p className="text-xl font-bold text-[#1A2A3A]">{user?.fullName}</p>
          <p className="text-sm text-[#5D8AA8] flex items-center gap-1.5 mt-0.5">
            <Mail size={13} />
            {user?.email}
          </p>
          <span className="inline-block mt-2 text-xs font-semibold bg-[#EAF4FB] text-[#2E86C1] px-2.5 py-1 rounded-full">
            {user?.role === 'PASIEN' ? 'Pasien' : user?.role}
          </span>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="btn-secondary flex items-center gap-1.5 text-sm"
        >
          <Edit3 size={14} />
          {editing ? 'Batal' : 'Edit'}
        </button>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card p-6 mb-5">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <User size={18} className="text-[#2E86C1]" />
            Informasi Pribadi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                {...register('fullName')}
                disabled={!editing}
                className={cn('input-field', !editing && 'bg-[#F4F8FC] cursor-default')}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
                No. Telepon
              </label>
              <input
                type="tel"
                {...register('phone')}
                disabled={!editing}
                placeholder="+62812..."
                className={cn('input-field', !editing && 'bg-[#F4F8FC] cursor-default')}
              />
            </div>

            {/* Date of birth */}
            <div>
              <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
                Tanggal Lahir
              </label>
              <input
                type="date"
                {...register('dateOfBirth')}
                disabled={!editing}
                className={cn('input-field', !editing && 'bg-[#F4F8FC] cursor-default')}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
                Jenis Kelamin
              </label>
              <select
                {...register('gender')}
                disabled={!editing}
                className={cn('input-field', !editing && 'bg-[#F4F8FC] cursor-default')}
              >
                <option value="">-- Pilih --</option>
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
                Berat Badan (kg)
              </label>
              <input
                type="number"
                {...register('weight', { valueAsNumber: true })}
                disabled={!editing}
                placeholder="70"
                className={cn('input-field', !editing && 'bg-[#F4F8FC] cursor-default')}
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
                Tinggi Badan (cm)
              </label>
              <input
                type="number"
                {...register('height', { valueAsNumber: true })}
                disabled={!editing}
                placeholder="170"
                className={cn('input-field', !editing && 'bg-[#F4F8FC] cursor-default')}
              />
            </div>
          </div>
        </div>

        {/* Health info */}
        <div className="card p-6 mb-5">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <Shield size={18} className="text-[#2E86C1]" />
            Informasi Kesehatan
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">
                Diagnosis / Catatan Kesehatan
              </label>
              <textarea
                {...register('diagnosis')}
                disabled={!editing}
                rows={3}
                placeholder="Contoh: Hipertensi primer sejak 2020, diabetes terkontrol..."
                className={cn(
                  'input-field resize-none',
                  !editing && 'bg-[#F4F8FC] cursor-default'
                )}
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        {editing && (
          <button
            type="submit"
            disabled={isPending || !isDirty}
            className="btn-primary w-full py-3"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </span>
            ) : (
              'Simpan Perubahan'
            )}
          </button>
        )}
      </form>

      {/* Danger zone */}
      <div className="card p-5 border-red-100 mt-5">
        <h2 className="text-sm font-semibold text-[#C0392B] mb-3">Zona Berbahaya</h2>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-[#C0392B] hover:bg-red-50 px-3 py-2 rounded-lg transition-colors w-full"
        >
          <LogOut size={16} />
          Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
