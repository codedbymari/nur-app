'use client';

import { useState, useCallback } from 'react';
import { 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  Briefcase, 
  Home, 
  Check, 
  X, 
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Heart
} from 'lucide-react';

const SoknadCard = ({ soknad, onUpdateStatus, formatDato }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoized status update handler
  const handleStatusUpdate = useCallback(async (newStatus) => {
    if (!onUpdateStatus || typeof onUpdateStatus !== 'function') {
      console.error('onUpdateStatus is not available or not a function');
      alert('Feil: Kan ikke oppdatere status - funksjon er ikke tilgjengelig');
      return;
    }

    if (!soknad?.id) {
      console.error('Missing soknad ID');
      return;
    }

    setIsUpdating(true);
    
    try {
      await onUpdateStatus(soknad.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Feil ved oppdatering av status: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  }, [onUpdateStatus, soknad?.id]);

  // Status configuration
  const statusConfig = {
    pending: {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      text: 'Venter på behandling',
      icon: Clock,
      dotColor: 'bg-orange-500'
    },
    godkjent: {
      color: 'bg-green-100 text-green-800 border-green-200',
      text: 'Godkjent',
      icon: Check,
      dotColor: 'bg-green-500'
    },
    avslatt: {
      color: 'bg-red-100 text-red-800 border-red-200',
      text: 'Avslått',
      icon: X,
      dotColor: 'bg-red-500'
    }
  };

  // Safe date formatter
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Ikke tilgjengelig';
    
    if (formatDato && typeof formatDato === 'function') {
      try {
        return formatDato(dateString);
      } catch (error) {
        console.warn('Date formatting failed:', error);
      }
    }
    
    try {
      return new Date(dateString).toLocaleDateString('nb-NO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }, [formatDato]);

  // Early return for invalid data
  if (!soknad) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
        <div className="flex items-center text-red-700">
          <X className="w-5 h-5 mr-2" />
          <span className="font-medium">Feil: Manglende søknadsdata</span>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[soknad.status] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;
  const canUpdate = soknad.status === 'pending' && !isUpdating;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header - Always Visible */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#780000] to-[#C1121F] rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {soknad.navn || 'Navn ikke oppgitt'}
                </h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <Mail className="w-4 h-4 mr-1" />
                  <span>{soknad.epost || 'E-post ikke oppgitt'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`px-4 py-2 rounded-xl border text-sm font-semibold ${currentStatus.color}`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${currentStatus.dotColor}`}></div>
              <StatusIcon className="w-4 h-4" />
              <span>{currentStatus.text}</span>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <QuickInfoItem icon={Calendar} label="Søkte" value={formatDate(soknad.created_at)} />
          <QuickInfoItem icon={Phone} label="Telefon" value={soknad.telefon} />
          <QuickInfoItem icon={User} label="Alder" value={soknad.alder} />
          <QuickInfoItem icon={Home} label="Bosted" value={soknad.bosted} />
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
          ? 'max-h-[1000px] opacity-100' 
          : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-6 pb-6">
          <div className="border-t border-gray-100 pt-6">
            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <DetailItem icon={User} label="Kjønn" value={soknad.kjonn} />
              <DetailItem icon={Briefcase} label="Yrke" value={soknad.yrke} />
            </div>

            {/* Long Text Sections */}
            {soknad.om_deg && (
              <TextSection 
                title="Om deg" 
                content={soknad.om_deg} 
                icon={FileText}
              />
            )}
            
            {soknad.hvorfor_nur && (
              <TextSection 
                title="Hvorfor NÜR" 
                content={soknad.hvorfor_nur} 
                icon={Heart}
              />
            )}
          </div>
        </div>
      </div>

      {/* Actions - Always at Bottom */}
      {canUpdate && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex space-x-3">
            <ActionButton
              onClick={() => handleStatusUpdate('godkjent')}
              variant="success"
              disabled={isUpdating}
              icon={Check}
            >
              Godkjenn søknad
            </ActionButton>
            <ActionButton
              onClick={() => handleStatusUpdate('avslatt')}
              variant="danger"
              disabled={isUpdating}
              icon={X}
            >
              Avslå søknad
            </ActionButton>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isUpdating && (
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center text-blue-700">
            <div className="animate-spin mr-2">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Oppdaterer status...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const QuickInfoItem = ({ icon: Icon, label, value }) => (
  <div className="text-center">
    <div className="flex items-center justify-center mb-1">
      <Icon className="w-4 h-4 text-gray-500" />
    </div>
    <div className="text-xs text-gray-500 font-medium">{label}</div>
    <div className="text-sm text-gray-900 font-semibold truncate">
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

const TextSection = ({ title, content, icon: Icon }) => (
  <div className="mb-6">
    <div className="flex items-center space-x-2 mb-3">
      <div className="w-8 h-8 bg-[#780000] rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h4 className="font-semibold text-gray-900">{title}</h4>
    </div>
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    </div>
  </div>
);

const ActionButton = ({ onClick, variant, disabled, icon: Icon, children }) => {
  const baseClasses = "flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex-1";
  
  const variantClasses = {
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300 shadow-lg hover:shadow-xl",
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

export default SoknadCard;