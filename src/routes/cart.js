const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth); // todas as rotas do carrinho exigem login

// Monta a resposta do carrinho com nomes, preços e subtotal
async function buildCart(userId) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  const items = (cart?.items || [])
    .filter((i) => i.product) // ignora produtos que não existem mais
    .map((i) => ({
      productId: i.product._id,
      name: i.product.name,
      emoji: i.product.emoji,
      price: i.product.price,
      quantity: i.quantity,
      stock: i.product.stock,
      total: +(i.product.price * i.quantity).toFixed(2),
    }));
  const subtotal = +items.reduce((sum, i) => sum + i.total, 0).toFixed(2);
  return { items, subtotal };
}

// GET /api/cart
router.get('/', async (req, res) => {
  res.json(await buildCart(req.userId));
});

// POST /api/cart/items  { productId, quantity }
router.post('/items', async (req, res) => {
  const { productId } = req.body;
  const quantity = Number(req.body.quantity ?? 1);

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ error: 'productId inválido' });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'A quantidade deve ser um inteiro maior que zero' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

  // REGRA: só adiciona se houver estoque
  if (product.stock < 1) {
    return res.status(409).json({ error: `"${product.name}" está esgotado` });
  }

  let cart = await Cart.findOne({ user: req.userId });
  if (!cart) cart = new Cart({ user: req.userId, items: [] });

  const existing = cart.items.find((i) => i.product.equals(product._id));
  const newQuantity = (existing?.quantity || 0) + quantity;

  if (newQuantity > product.stock) {
    return res.status(409).json({
      error: `Estoque insuficiente para "${product.name}": restam ${product.stock} unidade(s)`,
    });
  }

  if (existing) existing.quantity = newQuantity;
  else cart.items.push({ product: product._id, quantity });

  await cart.save();
  res.status(201).json(await buildCart(req.userId));
});

// DELETE /api/cart/items/:productId
router.delete('/items/:productId', async (req, res) => {
  await Cart.updateOne(
    { user: req.userId },
    { $pull: { items: { product: req.params.productId } } }
  );
  res.json(await buildCart(req.userId));
});

// DELETE /api/cart (esvazia o carrinho)
router.delete('/', async (req, res) => {
  await Cart.updateOne({ user: req.userId }, { $set: { items: [] } });
  res.json({ items: [], subtotal: 0 });
});

module.exports = router;