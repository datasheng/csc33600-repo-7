require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const csv = require('csv-parser');

// Ensure category path exists (nested insert)
async function ensureCategoryPathExists(db, fullPath) {
  const segments = fullPath.split('|');
  let parentId = null;

  for (const name of segments.map(s => s.trim())) {
    const [rows] = await db.execute(
      'SELECT category_id FROM category WHERE category_name = ? AND parent_id ' + (parentId === null ? 'IS NULL' : '= ?'),
      parentId === null ? [name] : [name, parentId]
    );

    if (rows.length > 0) {
      parentId = rows[0].category_id;
    } else {
      const [result] = await db.execute(
        'INSERT INTO category (category_name, parent_id) VALUES (?, ?)',
        [name, parentId]
      );
      parentId = result.insertId;
    }
  }

  return parentId;
}

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log("✅ Connected to MySQL");

  const products = [];
  fs.createReadStream('./products.csv')
    .pipe(csv())
    .on('data', row => products.push(row))
    .on('end', async () => {
      console.log(`📦 CSV loaded: ${products.length} rows`);
      let insertedCount = 0;

      for (const product of products) {
        try {
          const {
            product_id, product_name, category,
            discounted_price, actual_price, discount_percentage,
            rating, rating_count, about_product,
            user_id, user_name, review_id,
            review_title, review_content,
            img_link, product_link, shop_name, shop_address
          } = product;

          const dp = parseFloat(discounted_price);
          const ap = parseFloat(actual_price);
          const disc = parseFloat(discount_percentage);
          const rate = parseFloat(rating);
          const rcount = parseInt(rating_count);

          if (isNaN(dp) || isNaN(ap)) {
            console.warn(`❌ Skipping ${product_name} due to invalid prices`);
            continue;
          }

          // 👤 Ensure vendor user
          await connection.execute(
            'INSERT IGNORE INTO user (user_id, user_name, email, user_password, is_vendor) VALUES (?, ?, ?, ?, ?)',
            [user_id, user_name, `${user_id}@dummy.com`, 'hashed_password_placeholder', 1]
          );

          // 🏪 Ensure shop (shop_id is same as user_id)
          const [shopRows] = await connection.execute(
            'SELECT shop_id FROM shop WHERE shop_id = ?',
            [user_id]
          );
          if (shopRows.length === 0) {
            await connection.execute(
              'INSERT INTO shop (shop_id, shop_name, shop_address) VALUES (?, ?, ?)',
              [user_id, shop_name, shop_address]
            );
          }

          // 📂 Category
          const category_id = await ensureCategoryPathExists(connection, category);

          // 📦 Product
          await connection.execute(
            `INSERT IGNORE INTO product (
              product_id, product_name, discounted_price, actual_price, discount_percentage,
              rating, rating_count, about_product, image_url, external_url,
              category_id, shop_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              product_id, product_name, dp, ap, disc || 0,
              rate || 0, rcount || 0, about_product,
              img_link, product_link, category_id, user_id
            ]
          );

          // ✍ Reviews (if any)
          const ids = review_id.split(',');
          const titles = review_title.split(',');
          const contents = review_content.split(',');

          const count = Math.min(ids.length, titles.length, contents.length);
          for (let i = 0; i < count; i++) {
            const rid = ids[i].trim();
            const title = titles[i].trim();
            const content = contents[i].trim();

            if (rid && title && content) {
              await connection.execute(
                `INSERT INTO review (
                  review_id, user_id, product_id, review_title, review_content, review_date
                ) VALUES (?, ?, ?, ?, ?, CURDATE())`,
                [rid, user_id, product_id, title, content]
              );
            }
          }

          insertedCount++;
        } catch (err) {
          console.error('❌ Insert error:', err.message);
        }
      }

      console.log(`✅ ${insertedCount} products successfully inserted!`);
      await connection.end();
    });
})();
