import { SubOrder } from '../models/suborder.model.js';
import { Product } from '../models/product.model.js';
import mongoose from 'mongoose';

export const getDailySales = async (req, res) => {
  const vendorId = req.user.id;
  const date7DaysAgo = new Date();
  date7DaysAgo.setDate(date7DaysAgo.getDate() - 7);

  const sales = await SubOrder.aggregate([
    {
      $match: {
        vendorId: new mongoose.Types.ObjectId(vendorId),
        createdAt: { $gte: date7DaysAgo }
      }
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        },
        total: { $sum: "$total" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
  ]);

  res.json(sales);
};

export const getLowStock = async (req, res) => {
    const vendorId = req.user.id;
  
    const products = await Product.find({
      vendorId,
      stock: { $lte: 5 }
    });
  
    res.json(products);
  };