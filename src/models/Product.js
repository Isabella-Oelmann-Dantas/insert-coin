const { Schema, model } = require('mongoose');

module.exports = model('Product', new Schema({
  name: { type: String, required: true },
  description: String,
  emoji: String,
  platform: String, // ex.: "16-bit", "Arcade"
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
}));