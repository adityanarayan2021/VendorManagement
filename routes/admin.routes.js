import express from 'express';
import { getRevenuePerVendor, getTopProducts, getAverageOrderValue } from '../controllers/admin.controller.js';
import auth  from '../middleware/authMiddleware.js';
import rbac from '../middleware/rbac.middleware.js';

const router = express.Router();

router.get('/revenue', auth, rbac('admin'), getRevenuePerVendor);
router.get('/top-products', auth, rbac('admin'), getTopProducts);
router.get('/average-order-value', auth, rbac('admin'), getAverageOrderValue);

export default router;
