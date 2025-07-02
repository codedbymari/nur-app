'use client';

import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  Home,
  Clock,
  UserCheck,
  UserX,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';

export default function BrukerCard({ bruker, formatDato }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'aktiv': 
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          text: 'Aktiv',
          icon: UserCheck,
          dotColor: 'bg-green-500'
        };
      case 'inaktiv': 
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          text: 'Inaktiv',
          icon: UserX,
          dotColor: 'bg-red-500'
        };
      default: 
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          text: 'Ukjent',
          icon: User,
          dotColor: 'bg-gray-500'
        };
    }
  };

  const statusConfig = getStatusConfig(bruker.status);
  const StatusIcon = statusConfig.icon;

  // Calculate days since registration
  const getDaysSinceRegistration = () => {
    if (!bruker.created_at) return null;
    const created = new Date(bruker.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate days since last active
  const getDaysSinceActive = () => {
    if (!bruker.last_active) return null;
    const lastActive = new Date(bruker.last_active);
    const now = new Date();
    const diffTime = Math.abs(now - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceRegistration = getDaysSinceRegistration();
  const daysSinceActive = getDaysSinceActive();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header - Always Visible */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#780000] to-[#C1121F] rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {bruker.navn || 'Navn ikke oppgitt'}
              </h3>
              <div className="flex items-center text-gray-600 text-sm">
                <Mail className="w-4 h-4 mr-1" />
                <span>{bruker.epost || 'E-post ikke oppgitt'}</span>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`px-4 py-2 rounded-xl border text-sm font-semibold ${statusConfig.color}`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></div>
              <StatusIcon className="w-4 h-4" />
              <span>{statusConfig.text}</span>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <QuickInfoItem 
            icon={Calendar} 
            label="Registrert" 
            value={formatDato(bruker.created_at)}
            subtitle={daysSinceRegistration ? `${daysSinceRegistration} dager siden` : null}
          />
          <QuickInfoItem 
            icon={Phone} 
            label="Telefon" 
            value={bruker.telefon} 
          />
          <QuickInfoItem 
            icon={User} 
            label="Alder" 
            value={bruker.alder} 
          />
          <QuickInfoItem 
            icon={Activity} 
            label="Sist aktiv" 
            value={bruker.last_active ? formatDato(bruker.last_active) : 'Aldri'}
            subtitle={daysSinceActive ? `${daysSinceActive} dager siden` : null}
            isUrgent={daysSinceActive && daysSinceActive > 30}
          />
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center space-x-2 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors duration-200"
        >
          <span className="text-sm font-medium">
            {isExpanded ? 'Skjul detaljer' : 'Vis fullstendige detaljer'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Expandable Content */}
      <div className={`transition-all duration-500 ease-in-out ${
        isExpanded 
          ? 'max-h-[500px] opacity-100' 
          : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-6 pb-6">
          <div className="border-t border-gray-100 pt-6">
            {/* Detailed Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem 
                icon={User} 
                label="Kjønn" 
                value={bruker.kjonn} 
              />
              <DetailItem 
                icon={Briefcase} 
                label="Yrke" 
                value={bruker.yrke} 
              />
              <DetailItem 
                icon={Home} 
                label="Bosted" 
                value={bruker.bosted} 
              />
              <DetailItem 
                icon={Calendar} 
                label="Medlem siden" 
                value={daysSinceRegistration ? `${daysSinceRegistration} dager` : 'Ukjent'}
              />
            </div>

            {/* Activity Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <Activity className="w-5 h-5 text-[#780000]" />
                <h4 className="font-semibold text-gray-900">Aktivitetssammendrag</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 font-semibold ${
                    bruker.status === 'aktiv' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {statusConfig.text}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Registrert:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {formatDato(bruker.created_at)}
                  </span>
                </div>
                {bruker.last_active && (
                  <>
                    <div>
                      <span className="text-gray-600">Sist aktiv:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {formatDato(bruker.last_active)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Aktivitet:</span>
                      <span className={`ml-2 font-semibold ${
                        daysSinceActive && daysSinceActive <= 7 
                          ? 'text-green-600' 
                          : daysSinceActive && daysSinceActive <= 30 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                      }`}>
                        {daysSinceActive <= 7 ? 'Svært aktiv' : 
                         daysSinceActive <= 30 ? 'Moderat aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
const QuickInfoItem = ({ icon: Icon, label, value, subtitle, isUrgent = false }) => (
  <div className={`text-center p-3 rounded-xl ${isUrgent ? 'bg-red-50' : 'bg-gray-50'}`}>
    <div className="flex items-center justify-center mb-1">
      <Icon className={`w-4 h-4 ${isUrgent ? 'text-red-600' : 'text-gray-500'}`} />
    </div>
    <div className={`text-xs font-medium mb-1 ${isUrgent ? 'text-red-600' : 'text-gray-500'}`}>
      {label}
    </div>
    <div className={`text-sm font-semibold ${isUrgent ? 'text-red-700' : 'text-gray-900'}`}>
      {value || 'Ikke oppgitt'}
    </div>
    {subtitle && (
      <div className={`text-xs mt-1 ${isUrgent ? 'text-red-500' : 'text-gray-400'}`}>
        {subtitle}
      </div>
    )}
  </div>
);

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
      <Icon className="w-5 h-5 text-gray-600" />
    </div>
    <div className="flex-1">
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900 font-semibold">
        {value || 'Ikke oppgitt'}
      </dd>
    </div>
  </div>
);