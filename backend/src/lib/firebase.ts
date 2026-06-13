import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

// ─── Singleton Init ───────────────────────────────────────────────────────────

if (!admin.apps.length) {
  const projectId = process.env['FIREBASE_PROJECT_ID'];
  const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
  const privateKey = process.env['FIREBASE_PRIVATE_KEY'];

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables are required',
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      // Cloud Run / Vercel env vars encode newlines as literal \n — restore them
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });

  logger.info('Firebase Admin SDK initialized');
}

/** Firestore database instance */
export const db: admin.firestore.Firestore = admin.firestore();

/** Firebase Auth instance */
export const auth: admin.auth.Auth = admin.auth();

// ─── Collection Name Constants ────────────────────────────────────────────────

export const COLLECTIONS = {
  USERS: 'users',
  USER_PROFILES: 'userProfiles',
  BP_RECORDS: 'bpRecords',
  MEDICATIONS: 'medications',
  MEDICATION_LOGS: 'medicationLogs',
  CHAT_SESSIONS: 'chatSessions',
  CHAT_MESSAGES: 'chatMessages',
  CONTENT_ARTICLES: 'contentArticles',
  HEALTH_GOALS: 'healthGoals',
  NOTIFICATIONS: 'notifications',
  ADMIN_LOGS: 'adminLogs',
  HEROES: 'heroes',
} as const;
