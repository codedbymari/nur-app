'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input'; 
import ChatMessage from '@/components/app/ChatMessage'; 
export default function ChatPage() {
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser();
    loadActiveChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
      subscribeToMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadActiveChats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          id,
          match_dato,
          bruker1_id,
          bruker2_id,
          profiles!bruker1_id(navn, by),
          profiles!bruker2_id(navn, by)
        `)
        .or(`bruker1_id.eq.${user.id},bruker2_id.eq.${user.id}`)
        .not('interesse_bruker1', 'is', null)
        .not('interesse_bruker2', 'is', null)
        .eq('interesse_bruker1', true)
        .eq('interesse_bruker2', true)
        .order('match_dato', { ascending: false });

      if (error) throw error;

      const chatsWithPartner = matches.map(match => {
        const isUser1 = match.bruker1_id === user.id;
        const partner = isUser1 ? match.profiles[1] : match.profiles[0];
        
        return {
          id: match.id,
          partnerName: partner.navn,
          partnerLocation: partner.by,
          matchDate: match.match_dato,
          lastMessage: null, // Vil bli oppdatert med siste melding
          unreadCount: 0
        };
      });

      setActiveChats(chatsWithPartner);
      
      // Last siste meldinger for hver chat
      for (const chat of chatsWithPartner) {
        loadLastMessage(chat.id);
      }
      
    } catch (error) {
      console.error('Feil ved lasting av chatter:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLastMessage = async (matchId) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('melding, created_at, sender_id')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && data.length > 0) {
      setActiveChats(prev => prev.map(chat => 
        chat.id === matchId 
          ? { ...chat, lastMessage: data[0] }
          : chat
      ));
    }
  };

  const loadMessages = async (matchId) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          melding,
          created_at,
          sender_id,
          profiles(navn)
        `)
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Feil ved lasting av meldinger:', error);
    }
  };

  const subscribeToMessages = (matchId) => {
    const subscription = supabase
      .channel(`chat:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          const newMessage = payload.new;
          setMessages(prev => [...prev, newMessage]);
          loadLastMessage(matchId); // Oppdater siste melding i chat-listen
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !currentUser) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          match_id: selectedChat.id,
          sender_id: currentUser.id,
          melding: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Feil ved sending av melding:', error);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('nb-NO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('nb-NO', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#780000] mb-6">Meldinger</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chat Liste */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-lg">Aktive samtaler</h2>
          </div>
          
          <div className="overflow-y-auto h-full">
            {activeChats.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p className="mb-2">Ingen aktive samtaler ennå</p>
                <p className="text-sm">Når du og en match begge viser interesse, kan dere chatte her!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activeChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-[#FDF0D5]' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900">{chat.partnerName}</h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(chat.lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">{chat.partnerLocation}</p>
                    
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage.sender_id === currentUser?.id ? 'Du: ' : ''}
                        {chat.lastMessage.melding}
                      </p>
                    )}
                    
                    {!chat.lastMessage && (
                      <p className="text-sm text-gray-400 italic">Start en samtale...</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Chat Vindu */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-[#FDF0D5]">
                <h2 className="font-semibold text-lg text-[#780000]">
                  {selectedChat.partnerName}
                </h2>
                <p className="text-sm text-gray-600">
                  Match fra {new Date(selectedChat.matchDate).toLocaleDateString('nb-NO')}
                </p>
              </div>

              {/* Meldinger */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p className="mb-2">Ingen meldinger ennå</p>
                    <p className="text-sm">Send den første meldingen for å starte samtalen!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwn={message.sender_id === currentUser?.id}
                    />
                  ))
                )}
              </div>

              {/* Melding Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Skriv en melding..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-[#780000] hover:bg-[#C1121F] text-white px-6"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p>Velg en samtale for å begynne å chatte</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}