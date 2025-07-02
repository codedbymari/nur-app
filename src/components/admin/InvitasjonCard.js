'use client';

import { 
  Copy, 
  Trash2, 
  Calendar, 
  Clock,
  Check,
  X,
  Send,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';

export default function InvitasjonCard({ 
  invitasjon, 
  formatDato, 
  erUtlopt, 
  onCopyCode, 
  onDelete 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Status configuration
  const getStatusConfig = () => {
    if (invitasjon.brukt) {
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Brukt',
        icon: Check,
        dotColor: 'bg-blue-500'
      };
    }
    
    if (erUtlopt(invitasjon.utloper_dato)) {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Utløpt',
        icon: X,
        dotColor: 'bg-red-500'
      };
    }
    
    return {
      color: 'bg-green-100 text-green-800 border-green-200',
      text: 'Aktiv',
      icon: Check,
      dotColor: 'bg-green-500'
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const isActive = !invitasjon.brukt && !erUtlopt(invitasjon.utloper_dato);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header - Always Visible */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#780000] to-[#C1121F] rounded-xl flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Kode: {invitasjon.kode}
              </h3>
              {invitasjon.soknad && (
                <div className="flex items-center text-gray-600 text-sm">
                  <User className="w-4 h-4 mr-1" />
                  <span>{invitasjon.soknad.navn} ({invitasjon.soknad.epost})</span>
                </div>
              )}
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
        <div className="grid grid-cols-2 gap-4 mb-4">
          <QuickInfoItem 
            icon={Calendar} 
            label="Opprettet" 
            value={formatDato(invitasjon.created_at)} 
          />
          <QuickInfoItem 
            icon={Clock} 
            label="Utløper" 
            value={formatDato(invitasjon.utloper_dato)}
            isUrgent={!invitasjon.brukt && erUtlopt(invitasjon.utloper_dato)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mb-4">
          <ActionButton
            onClick={() => onCopyCode(invitasjon.kode)}
            variant="primary"
            icon={Copy}
            disabled={!isActive}
          >
            Kopier lenke
          </ActionButton>
          <ActionButton
            onClick={() => onDelete(invitasjon.id)}
            variant="danger"
            icon={Trash2}
          >
            Slett
          </ActionButton>
        </div>

        {/* Expand/Collapse Button - Only show if there's additional info */}
        {(invitasjon.message || invitasjon.brukt_dato) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center space-x-2 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors duration-200"
          >
            <span className="text-sm font-medium">
              {isExpanded ? 'Skjul detaljer' : 'Vis flere detaljer'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Expandable Content */}
      {(invitasjon.message || invitasjon.brukt_dato) && (
        <div className={`transition-all duration-500 ease-in-out ${
          isExpanded 
            ? 'max-h-[500px] opacity-100' 
            : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="px-6 pb-6">
            <div className="border-t border-gray-100 pt-6 space-y-4">
              {/* Message */}
              {invitasjon.message && (
                <DetailSection 
                  title="Melding" 
                  content={invitasjon.message} 
                  icon={MessageSquare}
                />
              )}
              
              {/* Usage Date */}
              {invitasjon.brukt_dato && (
                <DetailItem 
                  icon={Check} 
                  label="Brukt dato" 
                  value={formatDato(invitasjon.brukt_dato)} 
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
const QuickInfoItem = ({ icon: Icon, label, value, isUrgent = false }) => (
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

const DetailSection = ({ title, content, icon: Icon }) => (
  <div>
    <div className="flex items-center space-x-2 mb-3">
      <div className="w-8 h-8 bg-[#780000] rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h4 className="font-semibold text-gray-900">{title}</h4>
    </div>
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <p className="text-gray-700 leading-relaxed">
        {content}
      </p>
    </div>
  </div>
);

const ActionButton = ({ onClick, variant, disabled, icon: Icon, children }) => {
  const baseClasses = "flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex-1";
  
  const variantClasses = {
    primary: "bg-[#780000] text-white hover:bg-[#C1121F] focus:ring-[#780000] disabled:bg-gray-300 disabled:text-gray-500 shadow-lg hover:shadow-xl",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300 shadow-lg hover:shadow-xl"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
      aria-label={children}
    >
      <Icon className="w-4 h-4 mr-2" />
      {children}
    </button>
  );
};