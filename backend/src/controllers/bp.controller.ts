import type { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../app';
import { calculateBPCategory, validateBP } from '../utils/bp-calculator';
import * as BPService from '../services/bp.service';

// ─── Get Records ──────────────────────────────────────────────────────────────

export const getRecords = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const page = parseInt((req.query['page'] as string) ?? '1', 10);
  const limit = parseInt((req.query['limit'] as string) ?? '20', 10);
  const startDate = req.query['startDate']
    ? new Date(req.query['startDate'] as string)
    : undefined;
  const endDate = req.query['endDate'] ? new Date(req.query['endDate'] as string) : undefined;

  const result = await BPService.getRecords({
    userId: req.user.userId,
    page,
    limit,
    startDate,
    endDate,
  });

  res.json({ success: true, data: result });
});

// ─── Create Record ────────────────────────────────────────────────────────────

export const createRecord = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

    const { systolic, diastolic, pulse, measuredAt, notes } = req.body as {
      systolic: number;
      diastolic: number;
      pulse?: number;
      measuredAt?: string;
      notes?: string;
    };

    // Validate BP values
    const validation = validateBP(systolic, diastolic);
    if (!validation.valid) {
      return next(new AppError(validation.error ?? 'Nilai tekanan darah tidak valid', 400, 'VALIDATION_ERROR'));
    }

    const bpResult = calculateBPCategory(systolic, diastolic);

    const record = await BPService.createRecord({
      userId: req.user.userId,
      systolic,
      diastolic,
      pulse,
      measuredAt: measuredAt ? new Date(measuredAt) : new Date(),
      notes,
    });

    const responseData = {
      record,
      categoryInfo: bpResult,
      ...(bpResult.isCrisis
        ? {
            crisisWarning: {
              message:
                '⚠️ PERINGATAN KRISIS: Tekanan darah Anda sangat berbahaya! Segera ke IGD/UGD terdekat atau hubungi 119!',
              action: 'SEEK_EMERGENCY_CARE',
            },
          }
        : {}),
    };

    res.status(201).json({
      success: true,
      data: responseData,
      message: bpResult.isCrisis
        ? 'Data tersimpan — SEGERA cari bantuan medis darurat!'
        : 'Data tekanan darah berhasil disimpan',
    });
  },
);

// ─── Get Stats ────────────────────────────────────────────────────────────────

export const getStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const days = parseInt((req.query['days'] as string) ?? '30', 10);
  const stats = await BPService.getStats(req.user.userId, days);

  res.json({ success: true, data: stats });
});

// ─── Get Single Record ────────────────────────────────────────────────────────

export const getRecord = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const record = await BPService.findById(req.params['id'] as string, req.user.userId);
  res.json({ success: true, data: record });
});

// ─── Update Notes ─────────────────────────────────────────────────────────────

export const updateRecord = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

    const { notes } = req.body as { notes: string };
    const record = await BPService.updateNotes(
      req.params['id'] as string,
      req.user.userId,
      notes,
    );

    res.json({ success: true, data: record, message: 'Catatan berhasil diperbarui' });
  },
);

// ─── Soft Delete ──────────────────────────────────────────────────────────────

export const deleteRecord = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

    await BPService.softDelete(req.params['id'] as string, req.user.userId);
    res.json({ success: true, data: null, message: 'Data tekanan darah berhasil dihapus' });
  },
);
