const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const where = [];
    const params = [];

    if (search) {
      where.push('(p.title LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where.push('c.slug = ?');
      params.push(category);
    }
    if (minPrice) {
      where.push('p.price >= ?');
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      where.push('p.price <= ?');
      params.push(Number(maxPrice));
    }

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'p.price ASC';
    if (sort === 'price_desc') orderBy = 'p.price DESC';
    if (sort === 'rating') orderBy = 'p.rating DESC';

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (Number(page) - 1) * Number(limit);

    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereSql}`,
      params
    );

    res.json({ products: rows, total: countRows[0].total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Хатогӣ ҳангоми боргирии маҳсулот.' });
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
  res.json({ categories: rows });
});

// GET /api/products/:id — details + similar products + reviews
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Маҳсулот ёфт нашуд.' });
    const product = rows[0];

    const [similar] = await pool.query(
      'SELECT id, title, price, images, rating FROM products WHERE category_id = ? AND id != ? LIMIT 4',
      [product.category_id, id]
    );

    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
       FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({ product, similar, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Хатогӣ ҳангоми боргирии маълумоти маҳсулот.' });
  }
});

// POST /api/products/:id/reviews — add a review (auth required)
router.post('/:id/reviews', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Рейтинг бояд аз 1 то 5 бошад.' });
  }
  await pool.query('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)', [
    id, req.user.id, rating, comment || null
  ]);
  const [[agg]] = await pool.query(
    'SELECT AVG(rating) AS avgRating, COUNT(*) AS cnt FROM reviews WHERE product_id = ?', [id]
  );
  await pool.query('UPDATE products SET rating = ?, rating_count = ? WHERE id = ?', [
    Number(agg.avgRating).toFixed(1), agg.cnt, id
  ]);
  res.status(201).json({ message: 'Шарҳи шумо илова шуд.' });
});

// ---------- Admin: create / update / delete products ----------

// POST /api/products (admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { category_id, title, description, price, compare_price, stock, images, is_featured } = req.body;
    if (!title || !price) return res.status(400).json({ message: 'Ном ва нархи маҳсулот ҳатмист.' });

    const [result] = await pool.query(
      `INSERT INTO products (category_id, title, description, price, compare_price, stock, images, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id || null, title, description || '', price, compare_price || null, stock || 0,
       JSON.stringify(images || []), !!is_featured]
    );
    res.status(201).json({ message: 'Маҳсулот илова шуд.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Хатогӣ ҳангоми иловаи маҳсулот.' });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, title, description, price, compare_price, stock, images, is_featured } = req.body;
    await pool.query(
      `UPDATE products SET category_id=?, title=?, description=?, price=?, compare_price=?, stock=?, images=?, is_featured=?
       WHERE id=?`,
      [category_id || null, title, description || '', price, compare_price || null, stock || 0,
       JSON.stringify(images || []), !!is_featured, id]
    );
    res.json({ message: 'Маҳсулот таҳрир шуд.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Хатогӣ ҳангоми таҳрири маҳсулот.' });
  }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Маҳсулот нест карда шуд.' });
});

module.exports = router;
