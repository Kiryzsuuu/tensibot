import 'dotenv/config';
import { app } from './app';
import { logger } from './utils/logger';

const PORT = parseInt(process.env['PORT'] ?? '4000', 10);

const server = app.listen(PORT, () => {
  logger.info(`Tensi-Bot backend running on port ${PORT} [${process.env['NODE_ENV'] ?? 'development'}]`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

const shutdown = (signal: string): void => {
  logger.info(`Received ${signal}. Shutting down gracefully…`);

  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Could not close connections in time. Forcing shutdown.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
