'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Plus, Trash2, CheckCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';

interface SiteSettings {
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  stats: { value: string; label: string }[];
  benefits: string[];
  cta: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  seo: {
    siteName: string;
    tagline: string;
    description: string;
  };
}

type FormValues = SiteSettings & {
  benefitsRaw: { text: string }[];
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#D6EAF8] p-6">
      <h2 className="text-sm font-bold text-[#1A2A3A] mb-5 pb-3 border-b border-[#F4F8FC]">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-[#1A2A3A] mb-1.5">{label}</label>
      {hint && <p className="text-[10px] text-[#AED6F1] mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

const INPUT = 'w-full px-3 py-2 text-sm border border-[#D6E8F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E86C1]/30 bg-white placeholder:text-[#AED6F1]';
const TEXTAREA = INPUT + ' resize-none';

export default function AdminSettingsPage() {
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SiteSettings>>('/settings');
      return res.data.data!;
    },
  });

  const { register, handleSubmit, reset, control, formState: { isDirty } } = useForm<FormValues>({
    defaultValues: {
      hero: { badge: '', title: '', titleHighlight: '', subtitle: '', ctaPrimary: '', ctaSecondary: '' },
      stats: [{ value: '', label: '' }, { value: '', label: '' }, { value: '', label: '' }],
      benefitsRaw: [],
      cta: { title: '', subtitle: '', buttonText: '' },
      seo: { siteName: '', tagline: '', description: '' },
    },
  });

  const { fields: statFields, append: appendStat, remove: removeStat } = useFieldArray({ control, name: 'stats' });
  const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({ control, name: 'benefitsRaw' });

  useEffect(() => {
    if (settings) {
      reset({
        hero: settings.hero,
        stats: settings.stats,
        benefitsRaw: settings.benefits.map(b => ({ text: b })),
        cta: settings.cta,
        seo: settings.seo,
      });
    }
  }, [settings, reset]);

  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload: SiteSettings = {
        ...data,
        benefits: data.benefitsRaw.map(b => b.text).filter(Boolean),
      };
      const res = await api.patch<ApiResponse<SiteSettings>>('/settings', payload);
      return res.data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['site-settings'] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-[#2E86C1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={20} className="text-[#2E86C1]" />
            <h1 className="text-xl font-bold text-[#1A2A3A]">Pengaturan Landing Page</h1>
          </div>
          <p className="text-sm text-[#5D8AA8]">Kustomisasi teks dan konten halaman utama yang dilihat pengunjung</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-[#2E86C1] hover:underline"
        >
          <RefreshCw size={13} />
          Lihat Landing Page
        </a>
      </div>

      {isSuccess && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm mb-5">
          <CheckCircle size={15} />
          Pengaturan berhasil disimpan!
        </div>
      )}

      <form onSubmit={handleSubmit(d => void mutateAsync(d))} className="space-y-5">

        {/* Hero Section */}
        <SectionCard title="Hero Section">
          <Field label="Badge / Label Kecil" hint="Teks kecil di atas judul utama">
            <input {...register('hero.badge')} className={INPUT} placeholder="Platform Kesehatan Digital #1 di Indonesia" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Judul (bagian hitam)">
              <input {...register('hero.title')} className={INPUT} placeholder="Kendalikan Hipertensi," />
            </Field>
            <Field label="Judul (bagian berwarna)" hint="Ditampilkan dengan warna biru gradient">
              <input {...register('hero.titleHighlight')} className={INPUT} placeholder="Raih Hidup Lebih Sehat" />
            </Field>
          </div>
          <Field label="Subjudul / Deskripsi">
            <textarea {...register('hero.subtitle')} rows={3} className={TEXTAREA} placeholder="Deskripsi singkat tentang platform..." />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Teks Tombol Utama">
              <input {...register('hero.ctaPrimary')} className={INPUT} placeholder="Mulai Sekarang" />
            </Field>
            <Field label="Teks Tombol Sekunder">
              <input {...register('hero.ctaSecondary')} className={INPUT} placeholder="Sudah Punya Akun" />
            </Field>
          </div>
        </SectionCard>

        {/* Stats */}
        <SectionCard title="Statistik (3 angka di Hero)">
          <div className="space-y-3">
            {statFields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-3 bg-[#F4F8FC] rounded-xl p-3">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input {...register(`stats.${i}.value`)} className={INPUT} placeholder="Nilai (mis. 80%)" />
                  <input {...register(`stats.${i}.label`)} className={INPUT} placeholder="Keterangan" />
                </div>
                {statFields.length > 1 && (
                  <button type="button" onClick={() => removeStat(i)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {statFields.length < 4 && (
            <button
              type="button"
              onClick={() => appendStat({ value: '', label: '' })}
              className="mt-3 flex items-center gap-1.5 text-xs text-[#2E86C1] hover:underline"
            >
              <Plus size={13} />
              Tambah Statistik
            </button>
          )}
        </SectionCard>

        {/* Benefits */}
        <SectionCard title="Poin Keunggulan (checklist di bawah tombol Hero)">
          <div className="space-y-2">
            {benefitFields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-2">
                <input {...register(`benefitsRaw.${i}.text`)} className={INPUT + ' flex-1'} placeholder="Keunggulan singkat..." />
                <button type="button" onClick={() => removeBenefit(i)} className="text-red-400 hover:text-red-600 p-1 shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => appendBenefit({ text: '' })}
            className="mt-3 flex items-center gap-1.5 text-xs text-[#2E86C1] hover:underline"
          >
            <Plus size={13} />
            Tambah Poin
          </button>
        </SectionCard>

        {/* CTA Section */}
        <SectionCard title="CTA Section (bagian bawah sebelum footer)">
          <Field label="Judul CTA">
            <input {...register('cta.title')} className={INPUT} placeholder="Mulai Pantau Kesehatan Anda Hari Ini" />
          </Field>
          <Field label="Subjudul CTA">
            <input {...register('cta.subtitle')} className={INPUT} placeholder="Bergabung dengan ribuan pengguna..." />
          </Field>
          <Field label="Teks Tombol CTA">
            <input {...register('cta.buttonText')} className={INPUT} placeholder="Buat Akun Gratis" />
          </Field>
        </SectionCard>

        {/* SEO */}
        <SectionCard title="Info Situs (SEO & Metadata)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nama Situs">
              <input {...register('seo.siteName')} className={INPUT} placeholder="Tensi-Bot" />
            </Field>
            <Field label="Tagline">
              <input {...register('seo.tagline')} className={INPUT} placeholder="Kendalikan Hipertensi Anda" />
            </Field>
          </div>
          <Field label="Deskripsi Situs">
            <textarea {...register('seo.description')} rows={2} className={TEXTAREA} placeholder="Deskripsi untuk mesin pencari..." />
          </Field>
        </SectionCard>

        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="w-full flex items-center justify-center gap-2 bg-[#2E86C1] hover:bg-[#2471A3] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isPending ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
          ) : (
            <><Save size={16} /> Simpan Perubahan</>
          )}
        </button>
      </form>
    </div>
  );
}
