// routes/vendor.js
const express = require("express");
const router = express.Router();
const { supabase } = require("../supabaseClient");
const { v4: uuidv4 } = require("uuid");

// POST /api/vendor/product
router.post("/product", async (req, res) => {
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
    shop_id: userId, // 👈 vendor's user_id passed from frontend
  } = req.body;

  try {
    // 🔁 shop_id === user_id
    const { data: shopRows, error: shopError } = await supabase
      .from("shop")
      .select("shop_id")
      .eq("shop_id", userId);

    if (shopError) throw shopError;

    if (!shopRows || shopRows.length === 0) {
      return res.status(400).json({ error: "Shop not found for this vendor" });
    }

    const product_id = uuidv4(); // ✅ generate unique ID

    const { error: insertError } = await supabase.from("product").insert({
      product_id,
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
      shop_id: userId, // ✅ use userId directly as shop_id
    });

    if (insertError) throw insertError;

    res.status(201).json({ message: "Product submitted successfully" });
  } catch (err) {
    console.error("❌ Product submission error:", err.message);
    res.status(500).json({ error: "Failed to submit product" });
  }
});

// GET /api/vendor/products/:user_id
router.get("/products/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    // 🔁 shop_id === user_id
    const { data: products, error } = await supabase
      .from("product")
      .select("*")
      .eq("shop_id", user_id);

    if (error) throw error;

    res.json(products || []);
  } catch (err) {
    console.error("❌ Failed to get vendor products:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// PUT /api/vendor/products/:product_id
router.put("/products/:product_id", async (req, res) => {
  const { product_id } = req.params;
  const fields = req.body;

  // Remove undefined fields
  Object.keys(fields).forEach(
    (key) => fields[key] === undefined && delete fields[key]
  );

  try {
    const { error } = await supabase
      .from("product")
      .update(fields)
      .eq("product_id", product_id);

    if (error) throw error;

    res.json({ message: "Product updated" });
  } catch (err) {
    console.error("❌ Failed to update product:", err.message);
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE /api/vendor/products/:product_id
router.delete("/products/:product_id", async (req, res) => {
  const { product_id } = req.params;

  try {
    const { error } = await supabase
      .from("product")
      .delete()
      .eq("product_id", product_id);

    if (error) throw error;

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("❌ Failed to delete product:", err.message);
    res.status(500).json({ error: "Delete failed" });
  }
});

// GET /api/vendor/shop/:user_id
router.get("/shop/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const { data: rows, error } = await supabase
      .from("shop")
      .select("shop_name, shop_address")
      .eq("shop_id", user_id)
      .limit(1);

    if (error) throw error;

    if (!rows || rows.length === 0) {
      return res.status(200).json({ shop_name: "", shop_address: "" }); // no shop yet - return 200 status instead of 404
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching shop info:", err.message);
    res.status(500).json({ error: "Failed to fetch shop info" });
  }
});

// POST /api/vendor/shop/:user_id
router.post("/shop/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { shop_name, shop_address } = req.body;

  if (!shop_name || !shop_address) {
    return res.status(400).json({ error: "Missing shop name or address" });
  }

  try {
    // Check if shop exists
    const { data: existing, error: checkError } = await supabase
      .from("shop")
      .select("shop_id")
      .eq("shop_id", user_id);

    if (checkError) throw checkError;

    // Upsert the shop (update if exists, insert if not)
    const { error: upsertError } = await supabase.from("shop").upsert({
      shop_id: user_id,
      shop_name,
      shop_address,
    });

    if (upsertError) throw upsertError;

    res.status(200).json({ message: "Shop info saved successfully" });
  } catch (err) {
    console.error("❌ Error saving shop info:", err.message);
    res.status(500).json({ error: "Failed to save shop info" });
  }
});

module.exports = router;
