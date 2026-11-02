const mongoose = require('mongoose');

// EMBEDDING: review disimpan di dalam produk
const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  // REFERENCING: menunjuk ke koleksi Category
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  reviews: [reviewSchema]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);