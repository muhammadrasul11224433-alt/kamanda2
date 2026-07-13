const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — checkout from cart (auth required)
router.post('/', requireAuth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { shipping_address } = req.body;
    await conn.beginTransaction();

    const [cartRows] = await conn.query(
      `SELECT ci.quantity, p.id AS product_id, p.title, p.price, p.stock
       FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?`,
      [req.user.id]
    );

    if (cartRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Сабади шумо холист.' });
    }

    for (const item of cartRows) {
      if (item.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ message: `Мутаассифона, "${item.title}" дар анбор кофӣ нест.` });
      }
    }

    const total = cartRows.reduce((sum, r) => sum + Number(r.price) * r.quantity, 0);
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total, status, shipping_address) VALUES (?, ?, ?, ?)',
      [req.user.id, total, 'Pending', shipping_address || null]
    );
    const orderId = orderResult.insertId;

    for (const item of cartRows) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, title_snapshot, price_snapshot, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.title, item.price, item.quantity]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    await conn.commit();
    res.status(201).json({ message: 'Фармоиш бо муваффақият сабт шуд.', orderId, total });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Хатогӣ ҳангоми сабти фармоиш.' });
  } finally {
    conn.release();
  }
});

// GET /api/orders — current user's order history
router.get('/', requireAuth, async (req, res) => {
  const [orders] = await pool.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]
  );
  for (const order of orders) {
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;
  }
  res.json({ orders });
});

// ---------- Admin ----------

// GET /api/orders/admin/all — all orders, any status
router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.query;
  const params = [];
  let sql = `SELECT o.*, u.name AS customer_name, u.email AS customer_email
             FROM orders o JOIN users u ON o.user_id = u.id`;
  if (status) {
    sql += ' WHERE o.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY o.created_at DESC';
  const [orders] = await pool.query(sql, params);
  res.json({ orders });
});

// PUT /api/orders/admin/:id/status  { status }
router.put('/admin/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const valid = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Статуси нодуруст.' });
  await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ message: 'Статуси фармоиш навсозӣ шуд.' });
});

module.exports = router;
