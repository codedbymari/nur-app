// app/app/matches/page.js
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { MatchCard } from '../../../components/app/MatchCard';
import { calculateCompatibility } from '../../../lib/matching';
import { Button } from '../../../components/ui/Button';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      setUser(currentUser);

      // Hent brukerens profil
      const { data: userProfile } = await supabase
        .from('profiler')
        .select('*')
        .eq('bruker_id', currentUser.id)
        .single();

      if (!userProfile) return;

      // Hent potensielle matcher (andre godkjente profiler)
      const { data: potentialMatches } = await supabase
        .from('profiler')
        .select('*')
        .neq('bruker_id', currentUser.id);

      if (!potentialMatches) return;

      // Beregn kompatibilitet for hver match
      const matchesWithCompatibility = potentialMatches.map(match => ({
        ...match,
        kompatibilitet_score: calculateCompatibility(userProfile, match),
        felles_interesser: findCommonInterests(userProfile, match)
      }));

      // Sorter etter kompatibilitet
      const sortedMatches = matchesWithCompatibility
        .filter(match => match.kompatibilitet_score >= 60) // Minimum 60% kompatibilitet
        .sort((a, b) => b.kompatibilitet_score - a.kompatibilitet_score)
        .slice(0, 5); // Maksimum 5 matcher per dag

      setMatches(sortedMatches);
    } catch (error) {
      console.error('Feil ved lasting av matcher:', error);
    } finally {
      setLoading(false);
    }
  };

  const findCommonInterests = (user, match) => {
    const userInterests = user.interesser?.toLowerCase().split(',') || [];
    const matchInterests = match.interesser?.toLowerCase().split(',') || [];
    
    return userInterests.filter(interest => 
      matchInterests.some(matchInterest => 
        matchInterest.trim().includes(interest.trim()) || 
        interest.trim().includes(matchInterest.trim())
      )
    );
  };

  const handleInteresse = async (matchId) => {
    try {
      const { error } = await supabase
        .from('matcher')
        .insert({
          bruker_id: user.id,
          match_bruker_id: matchId,
          status: 'interesse',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Fjern fra lista
      setMatches(prev => prev.filter(match => match.bruker_id !== matchId));
      
      // Sjekk om det er gjensidig interesse
      const { data: mutualInterest } = await supabase
        .from('matcher')
        .select('*')
        .eq('bruker_id', matchId)
        .eq('match_bruker_id', user.id)
        .eq('status', 'interesse')
        .single();

      if (mutualInterest) {
        // Opprett chat
        await supabase
          .from('chats')
          .insert({
            bruker1_id: user.id,
            bruker2_id: matchId,
            created_at: new Date().toISOString()
          });

        // Oppdater begge matcher til 'match'
        await supabase
          .from('matcher')
          .update({ status: 'match' })
          .in('id', [mutualInterest.id]);
      }
    } catch (error) {
      console.error('Feil ved sending av interesse:', error);
    }
  };

  const handlePass = async (matchId) => {
    try {
      const { error } = await supabase
        .from('matcher')
        .insert({
          bruker_id: user.id,
          match_bruker_id: matchId,
          status: 'pass',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Fjern fra lista
      setMatches(prev => prev.filter(match => match.bruker_id !== matchId));
    } catch (error) {
      console.error('Feil ved pass:', error);
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dagens matcher
        </h1>
        <p className="text-gray-600">
          Utvalgte profiler basert på dine verdier og interesser
        </p>
      </div>

      {matches.length > 0 ? (
        <div className="space-y-6">
          {matches.map((match) => (
            <MatchCard
              key={match.bruker_id}
              match={match}
              onInteresse={handleInteresse}
              onPass={handlePass}
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
          <Link href="/app/profil">
            <Button>Oppdater profil</Button>
          </Link>
        </div>
      )}
    </div>
  );
}