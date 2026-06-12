/**
 * Creates the admin account in Firestore.
 * Run: npx ts-node scripts/seed-admin.ts
 */
import 'dotenv/config';
import * as admin from 'firebase-admin';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

if (!admin.apps.length) {
  const projectId = process.env['FIREBASE_PROJECT_ID'];
  const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
  const privateKey = process.env['FIREBASE_PRIVATE_KEY'];

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing Firebase environment variables. Check your .env file.');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

const ADMIN_EMAIL = 'maskiryz23@gmail.com';
const ADMIN_PASSWORD = 'opet123';
const ADMIN_FULL_NAME = 'Super Admin';
const ADMIN_ROLE = 'SUPER_ADMIN' as const;

async function seedAdmin(): Promise<void> {
  console.log('🌱 Tensi-Bot Admin Seeder');
  console.log('─────────────────────────');

  // Check if already exists
  const existing = await db.collection('users')
    .where('email', '==', ADMIN_EMAIL)
    .limit(1)
    .get();

  if (!existing.empty) {
    const doc = existing.docs[0];
    console.log(`⚠️  Admin "${ADMIN_EMAIL}" sudah ada (ID: ${doc.id})`);
    console.log('   Memperbarui role ke SUPER_ADMIN...');
    await doc.ref.update({ role: ADMIN_ROLE, isActive: true, updatedAt: new Date() });
    console.log('✅ Role diperbarui!');
    await admin.app().delete();
    return;
  }

  const userId = uuidv4();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const now = new Date();

  const batch = db.batch();

  // Create user document
  batch.set(db.collection('users').doc(userId), {
    email: ADMIN_EMAIL,
    passwordHash,
    role: ADMIN_ROLE,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  // Create profile document
  batch.set(db.collection('userProfiles').doc(userId), {
    userId,
    fullName: ADMIN_FULL_NAME,
    createdAt: now,
    updatedAt: now,
  });

  await batch.commit();

  console.log('✅ Admin berhasil dibuat!');
  console.log('');
  console.log('   Email   :', ADMIN_EMAIL);
  console.log('   Password:', ADMIN_PASSWORD);
  console.log('   Role    :', ADMIN_ROLE);
  console.log('   User ID :', userId);
  console.log('');
  console.log('⚠️  Ganti password setelah login pertama!');

  await admin.app().delete();
}

seedAdmin().catch(err => {
  console.error('❌ Seeder gagal:', err);
  process.exit(1);
});
