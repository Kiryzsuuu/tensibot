import type { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../app';
import {
  createUser,
  findUserByEmail,
  findUserById,
  comparePassword,
  storeRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  getUserProfile,
} from '../services/auth.service';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

import type { Role } from '../types';

const ALLOWED_REGISTER_ROLES: Role[] = ['PASIEN', 'DOKTER', 'PROFESIONAL', 'STAF', 'FARMASI'];

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName, role: rawRole } = req.body as {
    email: string;
    password: string;
    fullName: string;
    role?: string;
  };

  const role: Role = ALLOWED_REGISTER_ROLES.includes(rawRole as Role)
    ? (rawRole as Role)
    : 'PASIEN';

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError('Email sudah terdaftar', 409, 'EMAIL_EXISTS');
  }

  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({ email, passwordHash, fullName, role });

  const accessToken = generateAccessToken(user.id, user.role, user.email);
  const refreshToken = generateRefreshToken(user.id);
  await storeRefreshToken(user.id, refreshToken);

  res.status(201).json({
    success: true,
    data: { user: { id: user.id, email: user.email, role: user.role }, token: accessToken, accessToken, refreshToken },
    message: 'Registrasi berhasil',
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await findUserByEmail(email);
  if (!user) throw new AppError('Email atau password salah', 401, 'INVALID_CREDENTIALS');
  if (!user.isActive) throw new AppError('Akun Anda telah dinonaktifkan. Hubungi admin.', 403, 'ACCOUNT_DISABLED');

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) throw new AppError('Email atau password salah', 401, 'INVALID_CREDENTIALS');

  const accessToken = generateAccessToken(user.id, user.role, user.email);
  const refreshToken = generateRefreshToken(user.id);
  await storeRefreshToken(user.id, refreshToken);

  const profile = await getUserProfile(user.id);

  res.json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, role: user.role, fullName: profile?.fullName ?? null },
      token: accessToken,
      accessToken,
      refreshToken,
    },
    message: 'Login berhasil',
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };

  let decoded: { userId: string };
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Refresh token tidak valid atau sudah kedaluwarsa', 401, 'TOKEN_INVALID');
  }

  const userId = await validateRefreshToken(refreshToken);
  if (!userId || userId !== decoded.userId) {
    throw new AppError('Refresh token tidak valid', 401, 'TOKEN_INVALID');
  }

  const user = await findUserById(userId);
  if (!user || !user.isActive) throw new AppError('Pengguna tidak ditemukan atau tidak aktif', 401, 'UNAUTHORIZED');

  await revokeRefreshToken(refreshToken);
  const newAccessToken = generateAccessToken(user.id, user.role, user.email);
  const newRefreshToken = generateRefreshToken(user.id);
  await storeRefreshToken(user.id, newRefreshToken);

  res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) await revokeRefreshToken(refreshToken);
  res.json({ success: true, data: null, message: 'Logout berhasil' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };

  // Always return success to prevent email enumeration
  const user = await findUserByEmail(email);
  if (user) {
    // In a real app, generate a token, store it, and send an email via Nodemailer/SendGrid.
    // For now we just log it — email sending requires SMTP config.
    const { logger } = await import('../utils/logger');
    logger.info(`[ForgotPassword] Reset requested for ${email} (userId: ${user.id})`);
  }

  res.json({
    success: true,
    data: null,
    message: 'Jika email terdaftar, link reset password akan dikirim.',
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const user = await findUserById(req.user.userId);
  if (!user) return next(new AppError('Pengguna tidak ditemukan', 404, 'NOT_FOUND'));

  const profile = await getUserProfile(user.id);

  res.json({
    success: true,
    data: { id: user.id, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt, profile },
  });
});
