// backend/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { supabase, testConnection } = require("./supabaseClient");

const app = express();
app.use(cors());
const stripeRoutes = require("./routes/create-checkout-session");
const chatbotRoutes = require("./routes/chatbot");
app.use(express.json());
app.use("/api/auth", require("./routes/auth_supabase"));
app.use("/api/saved-items", require("./routes/savedItems"));
app.use("/api/vendor", require("./routes/vendor"));
app.use("/api/categories", require("./routes/category"));
app.use("/api/stripe", stripeRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Initialize Supabase connection
async function initializeSupabase() {
  const isConnected = await testConnection();
  if (isConnected) {
    console.log("✅ Supabase connection established successfully");
  } else {
    console.error(
      "❌ Failed to connect to Supabase. Some features may not work properly."
    );
  }
}

// Test the connection but don't crash the server if it fails
initializeSupabase().catch((err) => {
  console.error("❌ Supabase initialization error:", err.message);
});

app.get("/products", async (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = 30;
  const search = req.query.query || "";
  try {
    // Using Supabase's query builder
    let query = supabase
      .from("product")
      .select(
        `
          product_id, product_name, discounted_price, actual_price, discount_percentage,
          rating, rating_count, about_product, image_url, external_url,
          shop:shop_id (shop_name)
        `
      )
      .range(offset, offset + limit - 1);

    // Add search filter if provided
    if (search) {
      query = query.or(
        `product_name.ilike.%${search}%,about_product.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", JSON.stringify(error, null, 2));
      return res.status(500).json({
        error: "Failed to fetch products",
        details: error.message,
      });
    }

    console.log(`Successfully fetched ${data?.length || 0} products`);

    // Format response to match the previous structure
    const formattedData = data.map((product) => ({
      product_id: product.product_id,
      product_name: product.product_name,
      discounted_price: product.discounted_price,
      actual_price: product.actual_price,
      discount_percentage: product.discount_percentage,
      rating: product.rating,
      rating_count: product.rating_count,
      about_product: product.about_product,
      image_url: product.image_url,
      external_url: product.external_url,
      shop_name: product.shop?.shop_name,
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
