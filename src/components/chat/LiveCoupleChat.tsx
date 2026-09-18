import React, { useState, useEffect, useRef } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { ChatMessage } from '../../types';
import { loadChatMessages, saveChatMessages } from '../../utils/storage';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Send, Heart, Sparkles, MessageCircle, Smile, Zap, RefreshCw } from 'lucide-react';

const LOVE_EMOJIS = ['💖', '💋', '🥰', '🫂', '💍', '🌹', '💌', '✨', '🍓', '🧸', '🥺', '👑', '🍰', '🌸'];

export const LiveCoupleChat: React.FC = () => {
  const { profile, currentUserName, currentUserPhoto, partnerName, partnerPhoto, partnerRole } = useCouple();
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatMessages);
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);

  // Cross-tab real-time sync with BroadcastChannel
  useEffect(() => {
    try {
      const channel = new BroadcastChannel('love_couple_chat_channel');
      channelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_MESSAGE') {
          const incomingMsg: ChatMessage = event.data.message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incomingMsg.id)) return prev;
            return [...prev, incomingMsg];
          });
          soundFx.playPop(620, 0.08);
        } else if (event.data?.type === 'LOVE_BUZZ') {
          soundFx.playCelebration();
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f43f5e', '#ec4899', '#fbbf24'],
          });
        }
      };
    } catch {
      // Fallback to storage event for older browsers
      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'love_app_chat_messages_v2' && e.newValue) {
          try {
            setMessages(JSON.parse(e.newValue));
          } catch {
            // Ignore
          }
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }

    return () => {
      channelRef.current?.close();
    };
  }, []);

  // Save messages and auto-scroll
  useEffect(() => {
    saveChatMessages(messages);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      senderPhoto: currentUserPhoto,
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    soundFx.playPop(520, 0.05);

    // Broadcast to other tab
    try {
      channelRef.current?.postMessage({
        type: 'NEW_MESSAGE',
        message: newMsg,
      });
    } catch {
      // Ignore
    }
  };

  const handleSendLoveBuzz = () => {
    soundFx.playCelebration();
    confetti({
      particleCount: 45,
      spread: 80,
      origin: { y: 0.6 },
    });

    handleSendMessage(`💖 *Sent a high-voltage Love Buzz to ${partnerName}!* ⚡✨`);

    try {
      channelRef.current?.postMessage({ type: 'LOVE_BUZZ' });
    } catch {
      // Ignore
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    soundFx.playPop(650, 0.03);
  };

  const handleAddReaction = (msgId: string, reactionEmoji: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, reaction: reactionEmoji } : m))
    );
    soundFx.playPop(700, 0.04);
  };

  return (
    <div className="p-4 md:p-6 rounded-3xl glass-card border border-rose-200 shadow-xl max-w-3xl mx-auto flex flex-col h-[580px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-3 border-b border-rose-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-rose-400 shadow-sm">
              <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-slate-800 text-base">
                Chatting with {partnerName}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-bold uppercase">
                {partnerRole === 'boyfriend' ? '🤴 Boyfriend' : '👸 My Angel'}
              </span>
            </div>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Live cross-tab sync active 💕</span>
            </p>
          </div>
        </div>

        {/* Love Buzz Button */}
        <button
          type="button"
          onClick={handleSendLoveBuzz}
          title="Send a heart vibration buzz to partner!"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-rose-400/25 transition active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          <span>Send Love Buzz!</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderRole === profile.currentUserRole;
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {!isMe && (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-rose-200 shrink-0 shadow-xs mb-1">
                  <img src={msg.senderPhoto} alt={msg.senderName} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="max-w-[75%] sm:max-w-[65%]">
                <div
                  className={`relative p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-none shadow-rose-400/15'
                      : 'bg-white text-slate-800 border border-rose-100 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="break-words font-medium">{msg.text}</p>

                  <div
                    className={`flex items-center justify-between gap-3 text-[10px] mt-1 pt-1 ${
                      isMe ? 'text-rose-100/90' : 'text-slate-400'
                    }`}
                  >
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      type="button"
                      onClick={() => handleAddReaction(msg.id, '❤️')}
                      className="hover:scale-125 transition-transform"
                    >
                      {msg.reaction || '🤍'}
                    </button>
                  </div>
                </div>
              </div>

              {isMe && (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-rose-400 shrink-0 shadow-xs mb-1">
                  <img src={msg.senderPhoto} alt={msg.senderName} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Love Emoji Bar */}
      {showEmojis && (
        <div className="p-2 mb-2 bg-rose-50/90 border border-rose-200 rounded-2xl flex flex-wrap gap-1.5 animate-fade-in">
          {LOVE_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 pt-2 border-t border-rose-100 shrink-0"
      >
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type a sweet message to ${partnerName}...`}
          className="flex-1 px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs sm:text-sm bg-white font-medium text-slate-800"
        />

        <button
          type="submit"
          className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white shadow-md shadow-rose-400/25 transition active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
