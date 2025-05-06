import React, { useEffect, useState } from "react";
import axios from "axios";

const VendorProductForm = ({ userId }) => {
  const [form, setForm] = useState({
    product_name: "",
    discounted_price: "",
    actual_price: "",
    discount_percentage: "",
    rating: "",
    rating_count: "",
    about_product: "",
    external_url: "",
    image_url: "",
    category_id: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/categories/flat`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("❌ Failed to fetch categories:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Auto-calculate discount percentage if both prices are entered
    if (
      (name === "actual_price" || name === "discounted_price") &&
      form.actual_price &&
      form.discounted_price
    ) {
      const actual = parseFloat(
        name === "actual_price" ? value : form.actual_price
      );
      const discounted = parseFloat(
        name === "discounted_price" ? value : form.discounted_price
      );

      if (actual > 0 && discounted > 0) {
        const percentage = Math.round(((actual - discounted) / actual) * 100);
        setForm((prev) => ({
          ...prev,
          discount_percentage: percentage.toString(),
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/vendor/product`, {
        ...form,
        shop_id: userId,
      });

      setSuccess(true);
      setForm({
        product_name: "",
        discounted_price: "",
        actual_price: "",
        discount_percentage: "",
        rating: "",
        rating_count: "",
        about_product: "",
        external_url: "",
        image_url: "",
        category_id: "",
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("❌ Failed to submit product");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full w-8 h-8 flex items-center justify-center">
          📦
        </span>
        <h2 className="text-2xl font-bold">Add New Product</h2>
      </div>

      {success && (
        <div className="bg-green-800/30 border border-green-500 text-green-300 px-4 py-3 rounded flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            ></path>
          </svg>
          <span>Product submitted successfully!</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-cyan-300 text-sm font-medium">
              Product Name
            </label>
            <input
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              className="w-full p-3 rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-cyan-300 text-sm font-medium">
              Category
            </label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full p-3 rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            >
              <option value="" disabled>
                -- Select Category --
              </option>
              {categories.map((cat) => (
                <option
                  key={cat.category_id}
                  value={cat.category_id}
                  className="bg-gray-800"
                >
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-cyan-300 text-sm font-medium">
              Discounted Price ($)
            </label>
            <input
              name="discounted_price"
              value={form.discounted_price}
              onChange={handleChange}
              type="number"
              step="0.01"
              min="0"
              className="w-full p-3 rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-cyan-300 text-sm font-medium">
              Actual Price ($)
            </label>
            <input
              name="actual_price"
              value={form.actual_price}
              onChange={handleChange}
              type="number"
              step="0.01"
              min="0"
              className="w-full p-3 rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-cyan-300 text-sm font-medium">
              Discount Percentage (%)
            </label>
            <input
              name="discount_percentage"
              value={form.discount_percentage}
              onChange={handleChange}
              type="number"
              min="0"
              max="100"
              className="w-full p-3 rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-cyan-300 text-sm font-medium">
              Rating (0-5)
            </label>
            <input
              name="rating"
              value={form.rating}
              onChange={handleChange}
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="w-full p-3 rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-cyan-300 text-sm font-medium">
              Rating Count
            </label>
            <input
              name="rating_count"
              value={form.rating_count}
              onChange={handleChange}
              type="number"
              min="0"
              className="w-full p-3 rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-cyan-300 text-sm font-medium">
              Product URL
            </label>
            <input
              name="external_url"
              value={form.external_url}
              onChange={handleChange}
              type="url"
              placeholder="https://example.com/product"
              className="w-full p-3 rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-cyan-300 text-sm font-medium">
              Image URL
            </label>
            <input
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              type="url"
              placeholder="https://example.com/image.jpg"
              className="w-full p-3 rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-cyan-300 text-sm font-medium">
            About Product
          </label>
          <textarea
            name="about_product"
            value={form.about_product}
            onChange={handleChange}
            rows="4"
            className="w-full p-3 rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
          ></textarea>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-medium rounded flex items-center justify-center gap-2 transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                Processing...
              </>
            ) : (
              <>
                <span>Submit Product</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorProductForm;
