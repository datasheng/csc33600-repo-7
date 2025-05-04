import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Auth = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    first_name: '',
    last_name: '',
    address: '',
    is_vendor: 'false',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('❌ Passwords do not match');
      return;
    }

    const payload = {
      email: formData.email,
      password: formData.password,
      ...(isLogin
        ? {}
        : {
            username: formData.username,
            is_vendor: formData.is_vendor === 'true',
            first_name: formData.first_name,
            last_name: formData.last_name,
            address: formData.address
          }),
    };

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';


    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, payload);

      if (res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      }

      alert(isLogin ? '✅ Login successful!' : '✅ Account created!');
      navigate('/');
    } catch (err) {
      console.error('❌ Auth error:', err.response?.data || err.message);
      alert(err.response?.data?.message || '❌ Authentication failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-cyan-800 to-blue-900 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-white/80">
            {isLogin ? 'Sign in to your account' : 'Join our community today'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              {[
                { id: 'username', label: 'Username' },
                { id: 'first_name', label: 'First Name' },
                { id: 'last_name', label: 'Last Name' },
                { id: 'address', label: 'Address' }
              ].map(({ id, label }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium text-white/90">
                    {label}
                  </label>
                  <input
                    id={id}
                    name={id}
                    type="text"
                    required
                    value={formData[id]}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/70"
                  />
                </div>
              ))}
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/70"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/70"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/70"
                />
              </div>

              <div>
                <label htmlFor="is_vendor" className="block text-sm font-medium text-white/90">
                  Vendor
                </label>
                <select
                  id="is_vendor"
                  name="is_vendor"
                  value={formData.is_vendor}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 bg-white border border-white/30 rounded-md text-black"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 bg-white text-indigo-700 font-semibold rounded-md hover:bg-indigo-100 transition"
            >
              {isLogin ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-white/80 hover:text-white"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
