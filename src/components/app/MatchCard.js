// src/components/app/MatchCard.js
'use client';

import { Button } from '../ui/Button';

export function MatchCard({ match, onInteresse, onPass }) {  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Profile Image Placeholder */}
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xl">👤</span>
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">
                {match.navn}, {match.alder}
              </h3>
              <p className="text-gray-600">{match.by}</p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {match.kompatibilitet_score}% match
            </div>
          </div>

          <p className="text-gray-700">{match.beskrivelse}</p>

          {match.felles_interesser?.length > 0 && (
            <div className="pt-2">
              <p className="text-sm text-gray-500 mb-1">Felles interesser:</p>
              <div className="flex flex-wrap gap-2">
                {match.felles_interesser.map((interest, i) => (
                  <span 
                    key={i} 
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={() => onPass(match.bruker_id)}
          className="px-6"
        >
          Pass
        </Button>
        <Button 
          onClick={() => onInteresse(match.bruker_id)}
          className="px-6 bg-blue-600 hover:bg-blue-700"
        >
          Vis interesse
        </Button>
      </div>
    </div>
  );
}