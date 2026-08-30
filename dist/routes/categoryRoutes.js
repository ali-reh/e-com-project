import express from 'express';
import { getAllCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
const router = express.Router();
router.get('/', getAllCategories);
router.get('/:id', getCategory);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
export default router;
//# sourceMappingURL=categoryRoutes.js.map