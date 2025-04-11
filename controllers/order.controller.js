import mongoose from 'mongoose';
import { orderSchema } from '../validators/order.validator.js';
import { Product } from '../models/product.model.js';
import { Order } from '../models/order.model.js';
import { SubOrder } from '../models/suborder.model.js';


// 1. Get All Orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find()
        .populate("customerId")
        .skip(skip)
        .limit(limit),
      Order.countDocuments()
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: orders
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};


// 2. Get My Orders (Customer)
export const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ customerId })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ customerId })
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: orders
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};


// 3. Get SubOrders (Vendor)
export const getMySubOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [suborders, total] = await Promise.all([
      SubOrder.find({ vendorId })
        .populate("orderId")
        .populate("items.productId")
        .skip(skip)
        .limit(limit),
      SubOrder.countDocuments({ vendorId })
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: suborders
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch suborders" });
  }
};


// 4. Get Single Order by ID (Admin or Customer who owns it)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customerId');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Only allow owner or admin to view
    if (req.user.role !== 'admin' && order.customerId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const suborders = await SubOrder.find({ orderId: order._id })
      .populate('items.productId')
      .populate('vendorId');

    res.json({ order, suborders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// 5. Update SubOrder Status (Vendor or Admin)
export const updateSubOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const suborder = await SubOrder.findById(req.params.id);

    if (!suborder) return res.status(404).json({ error: 'SubOrder not found' });

    // Only allow vendor of suborder or admin
    if (
      req.user.role !== 'admin' &&
      suborder.vendorId.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    suborder.status = status;
    await suborder.save();
    res.json({ message: 'SubOrder status updated', suborder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// 5. Place Order (Customer)
export const placeOrder = async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customerId = req.user.id;
    const items = parsed.data.items;

    const productMap = new Map(); // productId => product
    const vendorMap = new Map();  // vendorId => [items]

    let totalAmount = 0;

    // Step 1: Validate & Group by Vendor
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error('Product not found');
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      productMap.set(product._id.toString(), product);

      const lineTotal = product.price * item.quantity;
      totalAmount += lineTotal;

      const vendorItems = vendorMap.get(product.vendorId.toString()) || [];
      vendorItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      });
      vendorMap.set(product.vendorId.toString(), vendorItems);
    }

    // Step 2: Create Master Order
    const masterOrder = await Order.create([{
      customerId,
      totalAmount
    }], { session });

    const orderId = masterOrder[0]?._id;

    // Step 3: Create SubOrders & Deduct Stock
    for (const [vendorId, vendorItems] of vendorMap.entries()) {
      const subTotal = vendorItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
      await SubOrder.create([{
        orderId,
        vendorId,
        items: vendorItems,
        total: subTotal
      }], { session });

      // Deduct stock
      for (const item of vendorItems) {
        const product = productMap.get(item.productId.toString());
        product.stock -= item.quantity;
        await product.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Order placed successfully', orderId });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
};

export const getVendorSubOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const [suborders, total] = await Promise.all([
      SubOrder.find({ vendorId })
        .populate("items.productId")
        .skip(skip)
        .limit(limit),
      SubOrder.countDocuments({ vendorId })
    ]);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: suborders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
