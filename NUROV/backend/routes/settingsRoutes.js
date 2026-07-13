const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings — public, used to theme the storefront (logo, colors, company name)
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM settings WHERE id = 1');
  res.json({ settings: rows[0] || {} });
});

// PUT /api/settings — admin only
router.put('/', requireAuth, requireAdmin, async (req, res) => {
  const { company_name, logo_url, primary_color, accent_color, currency, maintenance_mode } = req.body;
  await pool.query(
    `UPDATE settings SET company_name=?, logo_url=?, primary_color=?, accent_color=?, currency=?, maintenance_mode=?
     WHERE id = 1`,
    [company_name, logo_url || null, primary_color, accent_color, currency, !!maintenance_mode]
  );
  res.json({ message: 'Танзимот сабт шуд.' });
});

module.exports = router;
