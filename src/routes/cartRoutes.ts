// @ts-nocheck
import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
} from '../controllers/cartController.js';

const router = express.Router();

// Get cart contents
router.get('/', getCart);

// Get cart item count
router.get('/count', getCartCount);

// Add item to cart
router.post('/add', addToCart);

// Update item quantity
router.put('/item/:product_id', updateCartItem);

// Remove item from cart
router.delete('/item/:product_id', removeFromCart);

// Clear cart
router.delete('/clear', clearCart);

export default router;

