const { Schema, model } = require('mongoose');

module.exports = model('Order', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [{ product: String, price: Number, quantity: Number }],
  paymentMethod: { type: String, enum: ['dinheiro', 'cartao', 'pix'] },
  subtotal: Number,
  discount: Number,
  shipping: Number,
  total: Number,
}, { timestamps: true }));