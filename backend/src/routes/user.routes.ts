import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { getProfile, updateProfile, getDashboard } from '../controllers/user.controller';

export const userRouter = Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const updateProfileSchema = z
  .object({
    fullName: z.string().min(2, 'Nama minimal 2 karakter').max(100).optional(),
    dateOfBirth: z.string().datetime({ message: 'Format tanggal lahir tidak valid' }).optional(),
    weight: z
      .number()
      .positive('Berat badan harus positif')
      .max(500, 'Berat badan tidak valid')
      .optional(),
    height: z
      .number()
      .positive('Tinggi badan harus positif')
      .max(300, 'Tinggi badan tidak valid')
      .optional(),
    diagnosis: z.string().max(500).optional(),
    phone: z
      .string()
      .regex(/^[0-9+\-\s()]{8,20}$/, 'Format nomor telepon tidak valid')
      .optional(),
    address: z.string().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diisi',
  });

// ─── Routes ───────────────────────────────────────────────────────────────────

userRouter.use(authMiddleware);

userRouter.get('/profile', getProfile);
userRouter.patch('/profile', validateBody(updateProfileSchema), updateProfile);
userRouter.get('/dashboard', getDashboard);
