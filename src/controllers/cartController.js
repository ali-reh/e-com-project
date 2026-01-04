import GuestCart from '../models/GuestCart.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { v4 as uuidv4 } from 'uuid';

// Cookie settings
const GUEST_ID_COOKIE = 'guest_id';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Get or create guest ID from cookies
 */
const getOrCreateGuestId = (req, res) => {
  let guestId = req.cookies[GUEST_ID_COOKIE];

  if (!guestId) {
    guestId = uuidv4();
    res.cookie(GUEST_ID_COOKIE, guestId, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }

  return guestId;
};

/**
 * Get cart contents
 */
export const getCart = async (req, res) => {
  try {
    const guestId = getOrCreateGuestId(req, res);
    // Pass true to automatically remove inactive products from cart
    const cart = await GuestCart.getCartWithProducts(guestId, true);
    
    // Include removed items info in response
    if (cart.removedItems && cart.removedItems.length > 0) {
      return successResponse(res, cart, 'Cart retrieved. Some items were removed because they are no longer available.');
    }
    
    successResponse(res, cart, 'Cart retrieved successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (req, res) => {
  try {
    const guestId = getOrCreateGuestId(req, res);
    const { product_id, quantity = 1, size_id = null, size_name = null } = req.body;

    if (!product_id) {
      return errorResponse(res, { message: 'Product ID is required' }, 400);
    }

    await GuestCart.addItem(guestId, product_id, parseInt(quantity), size_id, size_name);
    const cart = await GuestCart.getCartWithProducts(guestId);
    
    successResponse(res, cart, 'Item added to cart');
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Update item quantity
 */
export const updateCartItem = async (req, res) => {
  try {
    const guestId = getOrCreateGuestId(req, res);
    const { product_id } = req.params;
    const { quantity, size_id = null } = req.body;

    if (quantity === undefined) {
      return errorResponse(res, { message: 'Quantity is required' }, 400);
    }

    await GuestCart.updateItemQuantity(guestId, product_id, parseInt(quantity), size_id);
    const cart = await GuestCart.getCartWithProducts(guestId);
    
    successResponse(res, cart, 'Cart updated');
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (req, res) => {
  try {
    const guestId = getOrCreateGuestId(req, res);
    const { product_id } = req.params;
    const { size_id = null } = req.query;

    await GuestCart.removeItem(guestId, product_id, size_id || null);
    const cart = await GuestCart.getCartWithProducts(guestId);
    
    successResponse(res, cart, 'Item removed from cart');
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Clear cart
 */
export const clearCart = async (req, res) => {
  try {
    const guestId = getOrCreateGuestId(req, res);
    await GuestCart.clear(guestId);
    
    successResponse(res, { items: [], total: 0, itemCount: 0 }, 'Cart cleared');
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Get cart count (for header badge)
 */
export const getCartCount = async (req, res) => {
  try {
    const guestId = getOrCreateGuestId(req, res);
    const cart = await GuestCart.getCartWithProducts(guestId);
    
    successResponse(res, { count: cart.itemCount }, 'Cart count retrieved');
  } catch (error) {
    errorResponse(res, error);
  }
};
