export type BPCategory = 'NORMAL' | 'ELEVATED' | 'STAGE_1' | 'STAGE_2' | 'CRISIS';

export interface BPResult {
  category: BPCategory;
  label: string;
  color: string;
  description: string;
  isCrisis: boolean;
}

export interface BPValidation {
  valid: boolean;
  error?: string;
}

/**
 * Calculates the blood pressure category based on systolic and diastolic values.
 * Follows American Heart Association (AHA) 2017 guidelines.
 */
export function calculateBPCategory(systolic: number, diastolic: number): BPResult {
  // Crisis Hypertension: systolic >= 180 OR diastolic >= 120
  if (systolic >= 180 || diastolic >= 120) {
    return {
      category: 'CRISIS',
      label: 'Krisis Hipertensi',
      color: '#7F1D1D', // red-900
      description:
        'Tekanan darah sangat tinggi dan berbahaya. Segera ke IGD atau hubungi layanan darurat!',
      isCrisis: true,
    };
  }

  // Stage 2 Hypertension: systolic >= 140 OR diastolic >= 90
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'STAGE_2',
      label: 'Hipertensi Tahap 2',
      color: '#DC2626', // red-600
      description:
        'Tekanan darah tinggi kategori 2. Diperlukan penanganan medis segera dan perubahan gaya hidup.',
      isCrisis: false,
    };
  }

  // Stage 1 Hypertension: systolic 130–139 OR diastolic 80–89
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      category: 'STAGE_1',
      label: 'Hipertensi Tahap 1',
      color: '#F97316', // orange-500
      description:
        'Tekanan darah tinggi kategori 1. Konsultasikan dengan dokter dan terapkan perubahan gaya hidup sehat.',
      isCrisis: false,
    };
  }

  // Elevated: systolic 120–129 AND diastolic < 80
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      category: 'ELEVATED',
      label: 'Meningkat',
      color: '#EAB308', // yellow-500
      description:
        'Tekanan darah sedikit di atas normal. Lakukan perubahan gaya hidup untuk mencegah hipertensi.',
      isCrisis: false,
    };
  }

  // Normal: systolic < 120 AND diastolic < 80
  return {
    category: 'NORMAL',
    label: 'Normal',
    color: '#16A34A', // green-600
    description: 'Tekanan darah dalam batas normal. Pertahankan gaya hidup sehat.',
    isCrisis: false,
  };
}

/**
 * Validates blood pressure input values.
 */
export function validateBP(systolic: number, diastolic: number): BPValidation {
  if (!Number.isInteger(systolic) || !Number.isInteger(diastolic)) {
    return { valid: false, error: 'Nilai tekanan darah harus berupa bilangan bulat' };
  }

  if (systolic < 60 || systolic > 300) {
    return {
      valid: false,
      error: 'Nilai sistolik harus antara 60–300 mmHg',
    };
  }

  if (diastolic < 40 || diastolic > 200) {
    return {
      valid: false,
      error: 'Nilai diastolik harus antara 40–200 mmHg',
    };
  }

  if (systolic <= diastolic) {
    return {
      valid: false,
      error: 'Nilai sistolik harus lebih besar dari nilai diastolik',
    };
  }

  return { valid: true };
}
