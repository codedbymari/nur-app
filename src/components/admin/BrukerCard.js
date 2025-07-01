// src/components/admin/BrukerCard.js
'use client';

export default function BrukerCard({ bruker, formatDato }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'aktiv': return 'bg-green-100 text-green-800';
      case 'inaktiv': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-[#FDF0D5] p-6 rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#780000]">{bruker.navn}</h3>
          <p className="text-gray-600">{bruker.epost}</p>
          <p className="text-sm text-gray-500">Registrert: {formatDato(bruker.created_at)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bruker.status)}`}>
          {bruker.status}
        </span>
      </div>

      <div className="space-y-2">
        <div><strong>Telefon:</strong> {bruker.telefon}</div>
        <div><strong>Alder:</strong> {bruker.alder}</div>
        <div><strong>Kjønn:</strong> {bruker.kjonn}</div>
        <div><strong>Yrke:</strong> {bruker.yrke}</div>
        <div><strong>Bosted:</strong> {bruker.bosted}</div>
        {bruker.sist_aktiv && (
          <div><strong>Sist aktiv:</strong> {formatDato(bruker.sist_aktiv)}</div>
        )}
      </div>
    </div>
  );
}