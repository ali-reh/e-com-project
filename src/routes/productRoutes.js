import express from 'express';
import {
  getAllProducts,
  getProduct,
  getFeaturedProducts
} from '../controllers/productController.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

export default router;
