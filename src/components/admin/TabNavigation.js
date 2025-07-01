// src/components/admin/TabNavigation.js
'use client';

export default function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'soknader', label: 'Søknader' },
    { id: 'brukere', label: 'Brukere' },
    { id: 'invitasjoner', label: 'Invitasjoner' }
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-[#780000] text-[#780000]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
