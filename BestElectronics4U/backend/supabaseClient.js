// supabaseClient.js
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  console.error("ERROR: SUPABASE_URL is not defined in environment variables");
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "ERROR: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables"
  );
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Test connection function
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("saved_items")
      .select("*")
      .limit(1);
    if (error) {
      console.error("Supabase connection test failed:", error.message);
      return false;
    }
    console.log("Supabase connection successful");
    return true;
  } catch (err) {
    console.error("Supabase connection exception:", err.message);
    return false;
  }
};

module.exports = { supabase, testConnection };
