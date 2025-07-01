
// components/app/EventCard.js
'use client';
import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatDate } from 'date-fns';
import { nb } from 'date-fns/locale';

export function EventCard({ event, onDelta, isRegistered }) {
  const [loading, setLoading] = useState(false);

  const handleRegistration = async () => {
    setLoading(true);
    try {
      await onDelta(event.id, !isRegistered);
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = new Date(event.dato) > new Date();
  const isFull = event.maks_deltakere && event.antall_pameldte >= event.maks_deltakere;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {event.tittel}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span>📅 {formatDate(new Date(event.dato), 'dd. MMMM yyyy', { locale: nb })}</span>
              <span>🕐 {event.tid}</span>
              {event.sted && <span>📍 {event.sted}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              event.type === 'online' 
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {event.type === 'online' ? 'Online' : 'Fysisk møte'}
            </div>
          </div>
        </div>

        {/* Beskrivelse */}
        <div>
          <p className="text-gray-700 line-clamp-3">
            {event.beskrivelse}
          </p>
        </div>

        {/* Deltakere info */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {event.antall_pameldte || 0} påmeldte
            {event.maks_deltakere && ` av ${event.maks_deltakere}`}
          </div>
          
          {event.kjonn_separert && (
            <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
              Kjønnsseparert
            </div>
          )}
        </div>

        {/* Påmelding */}
        <div className="pt-4 border-t">
          {!isUpcoming ? (
            <div className="text-gray-500 text-sm text-center py-2">
              Dette eventet har allerede skjedd
            </div>
          ) : isFull && !isRegistered ? (
            <div className="text-orange-600 text-sm text-center py-2">
              Eventet er fullt
            </div>
          ) : (
            <Button
              onClick={handleRegistration}
              disabled={loading}
              variant={isRegistered ? 'outline' : 'primary'}
              className="w-full"
            >
              {loading 
                ? (isRegistered ? 'Melder av...' : 'Melder på...')
                : (isRegistered ? 'Meld av' : 'Meld på')
              }
            </Button>
          )}
        </div>

        {/* Ekstra info for registrerte */}
        {isRegistered && isUpcoming && (
          <div className="bg-emerald-50 p-3 rounded-lg">
            <p className="text-sm text-emerald-800">
              ✓ Du er påmeldt dette eventet
            </p>
            {event.type === 'online' && event.meeting_link && (
              <div className="mt-2">
                <a
                  href={event.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-600 hover:text-emerald-800 underline"
                >
                  Join meeting →
                </a>
              </div>
            )}
            {event.ekstra_info && (
              <div className="mt-2">
                <p className="text-sm text-emerald-700">
                  {event.ekstra_info}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}