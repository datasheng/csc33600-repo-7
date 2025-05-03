// routes/vendor.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/vendor/product
const { v4: uuidv4 } = require('uuid');



router.post('/product', async (req, res) => {
  const {
    product_name,
    discounted_price,
    actual_price,
    discount_percentage,
    rating,
    rating_count,
    about_product,
    external_url,
    image_url,
    category_id,
    shop_id: userId // 👈 vendor's user_id passed from frontend
  } = req.body;

  try {
    // 🔁 shop_id === user_id
    const [shopRows] = await db.execute(
      'SELECT shop_id FROM shop WHERE shop_id = ?',
      [userId]
    );

    if (shopRows.length === 0) {
      return res.status(400).json({ error: 'Shop not found for this vendor' });
    }

    const product_id = uuidv4(); // ✅ generate unique ID

    await db.execute(
      `INSERT INTO product (
        product_id, product_name, discounted_price, actual_price, discount_percentage,
        rating, rating_count, about_product, external_url,
        image_url, category_id, shop_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_id, product_name, discounted_price, actual_price, discount_percentage,
        rating, rating_count, about_product, external_url,
        image_url, category_id, userId // ✅ use userId directly as shop_id
      ]
    );

    res.status(201).json({ message: 'Product submitted successfully' });
  } catch (err) {
    console.error('❌ Product submission error:', err.message);
    res.status(500).json({ error: 'Failed to submit product' });
  }
});


  // GET /api/vendor/products/:user_id
  router.get('/products/:user_id', async (req, res) => {
    try {
      const { user_id } = req.params;
  
      // 🔁 shop_id === user_id
      const [products] = await db.execute(
        'SELECT * FROM product WHERE shop_id = ?',
        [user_id]
      );
  
      res.json(products);
    } catch (err) {
      console.error('❌ Failed to get vendor products:', err.message);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });
  
  
  // PUT /api/vendor/products/:product_id
  router.put('/products/:product_id', async (req, res) => {
    const { product_id } = req.params;
    const fields = req.body;
  
    const keys = Object.keys(fields).filter(key => fields[key] !== undefined);
    const values = keys.map(key => fields[key]);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
  
    try {
      await db.execute(`UPDATE product SET ${setClause} WHERE product_id = ?`, [...values, product_id]);
      res.json({ message: 'Product updated' });
    } catch (err) {
      console.error('❌ Failed to update product:', err.message);
      res.status(500).json({ error: 'Update failed' });
    }
  });
  
  
  // DELETE /api/vendor/products/:product_id
  router.delete('/products/:product_id', async (req, res) => {
    const { product_id } = req.params;
  
    try {
      await db.execute('DELETE FROM product WHERE product_id = ?', [product_id]);
      res.json({ message: 'Product deleted' });
    } catch (err) {
      console.error('❌ Failed to delete product:', err.message);
      res.status(500).json({ error: 'Delete failed' });
    }
  });
  
  




// GET /api/vendor/shop/:user_id
router.get('/shop/:user_id', async (req, res) => {
    const { user_id } = req.params;
  
    try {
      const [rows] = await db.execute(
        'SELECT shop_name, shop_address FROM shop WHERE shop_id = ? LIMIT 1',
        [user_id] // shop_id === user_id
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ shop_name: '', shop_address: '' }); // no shop yet
      }
  
      res.json(rows[0]);
    } catch (err) {
      console.error('❌ Error fetching shop info:', err.message);
      res.status(500).json({ error: 'Failed to fetch shop info' });
    }
  });
  

// POST /api/vendor/shop/:user_id
router.post('/shop/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const { shop_name, shop_address } = req.body;
  
    if (!shop_name || !shop_address) {
      return res.status(400).json({ error: 'Missing shop name or address' });
    }
  
    try {
      // Try to update existing shop
      const [result] = await db.execute(
        'UPDATE shop SET shop_name = ?, shop_address = ? WHERE shop_id = ?',
        [shop_name, shop_address, user_id]
      );
  
      // Insert if no existing shop found
      if (result.affectedRows === 0) {
        await db.execute(
          'INSERT INTO shop (shop_id, shop_name, shop_address) VALUES (?, ?, ?)',
          [user_id, shop_name, shop_address]
        );
      }
  
      res.status(200).json({ message: 'Shop info saved successfully' });
    } catch (err) {
      console.error('❌ Error saving shop info:', err.message);
      res.status(500).json({ error: 'Failed to save shop info' });
    }
  });
  




module.exports = router;
