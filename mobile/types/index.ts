export type Role = 'PASIEN' | 'DOKTER' | 'PROFESIONAL' | 'STAF' | 'FARMASI' | 'ADMIN' | 'SUPER_ADMIN';
export type BPCategory = 'NORMAL' | 'ELEVATED' | 'STAGE_1' | 'STAGE_2' | 'CRISIS';
export type MedStatus = 'TAKEN' | 'SKIPPED' | 'PENDING';
export type MessageRole = 'USER' | 'ASSISTANT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE';
  weightKg?: number;
  heightCm?: number;
  phoneNumber?: string;
  diagnosis?: string;
  diagnoses?: string[];
  avatarUrl?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface BPRecord {
  id: string;
  userId: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  category: BPCategory;
  measuredAt: string;
  notes?: string;
  createdAt: string;
}

export interface BPStats {
  totalRecords: number;
  avgSystolic: number;
  avgDiastolic: number;
  minSystolic: number;
  maxSystolic: number;
  avgPulse?: number;
  latestCategory?: BPCategory;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  instructions?: string;
  notes?: string;
  isActive: boolean;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  userId: string;
  scheduledAt: string;
  takenAt?: string;
  status: MedStatus;
}

export interface MedicationWithStatus extends Medication {
  todayLogs: MedicationLog[];
  complianceRate?: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: { code: string; message: string };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
