import { Router } from 'express';
import { z } from 'zod';
import { authRateLimit } from '../middleware/rateLimit.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
} from '../controllers/auth.controller';

export const authRouter = Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf kapital')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
  fullName: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang'),
  role: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token harus diisi'),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

authRouter.post('/register', authRateLimit, validateBody(registerSchema), register);
authRouter.post('/login', authRateLimit, validateBody(loginSchema), login);
authRouter.post('/refresh', authRateLimit, validateBody(refreshSchema), refresh);
authRouter.post('/forgot-password', authRateLimit, validateBody(z.object({ email: z.string().email() })), forgotPassword);
authRouter.post('/logout', authMiddleware, logout);
authRouter.get('/me', authMiddleware, getMe);
