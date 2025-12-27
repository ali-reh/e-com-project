import express from 'express';
import {
  getAllOrders,
  getOrder,
  getOrderByNumber,
  createOrder,
  updateOrderStatus,
  deleteOrder
} from '../controllers/orderController.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', getAllOrders);
router.get('/:id', getOrder);
router.get('/number/:orderNumber', getOrderByNumber);
router.post('/', createOrder);

// Order management routes
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;
