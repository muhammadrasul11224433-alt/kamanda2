const jwt = require('jsonwebtoken');

// Verifies the JWT sent in the Authorization header and attaches the user payload to req.user
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Санади дастрасӣ ёфт нашуд. Аввал ворид шавед.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, role, name }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Санади дастрасӣ нодуруст ё муддаташ гузаштааст.' });
  }
}

// Must be used after requireAuth. Restricts route to admin users only.
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Дастрасӣ манъ аст. Танҳо админ.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
