const express = require('express');
const cors = require('cors');
const path = require('path');
const { connect } = require('./database');
const seed = require('./seed');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const docsRoutes = require('./routes/docs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (_, res) => res.json({ status: 'ok', game: 'INSERT COIN' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use(docsRoutes);

const PORT = process.env.PORT || 3000;

(async () => {
  console.log('Iniciando... (na 1ª vez, o download do MongoDB pode demorar)');
  await connect();
  await seed();
  app.listen(PORT, () => console.log(`🕹️ Insert Coin rodando em http://localhost:${PORT}`));
})().catch((err) => {
  console.error('❌ Erro ao iniciar:', err);
  process.exit(1);
});

module.exports = app;