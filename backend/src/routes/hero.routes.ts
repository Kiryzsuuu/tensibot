import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import * as HeroController from '../controllers/hero.controller';

export const heroRouter = Router();

// Public — get active heroes for dashboard
heroRouter.get('/active', HeroController.getActiveHeroes);

// Auth required — for admin management
heroRouter.get('/', authMiddleware, roleMiddleware(['ADMIN', 'SUPER_ADMIN']), HeroController.listHeroes);
heroRouter.post('/', authMiddleware, roleMiddleware(['ADMIN', 'SUPER_ADMIN']), HeroController.createHero);
heroRouter.put('/:id', authMiddleware, roleMiddleware(['ADMIN', 'SUPER_ADMIN']), HeroController.updateHero);
heroRouter.delete('/:id', authMiddleware, roleMiddleware(['ADMIN', 'SUPER_ADMIN']), HeroController.deleteHero);
