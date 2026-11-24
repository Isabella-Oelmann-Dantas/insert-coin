const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'insert-coin-segredo-de-desenvolvimento';

function signToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '2h' });
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  try {
    req.userId = jwt.verify(token, JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

module.exports = { auth, signToken };