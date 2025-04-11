import { Product } from '../models/product.model.js';
import { productSchema } from '../validators/product.validator.js';
import mongoose from 'mongoose';

export const createProduct = async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });

  const product = await Product.create({
    ...parsed.data,
    vendorId: req.user.id
  });

  res.status(201).json(product);
};

export const getVendorProducts = async (req, res) => {
  const products = await Product.find({ vendorId: req.user.id });
  res.json(products);
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid product ID' });

  const parsed = productSchema.partial().safeParse(req.body); // partial() for optional update fields
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });

  const product = await Product.findOneAndUpdate(
    { _id: id, vendorId: req.user.id },
    parsed.data,
    { new: true }
  );

  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
};

export const getAllProducts = async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10
  } = req.query;

  const query = {};

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  try {
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      products
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};


export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid product ID' });

  const product = await Product.findOneAndDelete({ _id: id, vendorId: req.user.id });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  res.json({ message: 'Product deleted' });
};
