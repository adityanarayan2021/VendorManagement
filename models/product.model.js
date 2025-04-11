import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: String,
},
{ timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
