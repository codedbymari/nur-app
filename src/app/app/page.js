// app/app/page.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    nye_matcher: 0,
    uleste_meldinger: 0,
    kommende_events: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Hent statistikk
      const [matcherRes, meldingerRes, eventsRes] = await Promise.all([
        supabase
          .from('matcher')
          .select('id')
          .eq('bruker_id', user.id)
          .eq('status', 'ny'),
        supabase
          .from('meldinger')
          .select('id')
          .eq('mottaker_id', user.id)
          .eq('lest', false),
        supabase
          .from('event_deltakelser')
          .select('event:events(*)')
          .eq('bruker_id', user.id)
          .gte('event.dato', new Date().toISOString())
      ]);

      setStats({
        nye_matcher: matcherRes.data?.length || 0,
        uleste_meldinger: meldingerRes.data?.length || 0,
        kommende_events: eventsRes.data?.length || 0
      });

      // Hent recent activity (forenkling)
      const { data: aktivitet } = await supabase
        .from('matcher')
        .select('*, profil:profiler(*)')
        .eq('bruker_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(aktivitet || []);
    } catch (error) {
      console.error('Feil ved lasting av dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Velkommen */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Velkommen til NÜR
        </h1>
        <p className="text-gray-600">
          Oversikt over dine matcher, meldinger og aktiviteter
        </p>
      </div>

      {/* Statistikk kort */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-semibold">💚</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nye matcher</p>
              <p className="text-2xl font-bold text-gray-900">{stats.nye_matcher}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/app/matches">
              <Button size="sm" className="w-full">
                Se matcher
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">💬</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Uleste meldinger</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uleste_meldinger}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/app/chat">
              <Button size="sm" variant="outline" className="w-full">
                Åpne chat
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kommende events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.kommende_events}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/app/events">
              <Button size="sm" variant="outline" className="w-full">
                Se events
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Rask tilgang */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rask tilgang
          </h3>
          <div className="space-y-3">
            <Link href="/app/profil" className="block">
              <Button variant="outline" className="w-full justify-start">
                👤 Rediger profil
              </Button>
            </Link>
            <Link href="/app/matches" className="block">
              <Button variant="outline" className="w-full justify-start">
                💕 Se dagens matcher
              </Button>
            </Link>
            <Link href="/app/events" className="block">
              <Button variant="outline" className="w-full justify-start">
                🎉 Kommende events
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Siste aktivitet
          </h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((aktivitet) => (
                <div key={aktivitet.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">
                      Ny match: {aktivitet.profil?.fornavn}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(aktivitet.created_at).toLocaleDateString('nb-NO')}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    aktivitet.status === 'match' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Ingen aktivitet ennå
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Tips sektion */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          💡 Tips for å få flere matcher
        </h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Fyll ut profilen din fullstendig</li>
          <li>• Vær spesifikk om dine verdier og interesser</li>
          <li>• Sjekk inn daglig for nye matcher</li>
          <li>• Delta på community events</li>
        </ul>
      </Card>
    </div>
  );
}
