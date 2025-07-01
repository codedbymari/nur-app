// app/status/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function StatusPage() {
  const router = useRouter();
  const [epost, setEpost] = useState('');
  const [loading, setLoading] = useState(false);
  const [soknadData, setSoknadData] = useState(null);
  const [error, setError] = useState('');
  const [soknad, setSoknad] = useState(null);

  const handleSok = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSoknadData(null);

    if (!epost.trim()) {
      setError('Vennligst skriv inn e-post');
      setLoading(false);
      return;
    }

    try {
      const { data, error: sokError } = await supabase
        .from('soknad')
        .select('*')
        .eq('epost', epost.toLowerCase().trim())
        .single();

      if (sokError || !data) {
        setError('Ingen søknad funnet med denne e-posten');
        setLoading(false);
        return;
      }

      setSoknadData(data);
      setSoknad(data);

    } catch (error) {
      console.error('Feil ved søk:', error);
      setError('Det oppstod en feil. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'venter':
        return {
          icon: '⏳',
          tittel: 'Under behandling',
          beskrivelse: 'Din søknad er mottatt og blir nå vurdert av vårt team.',
          farge: 'yellow',
          bgFarge: 'bg-yellow-50',
          borderFarge: 'border-yellow-200',
          tekstFarge: 'text-yellow-800'
        };
      case 'godkjent':
        return {
          icon: '✅',
          tittel: 'Godkjent',
          beskrivelse: 'Gratulerer! Din søknad er godkjent. Du vil motta en invitasjon på e-post snart.',
          farge: 'green',
          bgFarge: 'bg-green-50',
          borderFarge: 'border-green-200',
          tekstFarge: 'text-green-800'
        };
      case 'avslatt':
        return {
          icon: '❌',
          tittel: 'Ikke godkjent',
          beskrivelse: 'Din søknad er dessverre ikke godkjent denne gangen. Du kan søke på nytt om 6 måneder.',
          farge: 'red',
          bgFarge: 'bg-red-50',
          borderFarge: 'border-red-200',
          tekstFarge: 'text-red-800'
        };
      default:
        return {
          icon: '❓',
          tittel: 'Ukjent status',
          beskrivelse: 'Status ukjent',
          farge: 'gray',
          bgFarge: 'bg-gray-50',
          borderFarge: 'border-gray-200',
          tekstFarge: 'text-gray-800'
        };
    }
  };

  const formatDato = (dateString) => {
    const dato = new Date(dateString);
    return dato.toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const beregnDagerSiden = (dateString) => {
    const soknadDato = new Date(dateString);
    const iDag = new Date();
    const forskjell = iDag - soknadDato;
    const dager = Math.floor(forskjell / (1000 * 60 * 60 * 24));
    return dager;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="text-2xl font-bold text-[#780000] hover:text-[#C1121F] transition-colors"
            >
              NÜR
            </button>
            <button
              onClick={() => router.push('/soknad')}
              className="text-sm text-[#780000] hover:text-[#C1121F] font-medium"
            >
              Ny søknad →
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#780000] mb-4">
            Sjekk søknadsstatus
          </h1>
          <p className="text-gray-600">
            Skriv inn e-posten du brukte da du søkte for å se status på søknaden din.
          </p>
        </div>

        {/* Søkeskjema */}
        <div className="bg-[#FDF0D5] rounded-lg p-8 mb-8">
          <form onSubmit={handleSok} className="space-y-6">
            <div>
              <label htmlFor="epost" className="block text-sm font-medium text-gray-700 mb-2">
                E-post
              </label>
              <input
                type="email"
                id="epost"
                name="epost"
                value={epost}
                onChange={(e) => setEpost(e.target.value)}
                placeholder="din@epost.no"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#780000] focus:border-[#780000]"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#780000] text-white py-3 px-4 rounded-lg hover:bg-[#C1121F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Søker...
                </>
              ) : (
                'Sjekk status'
              )}
            </button>
          </form>
        </div>

        {/* Søknadsresultat */}
        {soknadData && (
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            {(() => {
              const statusInfo = getStatusInfo(soknadData.status);
              return (
                <div className={`${statusInfo.bgFarge} ${statusInfo.borderFarge} border rounded-lg p-6 mb-6`}>
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-4">{statusInfo.icon}</span>
                    <div>
                      <h2 className={`text-2xl font-bold ${statusInfo.tekstFarge}`}>
                        {statusInfo.tittel}
                      </h2>
                      <p className={`${statusInfo.tekstFarge} opacity-80`}>
                        {statusInfo.beskrivelse}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Søknadsinformasjon */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#780000] mb-4">
                  Søknadsinformasjon
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">Navn</span>
                    <p className="text-gray-800 font-medium">{soknadData.navn}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">Alder</span>
                    <p className="text-gray-800 font-medium">{soknadData.alder} år</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">By</span>
                    <p className="text-gray-800 font-medium">{soknadData.by}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">Søknad sendt</span>
                    <p className="text-gray-800 font-medium">
                      {formatDato(soknadData.created_at)}
                    </p>
                    <p className="text-sm text-gray-500">
                      ({beregnDagerSiden(soknadData.created_at)} {beregnDagerSiden(soknadData.created_at) === 1 ? 'dag' : 'dager'} siden)
                    </p>
                  </div>
                </div>
              </div>

              {/* Verdier */}
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-2">Verdier</span>
                <div className="flex flex-wrap gap-2">
                  {soknadData.verdier?.map((verdi, index) => (
                    <span
                      key={index}
                      className="bg-[#780000] text-white text-sm px-3 py-1 rounded-full"
                    >
                      {verdi}
                    </span>
                  ))}
                </div>
              </div>

              {/* Om deg */}
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-2">Om deg</span>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">{soknadData.om_deg}</p>
                </div>
              </div>

              {/* Admin notater (hvis tilgjengelig) */}
              {soknadData.admin_notater && (
                <div>
                  <span className="text-sm font-medium text-gray-500 block mb-2">Tilbakemelding</span>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-blue-800 whitespace-pre-wrap">{soknadData.admin_notater}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Handlinger basert på status */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              {soknadData.status === 'venter' && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Vi behandler søknader i den rekkefølgen de kommer inn. 
                    Gjennomsnittlig behandlingstid er 3-5 virkedager.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-[#780000] hover:text-[#C1121F] font-medium"
                  >
                    Oppdater status
                  </button>
                </div>
              )}

              {soknadData.status === 'godkjent' && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Sjekk e-posten din for invitasjonslenke. Har du ikke mottatt den?
                  </p>
                  <div className="space-x-4">
                    <button
                      onClick={() => window.location.href = 'mailto:hjelp@nur.no?subject=Mangler invitasjon'}
                      className="bg-[#780000] text-white px-6 py-2 rounded-lg hover:bg-[#C1121F] transition-colors"
                    >
                      Kontakt oss
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-[#780000] hover:text-[#C1121F] font-medium"
                    >
                      Oppdater status
                    </button>
                  </div>
                </div>
              )}

              {soknadData.status === 'avslatt' && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Du kan sende inn en ny søknad om 6 måneder. 
                    Vi oppmuntrer deg til å forbedre profilen din i mellomtiden.
                  </p>
                  <button
                    onClick={() => router.push('/')}
                    className="text-[#780000] hover:text-[#C1121F] font-medium"
                  >
                    Tilbake til forsiden
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hjelp-seksjon */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-[#780000] mb-4">
            Trenger du hjelp?
          </h3>
          <p className="text-gray-600 mb-4">
            Har du spørsmål om søknaden din eller trenger teknisk støtte?
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = 'mailto:hjelp@nur.no?subject=Spørsmål om søknad'}
              className="bg-[#780000] text-white px-6 py-2 rounded-lg hover:bg-[#C1121F] transition-colors"
            >
              Send e-post
            </button>
            <button
              onClick={() => router.push('/')}
              className="text-[#780000] hover:text-[#C1121F] font-medium"
            >
              Tilbake til forsiden
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

