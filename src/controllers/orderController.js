import Order from '../models/Order.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { validateOrder } from '../utils/validators.js';
import EmailService from '../utils/emailService.js';

// Get all orders
export const getAllOrders = async (req, res, next) => {
  try {
    const { limit = 1000, offset = 0, status } = req.query;

    const filters = {};
    if (status) filters.status = status;

    const orders = await Order.getAll(
      parseInt(limit),
      parseInt(offset),
      filters
    );

    successResponse(res, orders, 'Orders retrieved successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Get order by ID
export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.getById(id);

    if (!order) {
      return errorResponse(res, { message: 'Order not found' }, 404);
    }

    successResponse(res, order, 'Order retrieved successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Get order by order number
export const getOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.getByOrderNumber(orderNumber);

    if (!order) {
      return errorResponse(res, { message: 'Order not found' }, 404);
    }

    successResponse(res, order, 'Order retrieved successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Create order (no login required, cash on delivery)
export const createOrder = async (req, res, next) => {
  try {
    const errors = validateOrder(req.body);

    if (Object.keys(errors).length > 0) {
      return errorResponse(res, { message: 'Validation failed', errors }, 400);
    }

    const order = await Order.create(req.body);

    // Add order items if provided
    if (req.body.items && req.body.items.length > 0) {
      await Order.addItems(order.id, req.body.items);
    }

    successResponse(res, order, 'Order created successfully', 201);
  } catch (error) {
    errorResponse(res, error);
  }
};

// Update order status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.updateStatus(id, status);

    successResponse(res, order, 'Order status updated successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Delete order
export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Order.delete(id);
    successResponse(res, null, 'Order deleted successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Checkout - Create order from cart
export const checkout = async (req, res, next) => {
  try {
    const {
      customer_email,
      customer_name,
      customer_phone,
      shipping_address,
      billing_address,
      shipping_details,
      billing_details,
      subtotal,
      shipping_cost,
      tax,
      total,
      items,
      payment_method
    } = req.body;

    // Validate required fields
    if (!customer_email || !customer_name || !customer_phone || !shipping_address) {
      return errorResponse(res, { message: 'Missing required customer information' }, 400);
    }

    if (!items || items.length === 0) {
      return errorResponse(res, { message: 'No items in order' }, 400);
    }

    // Create order
    const orderData = {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      billing_address: billing_address || shipping_address,
      subtotal: parseFloat(subtotal),
      shipping_cost: parseFloat(shipping_cost),
      tax: parseFloat(tax) || 0,
      total: parseFloat(total),
      payment_method: payment_method || 'cod',
      status: 'pending'
    };

    const order = await Order.create(orderData);

    // Add order items
    const orderItems = items.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      size_name: item.size_name || null,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price),
      subtotal: parseFloat(item.subtotal),
      image_url: item.image_url || null
    }));

    await Order.addItems(order.id, orderItems);

    // Prepare order data for emails
    const orderWithItems = {
      ...order,
      items: orderItems,
      billing_details: billing_details || null,
      shipping_details: shipping_details || null
    };

    // Send emails (await both for Vercel serverless)
    try {
      await EmailService.sendOrderConfirmation(orderWithItems);
    } catch (err) {
      console.error('Failed to send order confirmation email:', err);
    }

    try {
      await EmailService.sendOrderNotification(orderWithItems);
    } catch (err) {
      console.error('Failed to send order notification email:', err);
    }

    successResponse(res, order, 'Order placed successfully', 201);
  } catch (error) {
    console.error('Checkout error:', error);
    errorResponse(res, { message: 'Failed to place order. Please try again.' }, 500);
  }
};
