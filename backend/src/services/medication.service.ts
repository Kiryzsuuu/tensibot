import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db, COLLECTIONS } from '../lib/firebase';
import { AppError } from '../app';
import type { UserMedication, MedicationLog, MedStatus } from '../types';

export interface CreateMedicationInput {
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

export interface UpdateMedicationInput {
  name?: string;
  dosage?: string;
  frequency?: string;
  times?: string[];
  endDate?: Date;
  notes?: string;
  isActive?: boolean;
}

export interface LogMedicationInput {
  userId: string;
  medicationId: string;
  scheduledTime: Date;
  status: MedStatus;
  takenAt?: Date;
  notes?: string;
}

export interface TodayScheduleItem {
  medication: UserMedication;
  scheduledTime: Date;
  log: MedicationLog | null;
}

export async function createMedication(input: CreateMedicationInput): Promise<UserMedication> {
  const id = uuidv4();
  const now = new Date();

  const data: Omit<UserMedication, 'id'> = {
    userId: input.userId,
    name: input.name,
    dosage: input.dosage,
    frequency: input.frequency,
    times: input.times,
    startDate: input.startDate,
    endDate: input.endDate ?? null,
    notes: input.notes ?? null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection(COLLECTIONS.MEDICATIONS).doc(id).set(data);
  return { id, ...data };
}

export async function listMedications(userId: string): Promise<UserMedication[]> {
  const snapshot = await db.collection(COLLECTIONS.MEDICATIONS)
    .where('userId', '==', userId)
    .where('isActive', '==', true)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserMedication));
}

export async function findMedicationById(id: string, userId: string): Promise<UserMedication> {
  const doc = await db.collection(COLLECTIONS.MEDICATIONS).doc(id).get();

  if (!doc.exists) throw new AppError('Obat tidak ditemukan', 404, 'NOT_FOUND');

  const data = doc.data()!;
  if (data['userId'] !== userId || data['isActive'] === false) {
    throw new AppError('Obat tidak ditemukan', 404, 'NOT_FOUND');
  }

  return { id: doc.id, ...data } as UserMedication;
}

export async function updateMedication(id: string, userId: string, data: UpdateMedicationInput): Promise<UserMedication> {
  await findMedicationById(id, userId);
  const updatePayload: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if (data.endDate !== undefined) updatePayload['endDate'] = data.endDate;
  await db.collection(COLLECTIONS.MEDICATIONS).doc(id).update(updatePayload);
  const updated = await db.collection(COLLECTIONS.MEDICATIONS).doc(id).get();
  return { id: updated.id, ...updated.data() } as UserMedication;
}

export async function softDeleteMedication(id: string, userId: string): Promise<void> {
  await findMedicationById(id, userId);
  await db.collection(COLLECTIONS.MEDICATIONS).doc(id).update({ isActive: false });
}

export async function logMedication(input: LogMedicationInput): Promise<MedicationLog> {
  const existing = await db.collection(COLLECTIONS.MEDICATION_LOGS)
    .where('userId', '==', input.userId)
    .where('medicationId', '==', input.medicationId)
    .where('scheduledTime', '==', Timestamp.fromDate(input.scheduledTime))
    .limit(1)
    .get();

  const logData = {
    userId: input.userId,
    medicationId: input.medicationId,
    scheduledTime: input.scheduledTime,
    status: input.status,
    takenAt: input.takenAt ?? (input.status === 'TAKEN' ? new Date() : null),
    notes: input.notes ?? null,
    createdAt: new Date(),
  };

  if (!existing.empty) {
    const docRef = existing.docs[0].ref;
    await docRef.update({
      status: input.status,
      takenAt: logData.takenAt,
      notes: logData.notes,
    });
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as MedicationLog;
  }

  const id = uuidv4();
  await db.collection(COLLECTIONS.MEDICATION_LOGS).doc(id).set(logData);
  return { id, userId: logData.userId, medicationId: logData.medicationId, scheduledTime: logData.scheduledTime, status: logData.status, takenAt: logData.takenAt, notes: logData.notes, createdAt: logData.createdAt } as MedicationLog;
}

export async function getTodaySchedule(userId: string): Promise<TodayScheduleItem[]> {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const medsSnapshot = await db.collection(COLLECTIONS.MEDICATIONS)
    .where('userId', '==', userId)
    .where('isActive', '==', true)
    .get();

  const toDate = (val: unknown): Date => {
    if (val instanceof Date) return val;
    if (val && typeof val === 'object' && 'toDate' in val) return (val as { toDate(): Date }).toDate();
    return new Date(val as string);
  };

  const medications = medsSnapshot.docs
    .map(d => ({ id: d.id, ...d.data() } as UserMedication))
    .filter(med => {
      const startDate = toDate(med.startDate);
      const endDate = med.endDate ? toDate(med.endDate) : null;
      return startDate <= endOfDay && (!endDate || endDate >= startOfDay);
    });

  const logsSnapshot = await db.collection(COLLECTIONS.MEDICATION_LOGS)
    .where('userId', '==', userId)
    .where('scheduledTime', '>=', Timestamp.fromDate(startOfDay))
    .where('scheduledTime', '<=', Timestamp.fromDate(endOfDay))
    .get();

  const logsMap = new Map<string, MedicationLog>();
  logsSnapshot.docs.forEach(d => {
    const raw = d.data();
    const log: MedicationLog = {
      id: d.id,
      userId: raw['userId'] as string,
      medicationId: raw['medicationId'] as string,
      scheduledTime: raw['scheduledTime']?.toDate?.() ?? new Date(raw['scheduledTime']),
      status: raw['status'] as MedStatus,
      takenAt: raw['takenAt']?.toDate?.() ?? raw['takenAt'] ?? null,
      notes: raw['notes'] ?? null,
      createdAt: raw['createdAt']?.toDate?.() ?? new Date(raw['createdAt']),
    };
    logsMap.set(log.medicationId, log);
  });

  const scheduleItems: TodayScheduleItem[] = [];

  for (const med of medications) {
    for (const timeStr of med.times) {
      const [hoursStr, minutesStr] = timeStr.split(':');
      const scheduledTime = new Date(now);
      scheduledTime.setHours(parseInt(hoursStr ?? '0', 10), parseInt(minutesStr ?? '0', 10), 0, 0);

      scheduleItems.push({
        medication: med,
        scheduledTime,
        log: logsMap.get(med.id) ?? null,
      });
    }
  }

  scheduleItems.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  return scheduleItems;
}

export async function getMedicationComplianceToday(
  userId: string,
): Promise<{ total: number; taken: number; skipped: number; pending: number }> {
  const schedule = await getTodaySchedule(userId);
  const total = schedule.length;
  const taken = schedule.filter(s => s.log?.status === 'TAKEN').length;
  const skipped = schedule.filter(s => s.log?.status === 'SKIPPED').length;
  return { total, taken, skipped, pending: total - taken - skipped };
}
