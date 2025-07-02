'use client';

import { FileText, Users, Send } from 'lucide-react';

export default function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { 
      id: 'soknader', 
      label: 'Søknader',
      icon: FileText,
      description: 'Behandle medlemskapssøknader'
    },
    { 
      id: 'brukere', 
      label: 'Brukere',
      icon: Users,
      description: 'Administrer brukerkontoer'
    },
    { 
      id: 'invitasjoner', 
      label: 'Invitasjoner',
      icon: Send,
      description: 'Håndter invitasjonssystem'
    }
  ];

  return (
    <div className="mb-8">
      {/* Tab Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Administrasjon</h2>
          <p className="text-sm text-gray-600 mt-1">Velg område for å administrere</p>
        </div>
      </div>

      {/* Modern Tab Pills */}
      <div className="bg-gray-50 p-2 rounded-2xl border border-gray-200 inline-flex space-x-1">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center space-x-3 px-6 py-3 rounded-xl font-medium text-sm
                         transition-all duration-200 group min-w-[140px] ${
                isActive
                  ? 'bg-white text-[#780000] shadow-lg border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <IconComponent className={`w-4 h-4 transition-transform duration-200 ${
                isActive ? 'scale-110' : 'group-hover:scale-105'
              }`} />
              <span className="font-semibold">{tab.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 
                                rounded-full shadow-lg"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Description */}
      <div className="mt-4">
        {tabs.map((tab) => {
          if (activeTab !== tab.id) return null;
          
          return (
            <div key={tab.id} className="flex items-center space-x-2 text-sm text-gray-600">
              <tab.icon className="w-4 h-4 text-[#780000]" />
              <span>{tab.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}