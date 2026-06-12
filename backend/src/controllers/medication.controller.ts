import type { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../app';
import * as MedService from '../services/medication.service';

// ─── List Medications ─────────────────────────────────────────────────────────

export const listMedications = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

    const medications = await MedService.listMedications(req.user.userId);
    res.json({ success: true, data: medications });
  },
);

// ─── Add Medication ───────────────────────────────────────────────────────────

export const addMedication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

    const { name, dosage, frequency, times, startDate, endDate, notes } = req.body as {
      name: string;
      dosage: string;
      frequency: string;
      times: string[];
      startDate: string;
      endDate?: string;
      notes?: string;
    };

    const medication = await MedService.createMedication({
      userId: req.user.userId,
      name,
      dosage,
      frequency,
      times,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      notes,
    });

    res.status(201).json({
      success: true,
      data: medication,
      message: 'Obat berhasil ditambahkan',
    });
  },
);

// ─── Update Medication ────────────────────────────────────────────────────────

export const updateMedication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

    const body = req.body as {
      name?: string;
      dosage?: string;
      frequency?: string;
      times?: string[];
      endDate?: string;
      notes?: string;
      isActive?: boolean;
    };

    const updated = await MedService.updateMedication(
      req.params['id'] as string,
      req.user.userId,
      {
        name: body.name,
        dosage: body.dosage,
        frequency: body.frequency,
        times: body.times,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        notes: body.notes,
        isActive: body.isActive,
      },
    );

    res.json({ success: true, data: updated, message: 'Informasi obat berhasil diperbarui' });
  },
);

// ─── Delete Medication ────────────────────────────────────────────────────────

export const deleteMedication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

    await MedService.softDeleteMedication(req.params['id'] as string, req.user.userId);
    res.json({ success: true, data: null, message: 'Obat berhasil dihapus' });
  },
);

// ─── Log Medication ───────────────────────────────────────────────────────────

export const logMedication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

    const { scheduledTime, status, takenAt, notes } = req.body as {
      scheduledTime: string;
      status: 'TAKEN' | 'SKIPPED';
      takenAt?: string;
      notes?: string;
    };

    const log = await MedService.logMedication({
      userId: req.user.userId,
      medicationId: req.params['id'] as string,
      scheduledTime: new Date(scheduledTime),
      status,
      takenAt: takenAt ? new Date(takenAt) : undefined,
      notes,
    });

    res.json({
      success: true,
      data: log,
      message: status === 'TAKEN' ? 'Obat berhasil dicatat sebagai diminum' : 'Obat dicatat sebagai dilewati',
    });
  },
);

// ─── Today's Schedule ─────────────────────────────────────────────────────────

export const getTodaySchedule = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

    const schedule = await MedService.getTodaySchedule(req.user.userId);
    const compliance = await MedService.getMedicationComplianceToday(req.user.userId);

    res.json({
      success: true,
      data: {
        schedule,
        compliance,
      },
    });
  },
);
