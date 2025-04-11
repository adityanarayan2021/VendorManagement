import express from 'express';
import { getDailySales, getLowStock } from '../controllers/vendor.controller.js';
import auth from '../middleware/authMiddleware.js';
import rbac from '../middleware/rbac.middleware.js';

const router = express.Router();

router.get('/daily-sales', auth, rbac('vendor'), getDailySales);
router.get('/low-stock', auth, rbac('vendor'), getLowStock);

export default router;
