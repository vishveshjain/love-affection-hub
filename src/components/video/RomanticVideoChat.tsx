import React, { useState, useEffect, useRef } from 'react';
import { useCouple } from '../../context/CoupleContext';
import {
  videoCallService,
  ROMANTIC_THEMES,
  ROMANTIC_FILTERS,
  RomanticThemeId,
  RomanticFilterId,
} from '../../utils/webrtc';
import { romanticMusic } from '../../utils/romanticMusic';
import confetti from 'canvas-confetti';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  PhoneCall,
  Sparkles,
  Heart,
  Palette,
  Wand2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Columns,
  Flame,
  Music,
  ChevronLeft,
} from 'lucide-react';

const ROMANTIC_EMOJIS = [
  { emoji: '💋', label: 'Sweet Kiss', soundFreq: 800 },
  { emoji: '💖', label: 'Hearts Burst', soundFreq: 600 },
  { emoji: '🥰', label: 'In Love', soundFreq: 550 },
  { emoji: '🫂', label: 'Warm Cuddle', soundFreq: 450 },
  { emoji: '🌹', label: 'Red Rose', soundFreq: 520 },
  { emoji: '💍', label: 'Promise', soundFreq: 700 },
  { emoji: '✨', label: 'Magic', soundFreq: 900 },
  { emoji: '🧸', label: 'Teddy Hug', soundFreq: 480 },
  { emoji: '🍓', label: 'Sweet Treat', soundFreq: 640 },
  { emoji: '💌', label: 'Love Letter', soundFreq: 580 },
];

interface RomanticVideoChatProps {
  onClose?: () => void;
}

export const RomanticVideoChat: React.FC<RomanticVideoChatProps> = ({ onClose }) => {
  const { profile, currentUserName, partnerName, partnerPhoto, partnerRole, partnerOnline } = useCouple();

  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTheme, setActiveTheme] = useState<RomanticThemeId>('moonlight');
  const [activeFilter, setActiveFilter] = useState<RomanticFilterId>('dreamy');
  const [viewMode, setViewMode] = useState<'pip' | 'split'>('split');
  const [showThemes, setShowThemes] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);
  const [touchingHeart, setTouchingHeart] = useState(false);
  const [partnerTouching, setPartnerTouching] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);

  // Subscribe to call state changes
  useEffect(() => {
    const unsubState = videoCallService.onStateChange((state) => {
      setCallStatus(state.status);
      setLocalStream(state.localStream);
      setRemoteStream(state.remoteStream);
      setIsMuted(state.isMuted);
      setIsVideoOff(state.isVideoOff);
      setActiveTheme(state.activeTheme);
      setActiveFilter(state.activeFilter);
      setPartnerTouching(state.partnerTouchingHeart);
    });

    const unsubReaction = videoCallService.onReaction((reaction) => {
      setReactions((prev) => [...prev.slice(-20), reaction]);
      // Auto-cleanup floating emojis after 3.5s
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 3500);

      // Trigger celebratory particle burst
      if (reaction.emoji === '💋' || reaction.emoji === '💖' || reaction.emoji === '💍') {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { x: reaction.x / 100, y: reaction.y / 100 },
          colors: ['#f43f5e', '#ec4899', '#fbbf24'],
        });
      }
    });

    return () => {
      unsubState();
      unsubReaction();
    };
  }, []);

  // Attach local media stream to video tags
  useEffect(() => {
    if (localVideoRef.current) {
      if (localStream && !isVideoOff) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play().catch((err) => console.log('Autoplay local stream:', err));
      } else {
        localVideoRef.current.srcObject = null;
      }
    }
    if (pipVideoRef.current) {
      if (localStream && !isVideoOff) {
        pipVideoRef.current.srcObject = localStream;
        pipVideoRef.current.play().catch((err) => console.log('Autoplay pip stream:', err));
      } else {
        pipVideoRef.current.srcObject = null;
      }
    }
  }, [localStream, isVideoOff, callStatus, viewMode]);

  // Attach remote stream to video tag
  useEffect(() => {
    if (remoteVideoRef.current) {
      if (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch((err) => {
          console.log('Autoplay remote stream:', err);
        });
      } else {
        remoteVideoRef.current.srcObject = null;
      }
    }
  }, [remoteStream, callStatus, viewMode]);

  // Call duration counter
  useEffect(() => {
    let timer: any = null;
    if (callStatus === 'connected') {
      timer = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // If partner ends the call while connected or calling, auto-return smoothly to chat
  const prevStatusRef = useRef(callStatus);
  useEffect(() => {
    if ((prevStatusRef.current === 'connected' || prevStatusRef.current === 'calling') && callStatus === 'idle') {
      if (onClose) {
        const t = setTimeout(() => {
          onClose();
        }, 600);
        return () => clearTimeout(t);
      }
    }
    prevStatusRef.current = callStatus;
  }, [callStatus, onClose]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartCall = async () => {
    setPermissionError(null);
    try {
      await videoCallService.startCall(profile.currentUserRole, currentUserName, activeTheme);
      setMusicPlaying(true);
    } catch (err: any) {
      setPermissionError('Camera/Mic permission needed. Please allow permissions in your browser.');
    }
  };

  const handleEndCall = () => {
    videoCallService.endCall(true);
    if (onClose) {
      setTimeout(() => {
        onClose();
      }, 400);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = videoCallService.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleToggleVideo = () => {
    const nextOff = videoCallService.toggleVideo();
    setIsVideoOff(nextOff);
  };

  const handleSelectTheme = (themeId: RomanticThemeId) => {
    setActiveTheme(themeId);
    videoCallService.setTheme(themeId, true);
    setShowThemes(false);
  };

  const handleSelectFilter = (filterId: RomanticFilterId) => {
    setActiveFilter(filterId);
    videoCallService.setFilter(filterId, true);
    setShowFilters(false);
  };

  const handleSendReaction = (emoji: string) => {
    const x = Math.floor(Math.random() * 60) + 20;
    const y = Math.floor(Math.random() * 50) + 30;
    videoCallService.sendReaction(emoji, x, y, profile.currentUserRole);
  };

  const handleToggleMusic = () => {
    if (musicPlaying) {
      romanticMusic.stopRomanticAmbience();
      setMusicPlaying(false);
    } else {
      romanticMusic.startRomanticAmbience(0.2);
      setMusicPlaying(true);
    }
  };

  const handleTouchHeartStart = () => {
    setTouchingHeart(true);
    videoCallService.setTouchHeart(true, profile.currentUserRole);
    if (partnerTouching) {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#fb7185', '#fbbf24', '#c084fc'],
      });
    }
  };

  const handleTouchHeartEnd = () => {
    setTouchingHeart(false);
    videoCallService.setTouchHeart(false, profile.currentUserRole);
  };

  const currentThemeConfig = ROMANTIC_THEMES.find((t) => t.id === activeTheme) || ROMANTIC_THEMES[0];
  const currentFilterConfig = ROMANTIC_FILTERS.find((f) => f.id === activeFilter) || ROMANTIC_FILTERS[0];

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 bg-gradient-to-br ${currentThemeConfig.gradient} min-h-[580px] md:min-h-[640px] flex flex-col justify-between border-2 border-rose-400/40 select-none`}>
      {/* Dynamic Animated Atmospheric Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-rose-500/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/5 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl animate-pulse" />
        {/* Floating atmospheric ambient dots */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* ================= TOP HEADER BAR ================= */}
      <div className="relative z-20 flex items-center justify-between p-4 md:px-6 bg-black/40 backdrop-blur-md border-b border-white/10 text-white">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white/10 hover:bg-white/20 text-rose-200 hover:text-white transition active:scale-95 border border-white/15 flex items-center gap-1 text-xs font-bold shrink-0"
              title="Return to Love Hub & Chat"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentThemeConfig.icon}</span>
            <div>
              <h2 className="text-sm md:text-base font-extrabold flex items-center gap-1.5 text-white">
                <span>Romantic Video Sanctuary</span>
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
              </h2>
              <p className="text-[11px] text-rose-200/80">
                {currentThemeConfig.name} • {currentFilterConfig.name}
              </p>
            </div>
          </div>
        </div>

        {/* Center Timer / Status */}
        <div className="flex items-center gap-2">
          {callStatus === 'connected' ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Loving for {formatDuration(callDuration)}</span>
            </div>
          ) : callStatus === 'calling' ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold animate-pulse">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span>Calling {partnerName}...</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-rose-200 text-xs font-bold">
              <span>{partnerOnline ? 'Partner Online 🟢' : 'Private Sanctuary 🔒'}</span>
            </div>
          )}
        </div>

        {/* Right Quick Controls */}
        <div className="flex items-center gap-2">
          {/* Background Theme Selector Toggle */}
          <button
            type="button"
            onClick={() => setShowThemes((v) => !v)}
            title="Choose Romantic Background Setting"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 border border-white/15"
          >
            <Palette className="w-4 h-4 text-pink-300" />
          </button>

          {/* Video Filter Selector Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            title="Flattering Romantic Video Filter"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 border border-white/15"
          >
            <Wand2 className="w-4 h-4 text-amber-300" />
          </button>

          {/* Ambient Romantic Harmony Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleMusic}
            title={musicPlaying ? 'Mute romantic ambient music' : 'Play romantic ambient music'}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 border border-white/15"
          >
            {musicPlaying ? <Volume2 className="w-4 h-4 text-rose-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Split / Picture-in-Picture Layout Switcher */}
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'split' ? 'pip' : 'split'))}
            title={viewMode === 'split' ? 'Switch to Picture-in-Picture' : 'Switch to Side-by-Side'}
            className="hidden sm:flex p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 border border-white/15"
          >
            <Columns className="w-4 h-4 text-purple-300" />
          </button>
        </div>
      </div>

      {/* ================= THEMES MODAL POPOVER ================= */}
      {showThemes && (
        <div className="absolute top-16 right-4 z-50 w-72 rounded-2xl bg-slate-900/95 p-4 border border-rose-400/40 shadow-2xl backdrop-blur-xl text-white animate-fade-in">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Romantic Atmospheres
            </span>
            <button onClick={() => setShowThemes(false)} className="text-xs text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="space-y-2">
            {ROMANTIC_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectTheme(theme.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition ${
                  activeTheme === theme.id
                    ? 'bg-rose-500/30 border border-rose-400 ring-1 ring-rose-400/50'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              >
                <span className="text-xl p-1.5 rounded-lg bg-black/40">{theme.icon}</span>
                <div>
                  <div className="text-xs font-bold text-white">{theme.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{theme.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= FILTERS MODAL POPOVER ================= */}
      {showFilters && (
        <div className="absolute top-16 right-16 z-50 w-64 rounded-2xl bg-slate-900/95 p-4 border border-amber-400/40 shadow-2xl backdrop-blur-xl text-white animate-fade-in">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5" /> Flattering Video Filters
            </span>
            <button onClick={() => setShowFilters(false)} className="text-xs text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ROMANTIC_FILTERS.map((filt) => (
              <button
                key={filt.id}
                type="button"
                onClick={() => handleSelectFilter(filt.id)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition text-center ${
                  activeFilter === filt.id
                    ? 'bg-amber-500/30 border border-amber-400 ring-1 ring-amber-400/50'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              >
                <span className="text-xl">{filt.icon}</span>
                <span className="text-xs font-bold text-white">{filt.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= FLOATING FLYING EMOJIS & KISSES ================= */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.x}%`, top: `${r.y}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-5xl md:text-7xl animate-bounce filter drop-shadow-2xl select-none"
          >
            <span>{r.emoji}</span>
          </div>
        ))}
      </div>

      {/* ================= SOUL TOUCH MERGED HEART ANIMATION ================= */}
      {(touchingHeart || partnerTouching) && (
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center">
          <div
            className={`w-64 h-64 md:w-80 md:h-80 rounded-full flex flex-col items-center justify-center transition-all duration-500 ${
              touchingHeart && partnerTouching
                ? 'scale-125 bg-gradient-to-r from-rose-500/40 via-pink-400/50 to-amber-400/40 blur-2xl animate-ping'
                : 'scale-100 bg-rose-500/20 blur-xl animate-pulse'
            }`}
          />
          <div className="absolute flex flex-col items-center gap-2 animate-bounce">
            <span className="text-7xl md:text-9xl filter drop-shadow-[0_0_35px_rgba(244,63,94,0.8)]">
              {touchingHeart && partnerTouching ? '💖💍✨' : '💖'}
            </span>
            <span className="px-4 py-1.5 rounded-full bg-black/70 text-rose-300 font-extrabold text-xs md:text-sm border border-rose-400 shadow-xl backdrop-blur-md">
              {touchingHeart && partnerTouching
                ? '✨ Our Souls Are Touching Together! ✨'
                : `${touchingHeart ? 'You are reaching out' : `${partnerName} is holding out a heart`}`}
            </span>
          </div>
        </div>
      )}

      {/* ================= MAIN VIDEO STAGE AREA ================= */}
      <div className="relative z-10 flex-1 p-3 md:p-6 flex items-center justify-center">
        {/* Permission warning if any */}
        {permissionError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-full p-3 rounded-2xl bg-amber-500/90 text-slate-900 font-bold text-xs text-center shadow-xl">
            {permissionError}
          </div>
        )}

        {callStatus === 'idle' ? (
          /* IDLE STATE: CALL LAUNCHER BANNER */
          <div className="max-w-md w-full p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-xl text-center shadow-2xl flex flex-col items-center text-white">
            <div className="relative mb-5">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-rose-500 via-pink-400 to-indigo-500 blur-lg opacity-75 animate-pulse" />
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white">
                <img
                  src={partnerPhoto}
                  alt={partnerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 text-2xl">🌹</span>
            </div>

            <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2">
              Romantic Video Sanctuary
            </h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed max-w-xs">
              Talk directly with {partnerName} within an intimate starry paradise with soft ambient music, flattering filters, and flying kisses.
            </p>

            <div className="w-full space-y-3">
              <button
                type="button"
                onClick={handleStartCall}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-sm md:text-base shadow-xl shadow-rose-500/30 flex items-center justify-center gap-2 transition active:scale-95 ring-4 ring-rose-400/25 cursor-pointer"
              >
                <PhoneCall className="w-5 h-5 fill-white" />
                <span>Call My {partnerName} Now</span>
              </button>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-rose-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border border-white/10 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Return to Love Hub & Chat</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ACTIVE / CONNECTED VIDEO STAGE */
          <div className="w-full h-full flex flex-col items-center justify-center">
            {viewMode === 'split' ? (
              /* SIDE-BY-SIDE CINEMA VIEW */
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 h-[440px] md:h-[480px]">
                {/* 1. Partner (Remote) Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-rose-400/60 bg-black/60 flex items-center justify-center group">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    onLoadedMetadata={() => {
                      remoteVideoRef.current?.play().catch(() => {});
                    }}
                    style={{ filter: currentFilterConfig.cssFilter }}
                    className={`w-full h-full object-cover ${remoteStream ? 'block' : 'hidden'}`}
                  />
                  {remoteStream && (
                    <div className={`absolute inset-0 pointer-events-none transition-all ${currentFilterConfig.overlayClass}`} />
                  )}

                  {!remoteStream && (
                    /* Waiting / Ringing Placeholder */
                    <div className="flex flex-col items-center justify-center p-6 text-center text-white">
                      <div className="relative mb-3">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-rose-400 shadow-xl bg-white animate-pulse">
                          <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
                        </div>
                        <span className="absolute -top-1 -right-1 text-2xl animate-spin">✨</span>
                      </div>
                      <p className="text-sm font-extrabold text-rose-300">
                        {callStatus === 'calling' ? `Calling ${partnerName}...` : `Connecting with ${partnerName}...`}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Waiting for video stream</p>
                    </div>
                  )}

                  {/* Partner Name Badge */}
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <span>{partnerRole === 'boyfriend' ? '👑' : '🌸'}</span>
                    <span>{partnerName}</span>
                  </div>
                </div>

                {/* 2. Self (Local) Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-blue-400/60 bg-black/60 flex items-center justify-center group">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => {
                      localVideoRef.current?.play().catch(() => {});
                    }}
                    style={{ filter: currentFilterConfig.cssFilter }}
                    className={`w-full h-full object-cover -scale-x-100 ${localStream && !isVideoOff ? 'block' : 'hidden'}`}
                  />
                  {localStream && !isVideoOff && (
                    <div className={`absolute inset-0 pointer-events-none transition-all ${currentFilterConfig.overlayClass}`} />
                  )}

                  {(!localStream || isVideoOff) && (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-white">
                      <VideoOff className="w-12 h-12 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-300">Camera is turned off</p>
                    </div>
                  )}

                  {/* Self Name Badge */}
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <span>{profile.currentUserRole === 'boyfriend' ? '👑' : '🌸'}</span>
                    <span>You ({currentUserName})</span>
                    {isMuted && <MicOff className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                </div>
              </div>
            ) : (
              /* PICTURE-IN-PICTURE (PIP) VIEW */
              <div className="relative w-full h-[440px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl border-2 border-rose-400/60 bg-black/60 flex items-center justify-center">
                {/* Main View: Partner */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  onLoadedMetadata={() => {
                    remoteVideoRef.current?.play().catch(() => {});
                  }}
                  style={{ filter: currentFilterConfig.cssFilter }}
                  className={`w-full h-full object-cover ${remoteStream ? 'block' : 'hidden'}`}
                />
                {remoteStream && (
                  <div className={`absolute inset-0 pointer-events-none transition-all ${currentFilterConfig.overlayClass}`} />
                )}

                {!remoteStream && (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-white">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-rose-400 shadow-xl bg-white mb-3 animate-pulse">
                      <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-extrabold text-rose-300">
                      {callStatus === 'calling' ? `Calling ${partnerName}...` : `Connecting with ${partnerName}...`}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Waiting for video stream</p>
                  </div>
                )}

                {/* Floating Self Camera PiP (Heart/Pill shape) */}
                <div className="absolute top-4 right-4 w-32 h-44 md:w-36 md:h-48 rounded-2xl overflow-hidden border-2 border-white/80 shadow-2xl bg-black z-20">
                  <video
                    ref={pipVideoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => {
                      pipVideoRef.current?.play().catch(() => {});
                    }}
                    style={{ filter: currentFilterConfig.cssFilter }}
                    className={`w-full h-full object-cover -scale-x-100 ${localStream && !isVideoOff ? 'block' : 'hidden'}`}
                  />
                  {(!localStream || isVideoOff) && (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-[10px]">
                      <VideoOff className="w-6 h-6 mb-1" />
                      <span>Cam Off</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-2 text-[10px] text-white font-bold drop-shadow">
                    You
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= ROMANTIC EMOJI REACTION QUICK BAR ================= */}
      {callStatus !== 'idle' && (
        <div className="relative z-20 px-4 py-2 flex items-center justify-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-none bg-black/30 backdrop-blur-sm border-t border-white/10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300 whitespace-nowrap mr-1 flex items-center gap-1">
            <Heart className="w-3 h-3 fill-rose-400" /> Send Love:
          </span>
          {ROMANTIC_EMOJIS.map((item) => (
            <button
              key={item.emoji}
              type="button"
              onClick={() => handleSendReaction(item.emoji)}
              title={item.label}
              className="p-1.5 md:p-2 rounded-xl bg-white/10 hover:bg-rose-500/40 text-lg md:text-xl transition active:scale-125 transform shadow-xs hover:shadow-rose-400/30 shrink-0"
            >
              {item.emoji}
            </button>
          ))}
        </div>
      )}

      {/* ================= BOTTOM IN-CALL CONTROLS BAR ================= */}
      {callStatus !== 'idle' && (
        <div className="relative z-20 flex items-center justify-center gap-3 md:gap-6 p-4 bg-black/60 backdrop-blur-md border-t border-white/15">
          {/* Mute Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            className={`p-3 md:p-3.5 rounded-full transition shadow-lg active:scale-95 ${
              isMuted
                ? 'bg-rose-600 text-white ring-4 ring-rose-400/30'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle */}
          <button
            type="button"
            onClick={handleToggleVideo}
            title={isVideoOff ? 'Turn video on' : 'Turn video off'}
            className={`p-3 md:p-3.5 rounded-full transition shadow-lg active:scale-95 ${
              isVideoOff
                ? 'bg-rose-600 text-white ring-4 ring-rose-400/30'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Soul Heart Connection Hold Button */}
          <button
            type="button"
            onMouseDown={handleTouchHeartStart}
            onMouseUp={handleTouchHeartEnd}
            onTouchStart={handleTouchHeartStart}
            onTouchEnd={handleTouchHeartEnd}
            title="Press & hold to connect your soul heart with your partner's video!"
            className={`px-4 md:px-6 py-3 rounded-full font-extrabold text-xs md:text-sm flex items-center gap-2 transition shadow-xl active:scale-95 select-none ${
              touchingHeart
                ? 'bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300 text-white ring-4 ring-pink-300 animate-pulse'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-rose-500/30'
            }`}
          >
            <Heart className={`w-4 h-4 md:w-5 md:h-5 ${touchingHeart ? 'fill-white animate-ping' : 'fill-white'}`} />
            <span>{touchingHeart ? 'Souls Touching! 💖' : 'Touch Heart'}</span>
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEndCall}
            title="End Video Sanctuary Call"
            className="p-3 md:p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/40 ring-4 ring-rose-500/30 transition active:scale-95"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
