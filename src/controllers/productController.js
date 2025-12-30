import Product from '../models/Product.js';
import ProductImage from '../models/ProductImage.js';
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

// Create product (admin)
export const createProduct = async (req, res, next) => {
  try {
    const { categories, images, ...productData } = req.body;

    // Create the product
    const product = await Product.create(productData);

    // Add categories if provided
    if (categories && categories.length > 0) {
      await Product.setCategories(product.id, categories);
    }

    // Add images if provided
    if (images && images.length > 0) {
      for (const image of images) {
        await ProductImage.create({
          product_id: product.id,
          ...image
        });
      }
    }

    // Fetch the complete product with categories and images
    const completeProduct = await Product.getById(product.id);

    successResponse(res, completeProduct, 'Product created successfully', 201);
  } catch (error) {
    errorResponse(res, error);
  }
};

// Update product (admin)
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categories, images, ...productData } = req.body;

    // Update product data
    const product = await Product.update(id, productData);

    // Update categories if provided
    if (categories !== undefined) {
      await Product.setCategories(id, categories);
    }

    // Fetch the updated product with all relations
    const updatedProduct = await Product.getById(id);

    successResponse(res, updatedProduct, 'Product updated successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Delete product (admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Product.delete(id);
    successResponse(res, null, 'Product deleted successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Add category to product (admin)
export const addCategoryToProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoryId } = req.body;

    await Product.addCategory(id, categoryId);
    const product = await Product.getById(id);

    successResponse(res, product, 'Category added to product successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Remove category from product (admin)
export const removeCategoryFromProduct = async (req, res, next) => {
  try {
    const { id, categoryId } = req.params;

    await Product.removeCategory(id, categoryId);
    const product = await Product.getById(id);

    successResponse(res, product, 'Category removed from product successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Add image to product (admin)
export const addImageToProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const imageData = {
      product_id: id,
      ...req.body
    };

    const image = await ProductImage.create(imageData);
    successResponse(res, image, 'Image added to product successfully', 201);
  } catch (error) {
    errorResponse(res, error);
  }
};

// Update product image (admin)
export const updateProductImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;
    const image = await ProductImage.update(imageId, req.body);
    successResponse(res, image, 'Image updated successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Delete product image (admin)
export const deleteProductImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;
    await ProductImage.delete(imageId);
    successResponse(res, null, 'Image deleted successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};

// Set primary image (admin)
export const setPrimaryImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;
    const image = await ProductImage.setPrimary(imageId, id);
    successResponse(res, image, 'Primary image set successfully');
  } catch (error) {
    errorResponse(res, error);
  }
};