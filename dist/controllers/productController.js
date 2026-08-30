import Product from '../models/Product.js';
import ProductImage from '../models/ProductImage.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
export const getAllProducts = async (req, res, next) => {
    try {
        const { limit = 1000, offset = 0, category, minPrice, maxPrice, search } = req.query;
        const filters = {};
        if (category)
            filters.categoryId = category;
        if (minPrice)
            filters.minPrice = parseFloat(minPrice);
        if (maxPrice)
            filters.maxPrice = parseFloat(maxPrice);
        if (search)
            filters.search = search;
        const products = await Product.getAll(parseInt(limit), parseInt(offset), filters);
        successResponse(res, products, 'Products retrieved successfully');
    }
    catch (error) {
        errorResponse(res, error);
    }
};
export const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.getById(id);
        if (!product) {
            return errorResponse(res, { message: 'Product not found' }, 404);
        }
        successResponse(res, product, 'Product retrieved successfully');
    }
    catch (error) {
        errorResponse(res, error);
    }
};
export const getFeaturedProducts = async (req, res, next) => {
    try {
        const { limit = 1000 } = req.query;
        const products = await Product.getFeatured(parseInt(limit));
        successResponse(res, products, 'Featured products retrieved successfully');
    }
    catch (error) {
        errorResponse(res, error);
    }
};
export const getProductSizes = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sizes = await Product.getSizes(id);
        successResponse(res, sizes, 'Product sizes retrieved successfully');
    }
    catch (error) {
        errorResponse(res, error);
    }
};
export const createProduct = async (req, res, next) => {
    try {
        const { categories, images, ...productData } = req.body;
        const product = await Product.create(productData);
        if (categories && categories.length > 0) {
            await Product.setCategories(product.id, categories);
        }
        if (images && images.length > 0) {
            for (const image of images) {
                await ProductImage.create({
                    product_id: product.id,
                    ...image
                });
            }
        }
        const completeProduct = await Product.getById(product.id);
        successResponse(res, completeProduct, 'Product created successfully', 201);
    }
    catch (error) {
        errorResponse(res, error);
    }
};
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { categories, images, ...productData } = req.body;
        const product = await Product.update(id, productData);
        if (categories !== undefined) {
            await Product.setCategories(id, categories);
        }
        const updatedProduct = await Product.getById(id);
        successResponse(res, updatedProduct, 'Product updated successfully');
    }
    catch (error) {
        errorResponse(res, error);
    }
};
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Product.delete(id);
        successResponse(res, null, 'Product deleted successfully');
    }
    catch (error) {
        errorResponse(res, error);
    }
};
export const addCategoryToProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { categoryId } = req.body;
        await Product.addCategory(id, categoryId);
        const product = await Product.getById(id);
        successResponse(res, product, 'Category added to product successfully');
    }
    catch (error) {
        errorResponse(res, error);
    }
};
export const removeCategoryFromProduct = async (req, res, next) => {
    try {
        const { id, categoryId } = req.params;
        await Product.removeCategory(id, categoryId);
        const product = await Product.getById(id);
        successResponse(res, product, 'Category removed from product successfully');
    }
    catch (error) {
        errorResponse(res, error);
    }
};
export const addImageToProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const imageData = {
            product_id: id,
            ...req.body
        };
        const image = await ProductImage.create(imageData);
        successResponse(res, image, 'Image added to product successfully', 201);
    }
    catch (error) {
        errorResponse(res, error);
    }
};
export const updateProductImage = async (req, res, next) => {
    try {
        const { imageId } = req.params;
        const image = await ProductImage.update(imageId, req.body);
        successResponse(res, image, 'Image updated successfully');
    }
    catch (error) {
        errorResponse(res, error);
    }
};
export const deleteProductImage = async (req, res, next) => {
    try {
        const { imageId } = req.params;
        await ProductImage.delete(imageId);
        successResponse(res, null, 'Image deleted successfully');
    }
    catch (error) {
        errorResponse(res, error);
    }
};
export const setPrimaryImage = async (req, res, next) => {
    try {
        const { id, imageId } = req.params;
        const image = await ProductImage.setPrimary(imageId, id);
        successResponse(res, image, 'Primary image set successfully');
    }
    catch (error) {
        errorResponse(res, error);
    }
};
//# sourceMappingURL=productController.js.map