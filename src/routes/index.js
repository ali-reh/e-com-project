import express from 'express';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';

const router = express.Router();

router.use('/api/products', productRoutes);
router.use('/api/orders', orderRoutes);

export default router;
