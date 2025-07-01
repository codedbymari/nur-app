
// src/components/admin/CreateInvitationForm.js
'use client';

import { useState } from 'react';

export default function CreateInvitationForm({ 
  soknader, 
  onSubmit, 
  onCancel 
}) {
  const [form, setForm] = useState({
    soknad_id: '',
    custom_message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold text-[#780000] mb-4">
          Opprett manuell invitasjon
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Søknad (valgfritt)
            </label>
            <select
              value={form.soknad_id}
              onChange={(e) => setForm({...form, soknad_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#780000]"
            >
              <option value="">Velg søknad (eller la stå tom)</option>
              {soknader.filter(s => s.status === 'godkjent').map(soknad => (
                <option key={soknad.id} value={soknad.id}>
                  {soknad.navn} - {soknad.epost}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tilpasset melding
            </label>
            <textarea
              value={form.custom_message}
              onChange={(e) => setForm({...form, custom_message: e.target.value})}
              placeholder="Velkommen til NÜR!"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#780000]"
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-[#780000] text-white py-2 px-4 rounded-lg hover:bg-[#C1121F] transition-colors"
            >
              Opprett invitasjon
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Avbryt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}