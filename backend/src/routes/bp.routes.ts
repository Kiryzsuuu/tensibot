import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  getRecords,
  createRecord,
  getStats,
  getRecord,
  updateRecord,
  deleteRecord,
} from '../controllers/bp.controller';

export const bpRouter = Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createBPSchema = z.object({
  systolic: z
    .number({ required_error: 'Nilai sistolik wajib diisi' })
    .int('Nilai sistolik harus bilangan bulat')
    .min(60, 'Sistolik minimal 60')
    .max(300, 'Sistolik maksimal 300'),
  diastolic: z
    .number({ required_error: 'Nilai diastolik wajib diisi' })
    .int('Nilai diastolik harus bilangan bulat')
    .min(40, 'Diastolik minimal 40')
    .max(200, 'Diastolik maksimal 200'),
  pulse: z
    .number()
    .int('Nadi harus bilangan bulat')
    .min(20, 'Nadi minimal 20')
    .max(300, 'Nadi maksimal 300')
    .optional(),
  measuredAt: z.string().datetime({ message: 'Format tanggal tidak valid' }).optional(),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
});

const updateBPSchema = z.object({
  notes: z.string().max(500, 'Catatan maksimal 500 karakter'),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

bpRouter.use(authMiddleware);

bpRouter.get('/', getRecords);
bpRouter.post('/', validateBody(createBPSchema), createRecord);
bpRouter.get('/stats', getStats);
bpRouter.get('/:id', getRecord);
bpRouter.patch('/:id', validateBody(updateBPSchema), updateRecord);
bpRouter.delete('/:id', deleteRecord);
