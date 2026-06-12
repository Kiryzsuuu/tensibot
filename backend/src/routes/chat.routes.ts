import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { chatRateLimit } from '../middleware/rateLimit.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  listSessions,
  createSession,
  getMessages,
  sendMessage,
  deleteSession,
} from '../controllers/chat.controller';

export const chatRouter = Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createSessionSchema = z.object({
  title: z.string().max(100, 'Judul maksimal 100 karakter').optional(),
});

const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Pesan tidak boleh kosong')
    .max(2000, 'Pesan terlalu panjang (maksimal 2000 karakter)'),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

chatRouter.use(authMiddleware);

chatRouter.get('/sessions', listSessions);
chatRouter.post('/sessions', validateBody(createSessionSchema), createSession);
chatRouter.get('/sessions/:id/messages', getMessages);
chatRouter.post(
  '/sessions/:id/messages',
  chatRateLimit,
  validateBody(sendMessageSchema),
  sendMessage,
);
chatRouter.delete('/sessions/:id', deleteSession);
