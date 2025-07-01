// src/components/admin/SoknadCard.js
'use client';

export default function SoknadCard({ soknad, onUpdateStatus, formatDato }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'godkjent': return 'bg-green-100 text-green-800';
      case 'avslatt': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Venter';
      case 'godkjent': return 'Godkjent';
      case 'avslatt': return 'Avslått';
      default: return status;
    }
  };

  return (
    <div className="bg-[#FDF0D5] p-6 rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#780000]">{soknad.navn}</h3>
          <p className="text-gray-600">{soknad.epost}</p>
          <p className="text-sm text-gray-500">Søkte: {formatDato(soknad.created_at)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(soknad.status)}`}>
          {getStatusText(soknad.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div><strong>Telefon:</strong> {soknad.telefon}</div>
        <div><strong>Alder:</strong> {soknad.alder}</div>
        <div><strong>Kjønn:</strong> {soknad.kjonn}</div>
        <div><strong>Yrke:</strong> {soknad.yrke}</div>
        <div><strong>Bosted:</strong> {soknad.bosted}</div>
        
        {soknad.om_deg && (
          <div>
            <strong>Om deg:</strong>
            <p className="mt-1 text-gray-700 bg-white p-3 rounded border">
              {soknad.om_deg}
            </p>
          </div>
        )}
        
        {soknad.hvorfor_nur && (
          <div>
            <strong>Hvorfor NÜR:</strong>
            <p className="mt-1 text-gray-700 bg-white p-3 rounded border">
              {soknad.hvorfor_nur}
            </p>
          </div>
        )}
      </div>

      {soknad.status === 'pending' && (
        <div className="flex space-x-2">
          <button
            onClick={() => onUpdateStatus(soknad.id, 'godkjent')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Godkjenn
          </button>
          <button
            onClick={() => onUpdateStatus(soknad.id, 'avslatt')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Avslå
          </button>
        </div>
      )}
    </div>
  );
}
