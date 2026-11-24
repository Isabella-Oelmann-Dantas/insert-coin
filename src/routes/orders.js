const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const SHIPPING_FEE = 19.9;
const CASH_DISCOUNT = 0.1;
const round = (n) => Math.round(n * 100) / 100;

// POST /api/orders/checkout  { paymentMethod: "dinheiro" | "cartao" | "pix" }
router.post('/checkout', async (req, res) => {
  const { paymentMethod } = req.body;

  if (!['dinheiro', 'cartao', 'pix'].includes(paymentMethod)) {
    return res.status(400).json({ error: 'Forma de pagamento inválida. Use: dinheiro, cartao ou pix' });
  }

  const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
  const cartItems = (cart?.items || []).filter((i) => i.product);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Carrinho vazio' });
  }

  // Revalida o estoque no momento da compra
  for (const item of cartItems) {
    if (item.quantity > item.product.stock) {
      return res.status(409).json({
        error: `Estoque insuficiente para "${item.product.name}": restam ${item.product.stock} unidade(s)`,
      });
    }
  }

  const user = await User.findById(req.userId);

  // Cálculos
  const subtotal = round(cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0));
  const discount = paymentMethod === 'dinheiro' ? round(subtotal * CASH_DISCOUNT) : 0; // REGRA 1
  const wasVip = user.isVip;
  const shipping = wasVip ? 0 : SHIPPING_FEE; // REGRA 3
  const total = round(subtotal - discount + shipping);

  // Baixa o estoque
  for (const item of cartItems) {
    await Product.updateOne({ _id: item.product._id }, { $inc: { stock: -item.quantity } });
  }

  // Cria o pedido
  const order = await Order.create({
    user: user._id,
    items: cartItems.map((i) => ({
      product: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    })),
    paymentMethod,
    subtotal,
    discount,
    shipping,
    total,
  });

  // Soma o gasto e verifica promoção a VIP
  user.totalSpent = round(user.totalSpent + total);
  await user.save();

  // Esvazia o carrinho
  await Cart.updateOne({ user: req.userId }, { $set: { items: [] } });

  res.status(201).json({
    order,
    customer: {
      totalSpent: user.totalSpent,
      isVip: user.isVip,
      becameVip: !wasVip && user.isVip,
    },
  });
});

// GET /api/orders (histórico do usuário)
router.get('/', async (req, res) => {
  res.json(await Order.find({ user: req.userId }).sort({ createdAt: -1 }));
});

module.exports = router;