'use client';

import { useState } from 'react';
import { 
  X, 
  Send, 
  User, 
  MessageSquare, 
  Check,
  UserCheck,
  Mail
} from 'lucide-react';

export default function CreateInvitationForm({ 
  soknader, 
  onSubmit, 
  onCancel 
}) {
  const [form, setForm] = useState({
    soknad_id: '',
    custom_message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(form);
    } catch (error) {
      console.error('Error creating invitation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const godkjenteSoknader = soknader.filter(s => s.status === 'godkjent');
  const selectedSoknad = godkjenteSoknader.find(s => s.id === form.soknad_id);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#780000] to-[#C1121F] rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Opprett invitasjon
              </h3>
              <p className="text-sm text-gray-600">
                Send invitasjon til godkjent søker
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Lukk"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Søknad Selection */}
          <div className="mb-6">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900 mb-3">
              <User className="w-4 h-4 text-[#780000]" />
              <span>Velg søknad (valgfritt)</span>
            </label>
            
            <select
              value={form.soknad_id}
              onChange={(e) => setForm({...form, soknad_id: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#780000] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              <option value="">Generisk invitasjon (ingen spesifikk søker)</option>
              {godkjenteSoknader.map(soknad => (
                <option key={soknad.id} value={soknad.id}>
                  {soknad.navn} - {soknad.epost}
                </option>
              ))}
            </select>
            
            {/* Selected Applicant Preview */}
            {selectedSoknad && (
              <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      {selectedSoknad.navn}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-green-700">
                      <Mail className="w-3 h-3" />
                      <span>{selectedSoknad.epost}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              {godkjenteSoknader.length} godkjente søknader tilgjengelig
            </p>
          </div>

          {/* Custom Message */}
          <div className="mb-6">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900 mb-3">
              <MessageSquare className="w-4 h-4 text-[#780000]" />
              <span>Tilpasset melding</span>
            </label>
            
            <textarea
              value={form.custom_message}
              onChange={(e) => setForm({...form, custom_message: e.target.value})}
              placeholder="Velkommen til NÜR! Vi ser frem til å hjelpe deg med å finne din perfekte match basert på islamske verdier og kompatibilitet."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#780000] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
              rows={4}
            />
            
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Personlig melding som sendes med invitasjonen
              </p>
              <span className="text-xs text-gray-400">
                {form.custom_message.length}/500
              </span>
            </div>
          </div>

          {/* Summary Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Invitasjonssammendrag
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Type: {selectedSoknad ? 'Personlig invitasjon' : 'Generisk invitasjon'}</li>
              <li>• Mottaker: {selectedSoknad ? selectedSoknad.navn : 'Åpen for alle'}</li>
              <li>• Utløper: 30 dager fra nå</li>
              <li>• Melding: {form.custom_message ? 'Tilpasset melding inkludert' : 'Standard melding'}</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center space-x-2 bg-[#780000] text-white py-3 px-6 rounded-xl hover:bg-[#C1121F] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Oppretter...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Opprett invitasjon</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>Avbryt</span>
            </button>
          </div>
        </form>
        
        {/* Footer Info */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <p className="text-xs text-gray-600 text-center">
            Invitasjonslenken vil være gyldig i 30 dager og kan kun brukes én gang.
          </p>
        </div>
      </div>
    </div>
  );
}