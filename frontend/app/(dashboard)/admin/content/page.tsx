'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Pencil, Eye, EyeOff, X, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';
import { cn } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  type: 'article' | 'tip' | 'news';
  tags: string[];
  isPublished: boolean;
  publishedAt?: string | { _seconds: number } | null;
  authorId?: string;
  createdAt?: string | { _seconds: number };
}

const articleSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(200),
  slug: z.string().min(1, 'Slug wajib diisi').max(200).regex(/^[a-z0-9-]+$/, 'Hanya huruf kecil, angka, dan tanda hubung'),
  summary: z.string().min(1, 'Ringkasan wajib diisi').max(500),
  content: z.string().min(1, 'Konten wajib diisi'),
  type: z.enum(['article', 'tip', 'news']),
  tags: z.string().optional(),
  isPublished: z.boolean(),
});
type ArticleForm = z.infer<typeof articleSchema>;

const TYPE_LABELS = { article: 'Artikel', tip: 'Tips', news: 'Berita' };
const TYPE_COLORS = { article: 'bg-blue-100 text-blue-700', tip: 'bg-green-100 text-green-700', news: 'bg-orange-100 text-orange-700' };

function toDate(val?: string | { _seconds: number } | null): string {
  if (!val) return '—';
  if (typeof val === 'object' && '_seconds' in val) return new Date(val._seconds * 1000).toLocaleDateString('id-ID');
  return new Date(val as string).toLocaleDateString('id-ID');
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ─── Article Form Modal ──────────────────────────────────────────────────────

function ArticleModal({ existing, onClose }: { existing?: Article; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!existing;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ArticleForm>({
    resolver: zodResolver(articleSchema),
    defaultValues: existing
      ? { title: existing.title, slug: existing.slug, summary: existing.summary, content: existing.content, type: existing.type, tags: existing.tags.join(', '), isPublished: existing.isPublished }
      : { type: 'article', isPublished: false },
  });

  const titleVal = watch('title');

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: ArticleForm) => {
      const payload = { ...data, tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (isEdit) {
        return api.patch(`/content/${existing!.id}`, payload);
      }
      return api.post('/content', payload);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-articles'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F4F8FC] sticky top-0 bg-white">
          <h2 className="font-bold text-[#1A2A3A]">{isEdit ? 'Edit Artikel' : 'Artikel Baru'}</h2>
          <button onClick={onClose} className="text-[#AED6F1] hover:text-[#5D8AA8]"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(d => mutate(d))} className="px-6 py-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">Gagal menyimpan. Coba lagi.</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Judul</label>
              <input
                {...register('title')}
                className="input-field"
                placeholder="Memahami Hipertensi..."
                onChange={e => {
                  setValue('title', e.target.value);
                  if (!isEdit) setValue('slug', slugify(e.target.value));
                }}
                value={titleVal}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Slug</label>
              <input {...register('slug')} className="input-field font-mono text-sm" placeholder="memahami-hipertensi" />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Tipe</label>
              <select {...register('type')} className="input-field">
                <option value="article">Artikel</option>
                <option value="tip">Tips</option>
                <option value="news">Berita</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Ringkasan</label>
            <textarea {...register('summary')} className="input-field resize-none" rows={2} placeholder="Ringkasan singkat artikel..." />
            {errors.summary && <p className="text-red-500 text-xs mt-1">{errors.summary.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Konten</label>
            <textarea {...register('content')} className="input-field resize-y min-h-[150px]" placeholder="Tulis konten artikel di sini..." />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2A3A] mb-1.5">Tags <span className="font-normal text-[#5D8AA8]">(pisah koma)</span></label>
            <input {...register('tags')} className="input-field" placeholder="hipertensi, diet, kesehatan" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('isPublished')} className="w-4 h-4 rounded text-[#2E86C1]" />
            <span className="text-sm font-medium text-[#1A2A3A]">Publikasikan sekarang</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Batal</button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1 py-2.5">
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2"><Check size={16} />{isEdit ? 'Simpan Perubahan' : 'Buat Artikel'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminContentPage() {
  const [modal, setModal] = useState<'new' | Article | null>(null);
  const qc = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ articles: Article[] }>>('/content/admin/all');
      return res.data.data?.articles ?? [];
    },
  });

  const { mutate: togglePublish } = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      return api.patch(`/content/${id}`, { isPublished: !isPublished });
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-articles'] }),
  });

  return (
    <div>
      {modal && (
        <ArticleModal
          existing={modal === 'new' ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={20} className="text-[#2E86C1]" />
            <h1 className="text-xl font-bold text-[#1A2A3A]">Kelola Konten Edukasi</h1>
          </div>
          <p className="text-sm text-[#5D8AA8]">{articles.length} artikel tersedia</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Artikel Baru
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-[#EAF4FB] rounded-xl animate-pulse" />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D6EAF8] p-12 text-center">
          <FileText size={36} className="text-[#AED6F1] mx-auto mb-3" />
          <p className="font-semibold text-[#1A2A3A]">Belum ada artikel</p>
          <p className="text-sm text-[#5D8AA8] mt-1 mb-4">Buat artikel pertama untuk ditampilkan di halaman edukasi</p>
          <button onClick={() => setModal('new')} className="btn-primary mx-auto">Buat Artikel Pertama</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#D6EAF8] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F4F8FC] border-b border-[#D6EAF8]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D8AA8]">Judul</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D8AA8] hidden sm:table-cell">Tipe</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D8AA8] hidden md:table-cell">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#5D8AA8]">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#5D8AA8]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F8FC]">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-[#FAFCFF] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1A2A3A] line-clamp-1 max-w-xs">{article.title}</p>
                    <p className="text-xs text-[#AED6F1] font-mono">{article.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', TYPE_COLORS[article.type])}>
                      {TYPE_LABELS[article.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#5D8AA8] hidden md:table-cell">
                    {toDate(article.publishedAt ?? article.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', article.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                      {article.isPublished ? 'Publik' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal(article)}
                        className="p-1.5 text-[#AED6F1] hover:text-[#2E86C1] hover:bg-[#EAF4FB] rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => togglePublish({ id: article.id, isPublished: article.isPublished })}
                        className={cn('p-1.5 rounded-lg transition-colors', article.isPublished ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-50' : 'text-green-500 hover:text-green-700 hover:bg-green-50')}
                        title={article.isPublished ? 'Jadikan draft' : 'Publikasikan'}
                      >
                        {article.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
