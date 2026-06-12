import jwt from 'jsonwebtoken';
import type { Role } from '../types';

interface AccessTokenPayload {
  userId: string;
  role: Role;
  email: string;
}

interface RefreshTokenPayload {
  userId: string;
}

export interface DecodedAccessToken extends AccessTokenPayload {
  iat: number;
  exp: number;
}

export interface DecodedRefreshToken extends RefreshTokenPayload {
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env['JWT_SECRET']!;
const JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET']!;
const JWT_EXPIRES_IN = (process.env['JWT_EXPIRES_IN'] ?? '1h') as jwt.SignOptions['expiresIn'];
const JWT_REFRESH_EXPIRES_IN = (process.env['JWT_REFRESH_EXPIRES_IN'] ?? '30d') as jwt.SignOptions['expiresIn'];

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables are required');
}

export function generateAccessToken(userId: string, role: Role, email: string): string {
  return jwt.sign({ userId, role, email } as AccessTokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId } as RefreshTokenPayload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): DecodedAccessToken {
  return jwt.verify(token, JWT_SECRET) as unknown as DecodedAccessToken;
}

export function verifyRefreshToken(token: string): DecodedRefreshToken {
  return jwt.verify(token, JWT_REFRESH_SECRET) as unknown as DecodedRefreshToken;
}
