// src/components/admin/LoginForm.js
'use client';

import { useState } from 'react';

export default function LoginForm({ onLogin, error }) {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(loginForm);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-[#FDF0D5] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#780000] mb-6 text-center">NÜR Admin Login</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#780000] text-sm font-bold mb-2">
              E-post
            </label>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#780000]"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-[#780000] text-sm font-bold mb-2">
              Passord
            </label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#780000]"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#780000] text-white py-2 px-4 rounded-lg hover:bg-[#C1121F] transition-colors"
          >
            Logg inn
          </button>
        </form>

        {/* Quick login hint for development */}
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
          <strong>Admin bruker:</strong><br/>
          E-post: marjamahassanali@gmail.com<br/>
          Passord: test123
        </div>
      </div>
    </div>
  );
}
