const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// GET /api/products
router.get('/', async (_, res) => {
  res.json(await Product.find());
});

module.exports = router;