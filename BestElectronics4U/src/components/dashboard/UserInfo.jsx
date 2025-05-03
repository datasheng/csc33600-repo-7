import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserInfo = ({ user }) => {
  const [shop, setShop] = useState({ shop_name: '', shop_address: '' });

  useEffect(() => {
    if (user.is_vendor) {
      axios.get(`http://localhost:5000/api/vendor/shop/${user.user_id}`)
        .then(res => setShop(res.data))
        .catch(err => console.error('❌ Error fetching shop info:', err));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShop(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    axios.post(`http://localhost:5000/api/vendor/shop/${user.user_id}`, shop)
      .then(() => alert('✅ Shop info updated!'))
      .catch(() => alert('❌ Failed to update shop info'));
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl shadow space-y-3">
      <h2 className="text-2xl font-bold mb-4">👤 User Info</h2>
      <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Address:</strong> {user.address}</p>

      {user.is_vendor && (
        <>
          <h3 className="text-xl font-semibold mt-4">🏪 Vendor Shop</h3>
          <div>
            <label>Shop Name:</label>
            <input
              name="shop_name"
              value={shop.shop_name}
              onChange={handleChange}
              className="w-full bg-white/20 text-white p-2 rounded my-1"
            />
          </div>
          <div>
            <label>Shop Address:</label>
            <input
              name="shop_address"
              value={shop.shop_address}
              onChange={handleChange}
              className="w-full bg-white/20 text-white p-2 rounded my-1"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mt-2"
          >
            Save Shop Info
          </button>
        </>
      )}
    </div>
  );
};

export default UserInfo;
