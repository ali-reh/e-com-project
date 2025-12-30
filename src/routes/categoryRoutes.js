import express from 'express';
import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategory);

// Admin routes (add auth middleware when you have user system)
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;