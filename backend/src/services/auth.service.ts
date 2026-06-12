import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, COLLECTIONS } from '../lib/firebase';
import { AppError } from '../app';
import type { User, UserProfile, Role } from '../types';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const snapshot = await db.collection(COLLECTIONS.USERS)
    .where('email', '==', email.toLowerCase().trim())
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
}

export async function findUserById(id: string): Promise<User | null> {
  const doc = await db.collection(COLLECTIONS.USERS).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as User;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  fullName: string;
  role?: Role;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const userId = uuidv4();
  const now = new Date();

  const userData: Omit<User, 'id'> = {
    email: input.email.toLowerCase().trim(),
    passwordHash: input.passwordHash,
    role: input.role ?? 'PASIEN',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const profileData: Omit<UserProfile, 'id'> = {
    userId,
    fullName: input.fullName,
    createdAt: now,
    updatedAt: now,
  };

  const batch = db.batch();
  batch.set(db.collection(COLLECTIONS.USERS).doc(userId), userData);
  batch.set(db.collection(COLLECTIONS.USER_PROFILES).doc(userId), profileData);
  await batch.commit();

  return { id: userId, ...userData };
}

export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await db.collection('refreshTokens').add({
    userId,
    token,
    expiresAt,
    createdAt: new Date(),
  });
}

export async function validateRefreshToken(token: string): Promise<string | null> {
  const snapshot = await db.collection('refreshTokens')
    .where('token', '==', token)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data();
  const expiresAt = data['expiresAt']?.toDate?.() ?? new Date(data['expiresAt']);

  if (expiresAt < new Date()) {
    await doc.ref.delete();
    return null;
  }

  return data['userId'] as string;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const snapshot = await db.collection('refreshTokens')
    .where('token', '==', token)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const doc = await db.collection(COLLECTIONS.USER_PROFILES).doc(userId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as UserProfile;
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const ref = db.collection(COLLECTIONS.USER_PROFILES).doc(userId);
  await ref.set({ ...data, updatedAt: new Date() }, { merge: true });
  const updated = await ref.get();
  if (!updated.exists) throw new AppError('Profil tidak ditemukan', 404, 'NOT_FOUND');
  return { id: updated.id, ...updated.data() } as UserProfile;
}
