// app/app/matches/page.js
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { MatchCard } from '../../../components/app/MatchCard';
import { hentDagensMatches, registrerInteresse, hentMatchStatistikk } from '../../../lib/matching';
import { Button } from '../../../components/ui/Button';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!currentUser) {
        setError('Du må være innlogget for å se matcher');
        return;
      }

      setUser(currentUser);

      // Sjekk om bruker har en profil
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setError('Du må opprette en profil først');
          return;
        }
        throw profileError;
      }

      if (!userProfile.aktiv) {
        setError('Profilen din er ikke aktiv. Kontakt support for hjelp.');
        return;
      }

      // Hent dagens matcher ved hjelp av matching-algoritmen
      const todaysMatches = await hentDagensMatches(currentUser.id);
      
      // Transformer data for MatchCard komponenten
      const formattedMatches = todaysMatches.map(match => {
        const otherUser = match.profiles || match;
        return {
          id: match.id,
          bruker_id: match.bruker2_id,
          navn: otherUser.navn,
          alder: otherUser.alder,
          by: otherUser.by,
          verdier: otherUser.verdier,
          interesser: otherUser.interesser,
          beskrivelse: otherUser.beskrivelse,
          kompatibilitet_score: Math.round((match.match_score || 0) * 100),
          match_dato: match.match_dato,
          interesse_status: getInteresseStatus(match, currentUser.id)
        };
      });

      setMatches(formattedMatches);

      // Hent brukerstatistikk
      const userStats = await hentMatchStatistikk(currentUser.id);
      setStats(userStats);

    } catch (error) {
      console.error('Feil ved lasting av matcher:', error);
      setError('Noe gikk galt ved lasting av matcher. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const getInteresseStatus = (match, userId) => {
    const erBruker1 = match.bruker1_id === userId;
    const minInteresse = erBruker1 ? match.interesse_bruker1 : match.interesse_bruker2;
    const motpartInteresse = erBruker1 ? match.interesse_bruker2 : match.interesse_bruker1;
    
    if (match.mutual_match) return 'mutual';
    if (minInteresse === true) return 'sendt';
    if (minInteresse === false) return 'pass';
    return 'venter';
  };

  const handleInteresse = async (matchId, brukerId) => {
    try {
      // Finn match-objektet
      const match = matches.find(m => m.bruker_id === brukerId);
      if (!match) return;

      // Registrer interesse via matching-biblioteket
      const updatedMatch = await registrerInteresse(match.id, user.id, true);
      
      // Oppdater lokal state
      setMatches(prev => prev.map(m => 
        m.bruker_id === brukerId 
          ? { ...m, interesse_status: updatedMatch.mutual_match ? 'mutual' : 'sendt' }
          : m
      ));

      // Hvis mutual match, vis melding
      if (updatedMatch.mutual_match) {
        // Du kan legge til en toast/modal her
        console.log('🎉 Mutual match!');
      }

    } catch (error) {
      console.error('Feil ved sending av interesse:', error);
      setError('Kunne ikke sende interesse. Prøv igjen.');
    }
  };

  const handlePass = async (matchId, brukerId) => {
    try {
      // Finn match-objektet
      const match = matches.find(m => m.bruker_id === brukerId);
      if (!match) return;

      // Registrer pass via matching-biblioteket
      await registrerInteresse(match.id, user.id, false);
      
      // Fjern fra lokal state
      setMatches(prev => prev.filter(m => m.bruker_id !== brukerId));

    } catch (error) {
      console.error('Feil ved pass:', error);
      setError('Kunne ikke registrere pass. Prøv igjen.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😔</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Oops! Noe gikk galt
        </h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="space-x-4">
          <Button onClick={fetchMatches}>Prøv igjen</Button>
          {error.includes('profil') && (
            <Link href="/app/profil">
              <Button variant="outline">Opprett profil</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dagens matcher
        </h1>
        <p className="text-gray-600">
          Utvalgte profiler basert på dine verdier og interesser
        </p>
        
        {/* Vis statistikk hvis tilgjengelig */}
        {stats && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Totale matcher: <strong>{stats.totalMatches}</strong></span>
              <span>Gjensidige matcher: <strong>{stats.mutualMatches}</strong></span>
              <span>Venter svar: <strong>{stats.ventende}</strong></span>
              <span>Suksessrate: <strong>{stats.successRate}%</strong></span>
            </div>
          </div>
        )}
      </div>

      {matches.length > 0 ? (
        <div className="space-y-6">
          {matches.map((match) => (
            <MatchCard
              key={match.bruker_id}
              match={match}
              onInteresse={() => handleInteresse(match.id, match.bruker_id)}
              onPass={() => handlePass(match.id, match.bruker_id)}
              disabled={match.interesse_status !== 'venter'}
              status={match.interesse_status}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💕</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ingen nye matcher i dag
          </h3>
          <p className="text-gray-600 mb-6">
            Kom tilbake i morgen for nye forslag, eller oppdater profilen din
            for å få bedre matcher.
          </p>
          <div className="space-x-4">
            <Link href="/app/profil">
              <Button>Oppdater profil</Button>
            </Link>
            <Button variant="outline" onClick={fetchMatches}>
              Oppdater matcher
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}