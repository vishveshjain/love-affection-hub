import React, { useState, useEffect, useRef } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { ChatMessage, ChatAttachment } from '../../types';
import { loadChatMessages, saveChatMessages, fileToDataUrl } from '../../utils/storage';
import { soundFx } from '../../utils/audio';
import { realtimeHub, getRoomKey, setRoomKey, getClientId, RealtimePayload } from '../../utils/realtime';
import { saveCloudData, onCloudDataLoaded } from '../../utils/cloudStore';
import { processChatAttachment, formatFileSize } from '../../utils/attachmentService';
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
  Camera,
  Video,
  Paperclip,
  Image as ImageIcon,
  Film,
  FileText,
  Music,
  Download,
  ExternalLink,
  X,
  Maximize2,
  Loader2,
  File as FileIcon,
} from 'lucide-react';

const LOVE_EMOJIS = ['💖', '💋', '🥰', '🫂', '💍', '🌹', '💌', '✨', '🍓', '🧸', '🥺', '👑', '🍰', '🌸'];

interface LiveCoupleChatProps {
  onStartVideoCall?: () => void;
}

export const LiveCoupleChat: React.FC<LiveCoupleChatProps> = ({ onStartVideoCall }) => {
  const { profile, currentUserName, currentUserPhoto, partnerName, partnerPhoto, partnerRole, partnerOnline, updateProfilePhoto } = useCouple();
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatMessages);
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [roomKey, setRoomKeyState] = useState(getRoomKey());
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [tempRoomKey, setTempRoomKey] = useState(getRoomKey());
  const [copied, setCopied] = useState(false);

  // Attachments State
  const [stagedAttachments, setStagedAttachments] = useState<ChatAttachment[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxAttachment, setLightboxAttachment] = useState<ChatAttachment | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChatPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const dataUrl = await fileToDataUrl(e.target.files[0]);
        updateProfilePhoto(profile.currentUserRole, dataUrl);
      } catch (err) {
        console.error('Error updating profile photo from chat', err);
      }
    }
  };

  // Handle file selection from file input, drop, or paste
  const handleFilesSelected = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessingFile(true);
    soundFx.playPop(550, 0.04);

    const processedList: ChatAttachment[] = [];
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgressText(`Uploading ${file.name} (${i + 1}/${fileArray.length})...`);
      try {
        const att = await processChatAttachment(file, (status) => setUploadProgressText(status));
        processedList.push(att);
      } catch (err) {
        console.error('Error processing attachment', err);
      }
    }

    setStagedAttachments((prev) => [...prev, ...processedList]);
    setIsProcessingFile(false);
    setUploadProgressText('');
    soundFx.playPop(680, 0.08);
  };

  const handleRemoveStagedAttachment = (id: string) => {
    setStagedAttachments((prev) => prev.filter((a) => a.id !== id));
    soundFx.playPop(420, 0.05);
  };

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

  // Merge messages when cloud data is loaded
  useEffect(() => {
    const unsubCloud = onCloudDataLoaded((cloudData) => {
      if (Array.isArray(cloudData.chat) && cloudData.chat.length > 0) {
        setMessages((prev) => {
          const map = new Map<string, ChatMessage>();
          prev.forEach((m) => map.set(m.id, m));
          cloudData.chat.forEach((m) => map.set(m.id, m));
          return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
        });
      }
    });
    return unsubCloud;
  }, []);

  // Persist messages in local storage and cloud, and auto-scroll
  useEffect(() => {
    saveChatMessages(messages);
    saveCloudData({ chat: messages });
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text && stagedAttachments.length === 0) return;

    const attachmentsToSend = stagedAttachments.length > 0 ? [...stagedAttachments] : undefined;
    const singleAttachment = stagedAttachments.length === 1 ? stagedAttachments[0] : undefined;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      senderClientId: getClientId(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      text,
      timestamp: Date.now(),
      attachment: singleAttachment,
      attachments: attachmentsToSend,
    };

    // Add locally immediately
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setStagedAttachments([]);
    soundFx.playPop(520, 0.05);

    // If attachments included, burst a small celebratory heart confetti
    if (attachmentsToSend && attachmentsToSend.length > 0) {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#f43f5e', '#fb7185', '#fda4af'],
      });
    }

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
    const updated = messages.map((m) =>
      m.id === msgId ? { ...m, reaction: reactionEmoji } : m
    );
    setMessages(updated);
    soundFx.playPop(700, 0.04);

    const changedMsg = updated.find((m) => m.id === msgId);
    if (changedMsg) {
      realtimeHub.publish({
        type: 'CHAT_MESSAGE',
        senderRole: profile.currentUserRole,
        senderName: currentUserName,
        data: changedMsg,
        timestamp: Date.now(),
      });
    }
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

  // Helper to download an attachment
  const triggerDownload = (att: ChatAttachment) => {
    const a = document.createElement('a');
    a.href = att.url;
    a.download = att.name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    soundFx.playPop(520, 0.04);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Paste handler for screenshots or copied images
  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      handleFilesSelected(e.clipboardData.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      className={`relative p-4 md:p-6 rounded-3xl glass-card border transition-all duration-200 shadow-xl max-w-3xl mx-auto flex flex-col h-[640px] ${
        isDragging ? 'border-rose-400 ring-4 ring-rose-200/50 bg-rose-50/40' : 'border-rose-200'
      }`}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-40 rounded-3xl bg-rose-500/10 backdrop-blur-xs flex flex-col items-center justify-center p-6 border-4 border-dashed border-rose-400 text-center animate-fade-in pointer-events-none">
          <Heart className="w-14 h-14 text-rose-500 fill-rose-400 animate-bounce mb-2" />
          <h4 className="text-lg font-black text-rose-700">Drop attachments to share with {partnerName}! 💌</h4>
          <p className="text-xs text-rose-600 mt-1">Photos, videos, audio clips, voice notes, documents & files</p>
        </div>
      )}

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

        {/* Room Key & Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Profile Picture Changer */}
          <input
            type="file"
            ref={chatPhotoInputRef}
            onChange={handleChatPhotoUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => chatPhotoInputRef.current?.click()}
            title={`Update your photo (${currentUserName})`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-rose-200 text-slate-700 hover:text-rose-600 text-xs font-semibold shadow-xs hover:border-rose-300 transition active:scale-95 cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full overflow-hidden border border-rose-400 shrink-0">
              <img src={currentUserPhoto} alt={currentUserName} className="w-full h-full object-cover" />
            </div>
            <span className="hidden sm:inline">My Photo</span>
            <Camera className="w-3 h-3 text-rose-500" />
          </button>

          {/* Secret Room Key Pill */}
          <button
            type="button"
            onClick={() => {
              setTempRoomKey(roomKey);
              setShowRoomModal(true);
            }}
            title="Private Couple Room Code"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Room:</span>
            <span className="font-mono text-[11px] font-bold text-rose-700 truncate max-w-[100px]">
              {roomKey}
            </span>
          </button>

          {/* Romantic Video Call Launch Button */}
          {onStartVideoCall && (
            <button
              type="button"
              onClick={onStartVideoCall}
              title="Launch Romantic Video Call Sanctuary"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-pink-500/25 transition active:scale-95 cursor-pointer"
            >
              <Video className="w-3.5 h-3.5 fill-white text-white" />
              <span>Video Call</span>
            </button>
          )}

          {/* Love Buzz Button */}
          <button
            type="button"
            onClick={handleSendLoveBuzz}
            title="Send an instant heart vibration buzz to your partner anywhere in the world!"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-rose-400/25 transition active:scale-95 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Love Buzz!</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-3.5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Globe className="w-10 h-10 text-rose-300 mb-2 animate-bounce" />
            <p className="font-bold text-slate-700 text-sm">Your Private Internet Love Chat</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Say hello or send a photo! Any message you type here will reach {partnerName}'s phone anywhere in the world in real time.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderClientId
              ? msg.senderClientId === getClientId()
              : msg.senderName === currentUserName || msg.senderRole === profile.currentUserRole;
            const avatarSrc =
              msg.senderRole === 'boyfriend'
                ? profile.boyfriendPhoto
                : profile.girlfriendPhoto;

            const allAttachments: ChatAttachment[] = msg.attachments || (msg.attachment ? [msg.attachment] : []);

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-rose-200 shrink-0 shadow-xs mb-1">
                    <img src={avatarSrc} alt={msg.senderName} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="max-w-[85%] sm:max-w-[70%]">
                  <div
                    className={`relative p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-none shadow-rose-400/15'
                        : 'bg-white text-slate-800 border border-rose-100 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {/* Render Attachments (if present) */}
                    {allAttachments.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {allAttachments.map((att, idx) => (
                          <div key={att.id || idx} className="rounded-xl overflow-hidden">
                            {/* IMAGE ATTACHMENT */}
                            {att.type === 'image' && (
                              <div className="relative group rounded-xl overflow-hidden bg-black/5 border border-white/20">
                                <img
                                  src={att.url || att.thumbnail}
                                  alt={att.name}
                                  onClick={() => setLightboxAttachment(att)}
                                  className="w-full max-h-64 object-cover rounded-xl cursor-pointer hover:scale-102 transition duration-300"
                                  loading="lazy"
                                />
                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => setLightboxAttachment(att)}
                                    className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
                                    title="View Fullscreen"
                                  >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => triggerDownload(att)}
                                    className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
                                    title="Download"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* VIDEO ATTACHMENT */}
                            {att.type === 'video' && (
                              <div className="relative rounded-xl overflow-hidden bg-black/90 border border-white/20">
                                <video
                                  src={att.url}
                                  controls
                                  playsInline
                                  preload="metadata"
                                  className="w-full max-h-64 rounded-xl object-contain bg-black"
                                />
                                <div className="flex items-center justify-between px-2 py-1 bg-black/60 text-[10px] text-white">
                                  <span className="truncate max-w-[180px]">{att.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => triggerDownload(att)}
                                    className="hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>{formatFileSize(att.size)}</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* AUDIO ATTACHMENT */}
                            {att.type === 'audio' && (
                              <div
                                className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
                                  isMe
                                    ? 'bg-white/20 border-white/30 text-white'
                                    : 'bg-rose-50/80 border-rose-200 text-slate-800'
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <Music className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{att.name}</span>
                                  </div>
                                  <span className="text-[10px] opacity-80 shrink-0">
                                    {formatFileSize(att.size)}
                                  </span>
                                </div>
                                <audio src={att.url} controls className="w-full h-8" />
                              </div>
                            )}

                            {/* FILE / DOCUMENT ATTACHMENT */}
                            {att.type === 'file' && (
                              <div
                                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                                  isMe
                                    ? 'bg-white/20 border-white/30 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                      isMe ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-600'
                                    }`}
                                  >
                                    <FileIcon className="w-5 h-5" />
                                  </div>
                                  <div className="truncate text-left">
                                    <p className="font-bold text-xs truncate max-w-[180px]">
                                      {att.name}
                                    </p>
                                    <p className="text-[10px] opacity-80">
                                      {formatFileSize(att.size)}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => triggerDownload(att)}
                                  className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                                    isMe
                                      ? 'bg-white/30 hover:bg-white/40 text-white'
                                      : 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs'
                                  }`}
                                  title="Download File"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Text Message */}
                    {msg.text && <p className="break-words font-medium">{msg.text}</p>}

                    {/* Timestamp & Reaction */}
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
                        className="hover:scale-125 transition-transform cursor-pointer"
                      >
                        {msg.reaction || '🤍'}
                      </button>
                    </div>
                  </div>
                </div>

                {isMe && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-rose-400 shrink-0 shadow-xs mb-1">
                    <img src={avatarSrc} alt={msg.senderName} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* STAGED ATTACHMENTS PREVIEW TRAY */}
      {stagedAttachments.length > 0 && (
        <div className="p-2 mb-2 bg-rose-50/90 border border-rose-200 rounded-2xl flex items-center gap-2 overflow-x-auto animate-fade-in shrink-0">
          <span className="text-[10px] font-extrabold uppercase text-rose-600 px-1 shrink-0">
            Attached ({stagedAttachments.length}):
          </span>

          {stagedAttachments.map((att) => (
            <div
              key={att.id}
              className="relative group bg-white border border-rose-200 rounded-xl p-1.5 flex items-center gap-2 text-xs shadow-xs shrink-0 max-w-[200px]"
            >
              {att.type === 'image' ? (
                <img
                  src={att.thumbnail || att.url}
                  alt={att.name}
                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                  {att.type === 'video' ? (
                    <Film className="w-4 h-4" />
                  ) : att.type === 'audio' ? (
                    <Music className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
              )}

              <div className="truncate text-left pr-4">
                <p className="truncate font-semibold text-[11px] text-slate-800">{att.name}</p>
                <p className="text-[9px] text-slate-400">{formatFileSize(att.size)}</p>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveStagedAttachment(att.id)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-xs cursor-pointer"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* UPLOADING / PROCESSING INDICATOR */}
      {isProcessingFile && (
        <div className="flex items-center gap-2 p-2 mb-2 bg-purple-50/90 border border-purple-200 rounded-2xl text-xs text-purple-700 animate-pulse shrink-0">
          <Loader2 className="w-4 h-4 animate-spin text-purple-600 shrink-0" />
          <span className="font-medium truncate">{uploadProgressText || 'Processing attachment...'}</span>
        </div>
      )}

      {/* Love Emoji Bar */}
      {showEmojis && (
        <div className="p-2 mb-2 bg-rose-50/90 border border-rose-200 rounded-2xl flex flex-wrap gap-1.5 animate-fade-in shrink-0">
          {LOVE_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
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
        {/* Hidden Attachment Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files) handleFilesSelected(e.target.files);
            e.target.value = ''; // reset so same file can be chosen again
          }}
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
          className="hidden"
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach photos, videos, voice recordings, or files"
          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            stagedAttachments.length > 0
              ? `Add a caption for your ${stagedAttachments.length} attachment(s)...`
              : `Type a sweet message to ${partnerName}...`
          }
          className="flex-1 px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs sm:text-sm bg-white font-medium text-slate-800"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() && stagedAttachments.length === 0}
          className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white shadow-md shadow-rose-400/25 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center">
            {/* Top Bar with Controls */}
            <div className="absolute -top-10 left-0 right-0 flex items-center justify-between text-white text-xs px-2">
              <span className="font-semibold truncate max-w-xs">{lightboxAttachment.name}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerDownload(lightboxAttachment)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxAttachment(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media Body */}
            {lightboxAttachment.type === 'image' && (
              <img
                src={lightboxAttachment.url}
                alt={lightboxAttachment.name}
                className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
            )}
            {lightboxAttachment.type === 'video' && (
              <video
                src={lightboxAttachment.url}
                controls
                autoPlay
                playsInline
                className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl bg-black"
              />
            )}
          </div>
        </div>
      )}

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
                    value={tempRoomKey}
                    onChange={(e) => setTempRoomKey(e.target.value)}
                    placeholder="e.g. vishvesh-laura-love-nest-2026"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyRoomKey}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-rose-400/25 transition active:scale-95 cursor-pointer"
                >
                  Connect & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
