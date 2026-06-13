import type { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../app';
import { db, COLLECTIONS } from '../lib/firebase';
import { getUserProfile, updateUserProfile, findUserById } from '../services/auth.service';
import * as BPService from '../services/bp.service';
import * as MedService from '../services/medication.service';

export const getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const [user, profile] = await Promise.all([
    findUserById(req.user.userId),
    getUserProfile(req.user.userId),
  ]);

  if (!user) return next(new AppError('Pengguna tidak ditemukan', 404, 'NOT_FOUND'));

  const { passwordHash, ...safeUser } = user as typeof user & { passwordHash?: unknown };
  void passwordHash;

  res.json({
    success: true,
    data: { ...safeUser, profile },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const body = req.body as {
    fullName?: string;
    dateOfBirth?: string;
    // accept both old and new field names
    weightKg?: number; weight?: number;
    heightCm?: number; height?: number;
    phoneNumber?: string; phone?: string;
    gender?: string;
    diagnosis?: string;
    diagnosisYear?: number;
    allergies?: string;
    emergencyContact?: string;
    address?: string;
  };

  const updateData: Record<string, unknown> = {};
  if (body.fullName !== undefined) updateData['fullName'] = body.fullName;
  if (body.dateOfBirth !== undefined) updateData['dateOfBirth'] = new Date(body.dateOfBirth);
  if (body.gender !== undefined) updateData['gender'] = body.gender;
  // normalise weight/height/phone — accept both naming conventions
  const weight = body.weightKg ?? body.weight;
  const height = body.heightCm ?? body.height;
  const phone = body.phoneNumber ?? body.phone;
  if (weight !== undefined) updateData['weightKg'] = weight;
  if (height !== undefined) updateData['heightCm'] = height;
  if (phone !== undefined) updateData['phoneNumber'] = phone;
  if (body.diagnosis !== undefined) updateData['diagnosis'] = body.diagnosis;
  if (body.diagnosisYear !== undefined) updateData['diagnosisYear'] = body.diagnosisYear;
  if (body.allergies !== undefined) updateData['allergies'] = body.allergies;
  if (body.emergencyContact !== undefined) updateData['emergencyContact'] = body.emergencyContact;
  if (body.address !== undefined) updateData['address'] = body.address;

  const profile = await updateUserProfile(req.user.userId, updateData);

  res.json({ success: true, data: profile, message: 'Profil berhasil diperbarui' });
});

export const getDashboard = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const userId = req.user.userId;

  const [bpStats, latestBPRecords, medicationCompliance, sevenDayRecords, profile, medsSnapshot] =
    await Promise.all([
      BPService.getStats(userId, 30),
      BPService.getRecords({ userId, limit: 5 }),
      MedService.getMedicationComplianceToday(userId),
      BPService.getLast7Days(userId),
      getUserProfile(userId),
      db.collection(COLLECTIONS.MEDICATIONS).where('userId', '==', userId).where('isActive', '==', true).get(),
    ]);

  const trendData = sevenDayRecords.map(r => {
    const date = r.measuredAt instanceof Date ? r.measuredAt : new Date(r.measuredAt as unknown as string);
    return {
      date: date.toISOString().split('T')[0],
      systolic: r.systolic,
      diastolic: r.diastolic,
      pulse: r.pulse,
      category: r.category,
    };
  });

  res.json({
    success: true,
    data: {
      profile: { fullName: profile?.fullName ?? null },
      bpStats,
      latestBPRecords: latestBPRecords.items,
      trendData,
      medication: {
        activeCount: medsSnapshot.size,
        todayCompliance: medicationCompliance,
      },
    },
  });
});
