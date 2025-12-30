import express from 'express';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';
import categoryRoutes from './categoryRoutes.js';

const router = express.Router();

router.use('/api/products', productRoutes);
router.use('/api/orders', orderRoutes);
router.use('/api/categories', categoryRoutes);

export default router;