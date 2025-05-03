require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');
const csv = require('csv-parser');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ Connected to MySQL");
});

const filePath = './products.csv';
let insertedCount = 0;

function normalizeCategory(raw) {
  if (!raw) return null;
  const parts = raw.split('|');
  return parts[parts.length - 1].trim().replace(/\s+/g, '');
}

function getOrCreateCategory(categoryName) {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT category_id FROM category WHERE category_name = ?',
      [categoryName],
      (err, results) => {
        if (err) return reject(err);
        if (results.length) {
          return resolve(results[0].category_id);
        }
        // Insert new category if it doesn't exist
        db.query(
          'INSERT INTO category (category_name) VALUES (?)',
          [categoryName],
          (err, result) => {
            if (err) return reject(err);
            resolve(result.insertId);
          }
        );
      }
    );
  });
}

function getOrCreateShop(shopName, shopAddress) {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT shop_id FROM shop WHERE shop_name = ? AND shop_address = ?',
      [shopName, shopAddress],
      (err, results) => {
        if (err) return reject(err);
        if (results.length) return resolve(results[0].shop_id);

        db.query(
          'INSERT INTO shop (shop_name, shop_address) VALUES (?, ?)',
          [shopName, shopAddress],
          (err, result) => {
            if (err) return reject(err);
            resolve(result.insertId);
          }
        );
      }
    );
  });
}

function getOrCreateUser(user_id, user_name) {
  return new Promise((resolve, reject) => {
    db.query('SELECT user_id FROM user WHERE user_id = ?', [user_id], (err, results) => {
      if (err) return reject(err);
      if (results.length) return resolve(user_id);

      db.query('INSERT INTO user (user_id, user_name) VALUES (?, ?)', [user_id, user_name], (err) => {
        if (err) return reject(err);
        resolve(user_id);
      });
    });
  });
}

function insertProductAndReview(row, category_id, shop_id, user_id) {
  const productQuery = `
    INSERT INTO product (
      product_id, product_name, discounted_price, actual_price, discount_percentage,
      rating, rating_count, about_product, img_link, product_link,
      category_id, shop_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const productValues = [
    row.product_id,
    row.product_name,
    parseFloat(row.discounted_price) || 0,
    parseFloat(row.actual_price) || 0,
    parseFloat(row.discount_percentage) || 0,
    parseFloat(row.rating) || 0,
    parseInt(row.rating_count) || 0,
    row.about_product,
    row.img_link,
    row.product_link,
    category_id,
    shop_id
  ];

  db.query(productQuery, productValues, (err) => {
    if (err) {
      console.error('❌ Product Insert Error:', err.message);
      return;
    }

    const reviewQuery = `
      INSERT INTO review (
        review_id, user_id, product_id, review_title, review_content
      ) VALUES (?, ?, ?, ?, ?)
    `;
    const reviewValues = [
      row.review_id,
      user_id,
      row.product_id,
      row.review_title,
      row.review_content
    ];

    db.query(reviewQuery, reviewValues, (err) => {
      if (err) {
        console.error('❌ Review Insert Error:', err.message);
      } else {
        insertedCount++;
      }
    });
  });
}

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', async (row) => {
    try {
      const category = normalizeCategory(row.category);
      if (!category) {
        console.warn(`❌ Category not found in row: ${row.category}`);
        return;
      }

      const [category_id, shop_id, user_id] = await Promise.all([
        getOrCreateCategory(category),
        getOrCreateShop(row.shop_name, row.shop_address),
        getOrCreateUser(row.user_id, row.user_name)
      ]);

      insertProductAndReview(row, category_id, shop_id, user_id);
    } catch (error) {
      console.error('❌ Insert error:', error.message);
    }
  })
  .on('end', () => {
    setTimeout(() => {
      console.log(`✅ ${insertedCount} products successfully inserted!`);
      db.end();
    }, 3000); // Allow inserts to complete
  });
