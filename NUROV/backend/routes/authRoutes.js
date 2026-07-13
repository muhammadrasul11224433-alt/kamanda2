const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Ҳамаи майдонҳои ҳатмиро пур кунед.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Парол ва тасдиқи парол мувофиқат намекунанд.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Парол бояд ҳадди ақал 6 аломат бошад.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Ин почтаи электронӣ аллакай сабт шудааст.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, passwordHash, 'customer']
    );

    const user = { id: result.insertId, name, email, role: 'customer' };
    const token = signToken(user);
    res.status(201).json({ message: 'Сабти ном бомуваффақият анҷом ёфт.', token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Хатогии сервер ҳангоми сабти ном.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email ва паролро ворид кунед.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email ё парол нодуруст аст.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Email ё парол нодуруст аст.' });
    }

    const token = signToken(user);
    res.json({
      message: 'Воридшавӣ муваффақ буд.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Хатогии сервер ҳангоми воридшавӣ.' });
  }
});

// GET /api/auth/me — returns current user from token
router.get('/me', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, avatar_url, role, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Корбар ёфт нашуд.' });
  res.json({ user: rows[0] });
});

module.exports = router;
