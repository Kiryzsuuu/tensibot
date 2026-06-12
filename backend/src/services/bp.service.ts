import { Timestamp } from 'firebase-admin/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import { AppError } from '../app';
import { calculateBPCategory } from '../utils/bp-calculator';
import type { BloodPressureRecord, BPCategory } from '../types';

export interface CreateBPInput {
  userId: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  measuredAt?: Date;
  notes?: string;
}

export interface BPStats {
  count: number;
  avgSystolic: number;
  avgDiastolic: number;
  avgPulse: number | null;
  minSystolic: number;
  maxSystolic: number;
  minDiastolic: number;
  maxDiastolic: number;
  latestCategory: BPCategory | null;
}

export interface PaginatedBPRecords {
  records: BloodPressureRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function createRecord(input: CreateBPInput): Promise<BloodPressureRecord> {
  const category = calculateBPCategory(input.systolic, input.diastolic).category;
  const now = new Date();

  const data: Omit<BloodPressureRecord, 'id'> = {
    userId: input.userId,
    systolic: input.systolic,
    diastolic: input.diastolic,
    pulse: input.pulse ?? null,
    measuredAt: input.measuredAt ?? now,
    category,
    notes: input.notes ?? null,
    isDeleted: false,
    createdAt: now,
  };

  const ref = await db.collection(COLLECTIONS.BP_RECORDS).add(data);
  return { id: ref.id, ...data };
}

export async function getRecords(options: {
  userId: string;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<PaginatedBPRecords> {
  const page = options.page ?? 1;
  const limit = Math.min(options.limit ?? 20, 100);

  let query = db.collection(COLLECTIONS.BP_RECORDS)
    .where('userId', '==', options.userId)
    .where('isDeleted', '==', false)
    .orderBy('measuredAt', 'desc');

  if (options.startDate) {
    query = query.where('measuredAt', '>=', Timestamp.fromDate(options.startDate));
  }
  if (options.endDate) {
    query = query.where('measuredAt', '<=', Timestamp.fromDate(options.endDate));
  }

  const snapshot = await query.get();
  const all = snapshot.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      measuredAt: data['measuredAt']?.toDate?.() ?? new Date(data['measuredAt']),
      createdAt: data['createdAt']?.toDate?.() ?? new Date(data['createdAt']),
    } as BloodPressureRecord;
  });

  const total = all.length;
  const records = all.slice((page - 1) * limit, page * limit);

  return { records, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getStats(userId: string, days = 30): Promise<BPStats> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const snapshot = await db.collection(COLLECTIONS.BP_RECORDS)
    .where('userId', '==', userId)
    .where('isDeleted', '==', false)
    .where('measuredAt', '>=', Timestamp.fromDate(since))
    .orderBy('measuredAt', 'desc')
    .get();

  const records = snapshot.docs.map(d => d.data() as BloodPressureRecord & { category: BPCategory });

  if (records.length === 0) {
    return {
      count: 0, avgSystolic: 0, avgDiastolic: 0, avgPulse: null,
      minSystolic: 0, maxSystolic: 0, minDiastolic: 0, maxDiastolic: 0,
      latestCategory: null,
    };
  }

  const systolics = records.map(r => r.systolic);
  const diastolics = records.map(r => r.diastolic);
  const pulses = records.filter(r => r.pulse !== null && r.pulse !== undefined).map(r => r.pulse as number);

  return {
    count: records.length,
    avgSystolic: Math.round(systolics.reduce((a, b) => a + b, 0) / records.length),
    avgDiastolic: Math.round(diastolics.reduce((a, b) => a + b, 0) / records.length),
    avgPulse: pulses.length > 0 ? Math.round(pulses.reduce((a, b) => a + b, 0) / pulses.length) : null,
    minSystolic: Math.min(...systolics),
    maxSystolic: Math.max(...systolics),
    minDiastolic: Math.min(...diastolics),
    maxDiastolic: Math.max(...diastolics),
    latestCategory: records[0]?.category ?? null,
  };
}

export async function findById(id: string, userId: string): Promise<BloodPressureRecord> {
  const doc = await db.collection(COLLECTIONS.BP_RECORDS).doc(id).get();

  if (!doc.exists) {
    throw new AppError('Data tekanan darah tidak ditemukan', 404, 'NOT_FOUND');
  }

  const data = doc.data()!;
  if (data['userId'] !== userId || data['isDeleted'] === true) {
    throw new AppError('Data tekanan darah tidak ditemukan', 404, 'NOT_FOUND');
  }

  return { id: doc.id, ...data } as BloodPressureRecord;
}

export async function updateNotes(id: string, userId: string, notes: string): Promise<BloodPressureRecord> {
  await findById(id, userId);
  await db.collection(COLLECTIONS.BP_RECORDS).doc(id).update({ notes });
  const updated = await db.collection(COLLECTIONS.BP_RECORDS).doc(id).get();
  return { id: updated.id, ...updated.data() } as BloodPressureRecord;
}

export async function softDelete(id: string, userId: string): Promise<void> {
  await findById(id, userId);
  await db.collection(COLLECTIONS.BP_RECORDS).doc(id).update({ isDeleted: true });
}

export async function getLast7Days(userId: string): Promise<BloodPressureRecord[]> {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const snapshot = await db.collection(COLLECTIONS.BP_RECORDS)
    .where('userId', '==', userId)
    .where('isDeleted', '==', false)
    .where('measuredAt', '>=', Timestamp.fromDate(since))
    .orderBy('measuredAt', 'asc')
    .get();

  return snapshot.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      measuredAt: data['measuredAt']?.toDate?.() ?? new Date(data['measuredAt']),
      createdAt: data['createdAt']?.toDate?.() ?? new Date(data['createdAt']),
    } as BloodPressureRecord;
  });
}
