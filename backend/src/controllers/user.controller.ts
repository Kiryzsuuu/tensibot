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

  const {
    fullName, dateOfBirth, weightKg, heightCm, phoneNumber,
    diagnosis, diagnosisYear, allergies, emergencyContact, address,
  } = req.body as {
    fullName?: string;
    dateOfBirth?: string;
    weightKg?: number;
    heightCm?: number;
    phoneNumber?: string;
    diagnosis?: string;
    diagnosisYear?: number;
    allergies?: string;
    emergencyContact?: string;
    address?: string;
  };

  const updateData: Record<string, unknown> = {};
  if (fullName !== undefined) updateData['fullName'] = fullName;
  if (dateOfBirth !== undefined) updateData['dateOfBirth'] = new Date(dateOfBirth);
  if (weightKg !== undefined) updateData['weightKg'] = weightKg;
  if (heightCm !== undefined) updateData['heightCm'] = heightCm;
  if (phoneNumber !== undefined) updateData['phoneNumber'] = phoneNumber;
  if (diagnosis !== undefined) updateData['diagnosis'] = diagnosis;
  if (diagnosisYear !== undefined) updateData['diagnosisYear'] = diagnosisYear;
  if (allergies !== undefined) updateData['allergies'] = allergies;
  if (emergencyContact !== undefined) updateData['emergencyContact'] = emergencyContact;
  if (address !== undefined) updateData['address'] = address;

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
      latestBPRecords: latestBPRecords.records,
      trendData,
      medication: {
        activeCount: medsSnapshot.size,
        todayCompliance: medicationCompliance,
      },
    },
  });
});
