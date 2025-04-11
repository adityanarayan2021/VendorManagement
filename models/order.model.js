import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalAmount: Number,
},
{ timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
