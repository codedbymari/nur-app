// components/app/ChatMessage.js
'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

export default function ChatMessage({ message, isOwn = false, senderName }) {
  const [showTime, setShowTime] = useState(false);

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: nb 
      });
    } catch (error) {
      return 'Ukjent tid';
    }
  };

  return (
    <div 
      className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
      onClick={() => setShowTime(!showTime)}
    >
      <div 
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg cursor-pointer ${
          isOwn 
            ? 'bg-[#780000] text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {!isOwn && senderName && (
          <p className="text-xs text-gray-500 mb-1 font-medium">{senderName}</p>
        )}
        <p className="text-sm">{message.melding}</p>
        {showTime && (
          <p className={`text-xs mt-1 ${isOwn ? 'text-white opacity-75' : 'text-gray-500'}`}>
            {formatTime(message.created_at)}
          </p>
        )}
      </div>
    </div>
  );
}
