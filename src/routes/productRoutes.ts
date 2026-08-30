import express from 'express';
import {
  getAllProducts,
  getProduct,
  getFeaturedProducts,
  getProductSizes,
  createProduct,
  updateProduct,
  deleteProduct,
  addCategoryToProduct,
  removeCategoryFromProduct,
  addImageToProduct,
  updateProductImage,
  deleteProductImage,
  setPrimaryImage,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);
router.get('/:id/sizes', getProductSizes);

router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

router.post('/:id/categories', addCategoryToProduct);
router.delete('/:id/categories/:categoryId', removeCategoryFromProduct);

router.post('/:id/images', addImageToProduct);
router.put('/:id/images/:imageId', updateProductImage);
router.delete('/:id/images/:imageId', deleteProductImage);
router.put('/:id/images/:imageId/primary', setPrimaryImage);

export default router;
