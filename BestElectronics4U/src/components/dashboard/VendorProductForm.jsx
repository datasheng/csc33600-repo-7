import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VendorProductForm = ({ userId }) => {
  const [form, setForm] = useState({
    product_name: '',
    discounted_price: '',
    actual_price: '',
    discount_percentage: '',
    rating: '',
    rating_count: '',
    about_product: '',
    external_url: '',
    image_url: '',
    category_id: ''
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories/flat') // 👈 Use the correct backend route
      .then(res => setCategories(res.data))
      .catch(err => console.error('❌ Failed to fetch categories:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/vendor/product', {
      ...form,
      shop_id: userId
    })
      .then(() => alert('✅ Product submitted!'))
      .catch(() => alert('❌ Failed to submit product'));
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl shadow space-y-4">
      <h2 className="text-2xl font-bold mb-4">📦 Submit New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {Object.entries(form).map(([key, val]) => (
          key !== 'category_id' && (
            <div key={key}>
              <label className="block capitalize">{key.replace(/_/g, ' ')}:</label>
              <input
                name={key}
                value={val}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white/20 text-white"
                required
              />
            </div>
          )
        ))}

        {/* ✅ Category dropdown with full paths */}
        <div>
          <label className="block">Category:</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white/20 text-black"
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map(cat => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name} {/* This should be full path like "Computers > Peripherals > Cables" */}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          Submit Product
        </button>
      </form>
    </div>
  );
};

export default VendorProductForm;
