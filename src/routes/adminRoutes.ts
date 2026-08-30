import { Router } from 'express';
import * as authController from '../controllers/adminAuthController.js';
import * as dashboardController from '../controllers/adminDashboardController.js';
import { verifyToken, requireSuperAdmin, requireAdmin } from '../middlewares/adminAuth.js';

const router = Router();

router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/logout', verifyToken, authController.logout);
router.get('/auth/profile', verifyToken, authController.getProfile);
router.get('/auth/verify', verifyToken, authController.verifyToken);

router.get('/dashboard/stats', verifyToken, dashboardController.getDashboardStats);
router.get('/analytics', verifyToken, dashboardController.getAnalytics);
router.get('/orders', verifyToken, dashboardController.getOrders);
router.get('/orders/:id', verifyToken, dashboardController.getOrder);
router.put('/orders/:id/status', verifyToken, dashboardController.updateOrderStatus);
router.delete('/orders/:id', verifyToken, requireAdmin, dashboardController.deleteOrder);

router.get('/products', verifyToken, dashboardController.getProducts);
router.post('/products', verifyToken, requireAdmin, dashboardController.createProduct);
router.put('/products/:id', verifyToken, requireAdmin, dashboardController.updateProduct);
router.put('/products/:id/stock', verifyToken, dashboardController.updateProductStock);
router.delete('/products/:id', verifyToken, requireAdmin, dashboardController.deleteProduct);

router.get('/categories', verifyToken, dashboardController.getCategories);
router.post('/categories', verifyToken, requireAdmin, dashboardController.createCategory);
router.put('/categories/:id', verifyToken, requireAdmin, dashboardController.updateCategory);
router.delete('/categories/:id', verifyToken, requireSuperAdmin, dashboardController.deleteCategory);

router.get('/sizes', verifyToken, dashboardController.getSizes);
router.get('/admins', verifyToken, requireSuperAdmin, authController.getAllAdmins);
router.post('/admins', verifyToken, requireSuperAdmin, authController.createAdmin);
router.put('/admins/:id', verifyToken, requireSuperAdmin, authController.updateAdmin);
router.delete('/admins/:id', verifyToken, requireSuperAdmin, authController.deleteAdmin);

export default router;
