import type { BPCategory } from '@/types';

export interface BPCategoryDef {
  category: BPCategory;
  label: string;
  labelShort: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  systolicRange: string;
  diastolicRange: string;
  description: string;
  recommendation: string;
  urgency: 'normal' | 'warning' | 'danger' | 'critical';
}

export const BP_CATEGORIES: Record<BPCategory, BPCategoryDef> = {
  NORMAL: {
    category: 'NORMAL',
    label: 'Normal',
    labelShort: 'Normal',
    color: '#16a34a',
    bgColor: '#dcfce7',
    textColor: '#15803d',
    borderColor: '#86efac',
    systolicRange: '< 120',
    diastolicRange: '< 80',
    description: 'Tekanan darah Anda dalam kisaran normal. Pertahankan gaya hidup sehat.',
    recommendation:
      'Lanjutkan pola makan sehat, olahraga teratur, dan hindari rokok serta alkohol.',
    urgency: 'normal',
  },
  ELEVATED: {
    category: 'ELEVATED',
    label: 'Meningkat',
    labelShort: 'Meningkat',
    color: '#ca8a04',
    bgColor: '#fef9c3',
    textColor: '#a16207',
    borderColor: '#fde047',
    systolicRange: '120–129',
    diastolicRange: '< 80',
    description: 'Tekanan darah sedikit meningkat. Perlu perhatian untuk mencegah hipertensi.',
    recommendation:
      'Kurangi konsumsi garam, tingkatkan aktivitas fisik, dan pantau secara berkala.',
    urgency: 'warning',
  },
  STAGE_1: {
    category: 'STAGE_1',
    label: 'Hipertensi Stage 1',
    labelShort: 'Stage 1',
    color: '#ea580c',
    bgColor: '#ffedd5',
    textColor: '#c2410c',
    borderColor: '#fdba74',
    systolicRange: '130–139',
    diastolicRange: '80–89',
    description: 'Hipertensi tahap awal. Diperlukan perubahan gaya hidup dan kemungkinan obat.',
    recommendation:
      'Konsultasikan dengan dokter. Perubahan gaya hidup dan obat mungkin diperlukan.',
    urgency: 'warning',
  },
  STAGE_2: {
    category: 'STAGE_2',
    label: 'Hipertensi Stage 2',
    labelShort: 'Stage 2',
    color: '#dc2626',
    bgColor: '#fee2e2',
    textColor: '#b91c1c',
    borderColor: '#fca5a5',
    systolicRange: '≥ 140',
    diastolicRange: '≥ 90',
    description:
      'Hipertensi tahap lanjut. Membutuhkan penanganan medis segera dan pengobatan rutin.',
    recommendation:
      'Segera hubungi dokter. Patuh minum obat sangat penting untuk mencegah komplikasi.',
    urgency: 'danger',
  },
  CRISIS: {
    category: 'CRISIS',
    label: 'Krisis Hipertensi',
    labelShort: 'KRISIS',
    color: '#991b1b',
    bgColor: '#fecaca',
    textColor: '#7f1d1d',
    borderColor: '#f87171',
    systolicRange: '> 180',
    diastolicRange: '> 120',
    description:
      'DARURAT MEDIS! Tekanan darah sangat berbahaya. Segera cari pertolongan medis!',
    recommendation:
      'SEGERA ke UGD / IGD rumah sakit terdekat atau hubungi 119. Ini adalah kedaruratan medis!',
    urgency: 'critical',
  },
};

export function getBPCategory(systolic: number, diastolic: number): BPCategory {
  if (systolic > 180 || diastolic > 120) return 'CRISIS';
  if (systolic >= 140 || diastolic >= 90) return 'STAGE_2';
  if (systolic >= 130 || diastolic >= 80) return 'STAGE_1';
  if (systolic >= 120) return 'ELEVATED';
  return 'NORMAL';
}

export function getBPCategoryDef(category: BPCategory): BPCategoryDef {
  return BP_CATEGORIES[category];
}

export const BP_CATEGORY_ORDER: BPCategory[] = [
  'NORMAL',
  'ELEVATED',
  'STAGE_1',
  'STAGE_2',
  'CRISIS',
];

export const MAX_SYSTOLIC = 300;
export const MIN_SYSTOLIC = 60;
export const MAX_DIASTOLIC = 200;
export const MIN_DIASTOLIC = 40;
