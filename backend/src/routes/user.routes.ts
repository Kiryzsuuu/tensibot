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
    // Accept both "YYYY-MM-DD" and full ISO datetime
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}/, 'Format tanggal lahir tidak valid')
      .optional(),
    // Accept both old (weight/height/phone) and new (weightKg/heightCm/phoneNumber) field names
    weightKg: z.number().positive().max(500).optional(),
    weight: z.number().positive().max(500).optional(),
    heightCm: z.number().positive().max(300).optional(),
    height: z.number().positive().max(300).optional(),
    diagnosis: z.string().max(500).optional(),
    phoneNumber: z.string().regex(/^[0-9+\-\s()]{7,20}$/, 'Format nomor telepon tidak valid').optional(),
    phone: z.string().regex(/^[0-9+\-\s()]{7,20}$/, 'Format nomor telepon tidak valid').optional(),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    address: z.string().max(500).optional(),
    diagnosisYear: z.number().int().min(1900).max(2100).optional(),
    allergies: z.string().max(500).optional(),
    emergencyContact: z.string().max(200).optional(),
  })
  .refine((data) => Object.keys(data).filter(k => data[k as keyof typeof data] !== undefined).length > 0, {
    message: 'Minimal satu field harus diisi',
  });

// ─── Routes ───────────────────────────────────────────────────────────────────

userRouter.use(authMiddleware);

userRouter.get('/profile', getProfile);
userRouter.patch('/profile', validateBody(updateProfileSchema), updateProfile);
userRouter.get('/dashboard', getDashboard);
