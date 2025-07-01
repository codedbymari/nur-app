//src/app/invite/[kode]/page.js

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { kode } = params;
  
  const [loading, setLoading] = useState(true);
  const [invitasjonStatus, setInvitasjonStatus] = useState(null);
  const [soknadData, setSoknadData] = useState(null);
  const [registrering, setRegistrering] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    epost: '',
    passord: '',
    bekreftPassord: '',
    utdanning: '',
    yrke: '',
    sivilstatus: 'ugift',
    ser_etter: 'ekteskap'
  });

  useEffect(() => {
    if (kode) {
      validerInvitasjon();
    }
  }, [kode]);

  const validerInvitasjon = async () => {
    try {
      // Sjekk om invitasjonskoden er gyldig
      const { data: invitasjon, error: invitasjonError } = await supabase
        .from('invitasjon')
        .select(`
          id,
          brukt,
          utloper_at,
          soknad:soknad_id (
            id,
            navn,
            alder,
            by,
            om_deg,
            verdier
          )
        `)
        .eq('kode', kode)
        .single();

      if (invitasjonError || !invitasjon) {
        setInvitasjonStatus('ugyldig');
        setLoading(false);
        return;
      }

      // Sjekk om invitasjonen er brukt
      if (invitasjon.brukt) {
        setInvitasjonStatus('brukt');
        setLoading(false);
        return;
      }

      // Sjekk om invitasjonen er utløpt
      if (invitasjon.utloper_at && new Date(invitasjon.utloper_at) < new Date()) {
        setInvitasjonStatus('utlopt');
        setLoading(false);
        return;
      }

      // Invitasjonen er gyldig
      setInvitasjonStatus('gyldig');
      setSoknadData(invitasjon.soknad);
      setFormData(prev => ({
        ...prev,
        epost: invitasjon.soknad.epost || ''
      }));
      
    } catch (error) {
      console.error('Feil ved validering:', error);
      setInvitasjonStatus('feil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegistrering = async (e) => {
    e.preventDefault();
    setRegistrering(true);
    setError('');

    // Valider passord
    if (formData.passord !== formData.bekreftPassord) {
      setError('Passordene stemmer ikke overens');
      setRegistrering(false);
      return;
    }

    if (formData.passord.length < 6) {
      setError('Passordet må være minst 6 tegn');
      setRegistrering(false);
      return;
    }

    try {
      // Opprett bruker i Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.epost,
        password: formData.passord,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user) {
        // Opprett brukerprofil
        const { error: profilError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            navn: soknadData.navn,
            alder: soknadData.alder,
            by: soknadData.by,
            om_meg: soknadData.om_deg,
            verdier: soknadData.verdier,
            utdanning: formData.utdanning,
            yrke: formData.yrke,
            sivilstatus: formData.sivilstatus,
            ser_etter: formData.ser_etter
          });

        if (profilError) {
          throw new Error('Feil ved opprettelse av profil');
        }

        // Marker invitasjonen som brukt
        const { error: invitasjonError } = await supabase
          .from('invitasjon')
          .update({ brukt: true })
          .eq('kode', kode);

        if (invitasjonError) {
          console.error('Feil ved oppdatering av invitasjon:', invitasjonError);
        }

        // Redirect til app
        router.push('/app');
      }

    } catch (error) {
      console.error('Registreringsfeil:', error);
      setError(error.message || 'Det oppstod en feil ved registrering');
    } finally {
      setRegistrering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#780000] mx-auto mb-4"></div>
          <p className="text-gray-600">Validerer invitasjon...</p>
        </div>
      </div>
    );
  }

  if (invitasjonStatus === 'ugyldig') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-[#780000] mb-4">Ugyldig invitasjon</h1>
            <p className="text-gray-600 mb-6">
              Denne invitasjonskoden er ikke gyldig. Kontroller at du har kopiert lenken riktig.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#780000] text-white px-6 py-3 rounded-lg hover:bg-[#C1121F] transition-colors"
            >
              Tilbake til forsiden
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (invitasjonStatus === 'brukt') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <div className="text-yellow-600 text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-[#780000] mb-4">Invitasjon allerede brukt</h1>
            <p className="text-gray-600 mb-6">
              Denne invitasjonen har allerede blitt brukt. Hver invitasjon kan kun brukes én gang.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#780000] text-white px-6 py-3 rounded-lg hover:bg-[#C1121F] transition-colors"
            >
              Tilbake til forsiden
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (invitasjonStatus === 'utlopt') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <div className="text-gray-600 text-6xl mb-4">⏰</div>
            <h1 className="text-2xl font-bold text-[#780000] mb-4">Invitasjon utløpt</h1>
            <p className="text-gray-600 mb-6">
              Denne invitasjonen har dessverre utløpt. Ta kontakt for å få en ny invitasjon.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#780000] text-white px-6 py-3 rounded-lg hover:bg-[#C1121F] transition-colors"
            >
              Tilbake til forsiden
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-[#780000]">NÜR</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#FDF0D5] rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-[#780000] mb-4">
              Velkommen, {soknadData?.navn}!
            </h1>
            <p className="text-gray-600">
              Din søknad har blitt godkjent. Fullfør registreringen din for å begynne å bruke NÜR.
            </p>
          </div>

          {/* Søknadsinformasjon */}
          <div className="bg-white rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#780000] mb-4">Din profil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Navn:</span>
                <span className="ml-2 text-gray-600">{soknadData?.navn}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Alder:</span>
                <span className="ml-2 text-gray-600">{soknadData?.alder} år</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">By:</span>
                <span className="ml-2 text-gray-600">{soknadData?.by}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Verdier:</span>
                <div className="mt-1">
                  {soknadData?.verdier?.map((verdi, index) => (
                    <span key={index} className="inline-block bg-[#780000] text-white text-xs px-2 py-1 rounded mr-2 mb-1">
                      {verdi}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Registreringsskjema */}
          <form onSubmit={handleRegistrering} className="space-y-6">
            <h2 className="text-xl font-semibold text-[#780000]">Fullfør registrering</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-post
                </label>
                <input
                  type="email"
                  name="epost"
                  value={formData.epost}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#780000] focus:border-[#780000]"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utdanning
                </label>
                <input
                  type="text"
                  name="utdanning"
                  value={formData.utdanning}
                  onChange={handleInputChange}
                  placeholder="F.eks. Bachelor i økonomi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#780000] focus:border-[#780000]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yrke
                </label>
                <input
                  type="text"
                  name="yrke"
                  value={formData.yrke}
                  onChange={handleInputChange}
                  placeholder="F.eks. Ingeniør"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#780000] focus:border-[#780000]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sivilstatus
                </label>
                <select
                  name="sivilstatus"
                  value={formData.sivilstatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#780000] focus:border-[#780000]"
                >
                  <option value="ugift">Ugift</option>
                  <option value="skilt">Skilt</option>
                  <option value="enke">Enke/enkemann</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ser etter
                </label>
                <select
                  name="ser_etter"
                  value={formData.ser_etter}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#780000] focus:border-[#780000]"
                >
                  <option value="ekteskap">Ekteskap</option>
                  <option value="vennskap">Vennskap først</option>
                  <option value="begge">Begge deler</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passord
                </label>
                <input
                  type="password"
                  name="passord"
                  value={formData.passord}
                  onChange={handleInputChange}
                  required
                  minLength="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#780000] focus:border-[#780000]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bekreft passord
                </label>
                <input
                  type="password"
                  name="bekreftPassord"
                  value={formData.bekreftPassord}
                  onChange={handleInputChange}
                  required
                  minLength="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#780000] focus:border-[#780000]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={registrering}
              className="w-full bg-[#780000] text-white py-3 px-4 rounded-lg hover:bg-[#C1121F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registrering ? 'Registrerer...' : 'Fullfør registrering'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
