import type { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../app';
import * as ChatService from '../services/chat.service';

// ─── List Sessions ────────────────────────────────────────────────────────────

export const listSessions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

    const sessions = await ChatService.listSessions(req.user.userId);
    res.json({ success: true, data: sessions });
  },
);

// ─── Create Session ───────────────────────────────────────────────────────────

export const createSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

    const { title } = req.body as { title?: string };
    const session = await ChatService.createSession(req.user.userId, title);

    res.status(201).json({
      success: true,
      data: session,
      message: 'Sesi chat baru dibuat',
    });
  },
);

// ─── Get Messages ─────────────────────────────────────────────────────────────

export const getMessages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

    const sessionId = req.params['id'] as string;
    const messages = await ChatService.getSessionMessages(sessionId, req.user.userId);

    res.json({ success: true, data: messages });
  },
);

// ─── Send Message ─────────────────────────────────────────────────────────────

export const sendMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

    const sessionId = req.params['id'] as string;
    const { content } = req.body as { content: string };

    if (!content || content.trim().length === 0) {
      return next(new AppError('Pesan tidak boleh kosong', 400, 'VALIDATION_ERROR'));
    }

    if (content.length > 2000) {
      return next(
        new AppError('Pesan terlalu panjang (maksimal 2000 karakter)', 400, 'VALIDATION_ERROR'),
      );
    }

    const result = await ChatService.sendMessage(sessionId, req.user.userId, content.trim());

    res.json({
      success: true,
      data: {
        userMessage: result.userMessage,
        assistantMessage: result.assistantMessage,
      },
    });
  },
);

// ─── Delete Session ───────────────────────────────────────────────────────────

export const deleteSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

    const sessionId = req.params['id'] as string;
    await ChatService.deleteSession(sessionId, req.user.userId);

    res.json({ success: true, data: null, message: 'Sesi chat berhasil dihapus' });
  },
);
