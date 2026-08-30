import express from 'express';
import { getAllOrders, getOrder, getOrderByNumber, createOrder, updateOrderStatus, deleteOrder, checkout } from '../controllers/orderController.js';
const router = express.Router();
router.get('/', getAllOrders);
router.get('/:id', getOrder);
router.get('/number/:orderNumber', getOrderByNumber);
router.post('/', createOrder);
router.post('/checkout', checkout);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);
export default router;
//# sourceMappingURL=orderRoutes.js.map