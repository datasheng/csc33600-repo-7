import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserInfo from '../components/dashboard/UserInfo';
import SavedItems from '../components/dashboard/SavedItems';
import VendorProductForm from '../components/dashboard/VendorProductForm';
import VendorProducts from '../components/dashboard/VendorProducts'; // ✅


const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      navigate('/auth'); // redirect if not logged in
    }
  }, [navigate]);

  if (!user) return null; // or loading spinner

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white space-y-12">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* SECTION 1: User & Vendor Info */}
      <UserInfo user={user} />

      {/* SECTION 2: Saved Items */}
      <SavedItems userId={user.user_id} />

      {/* SECTION 3: Vendor Product Submission */}
      {user.is_vendor && (
        <VendorProductForm userId={user.user_id} />
      )}
          {/* SECTION 4: Vendor Submitted Products*/}
        {user.is_vendor && (
        <>

            <VendorProducts userId={user.user_id} /> {}
        </>
        )}
    </div>
  );
};

export default Dashboard;
