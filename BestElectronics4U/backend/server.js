// backend/server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const stripeRoutes = require('./routes/create-checkout-session');

app.use(express.json()); 
app.use('/api/auth', require('./routes/auth'));
app.use('/api/saved-items', require('./routes/savedItems'));
app.use('/api/vendor', require('./routes/vendor'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/stripe', stripeRoutes);



//connect to DB via. enviroment variables.
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
db.connect(err => {
  if (err) throw err;
  console.log("✅ Connected to MySQL database!");
});

app.get('/products', (req, res) => {
    const offset = parseInt(req.query.offset) || 0;
    const limit = 30;
    const search = req.query.query || '';
  
    const sql = `
      SELECT 
        p.product_id, p.product_name, p.discounted_price, p.actual_price, p.discount_percentage,
        p.rating, p.rating_count, p.about_product, p.image_url, p.external_url,
        s.shop_name
      FROM product p
      LEFT JOIN shop s ON p.shop_id = s.shop_id
      WHERE p.product_name LIKE ? OR p.about_product LIKE ?
      LIMIT ? OFFSET ?;
    `;
  
    const searchPattern = `%${search}%`;
  
    db.query(sql, [searchPattern, searchPattern, limit, offset], (err, results) => {
      if (err) {
        console.error('❌ Error fetching products:', err.message);
        return res.status(500).json({ error: 'Database query error' });
      }
      res.json(results);
    });
  });
  
  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
