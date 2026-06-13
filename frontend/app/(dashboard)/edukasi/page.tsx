'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Clock, Search, Filter } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import api from '@/lib/api';
import { formatDateWIB, truncate } from '@/lib/utils';
import type { ContentArticle, ApiResponse, PaginatedResponse, ArticleCategory } from '@/types';

const CATEGORIES: { value: ArticleCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'GENERAL', label: 'Umum' },
  { value: 'DIET', label: 'Diet' },
  { value: 'EXERCISE', label: 'Olahraga' },
  { value: 'MEDICATION', label: 'Obat-obatan' },
  { value: 'LIFESTYLE', label: 'Gaya Hidup' },
  { value: 'EMERGENCY', label: 'Darurat' },
];

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  GENERAL: '#2E86C1',
  DIET: '#16a34a',
  EXERCISE: '#F5A623',
  MEDICATION: '#7c3aed',
  LIFESTYLE: '#0891b2',
  EMERGENCY: '#C0392B',
};

// Demo articles for when API has no data
const DEMO_ARTICLES: ContentArticle[] = [
  {
    id: '1',
    title: 'Memahami Hipertensi: Penyebab dan Faktor Risiko',
    slug: 'memahami-hipertensi',
    summary:
      'Hipertensi atau tekanan darah tinggi adalah kondisi ketika tekanan darah Anda secara konsisten di atas 130/80 mmHg. Pelajari penyebab dan cara mencegahnya.',
    content: '',
    category: 'GENERAL',
    publishedAt: new Date().toISOString(),
    readTimeMinutes: 5,
    isPublished: true,
  },
  {
    id: '2',
    title: 'Diet DASH: Pola Makan Terbaik untuk Penderita Hipertensi',
    slug: 'diet-dash',
    summary:
      'Diet DASH (Dietary Approaches to Stop Hypertension) terbukti secara ilmiah dapat menurunkan tekanan darah. Kenali prinsip-prinsip dasar diet ini.',
    content: '',
    category: 'DIET',
    publishedAt: new Date().toISOString(),
    readTimeMinutes: 7,
    isPublished: true,
  },
  {
    id: '3',
    title: 'Olahraga yang Aman dan Efektif untuk Penderita Hipertensi',
    slug: 'olahraga-hipertensi',
    summary:
      'Aktivitas fisik teratur dapat menurunkan tekanan darah hingga 5-8 mmHg. Ketahui jenis olahraga yang paling aman dan efektif bagi penderita hipertensi.',
    content: '',
    category: 'EXERCISE',
    publishedAt: new Date().toISOString(),
    readTimeMinutes: 6,
    isPublished: true,
  },
  {
    id: '4',
    title: 'Mengenal Obat Antihipertensi: Jenis, Fungsi, dan Efek Samping',
    slug: 'obat-antihipertensi',
    summary:
      'Ada berbagai jenis obat antihipertensi yang umum diresepkan dokter. Pelajari cara kerja masing-masing dan efek samping yang perlu diwaspadai.',
    content: '',
    category: 'MEDICATION',
    publishedAt: new Date().toISOString(),
    readTimeMinutes: 8,
    isPublished: true,
  },
  {
    id: '5',
    title: 'Mengelola Stres untuk Menurunkan Tekanan Darah',
    slug: 'kelola-stres',
    summary:
      'Stres kronis adalah salah satu pemicu utama hipertensi. Pelajari teknik-teknik manajemen stres yang terbukti efektif untuk menjaga kesehatan jantung Anda.',
    content: '',
    category: 'LIFESTYLE',
    publishedAt: new Date().toISOString(),
    readTimeMinutes: 5,
    isPublished: true,
  },
  {
    id: '6',
    title: 'Krisis Hipertensi: Tanda Bahaya yang Harus Segera Ditangani',
    slug: 'krisis-hipertensi',
    summary:
      'Tekanan darah di atas 180/120 mmHg adalah kondisi darurat medis. Kenali tanda-tandanya dan langkah pertolongan pertama yang harus dilakukan.',
    content: '',
    category: 'EMERGENCY',
    publishedAt: new Date().toISOString(),
    readTimeMinutes: 4,
    isPublished: true,
  },
];

function ArticleCard({ article }: { article: ContentArticle }) {
  const color = CATEGORY_COLORS[article.category];
  const catLabel = CATEGORIES.find((c) => c.value === article.category)?.label ?? article.category;

  return (
    <div className="card p-5 hover:shadow-card-hover transition-all duration-200 cursor-pointer group">
      {/* Category + read time */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: color + '20', color }}
        >
          {catLabel}
        </span>
        <div className="flex items-center gap-1 text-xs text-[#AED6F1]">
          <Clock size={11} />
          <span>{article.readTimeMinutes} menit</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-[#1A2A3A] text-sm mb-2 leading-snug group-hover:text-[#2E86C1] transition-colors">
        {article.title}
      </h3>

      {/* Summary */}
      <p className="text-xs text-[#5D8AA8] leading-relaxed mb-4">
        {truncate(article.summary, 120)}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F4F8FC]">
        <span className="text-xs text-[#AED6F1]">
          {formatDateWIB(article.publishedAt, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'Asia/Jakarta',
          })}
        </span>
        <span className="text-xs text-[#2E86C1] font-medium group-hover:underline">
          Baca selengkapnya
        </span>
      </div>
    </div>
  );
}

export default function EdukasiPage() {
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      try {
        const res = await api.get<ApiResponse<PaginatedResponse<ContentArticle>>>('/content/articles');
        return res.data.data?.items ?? DEMO_ARTICLES;
      } catch {
        return DEMO_ARTICLES;
      }
    },
  });

  const articles = articlesData ?? DEMO_ARTICLES;

  const filtered = articles.filter((a) => {
    const matchCat = activeCategory === 'ALL' || a.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Edukasi Kesehatan"
        subtitle="Tingkatkan pengetahuan Anda tentang hipertensi dan kesehatan jantung"
      />

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AED6F1]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari artikel..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.value
                ? 'bg-[#2E86C1] text-white'
                : 'bg-white border border-[#D6E8F5] text-[#5D8AA8] hover:bg-[#EAF4FB]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 bg-[#EAF4FB] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={40} className="text-[#AED6F1] mx-auto mb-3" />
          <p className="text-[#1A2A3A] font-semibold">Tidak ada artikel ditemukan</p>
          <p className="text-[#5D8AA8] text-sm mt-1">Coba ubah kata kunci atau kategori pencarian</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-[#5D8AA8] mb-4">{filtered.length} artikel ditemukan</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
