import Order from '../models/Order.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { validateOrder } from '../utils/validators.js';

// Get all orders
export const getAllOrders = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, status } = req.query;

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
