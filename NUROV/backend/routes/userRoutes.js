const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// PUT /api/users/profile — update name/phone/avatar
router.put('/profile', async (req, res) => {
  const { name, phone, avatar_url } = req.body;
  await pool.query('UPDATE users SET name = ?, phone = ?, avatar_url = ? WHERE id = ?', [
    name, phone || null, avatar_url || null, req.user.id
  ]);
  res.json({ message: 'Маълумоти профил навсозӣ шуд.' });
});

// PUT /api/users/password — change password
router.put('/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Корбар ёфт нашуд.' });

  const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!match) return res.status(401).json({ message: 'Пароли ҷорӣ нодуруст аст.' });

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Пароли нав бояд ҳадди ақал 6 аломат бошад.' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);
  res.json({ message: 'Парол бо муваффақият иваз шуд.' });
});

module.exports = router;
