import type { Request, Response } from 'express';
import { db } from '../lib/firebase';
import { asyncHandler } from '../app';

const SETTINGS_DOC = 'siteSettings';
const SETTINGS_COLLECTION = 'appConfig';

const DEFAULT_SETTINGS = {
  hero: {
    badge: 'Platform Kesehatan Digital #1 di Indonesia',
    title: 'Kendalikan Hipertensi,',
    titleHighlight: 'Raih Hidup Lebih Sehat',
    subtitle: 'Tensi-Bot membantu Anda memantau tekanan darah, mematuhi jadwal obat, dan berkonsultasi dengan AI medis — semuanya dalam satu platform yang mudah digunakan.',
    ctaPrimary: 'Mulai Sekarang',
    ctaSecondary: 'Sudah Punya Akun',
  },
  stats: [
    { value: '1 dari 3', label: 'Orang dewasa Indonesia berisiko hipertensi' },
    { value: '80%', label: 'Kasus dapat dicegah dengan gaya hidup sehat' },
    { value: '< 5 mnt', label: 'Waktu untuk catat dan analisis data Anda' },
  ],
  benefits: [
    'Gratis selamanya untuk fitur dasar',
    'Tidak perlu perangkat khusus',
    'Data tersimpan aman di cloud',
    'Tersedia 24/7, kapan saja',
  ],
  cta: {
    title: 'Mulai Pantau Kesehatan Anda Hari Ini',
    subtitle: 'Bergabung dengan ribuan pengguna yang sudah mengelola hipertensi mereka dengan lebih baik.',
    buttonText: 'Buat Akun Gratis',
  },
  seo: {
    siteName: 'Tensi-Bot',
    tagline: 'Kendalikan Hipertensi Anda',
    description: 'Platform digital untuk membantu penderita hipertensi memantau tekanan darah dan meningkatkan kepatuhan pengobatan.',
  },
};

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const doc = await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC).get();
  const data = doc.exists ? { ...DEFAULT_SETTINGS, ...doc.data() } : DEFAULT_SETTINGS;
  res.json({ success: true, data });
});

// ─── Bot Settings ─────────────────────────────────────────────────────────────

const BOT_DOC = 'botSettings';

const DEFAULT_BOT = {
  botName: 'Nara',
  botDescription: 'Asisten Kesehatan AI',
  avatarBase64: null as string | null,
};

export const getBotSettings = asyncHandler(async (_req: Request, res: Response) => {
  const doc = await db.collection(SETTINGS_COLLECTION).doc(BOT_DOC).get();
  const data = doc.exists ? { ...DEFAULT_BOT, ...doc.data() } : DEFAULT_BOT;
  res.json({ success: true, data });
});

export const updateBotSettings = asyncHandler(async (req: Request, res: Response) => {
  const { botName, botDescription, avatarBase64 } = req.body as {
    botName?: string;
    botDescription?: string;
    avatarBase64?: string | null;
  };
  const ref = db.collection(SETTINGS_COLLECTION).doc(BOT_DOC);
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (botName !== undefined) update['botName'] = botName;
  if (botDescription !== undefined) update['botDescription'] = botDescription;
  if (avatarBase64 !== undefined) update['avatarBase64'] = avatarBase64;

  const doc = await ref.get();
  if (doc.exists) {
    await ref.update(update);
  } else {
    await ref.set({ ...DEFAULT_BOT, ...update });
  }
  const updated = await ref.get();
  res.json({ success: true, data: updated.data(), message: 'Pengaturan bot berhasil disimpan' });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body as Partial<typeof DEFAULT_SETTINGS>;
  const ref = db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC);
  const doc = await ref.get();

  if (doc.exists) {
    await ref.update({ ...updates, updatedAt: new Date().toISOString() });
  } else {
    await ref.set({ ...DEFAULT_SETTINGS, ...updates, updatedAt: new Date().toISOString() });
  }

  const updated = await ref.get();
  res.json({ success: true, data: updated.data() });
});
