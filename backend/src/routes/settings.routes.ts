import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { getSettings, updateSettings, getBotSettings, updateBotSettings } from '../controllers/settings.controller';

export const settingsRouter = Router();

// Public — landing page fetches this
settingsRouter.get('/', getSettings);

// Admin only — update
settingsRouter.patch(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN', 'SUPER_ADMIN']),
  updateSettings,
);

// Bot settings — public read, admin write
settingsRouter.get('/bot', getBotSettings);
settingsRouter.patch(
  '/bot',
  authMiddleware,
  roleMiddleware(['ADMIN', 'SUPER_ADMIN']),
  updateBotSettings,
);
