import mongoose from 'mongoose';

const subOrderSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number
    }],
    total: Number,
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);
  
  export const SubOrder = mongoose.model('SubOrder', subOrderSchema);
  