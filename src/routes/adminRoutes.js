import { Router } from 'express';
import * as authController from '../controllers/adminAuthController.js';
import * as dashboardController from '../controllers/adminDashboardController.js';
import { verifyToken, requireSuperAdmin, requireAdmin } from '../middlewares/adminAuth.js';

const router = Router();

// ==========================================
// Authentication Routes (Public)
// ==========================================

// Admin login
router.post('/auth/login', authController.login);

// Refresh token
router.post('/auth/refresh', authController.refreshToken);

// ==========================================
// Protected Routes (Require Authentication)
// ==========================================

// Logout
router.post('/auth/logout', verifyToken, authController.logout);

// Get current admin profile
router.get('/auth/profile', verifyToken, authController.getProfile);

// Verify token
router.get('/auth/verify', verifyToken, authController.verifyToken);

// ==========================================
// Dashboard & Analytics
// ==========================================

// Get dashboard stats
router.get('/dashboard/stats', verifyToken, dashboardController.getDashboardStats);

// Get analytics data
router.get('/analytics', verifyToken, dashboardController.getAnalytics);

// ==========================================
// Orders Management
// ==========================================

// Get all orders
router.get('/orders', verifyToken, dashboardController.getOrders);

// Get single order
router.get('/orders/:id', verifyToken, dashboardController.getOrder);

// Update order status
router.put('/orders/:id/status', verifyToken, dashboardController.updateOrderStatus);

// Delete order
router.delete('/orders/:id', verifyToken, requireAdmin, dashboardController.deleteOrder);

// ==========================================
// Products Management
// ==========================================

// Get all products (including inactive)
router.get('/products', verifyToken, dashboardController.getProducts);

// Create product
router.post('/products', verifyToken, requireAdmin, dashboardController.createProduct);

// Update product
router.put('/products/:id', verifyToken, requireAdmin, dashboardController.updateProduct);

// Update product stock
router.put('/products/:id/stock', verifyToken, dashboardController.updateProductStock);

// Delete product
router.delete('/products/:id', verifyToken, requireAdmin, dashboardController.deleteProduct);

// ==========================================
// Categories Management
// ==========================================

// Get all categories
router.get('/categories', verifyToken, dashboardController.getCategories);

// Create category
router.post('/categories', verifyToken, requireAdmin, dashboardController.createCategory);

// Update category
router.put('/categories/:id', verifyToken, requireAdmin, dashboardController.updateCategory);

// Delete category
router.delete('/categories/:id', verifyToken, requireSuperAdmin, dashboardController.deleteCategory);

// ==========================================
// Sizes Management
// ==========================================

// Get all sizes
router.get('/sizes', verifyToken, dashboardController.getSizes);

// ==========================================
// Admin Management (Super Admin Only)
// ==========================================

// Get all admins
router.get('/admins', verifyToken, requireSuperAdmin, authController.getAllAdmins);

// Create admin
router.post('/admins', verifyToken, requireSuperAdmin, authController.createAdmin);

// Update admin
router.put('/admins/:id', verifyToken, requireSuperAdmin, authController.updateAdmin);

// Delete admin
router.delete('/admins/:id', verifyToken, requireSuperAdmin, authController.deleteAdmin);

export default router;
