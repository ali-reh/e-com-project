import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

// Get all products
export const getAllProducts = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, category, minPrice, maxPrice, search } = req.query;

    const filters = {};
    if (category) filters.categoryId = category;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (search) filters.search = search;

    const products = await Product.getAll(
      parseInt(limit),
      parseInt(offset),
      filters
    );

    successResponse(res, products, 'Products retrieved successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Get product by ID
export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.getById(id);

    if (!product) {
      return errorResponse(res, { message: 'Product not found' }, 404);
    }

    successResponse(res, product, 'Product retrieved successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const products = await Product.getFeatured(parseInt(limit));

    successResponse(res, products, 'Featured products retrieved successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};
