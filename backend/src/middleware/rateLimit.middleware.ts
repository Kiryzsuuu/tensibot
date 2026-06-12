import rateLimit from 'express-rate-limit';

/**
 * Auth endpoints: max 5 requests per minute.
 * Protects login/register from brute-force attacks.
 */
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Terlalu banyak percobaan. Silakan tunggu 1 menit sebelum mencoba lagi.',
    },
  },
});

/**
 * Chat AI endpoint: max 10 requests per minute per IP.
 * Prevents Claude API cost abuse.
 */
export const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Terlalu banyak pesan dikirim. Silakan tunggu sebentar sebelum melanjutkan chat.',
    },
  },
});

/**
 * General API: max 100 requests per minute per IP.
 */
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
    },
  },
});
