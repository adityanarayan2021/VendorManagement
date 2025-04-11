import express from 'express';
import { getAllProducts, createProduct, getVendorProducts, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';
import rbac from '../middleware/rbac.middleware.js';

const router = express.Router();

router.get('/', getAllProducts);
// Vendor protected routes
router.post('/', authMiddleware, rbac('vendor'), createProduct);
router.get('/', authMiddleware, rbac('vendor'), getVendorProducts);
router.put('/:id', authMiddleware, rbac('vendor'), updateProduct);
router.delete('/:id', authMiddleware, rbac('vendor'), deleteProduct);

export default router;
