// ─── Domain Enums ─────────────────────────────────────────────────────────────

export type Role =
  | 'PASIEN'
  | 'DOKTER'
  | 'PROFESIONAL'
  | 'STAF'
  | 'FARMASI'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type BPCategory = 'NORMAL' | 'ELEVATED' | 'STAGE_1' | 'STAGE_2' | 'CRISIS';

export type MedStatus = 'TAKEN' | 'SKIPPED' | 'PENDING';

// ─── Firestore Document Shapes ────────────────────────────────────────────────
// All documents include `id` (the Firestore document ID) after retrieval.

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: Date | null;
  weightKg?: number | null;
  heightCm?: number | null;
  phoneNumber?: string | null;
  diagnosis?: string | null;
  diagnosisYear?: number | null;
  allergies?: string | null;
  emergencyContact?: string | null;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BloodPressureRecord {
  id: string;
  userId: string;
  systolic: number;
  diastolic: number;
  pulse?: number | null;
  measuredAt: Date;
  category: BPCategory;
  notes?: string | null;
  isDeleted: boolean;
  createdAt: Date;
}

export interface UserMedication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];        // e.g. ["08:00", "20:00"]
  startDate: Date;
  endDate?: Date | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationLog {
  id: string;
  userId: string;
  medicationId: string;
  scheduledTime: Date;
  status: MedStatus;
  takenAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface ContentArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  type: string;
  tags: string[];
  publishedAt?: Date | null;
  authorId: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthGoal {
  id: string;
  userId: string;
  type: string;
  target: number;
  unit: string;
  deadline?: Date | null;
  achieved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetId?: string | null;
  targetType?: string | null;
  details?: Record<string, unknown> | null;
  createdAt: Date;
}
