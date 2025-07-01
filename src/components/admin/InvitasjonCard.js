
// src/components/admin/InvitasjonCard.js
'use client';

export default function InvitasjonCard({ 
  invitasjon, 
  formatDato, 
  erUtlopt, 
  onCopyCode, 
  onDelete 
}) {
  return (
    <div className="bg-[#FDF0D5] p-6 rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#780000]">
            Kode: {invitasjon.kode}
          </h3>
          {invitasjon.soknad && (
            <p className="text-gray-600">
              For: {invitasjon.soknad.navn} ({invitasjon.soknad.epost})
            </p>
          )}
          <p className="text-sm text-gray-500">
            Opprettet: {formatDato(invitasjon.created_at)}
          </p>
        </div>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            invitasjon.brukt 
              ? 'bg-blue-100 text-blue-800' 
              : erUtlopt(invitasjon.utloper_dato)
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
          }`}>
            {invitasjon.brukt 
              ? 'Brukt' 
              : erUtlopt(invitasjon.utloper_dato)
                ? 'Utløpt'
                : 'Aktiv'
            }
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div><strong>Utløper:</strong> {formatDato(invitasjon.utloper_dato)}</div>
        {invitasjon.message && (
          <div><strong>Melding:</strong> {invitasjon.message}</div>
        )}
        {invitasjon.brukt_dato && (
          <div><strong>Brukt dato:</strong> {formatDato(invitasjon.brukt_dato)}</div>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onCopyCode(invitasjon.kode)}
          className="bg-[#780000] text-white px-4 py-2 rounded hover:bg-[#C1121F] transition-colors"
        >
          Kopier lenke
        </button>
        <button
          onClick={() => onDelete(invitasjon.id)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Slett
        </button>
      </div>
    </div>
  );
}
