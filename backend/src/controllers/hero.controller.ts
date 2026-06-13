import { v4 as uuidv4 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../app';
import { db, COLLECTIONS } from '../lib/firebase';

const HEROES = COLLECTIONS.HEROES;

export const getActiveHeroes = asyncHandler(async (_req: Request, res: Response) => {
  const snap = await db.collection(HEROES)
    .where('isActive', '==', true)
    .orderBy('order', 'asc')
    .get();

  const heroes = snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      title: data['title'],
      subtitle: data['subtitle'],
      description: data['description'] ?? null,
      imageBase64: data['imageBase64'] ?? null,
      imageAlt: data['imageAlt'] ?? null,
      ctaText: data['ctaText'] ?? null,
      ctaLink: data['ctaLink'] ?? null,
      isActive: data['isActive'],
      order: data['order'],
      createdAt: data['createdAt']?.toDate?.()?.toISOString() ?? null,
      updatedAt: data['updatedAt']?.toDate?.()?.toISOString() ?? null,
    };
  });

  res.json({ success: true, data: heroes });
});

export const listHeroes = asyncHandler(async (_req: Request, res: Response) => {
  const snap = await db.collection(HEROES).orderBy('order', 'asc').get();

  const heroes = snap.docs.map(d => {
    const data = d.data();
    // Exclude large base64 from list view for performance
    return {
      id: d.id,
      title: data['title'],
      subtitle: data['subtitle'],
      description: data['description'] ?? null,
      imageAlt: data['imageAlt'] ?? null,
      hasImage: !!data['imageBase64'],
      ctaText: data['ctaText'] ?? null,
      ctaLink: data['ctaLink'] ?? null,
      isActive: data['isActive'],
      order: data['order'],
      createdBy: data['createdBy'],
      createdAt: data['createdAt']?.toDate?.()?.toISOString() ?? null,
      updatedAt: data['updatedAt']?.toDate?.()?.toISOString() ?? null,
    };
  });

  res.json({ success: true, data: heroes });
});

export const createHero = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const { title, subtitle, description, imageBase64, imageAlt, ctaText, ctaLink, isActive, order } = req.body as {
    title: string;
    subtitle: string;
    description?: string;
    imageBase64?: string;
    imageAlt?: string;
    ctaText?: string;
    ctaLink?: string;
    isActive?: boolean;
    order?: number;
  };

  if (!title || !subtitle) {
    return next(new AppError('Judul dan subjudul wajib diisi', 400, 'VALIDATION_ERROR'));
  }

  const id = uuidv4();
  const now = new Date();

  await db.collection(HEROES).doc(id).set({
    title,
    subtitle,
    description: description ?? null,
    imageBase64: imageBase64 ?? null,
    imageAlt: imageAlt ?? null,
    ctaText: ctaText ?? null,
    ctaLink: ctaLink ?? null,
    isActive: isActive ?? true,
    order: order ?? 0,
    createdBy: req.user.userId,
    createdAt: now,
    updatedAt: now,
  });

  res.status(201).json({ success: true, data: { id }, message: 'Hero berhasil dibuat' });
});

export const updateHero = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const id = req.params['id'] as string;
  const doc = await db.collection(HEROES).doc(id).get();
  if (!doc.exists) return next(new AppError('Hero tidak ditemukan', 404, 'NOT_FOUND'));

  const { title, subtitle, description, imageBase64, imageAlt, ctaText, ctaLink, isActive, order } = req.body as Record<string, unknown>;

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (title !== undefined) update['title'] = title;
  if (subtitle !== undefined) update['subtitle'] = subtitle;
  if (description !== undefined) update['description'] = description;
  if (imageBase64 !== undefined) update['imageBase64'] = imageBase64;
  if (imageAlt !== undefined) update['imageAlt'] = imageAlt;
  if (ctaText !== undefined) update['ctaText'] = ctaText;
  if (ctaLink !== undefined) update['ctaLink'] = ctaLink;
  if (isActive !== undefined) update['isActive'] = isActive;
  if (order !== undefined) update['order'] = order;

  await db.collection(HEROES).doc(id).update(update);

  res.json({ success: true, data: { id }, message: 'Hero berhasil diperbarui' });
});

export const deleteHero = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  const id = req.params['id'] as string;
  const doc = await db.collection(HEROES).doc(id).get();
  if (!doc.exists) return next(new AppError('Hero tidak ditemukan', 404, 'NOT_FOUND'));

  await db.collection(HEROES).doc(id).delete();

  res.json({ success: true, data: null, message: 'Hero berhasil dihapus' });
});
