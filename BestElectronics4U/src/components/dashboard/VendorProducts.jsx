import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VendorProducts = ({ userId }) => {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/vendor/products/${userId}`);
      setProducts(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch vendor products:', err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [userId]);

  const handleChange = (e, productId) => {
    const { name, value } = e.target;
    setProducts(prev =>
      prev.map(p =>
        p.product_id === productId ? { ...p, [name]: value } : p
      )
    );
  };

  const handleUpdate = async (product) => {
    try {
      await axios.put(`http://localhost:5000/api/vendor/products/${product.product_id}`, product);
      alert('✅ Product updated!');
      setEditing(null);
    } catch {
      alert('❌ Failed to update product');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/vendor/products/${productId}`);
      setProducts(prev => prev.filter(p => p.product_id !== productId));
      alert('🗑️ Product deleted');
    } catch {
      alert('❌ Failed to delete product');
    }
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl shadow space-y-6">
      <h2 className="text-2xl font-bold">🧾 Your Submitted Products</h2>
      {products.length === 0 ? (
        <p className="text-gray-300">You haven't submitted any products yet.</p>
      ) : (
        products.map((product) => (
          <div key={product.product_id} className="bg-white/5 p-4 rounded space-y-2">
            {[
              'product_name', 'discounted_price', 'actual_price', 'discount_percentage',
              'rating', 'rating_count', 'about_product', 'external_url',
              'image_url', 'category_id'
            ].map((field) => (
              <div key={field}>
                <label className="capitalize">{field.replace('_', ' ')}:</label>
                <input
                  name={field}
                  value={product[field] || ''}
                  onChange={(e) => handleChange(e, product.product_id)}
                  className="w-full bg-white/20 text-white p-2 rounded"
                />
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleUpdate(product)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Save
              </button>
              <button
                onClick={() => handleDelete(product.product_id)}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default VendorProducts;
