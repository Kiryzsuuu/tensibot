'use client';

import { useState, useRef, useCallback } from 'react';
import { Plus, Edit2, Trash2, Image, CheckCircle, XCircle, Monitor, Smartphone, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHeroAdmin, useCreateHero, useUpdateHero, useDeleteHero } from '@/hooks/useHero';
import type { HeroContent } from '@/types';
import type { HeroPayload } from '@/hooks/useHero';
import { cn } from '@/lib/utils';

// ─── Form defaults ────────────────────────────────────────────────────────────

const emptyForm = (): HeroPayload => ({
  title: '',
  subtitle: '',
  description: '',
  imageBase64: '',
  imageAlt: '',
  ctaText: '',
  ctaLink: '',
  isActive: true,
  order: 1,
});

// ─── Hero Form ────────────────────────────────────────────────────────────────

interface HeroFormProps {
  initial?: HeroPayload;
  onSubmit: (payload: HeroPayload) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

function HeroForm({ initial, onSubmit, onCancel, isLoading }: HeroFormProps) {
  const [form, setForm] = useState<HeroPayload>(initial ?? emptyForm());
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof HeroPayload>(key: K, value: HeroPayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      set('imageBase64', reader.result as string);
      set('imageAlt', file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-[#D6EAF8] p-6 mb-6 shadow-sm"
    >
      <h2 className="text-base font-bold text-[#1A2A3A] mb-5">
        {initial ? 'Edit Banner' : 'Tambah Banner Baru'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Title */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Judul *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Judul banner..."
            className="w-full border border-[#B2D4EC] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
          />
        </div>

        {/* Subtitle */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Subjudul *</label>
          <input
            type="text"
            required
            value={form.subtitle}
            onChange={(e) => set('subtitle', e.target.value)}
            placeholder="Subjudul banner..."
            className="w-full border border-[#B2D4EC] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Deskripsi</label>
          <textarea
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Deskripsi singkat..."
            className="w-full border border-[#B2D4EC] rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
          />
        </div>

        {/* Image upload */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Gambar Banner</label>
          <div
            className="border-2 border-dashed border-[#B2D4EC] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#2E86C1] transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {form.imageBase64 ? (
              <img
                src={form.imageBase64}
                alt="Preview"
                className="max-h-40 rounded-lg object-cover w-full"
              />
            ) : (
              <>
                <Image size={28} className="text-[#B2D4EC] mb-2" />
                <p className="text-sm text-[#5D8AA8]">Klik untuk pilih gambar</p>
                <p className="text-xs text-[#B2D4EC] mt-0.5">PNG, JPG, WEBP</p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          {form.imageBase64 && (
            <button
              type="button"
              onClick={() => { set('imageBase64', ''); set('imageAlt', ''); }}
              className="mt-1.5 text-xs text-red-500 hover:underline"
            >
              Hapus gambar
            </button>
          )}
        </div>

        {/* CTA Text */}
        <div>
          <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Teks Tombol CTA</label>
          <input
            type="text"
            value={form.ctaText ?? ''}
            onChange={(e) => set('ctaText', e.target.value)}
            placeholder="Pelajari Lebih Lanjut"
            className="w-full border border-[#B2D4EC] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
          />
        </div>

        {/* CTA Link */}
        <div>
          <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Link Tombol CTA</label>
          <input
            type="text"
            value={form.ctaLink ?? ''}
            onChange={(e) => set('ctaLink', e.target.value)}
            placeholder="/edukasi"
            className="w-full border border-[#B2D4EC] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
          />
        </div>

        {/* Order */}
        <div>
          <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Urutan</label>
          <input
            type="number"
            min={1}
            value={form.order}
            onChange={(e) => set('order', Number(e.target.value))}
            className="w-full border border-[#B2D4EC] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
          />
        </div>

        {/* Is Active */}
        <div className="flex items-center gap-3 pt-5">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
            />
            <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2E86C1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E86C1]" />
          </label>
          <span className="text-sm font-semibold text-[#1A2A3A]">Aktifkan Banner</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#2E86C1] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#154360] transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {isLoading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {initial ? 'Simpan Perubahan' : 'Tambah Banner'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-[#5D8AA8] hover:text-[#1A2A3A] px-4 py-2.5 rounded-xl border border-[#D6EAF8] hover:border-[#B2D4EC] transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

// ─── Mobile Preview Modal ─────────────────────────────────────────────────────

function MobilePreviewModal({ heroes, onClose }: { heroes: HeroContent[]; onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const active = heroes.filter(h => h.isActive).sort((a, b) => a.order - b.order);

  const prev = () => setCurrent(i => (i - 1 + active.length) % active.length);
  const next = () => setCurrent(i => (i + 1) % active.length);
  const slide = active[current];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-[#2E86C1]" />
            <span className="text-sm font-bold text-[#1A2A3A]">Preview Mobile</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Phone frame */}
        <div className="p-5 flex flex-col items-center">
          <div className="relative w-[260px] bg-[#F4F8FC] rounded-[32px] border-[6px] border-[#1A2A3A] shadow-xl overflow-hidden" style={{ minHeight: 520 }}>
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1A2A3A] rounded-b-2xl z-10" />

            {/* Screen content */}
            <div className="pt-8 pb-4 px-3">
              {/* Status bar sim */}
              <div className="flex justify-between items-center mb-3 px-1">
                <span className="text-[10px] font-bold text-[#1A2A3A]">9:41</span>
                <div className="flex gap-1 items-center">
                  <div className="w-3 h-2 border border-[#1A2A3A] rounded-sm relative">
                    <div className="absolute inset-0.5 bg-[#1A2A3A] rounded-sm" />
                  </div>
                </div>
              </div>

              {/* Greeting */}
              <div className="bg-white rounded-xl px-3 py-2.5 mb-3 shadow-sm">
                <p className="text-[10px] text-gray-400">Selamat Pagi,</p>
                <p className="text-xs font-bold text-[#1A2A3A]">Pengguna Tensi-Bot</p>
              </div>

              {/* Hero slide preview */}
              {active.length === 0 ? (
                <div className="bg-[#EAF4FB] rounded-2xl h-[110px] flex flex-col items-center justify-center gap-1">
                  <Image size={22} className="text-[#B2D4EC]" />
                  <p className="text-[10px] text-[#B2D4EC]">Tidak ada banner aktif</p>
                </div>
              ) : (
                <div className="relative">
                  <div
                    className="rounded-2xl overflow-hidden relative"
                    style={{ height: 110, backgroundColor: slide?.imageBase64 ? '#1a3a5c' : '#2E86C1' }}
                  >
                    {slide?.imageBase64 && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slide.imageBase64}
                          alt={slide.imageAlt ?? slide.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/45" />
                      </>
                    )}
                    <div className="relative z-10 p-3.5 h-full flex flex-col justify-center">
                      <p className="text-white font-bold text-[12px] leading-tight mb-0.5 line-clamp-2">{slide?.title}</p>
                      {slide?.subtitle && (
                        <p className="text-white/80 text-[10px] leading-tight line-clamp-2">{slide.subtitle}</p>
                      )}
                    </div>
                  </div>

                  {/* Dots */}
                  {active.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-2">
                      {active.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrent(i)}
                          className={cn(
                            'rounded-full transition-all',
                            i === current ? 'w-4 h-1.5 bg-[#2E86C1]' : 'w-1.5 h-1.5 bg-gray-300'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Rest of screen sim */}
              <div className="mt-3 space-y-2">
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="h-2 w-24 bg-gray-100 rounded mb-2" />
                  <div className="flex gap-2">
                    <div className="flex-1 h-12 bg-[#EAF4FB] rounded-lg" />
                    <div className="flex-1 h-12 bg-[#EAF4FB] rounded-lg" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="h-2 w-20 bg-gray-100 rounded mb-2" />
                  <div className="h-8 bg-[#EAF4FB] rounded-lg" />
                </div>
              </div>
            </div>

            {/* Home bar */}
            <div className="flex justify-center pb-2">
              <div className="w-20 h-1 bg-[#1A2A3A]/20 rounded-full" />
            </div>
          </div>

          {/* Navigation */}
          {active.length > 1 && (
            <div className="flex items-center gap-4 mt-4">
              <button onClick={prev} className="p-2 rounded-xl border border-[#D6EAF8] hover:bg-[#EAF4FB] transition-colors">
                <ChevronLeft size={16} className="text-[#2E86C1]" />
              </button>
              <span className="text-xs text-[#5D8AA8] font-medium">{current + 1} / {active.length}</span>
              <button onClick={next} className="p-2 rounded-xl border border-[#D6EAF8] hover:bg-[#EAF4FB] transition-colors">
                <ChevronRight size={16} className="text-[#2E86C1]" />
              </button>
            </div>
          )}

          <p className="text-[10px] text-[#B2D4EC] mt-3 text-center">
            Menampilkan {active.length} banner aktif dari {heroes.length} total
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminHeroPage() {
  const { data: heroes = [], isLoading } = useHeroAdmin();
  const createHero = useCreateHero();
  const updateHero = useUpdateHero();
  const deleteHero = useDeleteHero();

  const [showForm, setShowForm] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroContent | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const handleCreate = useCallback(
    async (payload: HeroPayload) => {
      await createHero.mutateAsync(payload);
      setShowForm(false);
    },
    [createHero]
  );

  const handleUpdate = useCallback(
    async (payload: HeroPayload) => {
      if (!editingHero) return;
      await updateHero.mutateAsync({ id: editingHero.id, payload });
      setEditingHero(null);
    },
    [editingHero, updateHero]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await deleteHero.mutateAsync(id);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteHero]
  );

  const heroToPayload = (h: HeroContent): HeroPayload => ({
    title: h.title,
    subtitle: h.subtitle,
    description: h.description,
    imageBase64: h.imageBase64,
    imageAlt: h.imageAlt,
    ctaText: h.ctaText,
    ctaLink: h.ctaLink,
    isActive: h.isActive,
    order: h.order,
  });

  return (
    <div>
      {showMobilePreview && (
        <MobilePreviewModal heroes={heroes} onClose={() => setShowMobilePreview(false)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A]">Kelola Hero Banner</h1>
          <p className="text-sm text-[#5D8AA8] mt-0.5">
            Banner yang tampil di halaman dashboard pengguna
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Preview Web */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#2E86C1] border border-[#B2D4EC] hover:bg-[#EAF4FB] px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <Monitor size={15} />
            Preview Web
          </a>

          {/* Preview Mobile */}
          <button
            onClick={() => setShowMobilePreview(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#2E86C1] border border-[#B2D4EC] hover:bg-[#EAF4FB] px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <Smartphone size={15} />
            Preview Mobile
          </button>

          {!showForm && !editingHero && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#2E86C1] text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#154360] transition-colors shadow-sm"
            >
              <Plus size={16} />
              Tambah Banner
            </button>
          )}
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <HeroForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isLoading={createHero.isPending}
        />
      )}

      {/* Edit form */}
      {editingHero && (
        <HeroForm
          initial={heroToPayload(editingHero)}
          onSubmit={handleUpdate}
          onCancel={() => setEditingHero(null)}
          isLoading={updateHero.isPending}
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#D6EAF8] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="w-7 h-7 border-2 border-[#2E86C1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : heroes.length === 0 ? (
          <div className="p-10 text-center">
            <Image size={36} className="text-[#B2D4EC] mx-auto mb-3" />
            <p className="text-[#5D8AA8] text-sm">Belum ada banner. Tambahkan banner pertama!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EAF4FB] border-b border-[#D6EAF8]">
                <th className="text-left px-5 py-3 font-semibold text-[#1A2A3A]">Judul</th>
                <th className="text-left px-5 py-3 font-semibold text-[#1A2A3A] hidden sm:table-cell">
                  Subjudul
                </th>
                <th className="text-center px-4 py-3 font-semibold text-[#1A2A3A]">Urutan</th>
                <th className="text-center px-4 py-3 font-semibold text-[#1A2A3A]">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-[#1A2A3A]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF4FB]">
              {[...heroes]
                .sort((a, b) => a.order - b.order)
                .map((hero) => (
                  <tr key={hero.id} className="hover:bg-[#F4F8FC] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {hero.imageBase64 ? (
                          <img
                            src={hero.imageBase64}
                            alt={hero.imageAlt ?? hero.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-[#EAF4FB] rounded-lg flex items-center justify-center shrink-0">
                            <Image size={16} className="text-[#B2D4EC]" />
                          </div>
                        )}
                        <span className="font-medium text-[#1A2A3A] truncate max-w-[160px]">
                          {hero.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#5D8AA8] hidden sm:table-cell truncate max-w-[200px]">
                      {hero.subtitle}
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#5D8AA8]">{hero.order}</td>
                    <td className="px-4 py-3.5 text-center">
                      {hero.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          <CheckCircle size={11} />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                          <XCircle size={11} />
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setShowForm(false);
                            setEditingHero(hero);
                          }}
                          className="p-1.5 text-[#5D8AA8] hover:text-[#2E86C1] hover:bg-[#EAF4FB] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(hero.id)}
                          disabled={deletingId === hero.id}
                          className="p-1.5 text-[#5D8AA8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Hapus"
                        >
                          {deletingId === hero.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin block" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
