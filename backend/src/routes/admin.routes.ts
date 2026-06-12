import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import {
  getDashboardStats,
  listUsers,
  getUserHealthData,
  toggleUserStatus,
  getAdminLogs,
} from '../controllers/admin.controller';

export const adminRouter = Router();

// All admin routes require authentication and admin role
adminRouter.use(authMiddleware);
adminRouter.use(roleMiddleware(['ADMIN', 'SUPER_ADMIN']));

adminRouter.get('/dashboard', getDashboardStats);
adminRouter.get('/users', listUsers);
adminRouter.get(
  '/users/:userId/health-data',
  roleMiddleware(['ADMIN', 'SUPER_ADMIN']),
  getUserHealthData,
);
adminRouter.patch(
  '/users/:userId/toggle-status',
  roleMiddleware(['SUPER_ADMIN']),
  toggleUserStatus,
);
adminRouter.get('/logs', roleMiddleware(['SUPER_ADMIN']), getAdminLogs);
