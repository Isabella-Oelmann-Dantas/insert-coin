const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

async function seed() {
  await Product.insertMany([
    {
      name: 'Cartucho Aventura Pixelada',
      emoji: '👾',
      platform: '16-bit',
      description: 'Plataforma clássica, com pulos impossíveis e trilha em chiptune',
      price: 149.9,
      stock: 5,
    },
    {
      name: 'Console Mini Retrô',
      emoji: '🎮',
      platform: '8-bit',
      description: '200 jogos na memória e saudade de brinde',
      price: 279.9,
      stock: 2, // estoque baixo: ótimo para testar o limite
    },
    {
      name: 'Joystick Arcade Clássico',
      emoji: '🕹️',
      platform: 'Arcade',
      description: 'Microswitch estalando como nos fliperamas de shopping',
      price: 189.9,
      stock: 0, // ESGOTADO: serve para testar o bloqueio no carrinho
    },
  ]);

  const hash = await bcrypt.hash('123456', 8);
  await User.insertMany([
    { name: 'Ana Player 1',      email: 'ana@insertcoin.com',   password: hash, totalSpent: 0 },
    { name: 'Bruno Quase Gold',  email: 'bruno@insertcoin.com', password: hash, totalSpent: 280 },
    { name: 'Carla Player Gold', email: 'carla@insertcoin.com', password: hash, totalSpent: 500 },
  ]);

  console.log('🌱 Seed concluído: 3 produtos e 3 usuários');
}

module.exports = seed;