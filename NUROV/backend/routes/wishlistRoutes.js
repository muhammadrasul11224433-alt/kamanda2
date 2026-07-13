const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/wishlist
router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT w.id AS wishlist_item_id, p.id AS product_id, p.title, p.price, p.images, p.rating
     FROM wishlist_items w JOIN products p ON w.product_id = p.id
     WHERE w.user_id = ? ORDER BY w.created_at DESC`,
    [req.user.id]
  );
  res.json({ items: rows });
});

// POST /api/wishlist { product_id }
router.post('/', async (req, res) => {
  const { product_id } = req.body;
  await pool.query(
    'INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)',
    [req.user.id, product_id]
  );
  res.status(201).json({ message: 'Ба рӯйхати дилхоҳ илова шуд.' });
});

// DELETE /api/wishlist/:productId
router.delete('/:productId', async (req, res) => {
  await pool.query('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?', [
    req.user.id, req.params.productId
  ]);
  res.json({ message: 'Аз рӯйхати дилхоҳ нест карда шуд.' });
});

module.exports = router;
