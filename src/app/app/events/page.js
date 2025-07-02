// src/app/app/events/page.js
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';


export default function EventsPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState('alle');
  const [userEventRegistrations, setUserEventRegistrations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadEvents();
      loadUserProfile();
      loadUserRegistrations();
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/');
        return;
      }
      
      setUser(user);
    } catch (error) {
      console.error('Feil ved sjekk av bruker:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('brukere')
        .select('*')
        .eq('id', user.id,)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Feil ved lasting av profil:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_registrations (
            id,
            user_id
          )
        `)
        .eq('aktiv', true)
        .gte('dato', new Date().toISOString())
        .order('dato', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Feil ved lasting av events:', error);
    }
  };

  const loadUserRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserEventRegistrations(data?.map(reg => reg.event_id) || []);
    } catch (error) {
      console.error('Feil ved lasting av påmeldinger:', error);
    }
  };

  const meldPaaEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
          navn: profile.navn,
          epost: user.email
        });

      if (error) throw error;
      
      await loadEvents();
      await loadUserRegistrations();
      alert('Du er nå påmeldt eventet!');
    } catch (error) {
      console.error('Feil ved påmelding:', error);
      if (error.code === '23505') {
        alert('Du er allerede påmeldt dette eventet.');
      } else {
        alert('Feil ved påmelding til event.');
      }
    }
  };

  const meldAvEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await loadEvents();
      await loadUserRegistrations();
      alert('Du er nå avmeldt eventet.');
    } catch (error) {
      console.error('Feil ved avmelding:', error);
      alert('Feil ved avmelding fra event.');
    }
  };

  const formatDato = (dateString) => {
    const dato = new Date(dateString);
    return {
      dag: dato.toLocaleDateString('nb-NO', { weekday: 'long' }),
      dato: dato.toLocaleDateString('nb-NO', { 
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      tid: dato.toLocaleTimeString('nb-NO', { 
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const erPaameldt = (eventId) => {
    return userEventRegistrations.includes(eventId);
  };

  const antallPaameldinger = (event) => {
    return event.event_registrations?.length || 0;
  };

  const kanMeldeSeg = (event) => {
    const paameldinger = antallPaameldinger(event);
    return !event.max_deltakere || paameldinger < event.max_deltakere;
  };

  const filtrerteEvents = events.filter(event => {
    if (filter === 'alle') return true;
    if (filter === 'digital') return event.type === 'digital';
    if (filter === 'fysisk') return event.type === 'fysisk';
    if (filter === 'paameldt') return erPaameldt(event.id);
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#780000] text-xl">Laster events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#780000] mb-2">Arrangementer</h1>
          <p className="text-gray-600">
            Delta på våre arrangementer og møt andre muslimske singler i et trygt miljø
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'alle', label: 'Alle arrangementer' },
              { id: 'digital', label: 'Digitale møter' },
              { id: 'fysisk', label: 'Fysiske møter' },
              { id: 'paameldt', label: 'Mine påmeldinger' }
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === filterOption.id
                    ? 'bg-[#780000] text-white'
                    : 'bg-[#FDF0D5] text-[#780000] hover:bg-[#780000] hover:text-white'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {filtrerteEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">
              {filter === 'paameldt' 
                ? 'Du er ikke påmeldt noen arrangementer ennå'
                : 'Ingen arrangementer funnet'
              }
            </div>
            <p className="text-gray-400">
              {filter === 'paameldt' 
                ? 'Meld deg på arrangementer for å møte andre!'
                : 'Sjekk tilbake senere for nye arrangementer'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrerteEvents.map((event) => {
              const datoInfo = formatDato(event.dato);
              const paameldt = erPaameldt(event.id);
              const paameldinger = antallPaameldinger(event);
              const kanMelde = kanMeldeSeg(event);

              return (
                <div key={event.id} className="bg-[#FDF0D5] rounded-lg p-6 hover:shadow-lg transition-shadow">
                  {/* Event Type Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.type === 'digital' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {event.type === 'digital' ? '📱 Digital' : '📍 Fysisk'}
                    </span>
                    {paameldt && (
                      <span className="bg-[#780000] text-white px-2 py-1 rounded-full text-xs font-medium">
                        Påmeldt
                      </span>
                    )}
                  </div>

                  {/* Event Title */}
                  <h3 className="text-xl font-bold text-[#780000] mb-2">
                    {event.tittel}
                  </h3>

                  {/* Event Date & Time */}
                  <div className="mb-3">
                    <div className="text-[#C1121F] font-semibold capitalize">
                      {datoInfo.dag}
                    </div>
                    <div className="text-gray-700">
                      {datoInfo.dato} kl. {datoInfo.tid}
                    </div>
                  </div>

                  {/* Location */}
                  {event.sted && (
                    <div className="mb-3">
                      <div className="text-gray-600">
                        📍 {event.sted}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {event.beskrivelse}
                  </p>

                  {/* Participants Info */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600">
                      {paameldinger} påmeldt
                      {event.max_deltakere && ` av ${event.max_deltakere} plasser`}
                    </div>
                    {event.max_deltakere && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-[#780000] h-2 rounded-full"
                          style={{ 
                            width: `${Math.min((paameldinger / event.max_deltakere) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="flex-1 bg-white text-[#780000] border border-[#780000] px-4 py-2 rounded-lg hover:bg-[#780000] hover:text-white transition-colors"
                    >
                      Les mer
                    </button>
                    
                    {paameldt ? (
                      <button
                        onClick={() => meldAvEvent(event.id)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Meld av
                      </button>
                    ) : (
                      <button
                        onClick={() => meldPaaEvent(event.id)}
                        disabled={!kanMelde}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                          kanMelde
                            ? 'bg-[#780000] text-white hover:bg-[#C1121F]'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {kanMelde ? 'Meld på' : 'Fullt'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedEvent.type === 'digital' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedEvent.type === 'digital' ? '📱 Digital' : '📍 Fysisk'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Event Title */}
                <h2 className="text-2xl font-bold text-[#780000] mb-4">
                  {selectedEvent.tittel}
                </h2>

                {/* Event Details */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-[#780000] mb-1">Dato og tid</h3>
                    <div className="text-gray-700">
                      {(() => {
                        const datoInfo = formatDato(selectedEvent.dato);
                        return `${datoInfo.dag}, ${datoInfo.dato} kl. ${datoInfo.tid}`;
                      })()}
                    </div>
                  </div>

                  {selectedEvent.sted && (
                    <div>
                      <h3 className="font-semibold text-[#780000] mb-1">Sted</h3>
                      <div className="text-gray-700">{selectedEvent.sted}</div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-[#780000] mb-1">Beskrivelse</h3>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {selectedEvent.beskrivelse}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#780000] mb-1">Deltakere</h3>
                    <div className="text-gray-700">
                      {antallPaameldinger(selectedEvent)} påmeldt
                      {selectedEvent.max_deltakere && ` av ${selectedEvent.max_deltakere} plasser`}
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Lukk
                  </button>
                  
                  {erPaameldt(selectedEvent.id) ? (
                    <button
                      onClick={() => {
                        meldAvEvent(selectedEvent.id);
                        setSelectedEvent(null);
                      }}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Meld av
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        meldPaaEvent(selectedEvent.id);
                        setSelectedEvent(null);
                      }}
                      disabled={!kanMeldeSeg(selectedEvent)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        kanMeldeSeg(selectedEvent)
                          ? 'bg-[#780000] text-white hover:bg-[#C1121F]'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {kanMeldeSeg(selectedEvent) ? 'Meld på' : 'Fullt'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}