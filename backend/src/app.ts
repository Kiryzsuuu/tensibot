import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { authRouter } from './routes/auth.routes';
import { bpRouter } from './routes/bp.routes';
import { chatRouter } from './routes/chat.routes';
import { medicationRouter } from './routes/medication.routes';
import { userRouter } from './routes/user.routes';
import { contentRouter } from './routes/content.routes';
import { adminRouter } from './routes/admin.routes';
import { heroRouter } from './routes/hero.routes';
import { logger } from './utils/logger';

export const app = express();

// ─── Security & Parsing Middleware ───────────────────────────────────────────

app.use(helmet());

app.use(
  cors({
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: process.env['NODE_ENV'] ?? 'development',
    },
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRouter);
app.use('/api/blood-pressure', bpRouter);
app.use('/api/chat', chatRouter);
app.use('/api/medications', medicationRouter);
app.use('/api/users', userRouter);
app.use('/api/content', contentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/hero', heroRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_SERVER_ERROR';
  const message = err.message ?? 'Internal server error';

  if (statusCode >= 500) {
    logger.error('Unhandled error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message },
    ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack }),
  });
});

// ─── AppError Class ───────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── asyncHandler ─────────────────────────────────────────────────────────────

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
