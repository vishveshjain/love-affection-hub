import React, { useState, useEffect, useRef } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { ChatMessage } from '../../types';
import { loadChatMessages, saveChatMessages } from '../../utils/storage';
import { soundFx } from '../../utils/audio';
import { realtimeHub, getRoomKey, setRoomKey, getClientId, RealtimePayload } from '../../utils/realtime';
import confetti from 'canvas-confetti';
import {
  Send,
  Heart,
  Sparkles,
  MessageCircle,
  Smile,
  Zap,
  Key,
  Globe,
  Wifi,
  WifiOff,
  Copy,
  Check,
} from 'lucide-react';

const LOVE_EMOJIS = ['💖', '💋', '🥰', '🫂', '💍', '🌹', '💌', '✨', '🍓', '🧸', '🥺', '👑', '🍰', '🌸'];

export const LiveCoupleChat: React.FC = () => {
  const { profile, currentUserName, currentUserPhoto, partnerName, partnerPhoto, partnerRole, partnerOnline } = useCouple();
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatMessages);
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [roomKey, setRoomKeyState] = useState(getRoomKey());
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [tempRoomKey, setTempRoomKey] = useState(getRoomKey());
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize and subscribe to real-time internet connection
  useEffect(() => {
    realtimeHub.connect(roomKey);

    const unsubscribeStatus = realtimeHub.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    const unsubscribeMessages = realtimeHub.subscribe((payload: RealtimePayload) => {
      if (payload.type === 'CHAT_MESSAGE') {
        const incomingMsg: ChatMessage = payload.data;
        if (!incomingMsg || !incomingMsg.id) return;

        setMessages((prev) => {
          if (prev.some((m) => m.id === incomingMsg.id)) return prev;
          return [...prev, incomingMsg];
        });

        // If the message is live (not historical), play alert sound and haptic vibration
        if (!payload.isHistorical) {
          soundFx.playPop(650, 0.08);
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate([60, 40, 60]);
            } catch {
              // Ignore
            }
          }
        }
      } else if (payload.type === 'LOVE_BUZZ') {
        if (!payload.isHistorical) {
          soundFx.playCelebration();
          confetti({
            particleCount: 65,
            spread: 85,
            origin: { y: 0.6 },
            colors: ['#f43f5e', '#ec4899', '#fbbf24', '#c084fc'],
          });
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate([150, 80, 150]);
            } catch {
              // Ignore
            }
          }
        }
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeMessages();
    };
  }, [roomKey]);

  // Persist messages in local storage and auto-scroll
  useEffect(() => {
    saveChatMessages(messages);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      senderClientId: getClientId(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      senderPhoto: currentUserPhoto,
      text,
      timestamp: Date.now(),
    };

    // Add locally immediately
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    soundFx.playPop(520, 0.05);

    // Publish to the internet
    await realtimeHub.publish({
      type: 'CHAT_MESSAGE',
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      data: newMsg,
      timestamp: Date.now(),
    });
  };

  const handleSendLoveBuzz = async () => {
    soundFx.playCelebration();
    confetti({
      particleCount: 45,
      spread: 80,
      origin: { y: 0.6 },
    });

    const buzzText = `💖⚡ *Sent a high-voltage Love Buzz to ${partnerName}!* ✨`;
    await handleSendMessage(buzzText);

    await realtimeHub.publish({
      type: 'LOVE_BUZZ',
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      data: { sender: currentUserName },
      timestamp: Date.now(),
    });
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

  const handleSaveRoomKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = tempRoomKey.trim() || 'vishvesh-laura-love-nest-2026';
    setRoomKey(cleaned);
    setRoomKeyState(cleaned);
    setShowRoomModal(false);
    realtimeHub.connect(cleaned);
    soundFx.playPop(600, 0.08);
  };

  const copyRoomKey = () => {
    navigator.clipboard?.writeText(roomKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 rounded-3xl glass-card border border-rose-200 shadow-xl max-w-3xl mx-auto flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-3 border-b border-rose-100 shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-rose-400 shadow-sm">
              <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
            </div>
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                partnerOnline ? 'bg-emerald-500 animate-pulse' : isConnected ? 'bg-blue-400' : 'bg-amber-400'
              }`}
              title={partnerOnline ? `${partnerName} is online right now` : isConnected ? 'Connected to room' : 'Connecting...'}
            />
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

            {/* Connection Status Badge */}
            <div className="flex items-center gap-1.5 text-xs">
              {partnerOnline ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>{partnerName} is active right now 💕</span>
                </span>
              ) : isConnected ? (
                <span className="text-emerald-600/80 font-medium flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-emerald-500" />
                  <span>Room Connected ☁️</span>
                </span>
              ) : (
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  <WifiOff className="w-3 h-3 text-amber-500" />
                  <span>Connecting across internet...</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Room Key & Love Buzz Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Secret Room Key Pill */}
          <button
            type="button"
            onClick={() => {
              setTempRoomKey(roomKey);
              setShowRoomModal(true);
            }}
            title="Private Couple Room Code"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-semibold shadow-xs transition"
          >
            <Key className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Room:</span>
            <span className="font-mono text-[11px] font-bold text-rose-700 truncate max-w-[100px]">
              {roomKey}
            </span>
          </button>

          {/* Love Buzz Button */}
          <button
            type="button"
            onClick={handleSendLoveBuzz}
            title="Send an instant heart vibration buzz to your partner anywhere in the world!"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-rose-400/25 transition active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Love Buzz!</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Globe className="w-10 h-10 text-rose-300 mb-2 animate-bounce" />
            <p className="font-bold text-slate-700 text-sm">Your Private Internet Love Chat</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Say hello! Any message you type here will reach {partnerName}'s phone anywhere in the world in real time.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderClientId
              ? msg.senderClientId === getClientId()
              : msg.senderName === currentUserName || msg.senderRole === profile.currentUserRole;
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

                <div className="max-w-[78%] sm:max-w-[65%]">
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
                      <span className="flex items-center gap-1">
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && <span title="Sent across the internet">☁️</span>}
                      </span>
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
          })
        )}
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

      {/* Secret Room Key Configuration Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-white shadow-2xl border border-rose-200">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <Key className="w-5 h-5" />
              <h4 className="text-lg font-bold text-slate-800">Private Couple Room Code</h4>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              This secret code connects your phone and {partnerName}'s phone in real-time across the internet! Both of you must share the same room code.
            </p>

            <form onSubmit={handleSaveRoomKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Secret Room Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={tempRoomKey}
                    onChange={(e) => setTempRoomKey(e.target.value)}
                    placeholder="e.g. vishvesh-laura-love-nest-2026"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <button
                    type="button"
                    onClick={copyRoomKey}
                    className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition text-xs font-semibold flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default is already pre-configured for Vishvesh &amp; Laura.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-rose-400/30"
                >
                  Save &amp; Connect 🌐
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
