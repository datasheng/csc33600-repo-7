const express = require('express');
const router = express.Router();
const db = require('../db');

// 🧠 Recursively build category path from parent IDs
function buildCategoryPath(category, allCategories, cache = new Map()) {
  if (cache.has(category.category_id)) return cache.get(category.category_id);

  const parent = allCategories.find(cat => cat.category_id === category.parent_id);
  const fullPath = parent
    ? `${buildCategoryPath(parent, allCategories, cache)} > ${category.category_name}`
    : category.category_name;

  cache.set(category.category_id, fullPath);
  return fullPath;
}

// 📦 GET /api/categories/flat
router.get('/flat', async (req, res) => {
  try {
    const [categories] = await db.execute(
      'SELECT category_id, category_name, parent_id FROM category'
    );

    const flat = categories.map(cat => ({
      category_id: cat.category_id,
      name: buildCategoryPath(cat, categories)
    }));

    // Optional: sort alphabetically by name
    flat.sort((a, b) => a.name.localeCompare(b.name));

    res.json(flat);
  } catch (err) {
    console.error('❌ Error fetching flat categories:', err.message);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

module.exports = router;
