const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { user_id, product_id } = req.body;

  try {
    await db.execute(
      'INSERT IGNORE INTO saved_items (user_id, product_id) VALUES (?, ?)',
      [user_id, product_id]
    );
    res.status(200).json({ message: 'Item saved successfully.' });
  } catch (err) {
    console.error('❌ Save item error:', err.message);
    res.status(500).json({ message: 'Error saving item.' });
  }
});




// GET /api/saved-items/:user_id
router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
      const [rows] = await db.execute(`
        SELECT p.product_id, p.product_name, p.image_url, p.external_url, s.shop_name
        FROM saved_items si
        JOIN product p ON si.product_id = p.product_id
        LEFT JOIN shop s ON p.shop_id = s.shop_id
        WHERE si.user_id = ?
      `, [user_id]);
  
      res.json(rows);
    } catch (err) {
      console.error('❌ Failed to fetch saved items:', err.message);
      res.status(500).json({ error: 'Failed to fetch saved items' });
    }
  });
  
  // POST /api/saved-items
  router.post('/', async (req, res) => {
    const { user_id, product_id } = req.body;
    if (!user_id || !product_id) {
      return res.status(400).json({ error: 'Missing user_id or product_id' });
    }
  
    try {
      await db.execute(
        'INSERT IGNORE INTO saved_items (user_id, product_id) VALUES (?, ?)',
        [user_id, product_id]
      );
      res.status(201).json({ message: 'Item saved successfully' });
    } catch (err) {
      console.error('❌ Failed to save item:', err.message);
      res.status(500).json({ error: 'Failed to save item' });
    }
  });
  
  // DELETE /api/saved-items
  router.delete('/', async (req, res) => {
    const { user_id, product_id } = req.body;
    if (!user_id || !product_id) {
      return res.status(400).json({ error: 'Missing user_id or product_id' });
    }
  
    try {
      const [result] = await db.execute(
        'DELETE FROM saved_items WHERE user_id = ? AND product_id = ?',
        [user_id, product_id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Item not found in saved list' });
      }
  
      res.json({ message: 'Item removed from saved items' });
    } catch (err) {
      console.error('❌ Failed to remove saved item:', err.message);
      res.status(500).json({ error: 'Failed to remove saved item' });
    }
  });
  
  module.exports = router;

