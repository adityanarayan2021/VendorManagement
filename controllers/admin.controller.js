import { SubOrder } from '../models/suborder.model.js';

export const getRevenuePerVendor = async (req, res) => {
  const date30DaysAgo = new Date();
  date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

  const revenue = await SubOrder.aggregate([
    { $match: { createdAt: { $gte: date30DaysAgo } } },
    {
      $group: {
        _id: "$vendorId",
        totalRevenue: { $sum: "$total" }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "vendor"
      }
    },
    { $unwind: "$vendor" },
    {
      $project: {
        vendorId: "$_id",
        vendorName: "$vendor.name",
        totalRevenue: 1
      }
    }
  ]);

  res.json(revenue);
};

export const getTopProducts = async (req, res) => {
  const topProducts = await SubOrder.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        totalSold: { $sum: "$items.quantity" }
      }
    },
    {
      $sort: { totalSold: -1 }
    },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    {
      $project: {
        productId: "$_id",
        name: "$product.name",
        totalSold: 1
      }
    }
  ]);

  res.json(topProducts);
};

export const getAverageOrderValue = async (req, res) => {
    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          avgOrderValue: { $avg: "$totalAmount" }
        }
      }
    ]);
  
    res.json({ averageOrderValue: result[0]?.avgOrderValue || 0 });
  };

