import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, getCartCount } from '../controllers/cartController.js';
const router = express.Router();
router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/add', addToCart);
router.put('/item/:product_id', updateCartItem);
router.delete('/item/:product_id', removeFromCart);
router.delete('/clear', clearCart);
export default router;
//# sourceMappingURL=cartRoutes.js.map