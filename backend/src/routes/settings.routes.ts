import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { getSettings, updateSettings } from '../controllers/settings.controller';

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
