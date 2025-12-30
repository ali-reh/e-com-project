import Category from '../models/Category.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

// Get all categories
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.getAll();
    successResponse(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Get category by ID
export const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.getById(id);

    if (!category) {
      return errorResponse(res, { message: 'Category not found' }, 404);
    }

    successResponse(res, category, 'Category retrieved successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Create category (admin)
export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    successResponse(res, category, 'Category created successfully', 201);
  } catch (error) {
    errorResponse(res, error);
  }
};

// Update category (admin)
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.update(id, req.body);
    successResponse(res, category, 'Category updated successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Delete category (admin)
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Category.delete(id);
    successResponse(res, null, 'Category deleted successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};