const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  model: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  }, { timestamps: true })

  module.exports = mongoose.model('Cart', cartSchema);

