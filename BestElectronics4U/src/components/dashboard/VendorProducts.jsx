import React, { useEffect, useState } from "react";
import axios from "axios";

const VendorProducts = ({ userId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/vendor/products/${userId}`
      );
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch vendor products:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [userId]);

  const handleChange = (e, productId) => {
    const { name, value } = e.target;
    setProducts((prev) =>
      prev.map((p) =>
        p.product_id === productId ? { ...p, [name]: value } : p
      )
    );
  };

  const handleUpdate = async (product) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/vendor/products/${
          product.product_id
        }`,
        product
      );
      alert("✅ Product updated!");
      setEditingId(null);
      fetchProducts(); // Refresh to get latest data
    } catch (err) {
      alert("❌ Failed to update product");
      console.error(err);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/vendor/products/${productId}`
      );
      setProducts((prev) => prev.filter((p) => p.product_id !== productId));
      alert("🗑️ Product deleted");
    } catch (err) {
      alert("❌ Failed to delete product");
      console.error(err);
    }
  };

  const toggleEdit = (productId) => {
    setEditingId(editingId === productId ? null : productId);
    setExpandedId(productId); // Expand the product when editing
  };

  const toggleExpand = (productId) => {
    setExpandedId(expandedId === productId ? null : productId);
  };

  const formatFields = {
    product_name: "Product Name",
    discounted_price: "Discounted Price ($)",
    actual_price: "Actual Price ($)",
    discount_percentage: "Discount (%)",
    rating: "Rating (0-5)",
    rating_count: "Rating Count",
    about_product: "Description",
    external_url: "Product URL",
    image_url: "Image URL",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full w-8 h-8 flex items-center justify-center">
          🧾
        </span>
        <h2 className="text-2xl font-bold">Your Products</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
          <div className="text-5xl mb-4">📪</div>
          <p className="text-white/70 text-lg">
            You haven't submitted any products yet.
          </p>
          <p className="text-white/50 mt-2">
            Use the Add Product tab to start listing your products.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="bg-white/5 rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-cyan-400/30"
            >
              <div
                className="p-4 flex flex-col md:flex-row gap-4 cursor-pointer"
                onClick={() => toggleExpand(product.product_id)}
              >
                <div className="flex-shrink-0 w-full md:w-32 h-32">
                  <img
                    src={product.image_url}
                    alt={product.product_name}
                    className="w-full h-full object-contain bg-gradient-to-br from-indigo-900/50 to-cyan-900/50 p-2 rounded"
                  />
                </div>

                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-white">
                    {product.product_name}
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-2">
                    <div>
                      <span className="text-cyan-300 text-sm">Price: </span>
                      <span className="text-green-400">
                        ${product.discounted_price}
                      </span>
                      {product.discount_percentage > 0 && (
                        <span className="text-gray-400 line-through ml-2">
                          ${product.actual_price}
                        </span>
                      )}
                    </div>

                    {product.discount_percentage > 0 && (
                      <div>
                        <span className="text-cyan-300 text-sm">
                          Discount:{" "}
                        </span>
                        <span className="text-yellow-400">
                          {product.discount_percentage}%
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="text-cyan-300 text-sm">Rating: </span>
                      <span>
                        {product.rating} ⭐ ({product.rating_count})
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEdit(product.product_id);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded flex items-center gap-1"
                    >
                      <span>
                        {editingId === product.product_id
                          ? "Cancel Edit"
                          : "Edit"}
                      </span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(product.product_id);
                      }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded flex items-center gap-1"
                    >
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center text-white/60">
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      expandedId === product.product_id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* Expanded section with edit form */}
              {expandedId === product.product_id && (
                <div className="border-t border-white/10 p-4 bg-white/5">
                  {editingId === product.product_id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(formatFields).map(
                          ([key, label]) =>
                            key !== "about_product" && (
                              <div key={key} className="space-y-1">
                                <label className="block text-cyan-300 text-sm">
                                  {label}
                                </label>
                                <input
                                  name={key}
                                  value={product[key] || ""}
                                  onChange={(e) =>
                                    handleChange(e, product.product_id)
                                  }
                                  className="w-full bg-white/10 text-white p-2 rounded border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                              </div>
                            )
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-cyan-300 text-sm">
                          Description
                        </label>
                        <textarea
                          name="about_product"
                          value={product.about_product || ""}
                          onChange={(e) => handleChange(e, product.product_id)}
                          rows="3"
                          className="w-full bg-white/10 text-white p-2 rounded border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        ></textarea>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleUpdate(product)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-lg font-medium mb-2 text-cyan-300">
                        Product Details
                      </h4>
                      <p className="text-white/80 mb-4 whitespace-pre-line">
                        {product.about_product}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <a
                          href={product.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded flex items-center gap-2 transition-colors"
                        >
                          <span>View Product</span>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            ></path>
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
