const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);

// GET /api/admin/dashboard — key stats for the dashboard cards + sales chart
router.get('/dashboard', async (req, res) => {
  const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users WHERE role = "customer"');
  const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
  const [[{ totalRevenue }]] = await pool.query(
    'SELECT COALESCE(SUM(total),0) AS totalRevenue FROM orders WHERE status != "Cancelled"'
  );
  const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products');

  const [salesByDay] = await pool.query(`
    SELECT DATE(created_at) AS day, SUM(total) AS revenue, COUNT(*) AS orders
    FROM orders WHERE status != 'Cancelled' AND created_at >= (CURDATE() - INTERVAL 13 DAY)
    GROUP BY DATE(created_at) ORDER BY day ASC
  `);

  const [statusBreakdown] = await pool.query(
    'SELECT status, COUNT(*) AS count FROM orders GROUP BY status'
  );

  const [topProducts] = await pool.query(`
    SELECT p.title, SUM(oi.quantity) AS unitsSold
    FROM order_items oi JOIN products p ON oi.product_id = p.id
    GROUP BY p.id ORDER BY unitsSold DESC LIMIT 5
  `);

  res.json({ totalUsers, totalOrders, totalRevenue, totalProducts, salesByDay, statusBreakdown, topProducts });
});

// ---------- Users management ----------

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
  );
  res.json({ users: rows });
});

// PUT /api/admin/users/:id/role  { role }
router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['customer', 'admin'].includes(role)) return res.status(400).json({ message: 'Нақши нодуруст.' });
  await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
  res.json({ message: 'Нақши корбар навсозӣ шуд.' });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ message: 'Корбар нест карда шуд.' });
});

// ---------- Categories management ----------

// GET /api/admin/categories
router.get('/categories', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
  res.json({ categories: rows });
});

// POST /api/admin/categories { name, slug, icon }
router.post('/categories', async (req, res) => {
  const { name, slug, icon } = req.body;
  if (!name || !slug) return res.status(400).json({ message: 'Ном ва slug ҳатмист.' });
  const [result] = await pool.query('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)', [
    name, slug, icon || null
  ]);
  res.status(201).json({ message: 'Категория илова шуд.', id: result.insertId });
});

// DELETE /api/admin/categories/:id
router.delete('/categories/:id', async (req, res) => {
  await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
  res.json({ message: 'Категория нест карда шуд.' });
});

module.exports = router;
