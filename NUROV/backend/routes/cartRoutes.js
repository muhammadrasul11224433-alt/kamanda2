const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/cart
router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT ci.id AS cart_item_id, ci.quantity, p.id AS product_id, p.title, p.price, p.images, p.stock
     FROM cart_items ci JOIN products p ON ci.product_id = p.id
     WHERE ci.user_id = ? ORDER BY ci.created_at DESC`,
    [req.user.id]
  );
  const total = rows.reduce((sum, r) => sum + Number(r.price) * r.quantity, 0);
  res.json({ items: rows, total });
});

// POST /api/cart  { product_id, quantity }
router.post('/', async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [req.user.id, product_id, quantity]
  );
  res.status(201).json({ message: 'Ба сабад илова шуд.' });
});

// PUT /api/cart/:cartItemId  { quantity }
router.put('/:cartItemId', async (req, res) => {
  const { quantity } = req.body;
  if (quantity < 1) return res.status(400).json({ message: 'Миқдор бояд аз 1 зиёд бошад.' });
  await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [
    quantity, req.params.cartItemId, req.user.id
  ]);
  res.json({ message: 'Миқдор навсозӣ шуд.' });
});

// DELETE /api/cart/:cartItemId
router.delete('/:cartItemId', async (req, res) => {
  await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.cartItemId, req.user.id]);
  res.json({ message: 'Аз сабад нест карда шуд.' });
});

module.exports = router;
