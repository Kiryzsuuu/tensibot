import { Router } from 'express';
import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { asyncHandler, AppError } from '../app';
import { db, COLLECTIONS } from '../lib/firebase';
import type { Request, Response, NextFunction } from 'express';

export const contentRouter = Router();

const createArticleSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung'),
  content: z.string().min(1, 'Konten wajib diisi'),
  summary: z.string().min(1, 'Ringkasan wajib diisi').max(500),
  type: z.enum(['article', 'tip', 'news']),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
});

contentRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt((req.query['page'] as string) ?? '1', 10);
  const limit = Math.min(parseInt((req.query['limit'] as string) ?? '10', 10), 50);
  const type = req.query['type'] as string | undefined;

  let query = db.collection(COLLECTIONS.CONTENT_ARTICLES).where('isPublished', '==', true);
  if (type) query = query.where('type', '==', type);

  const snap = await query.orderBy('publishedAt', 'desc').get();
  const all = snap.docs.map(d => {
    const data = d.data();
    return { id: d.id, title: data['title'], slug: data['slug'], summary: data['summary'], type: data['type'], tags: data['tags'], publishedAt: data['publishedAt']?.toDate?.() ?? null };
  });

  const total = all.length;
  const articles = all.slice((page - 1) * limit, page * limit);

  res.json({ success: true, data: { articles, total, page, limit, totalPages: Math.ceil(total / limit) } });
}));

contentRouter.get('/admin/all',
  authMiddleware,
  roleMiddleware(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (_req: Request, res: Response) => {
    const snap = await db.collection(COLLECTIONS.CONTENT_ARTICLES).orderBy('createdAt', 'desc').get();
    const articles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, data: { articles, total: articles.length } });
  }),
);

contentRouter.get('/:slug', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const snap = await db.collection(COLLECTIONS.CONTENT_ARTICLES)
    .where('slug', '==', req.params['slug'])
    .where('isPublished', '==', true)
    .limit(1)
    .get();

  if (snap.empty) return next(new AppError('Artikel tidak ditemukan', 404, 'NOT_FOUND'));

  const doc = snap.docs[0];
  res.json({ success: true, data: { id: doc.id, ...doc.data() } });
}));

contentRouter.post('/',
  authMiddleware,
  roleMiddleware(['ADMIN', 'SUPER_ADMIN']),
  validateBody(createArticleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { title, slug, content, summary, type, tags, isPublished } = req.body as {
      title: string; slug: string; content: string; summary: string;
      type: string; tags: string[]; isPublished: boolean;
    };

    const id = uuidv4();
    const now = new Date();
    const data = {
      title, slug, content, summary, type, tags, isPublished,
      authorId: req.user?.userId ?? '',
      publishedAt: isPublished ? Timestamp.fromDate(now) : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection(COLLECTIONS.CONTENT_ARTICLES).doc(id).set(data);
    res.status(201).json({ success: true, data: { id, ...data }, message: 'Artikel berhasil dibuat' });
  }),
);

contentRouter.patch('/:id',
  authMiddleware,
  roleMiddleware(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params['id'] as string;
    const doc = await db.collection(COLLECTIONS.CONTENT_ARTICLES).doc(id).get();
    if (!doc.exists) return next(new AppError('Artikel tidak ditemukan', 404, 'NOT_FOUND'));

    const { isPublished, ...rest } = req.body as { isPublished?: boolean; [key: string]: unknown };
    const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() };

    if (isPublished !== undefined) {
      updateData['isPublished'] = isPublished;
      if (isPublished && !doc.data()?.['publishedAt']) {
        updateData['publishedAt'] = Timestamp.fromDate(new Date());
      }
    }

    await db.collection(COLLECTIONS.CONTENT_ARTICLES).doc(id).update(updateData);
    const updated = await db.collection(COLLECTIONS.CONTENT_ARTICLES).doc(id).get();
    res.json({ success: true, data: { id: updated.id, ...updated.data() }, message: 'Artikel berhasil diperbarui' });
  }),
);
