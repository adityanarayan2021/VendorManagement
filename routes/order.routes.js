import express from 'express';
import { placeOrder, getAllOrders, getMyOrders, getOrderById, getMySubOrders, updateSubOrderStatus } from '../controllers/order.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';
import rbac from '../middleware/rbac.middleware.js';

const router = express.Router();

// Place a new order (Customer only)
router.post('/', authMiddleware, rbac('customer'), placeOrder);

//Get all orders (Admin only)
router.get('/', authMiddleware, rbac('admin'), getAllOrders);

//Get orders for logged-in customer
router.get('/my', authMiddleware, rbac('customer'), getMyOrders);

router.get("/vendor/suborders", authMiddleware, rbac('vendor'), getMySubOrders);

//Get a specific order with suborders (Admin or Customer)
router.get('/:id', authMiddleware, rbac('admin', 'customer'), getOrderById);

//Update suborder status (Vendor or Admin)
router.patch('/suborders/:id/status', authMiddleware, rbac('vendor', 'admin'), updateSubOrderStatus);

export default router
