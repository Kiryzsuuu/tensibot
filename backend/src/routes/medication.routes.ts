import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  listMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  logMedication,
  getTodaySchedule,
} from '../controllers/medication.controller';

export const medicationRouter = Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const addMedicationSchema = z.object({
  name: z.string().min(1, 'Nama obat wajib diisi').max(100),
  dosage: z.string().min(1, 'Dosis wajib diisi').max(100),
  frequency: z.string().min(1, 'Frekuensi wajib diisi').max(100),
  times: z
    .array(z.string().regex(timePattern, 'Format waktu harus HH:MM'))
    .min(1, 'Minimal 1 jadwal waktu')
    .max(10, 'Maksimal 10 jadwal waktu'),
  startDate: z.string().datetime({ message: 'Format tanggal mulai tidak valid' }),
  endDate: z.string().datetime({ message: 'Format tanggal selesai tidak valid' }).optional(),
  notes: z.string().max(500).optional(),
});

const updateMedicationSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    dosage: z.string().min(1).max(100).optional(),
    frequency: z.string().min(1).max(100).optional(),
    times: z.array(z.string().regex(timePattern, 'Format waktu harus HH:MM')).min(1).max(10).optional(),
    endDate: z.string().datetime().optional(),
    notes: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diisi untuk update',
  });

const logMedicationSchema = z.object({
  scheduledTime: z.string().datetime({ message: 'Format waktu jadwal tidak valid' }).optional(),
  status: z.enum(['TAKEN', 'SKIPPED'], {
    errorMap: () => ({ message: 'Status harus TAKEN atau SKIPPED' }),
  }),
  takenAt: z.string().datetime().optional(),
  notes: z.string().max(200).optional(),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

medicationRouter.use(authMiddleware);

medicationRouter.get('/', listMedications);
medicationRouter.post('/', validateBody(addMedicationSchema), addMedication);
medicationRouter.get('/today', getTodaySchedule);
medicationRouter.patch('/:id', validateBody(updateMedicationSchema), updateMedication);
medicationRouter.delete('/:id', deleteMedication);
medicationRouter.post('/:id/log', validateBody(logMedicationSchema), logMedication);
