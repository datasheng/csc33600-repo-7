const express = require("express");
const router = express.Router();
const { supabase } = require("../supabaseClient");

router.post("/", async (req, res) => {
  const { user_id, product_id } = req.body;

  console.log(
    `📝 Saving item request - User ID: ${user_id}, Product ID: ${product_id}, Type: ${typeof product_id}`
  );

  // Validate input
  if (!user_id || !product_id) {
    console.log("❌ Missing required fields in request");
    return res.status(400).json({
      message: "Missing required fields",
      details: "Both user_id and product_id are required",
    });
  }

  // Ensure product_id is a string
  const productIdStr = String(product_id);

  try {
    // Check if entry already exists
    const { data: existingItems, error: checkError } = await supabase
      .from("saved_items")
      .select("*")
      .eq("user_id", user_id)
      .eq("product_id", productIdStr);

    if (checkError) throw checkError;

    // Only insert if it doesn't already exist
    if (!existingItems || existingItems.length === 0) {
      const { error: insertError } = await supabase
        .from("saved_items")
        .insert({ user_id, product_id: productIdStr });

      if (insertError) throw insertError;
    }

    res.status(200).json({ message: "Item saved successfully." });
  } catch (err) {
    console.error("❌ Save item error:", err.message);

    // Provide more detailed error messages
    if (err.message.includes("foreign key constraint")) {
      if (err.message.includes("saved_items_user_id_fkey")) {
        return res.status(400).json({
          message: "Error saving item: User ID does not exist",
          details: err.message,
        });
      } else if (err.message.includes("saved_items_product_id_fkey")) {
        return res.status(400).json({
          message: "Error saving item: Product ID does not exist",
          details: err.message,
        });
      }
    }

    res.status(500).json({
      message: "Error saving item",
      details: err.message,
    });
  }
});

// GET /api/saved-items/:user_id
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const { data, error } = await supabase
      .from("saved_items")
      .select(
        `
        product_id,
        product:product_id (
          product_id, 
          product_name, 
          image_url, 
          external_url, 
          actual_price, 
          discounted_price,
          shop:shop_id (shop_name)
        )
      `
      )
      .eq("user_id", user_id);

    if (error) throw error;

    // Transform the data to match the expected format
    const formattedData = data.map((item) => ({
      product_id: item.product.product_id,
      product_name: item.product.product_name,
      image_url: item.product.image_url,
      external_url: item.product.external_url,
      shop_name: item.product.shop?.shop_name,
      actual_price: item.product.actual_price,
      discounted_price: item.product.discounted_price,
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("❌ Failed to fetch saved items:", err.message);
    res.status(500).json({ error: "Failed to fetch saved items" });
  }
});

// DELETE /api/saved-items
router.delete("/", async (req, res) => {
  const { user_id, product_id } = req.body;
  if (!user_id || !product_id) {
    return res.status(400).json({ error: "Missing user_id or product_id" });
  }

  // Ensure product_id is a string
  const productIdStr = String(product_id);

  try {
    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("user_id", user_id)
      .eq("product_id", productIdStr);

    if (error) throw error;

    res.json({ message: "Item removed from saved items" });
  } catch (err) {
    console.error("❌ Failed to remove saved item:", err.message);
    res.status(500).json({ error: "Failed to remove saved item" });
  }
});

module.exports = router;
