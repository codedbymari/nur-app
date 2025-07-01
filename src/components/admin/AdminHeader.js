'use client';

export default function AdminHeader({ user, onLogout }) {
  return (
    <div className="bg-[#780000] text-white p-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">NÜR Admin Panel</h1>
          <p className="text-white/80">Velkommen, {user?.email || 'Admin'}</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-[#C1121F] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Logg ut
        </button>
      </div>
    </div>
  );
}