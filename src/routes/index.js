import express from 'express';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import cartRoutes from './cartRoutes.js';
import contactRoutes from './contactRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use('/api/products', productRoutes);
router.use('/api/orders', orderRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/cart', cartRoutes);
router.use('/api/contact', contactRoutes);

// Admin routes (hidden path for security)
router.use('/api/x7k9m2-admin', adminRoutes);

export default router;