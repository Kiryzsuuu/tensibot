// ─── User & Auth ────────────────────────────────────────────────────────────

export type Role = 'PASIEN' | 'DOKTER' | 'PROFESIONAL' | 'STAF' | 'FARMASI' | 'ADMIN' | 'SUPER_ADMIN';

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
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE';
  weight?: number;
  height?: number;
  phone?: string;
  diagnosis?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  imageBase64?: string;
  imageAlt?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: Role;
}

// ─── Blood Pressure ──────────────────────────────────────────────────────────

export type BPCategory = 'NORMAL' | 'ELEVATED' | 'STAGE_1' | 'STAGE_2' | 'CRISIS';

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

export interface BPInput {
  systolic: number;
  diastolic: number;
  pulse?: number;
  measuredAt: string;
  notes?: string;
}

export interface BPStats {
  avgSystolic: number;
  avgDiastolic: number;
  minSystolic: number;
  maxSystolic: number;
  totalRecords: number;
  lastRecord?: BPRecord;
}

// ─── Medication ──────────────────────────────────────────────────────────────

export type MedStatus = 'TAKEN' | 'SKIPPED' | 'PENDING';

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
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

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type MessageRole = 'USER' | 'ASSISTANT';

export interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface SendMessagePayload {
  content: string;
  sessionId?: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
  sessionId: string;
  assistantMessage: ChatMessage;
}

// ─── Education Content ───────────────────────────────────────────────────────

export type ArticleCategory =
  | 'GENERAL'
  | 'DIET'
  | 'EXERCISE'
  | 'MEDICATION'
  | 'LIFESTYLE'
  | 'EMERGENCY';

export interface ContentArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  imageUrl?: string;
  publishedAt: string;
  readTimeMinutes: number;
  isPublished: boolean;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardData {
  user: User;
  lastBPRecord?: BPRecord;
  bpRecords7Days: BPRecord[];
  bpStats30Days: BPStats;
  todayMedications: MedicationWithStatus[];
  medicationComplianceWeek: number;
  unreadNotifications: number;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'MEDICATION' | 'BP_REMINDER' | 'HEALTH_TIP' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
  details?: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
