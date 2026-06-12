import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../app';
import { db, COLLECTIONS } from '../lib/firebase';
import { logger } from '../utils/logger';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const since7Days = new Date();
  since7Days.setDate(since7Days.getDate() - 7);

  const [usersSnap, activeUsersSnap, bpSnap, chatSnap, crisisSnap] = await Promise.all([
    db.collection(COLLECTIONS.USERS).get(),
    db.collection(COLLECTIONS.USERS).where('isActive', '==', true).get(),
    db.collection(COLLECTIONS.BP_RECORDS).where('isDeleted', '==', false).get(),
    db.collection(COLLECTIONS.CHAT_SESSIONS).where('isActive', '==', true).get(),
    db.collection(COLLECTIONS.BP_RECORDS)
      .where('category', '==', 'CRISIS')
      .where('isDeleted', '==', false)
      .where('createdAt', '>=', Timestamp.fromDate(since7Days))
      .get(),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers: usersSnap.size,
      activeUsers: activeUsersSnap.size,
      totalBPRecords: bpSnap.size,
      totalChatSessions: chatSnap.size,
      crisisEventsLast7Days: crisisSnap.size,
    },
  });
});

export const listUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const page = parseInt((req.query['page'] as string) ?? '1', 10);
  const limit = Math.min(parseInt((req.query['limit'] as string) ?? '20', 10), 100);

  const usersSnap = await db.collection(COLLECTIONS.USERS).orderBy('createdAt', 'desc').get();
  const all = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const total = all.length;
  const paged = all.slice((page - 1) * limit, page * limit);

  const usersWithProfiles = await Promise.all(
    paged.map(async (user: Record<string, unknown>) => {
      const profileDoc = await db.collection(COLLECTIONS.USER_PROFILES).doc(user['id'] as string).get();
      const profile = profileDoc.exists ? profileDoc.data() : null;
      const { passwordHash, ...safeUser } = user as Record<string, unknown> & { passwordHash?: unknown };
      void passwordHash;
      return { ...safeUser, profile: profile ? { fullName: profile['fullName'], phone: profile['phone'] } : null };
    }),
  );

  res.json({ success: true, data: { users: usersWithProfiles, total, page, limit, totalPages: Math.ceil(total / limit) } });
});

export const getUserHealthData = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const targetUserId = req.params['userId'] as string;

  const [userDoc, profileDoc, bpSnap, medsSnap] = await Promise.all([
    db.collection(COLLECTIONS.USERS).doc(targetUserId).get(),
    db.collection(COLLECTIONS.USER_PROFILES).doc(targetUserId).get(),
    db.collection(COLLECTIONS.BP_RECORDS).where('userId', '==', targetUserId).where('isDeleted', '==', false).orderBy('measuredAt', 'desc').limit(50).get(),
    db.collection(COLLECTIONS.MEDICATIONS).where('userId', '==', targetUserId).where('isActive', '==', true).get(),
  ]);

  if (!userDoc.exists) return next(new AppError('Pengguna tidak ditemukan', 404, 'NOT_FOUND'));

  const { passwordHash, ...safeUser } = { id: userDoc.id, ...userDoc.data() } as Record<string, unknown> & { passwordHash?: unknown };
  void passwordHash;

  await db.collection(COLLECTIONS.ADMIN_LOGS).doc(uuidv4()).set({
    adminId: req.user.userId,
    action: 'VIEW_USER_HEALTH_DATA',
    targetId: targetUserId,
    targetType: 'User',
    createdAt: new Date(),
  });

  res.json({
    success: true,
    data: {
      ...safeUser,
      profile: profileDoc.exists ? profileDoc.data() : null,
      bpRecords: bpSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      medications: medsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    },
  });
});

export const toggleUserStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const targetUserId = req.params['userId'] as string;
  const userDoc = await db.collection(COLLECTIONS.USERS).doc(targetUserId).get();
  if (!userDoc.exists) return next(new AppError('Pengguna tidak ditemukan', 404, 'NOT_FOUND'));

  const currentStatus = userDoc.data()?.['isActive'] as boolean;
  const newStatus = !currentStatus;

  await db.collection(COLLECTIONS.USERS).doc(targetUserId).update({ isActive: newStatus, updatedAt: new Date() });

  await db.collection(COLLECTIONS.ADMIN_LOGS).doc(uuidv4()).set({
    adminId: req.user.userId,
    action: newStatus ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
    targetId: targetUserId,
    targetType: 'User',
    details: { previousStatus: currentStatus, newStatus },
    createdAt: new Date(),
  });

  logger.info(`Admin ${req.user.email} toggled user ${targetUserId} to ${newStatus}`);

  res.json({
    success: true,
    data: { id: targetUserId, isActive: newStatus },
    message: `Pengguna berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
  });
});

export const getAdminLogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const page = parseInt((req.query['page'] as string) ?? '1', 10);
  const limit = Math.min(parseInt((req.query['limit'] as string) ?? '20', 10), 100);

  const snap = await db.collection(COLLECTIONS.ADMIN_LOGS).orderBy('createdAt', 'desc').get();
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const total = all.length;
  const logs = all.slice((page - 1) * limit, page * limit);

  res.json({ success: true, data: { logs, total, page, limit, totalPages: Math.ceil(total / limit) } });
});
