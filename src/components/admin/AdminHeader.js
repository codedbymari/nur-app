'use client';

import { LogOut, Shield, User } from 'lucide-react';

export default function AdminHeader({ user, onLogout }) {
  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : 'AD';

  return (
    <header className="bg-white text-gray-900 border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Branding */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#780000] to-[#C1121F] rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  NÜR <span className="text-[#780000] font-semibold">Admin</span>
                </h1>
                <p className="text-gray-600 text-sm font-medium">
                  Matchmaking Platform Management
                </p>
              </div>
            </div>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-4">
            {/* User profile section */}
            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-[#780000] to-[#C1121F] rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xs font-semibold text-white">
                  {userInitials}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Velkommen</p>
                <p className="text-xs text-gray-600 truncate max-w-[150px]">
                  {user?.email || 'admin@nur.no'}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-[#780000] hover:bg-[#C1121F] 
                         text-white rounded-xl transition-all duration-200 group border border-[#780000]
                         hover:border-[#C1121F] shadow-lg hover:shadow-xl"
              aria-label="Logg ut"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
              <span className="text-sm font-medium hidden sm:inline">Logg ut</span>
            </button>
          </div>
        </div>

        {/* Optional: Status indicators or breadcrumb could go here */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <span className="text-sm">System Active</span>
            </div>
            <div className="text-gray-500 text-sm font-medium">
              {new Date().toLocaleDateString('nb-NO', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}