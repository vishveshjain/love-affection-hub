import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCouple } from '../../context/CoupleContext';
import {
  videoCallService,
  ROMANTIC_THEMES,
  ROMANTIC_FILTERS,
  RomanticThemeId,
  RomanticFilterId,
  getMeteredCredentials,
  setMeteredCredentials,
} from '../../utils/webrtc';
import { romanticMusic, ROMANTIC_TRACKS, RomanticTrack } from '../../utils/romanticMusic';
import { soundFx } from '../../utils/audio';
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
  Volume1,
  Columns,
  ChevronLeft,
  Check,
  Globe,
  Settings,
  X,
  ScreenShare,
  ScreenShareOff,
  Monitor,
  MonitorUp,
  Music,
  Disc,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Sliders,
  Upload,
  Radio,
  Headphones,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Maximize2,
  Link2,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import {
  parseStreamingUrl,
  extractSpotifyUri,
  ROMANTIC_STREAMING_PRESETS,
  StreamingTrackInfo,
  StreamingProvider,
  getLinkedAccounts,
  saveLinkedAccount,
  removeLinkedAccount,
  LinkedAccount,
} from '../../utils/streamingMusic';

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

// ================= ATMOSPHERIC BACKGROUND COMPONENT =================
// Memoized & Eco-Optimized: Never recalculates random values on timer ticks.
// In Eco Mode (phones/tablets), eliminates GPU-heavy blur-3xl layers and 60fps repaints to keep phone completely cool.
const STATIC_STARS = [
  { top: '12%', left: '15%', size: 2, delay: '0.2s', dur: '3.2s' },
  { top: '22%', left: '82%', size: 3, delay: '1.5s', dur: '4.1s' },
  { top: '38%', left: '45%', size: 2, delay: '0.8s', dur: '3.6s' },
  { top: '48%', left: '18%', size: 1.5, delay: '2.1s', dur: '4.5s' },
  { top: '15%', left: '60%', size: 2.5, delay: '1.1s', dur: '3.9s' },
  { top: '65%', left: '75%', size: 2, delay: '0.5s', dur: '3.4s' },
  { top: '80%', left: '30%', size: 3, delay: '1.9s', dur: '4.8s' },
  { top: '70%', left: '12%', size: 1.5, delay: '2.7s', dur: '3.7s' },
  { top: '28%', left: '92%', size: 2, delay: '0.9s', dur: '4.2s' },
  { top: '85%', left: '88%', size: 2.5, delay: '1.3s', dur: '3.5s' },
  { top: '8%', left: '38%', size: 2, delay: '2.4s', dur: '4.0s' },
  { top: '55%', left: '52%', size: 1.5, delay: '1.7s', dur: '3.8s' },
];

const AtmosphericBackground = React.memo<{ themeId: RomanticThemeId; ecoMode?: boolean }>(
  ({ themeId, ecoMode = false }) => {
    // ECO / COOL PHONE MODE: Render lightweight, gorgeous, battery-friendly romantic atmosphere
    if (ecoMode) {
      switch (themeId) {
        case 'moonlight':
          return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-[#0a0f24] via-[#101538] to-[#181135]">
              {/* Soft Moon Orb */}
              <div className="absolute top-6 right-8 w-20 h-20 rounded-full bg-gradient-to-tr from-sky-100 to-indigo-100 shadow-[0_0_35px_rgba(186,230,253,0.4)] opacity-90" />
              {/* Gentle Floating Celestial Accents */}
              {['✨', '⭐', '✨', '🌟', '🌙'].map((emoji, i) => (
                <div
                  key={i}
                  className="absolute text-base text-sky-200/70 select-none animate-float-slow"
                  style={{
                    left: `${12 + i * 20}%`,
                    bottom: `${10 + (i % 3) * 15}%`,
                    animationDuration: `${7 + i * 2}s`,
                    animationDelay: `${i * 1.2}s`,
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          );

        case 'sunset':
          return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-purple-950/70 via-rose-900/50 to-amber-900/40">
              {/* Sun Horizon Glow */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full bg-gradient-to-t from-amber-400 via-rose-500 to-transparent blur-lg opacity-80" />
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-yellow-300 shadow-[0_0_45px_rgba(251,191,36,0.7)] opacity-95" />
              {/* Gentle Sunset Emojis */}
              {['💖', '🧡', '✨', '🌅', '🥂'].map((emoji, i) => (
                <div
                  key={i}
                  className="absolute text-lg select-none animate-float-slow opacity-85"
                  style={{
                    left: `${10 + i * 18}%`,
                    bottom: `${8 + (i % 3) * 14}%`,
                    animationDuration: `${6 + i * 1.5}s`,
                    animationDelay: `${i * 1.1}s`,
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          );

        case 'candlelight':
          return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-[#140608] via-[#240a0e] to-[#100305]">
              {/* Warm Candle Pool */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-72 h-44 rounded-full bg-amber-500/20 blur-xl" />
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-t from-amber-400 to-transparent blur-md opacity-80" />
              {/* Soft Rose Petals */}
              {['🌹', '✨', '🥀', '🕯️', '🌹'].map((emoji, i) => (
                <div
                  key={i}
                  className="absolute text-lg select-none animate-float-slow opacity-85"
                  style={{
                    left: `${14 + i * 18}%`,
                    bottom: `${12 + (i % 3) * 16}%`,
                    animationDuration: `${6.5 + i * 1.5}s`,
                    animationDelay: `${i * 1.2}s`,
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          );

        case 'sakura':
          return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-[#1a0a21] via-[#2d1235] to-[#45163f]">
              {/* Soft Spring Mist */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-pink-400/10 blur-xl" />
              {/* Falling Sakura Blossoms */}
              {[
                { left: '10%', delay: '0.2s', dur: '6s', size: 'text-xl', content: '🌸' },
                { left: '30%', delay: '1.5s', dur: '7s', size: 'text-2xl', content: '💮' },
                { left: '50%', delay: '0.8s', dur: '6.5s', size: 'text-xl', content: '🌸' },
                { left: '70%', delay: '2.2s', dur: '7.5s', size: 'text-2xl', content: '🌸' },
                { left: '88%', delay: '1.2s', dur: '6.2s', size: 'text-lg', content: '🍃' },
              ].map((sakura, i) => (
                <div
                  key={i}
                  className={`absolute ${sakura.size} select-none animate-sakura-fall`}
                  style={{
                    left: sakura.left,
                    top: '-30px',
                    animationDelay: sakura.delay,
                    animationDuration: sakura.dur,
                  }}
                >
                  {sakura.content}
                </div>
              ))}
            </div>
          );

        case 'aurora':
          return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-[#0b0c1e] via-[#12102f] to-[#0a1e22]">
              {/* Soft Aurora Glow Ribbon */}
              <div className="absolute top-8 -left-10 w-[120%] h-48 bg-gradient-to-r from-emerald-500/20 via-cyan-400/20 to-purple-500/15 blur-2xl" />
              {/* Neon Hearts */}
              {['💜', '💖', '✨', '💫', '💚'].map((emoji, i) => (
                <div
                  key={i}
                  className="absolute text-lg select-none animate-float-slow opacity-85"
                  style={{
                    left: `${15 + i * 18}%`,
                    bottom: `${10 + (i % 3) * 16}%`,
                    animationDuration: `${6 + i * 1.5}s`,
                    animationDelay: `${i * 1.2}s`,
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          );
      }
    }

    // FULL FIDELITY MODE (Desktop / Power plugged in)
    switch (themeId) {
      case 'moonlight':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Luminous Moon Orb */}
            <div className="absolute top-6 right-8 md:top-10 md:right-16 w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-slate-100 via-sky-100 to-indigo-200 shadow-[0_0_60px_rgba(186,230,253,0.5)] flex items-center justify-center opacity-95">
              <div className="w-5 h-5 rounded-full bg-slate-300/40 absolute top-4 left-6" />
              <div className="w-8 h-8 rounded-full bg-slate-300/30 absolute bottom-5 right-7" />
              <div className="w-3 h-3 rounded-full bg-slate-300/30 absolute top-12 left-12" />
            </div>

            {/* Static Pre-Computed Stars */}
            {STATIC_STARS.map((star, i) => (
              <div
                key={`star-${i}`}
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                  top: star.top,
                  left: star.left,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  animationDelay: star.delay,
                  animationDuration: star.dur,
                  boxShadow: `0 0 6px rgba(255,255,255,0.7)`,
                }}
              />
            ))}

            {/* Floating stardust specks */}
            {['✨', '⭐', '✨', '🌟', '🌙'].map((emoji, i) => (
              <div
                key={i}
                className="absolute text-lg text-sky-200/60 select-none animate-float-slow"
                style={{
                  left: `${15 + i * 18}%`,
                  bottom: `${10 + (i % 3) * 15}%`,
                  animationDuration: `${6 + i * 2}s`,
                  animationDelay: `${i * 1.3}s`,
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
        );

      case 'sunset':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Setting sun orb */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-t from-amber-400 via-rose-500 to-transparent blur-xl opacity-70" />
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-32 h-32 md:w-44 md:h-44 rounded-full bg-gradient-to-t from-yellow-300 via-amber-400 to-rose-400 shadow-[0_0_80px_rgba(251,191,36,0.8)] opacity-95" />
            {/* Floating warm sunset hearts */}
            {['💖', '🧡', '✨', '🌅', '🥂', '💖'].map((emoji, i) => (
              <div
                key={i}
                className="absolute text-xl select-none animate-float-slow opacity-80"
                style={{
                  left: `${10 + i * 16}%`,
                  bottom: `${5 + (i % 4) * 12}%`,
                  animationDuration: `${5 + i * 1.5}s`,
                  animationDelay: `${i * 0.9}s`,
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
        );

      case 'candlelight':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Warm candlelight glow */}
            <div className="absolute bottom-4 left-8 w-64 h-64 rounded-full bg-gradient-to-tr from-amber-500/35 via-orange-600/15 to-transparent blur-2xl" />
            <div className="absolute bottom-4 right-8 w-64 h-64 rounded-full bg-gradient-to-tl from-amber-500/35 via-rose-600/15 to-transparent blur-2xl" />

            {/* Drifting red rose petals */}
            {[
              { left: '12%', delay: '0s', dur: '7s', rot: '45deg', size: 'text-2xl' },
              { left: '28%', delay: '2.5s', dur: '8s', rot: '-30deg', size: 'text-xl' },
              { left: '46%', delay: '1s', dur: '6.5s', rot: '60deg', size: 'text-2xl' },
              { left: '68%', delay: '3.2s', dur: '7.5s', rot: '-45deg', size: 'text-xl' },
              { left: '84%', delay: '1.8s', dur: '8.5s', rot: '25deg', size: 'text-2xl' },
            ].map((petal, i) => (
              <div
                key={i}
                className={`absolute ${petal.size} select-none animate-petal-swirl`}
                style={{
                  left: petal.left,
                  top: '-20px',
                  animationDelay: petal.delay,
                  animationDuration: petal.dur,
                }}
              >
                <div style={{ transform: `rotate(${petal.rot})` }}>{i % 2 === 0 ? '🌹' : '🥀'}</div>
              </div>
            ))}

            {/* Warm embers */}
            {['✨', '🔥', '✨', '🕯️', '✨'].map((emoji, i) => (
              <div
                key={i}
                className="absolute text-base text-amber-200 select-none animate-float-slow opacity-75"
                style={{
                  left: `${18 + i * 16}%`,
                  bottom: `${15 + (i % 3) * 20}%`,
                  animationDuration: `${4.5 + i}s`,
                  animationDelay: `${i * 1.1}s`,
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
        );

      case 'sakura':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Soft pink sakura blossoms */}
            {[
              { left: '10%', delay: '0.2s', dur: '6s', size: 'text-2xl', content: '🌸' },
              { left: '25%', delay: '2.1s', dur: '7.5s', size: 'text-xl', content: '💮' },
              { left: '45%', delay: '1.1s', dur: '6.8s', size: 'text-2xl', content: '🌸' },
              { left: '65%', delay: '3.4s', dur: '8s', size: 'text-lg', content: '🌸' },
              { left: '85%', delay: '0.8s', dur: '7s', size: 'text-3xl', content: '💮' },
              { left: '92%', delay: '2.7s', dur: '6.2s', size: 'text-xl', content: '🍃' },
            ].map((sakura, i) => (
              <div
                key={i}
                className={`absolute ${sakura.size} select-none animate-sakura-fall`}
                style={{
                  left: sakura.left,
                  top: '-40px',
                  animationDelay: sakura.delay,
                  animationDuration: sakura.dur,
                }}
              >
                {sakura.content}
              </div>
            ))}
          </div>
        );

      case 'aurora':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Northern Lights Aurora Waves */}
            <div className="absolute -top-10 -left-[20%] w-[140%] h-72 bg-gradient-to-br from-emerald-500/25 via-violet-500/20 to-transparent blur-3xl transform -rotate-6" />
            <div className="absolute top-10 -right-[10%] w-[120%] h-64 bg-gradient-to-bl from-cyan-400/20 via-purple-500/15 to-transparent blur-2xl transform rotate-3" />
            {/* Neon hearts */}
            {['💜', '💖', '✨', '💫', '💚', '💜'].map((emoji, i) => (
              <div
                key={i}
                className="absolute text-xl select-none animate-float-slow opacity-85"
                style={{
                  left: `${12 + i * 15}%`,
                  bottom: `${10 + (i % 3) * 18}%`,
                  animationDuration: `${5.5 + i}s`,
                  animationDelay: `${i * 1.2}s`,
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
        );
    }
  }
);

// ================= FILTER OVERLAY VISUAL EFFECT COMPONENT =================
// Memoized and Eco-Optimized: Avoids heavy SVG feTurbulence filters that cause phone overheating.
const FilterOverlayEffect = React.memo<{ filterId: RomanticFilterId; ecoMode?: boolean }>(
  ({ filterId, ecoMode = false }) => {
    if (ecoMode) {
      // In Eco/Mobile mode, keep live camera streams fast and cool with simple CSS vignette
      return <div className="absolute inset-0 pointer-events-none rounded-3xl border border-white/10" />;
    }

    switch (filterId) {
      case 'fairy':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-3xl">
            <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(255,255,255,0.15)] pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-bl from-pink-300/15 via-purple-300/10 to-transparent rounded-full blur-xl" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-tr from-cyan-300/15 via-emerald-300/10 to-transparent rounded-full blur-xl" />
          </div>
        );
      case 'golden':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-3xl">
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(180,83,9,0.25)] pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-bl from-amber-400/25 via-yellow-500/15 to-transparent rounded-full blur-2xl" />
          </div>
        );
      case 'rose':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-3xl">
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(244,63,94,0.15)] pointer-events-none" />
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-pink-400/10 rounded-full blur-xl" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-rose-400/10 rounded-full blur-xl" />
          </div>
        );
      case 'candlelight':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-3xl">
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(120,53,15,0.45)] pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-orange-600/20 to-transparent blur-lg" />
          </div>
        );
      case 'vintage':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-3xl">
            <div className="absolute inset-0 border-[8px] border-black/30 rounded-3xl pointer-events-none" />
            <div className="absolute inset-0 shadow-[inset_0_0_70px_rgba(0,0,0,0.5)] pointer-events-none" />
          </div>
        );
      case 'dreamy':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-3xl">
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(255,255,255,0.2)] pointer-events-none" />
            <div className="absolute -top-[10%] left-[10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.06)_0%,_transparent_60%)] pointer-events-none" />
          </div>
        );
      default:
        return null;
    }
  }
);

export const RomanticVideoChat: React.FC<RomanticVideoChatProps> = ({ onClose }) => {
  const { profile, currentUserName, partnerName, partnerPhoto, partnerRole, partnerOnline } = useCouple();

  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTheme, setActiveTheme] = useState<RomanticThemeId>(videoCallService.activeTheme);
  const [activeFilter, setActiveFilter] = useState<RomanticFilterId>(videoCallService.activeFilter);
  const [viewMode, setViewMode] = useState<'pip' | 'split'>('split');
  const [showThemes, setShowThemes] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(romanticMusic.getIsPlaying());
  const [activeMusicTrackId, setActiveMusicTrackId] = useState(romanticMusic.getActiveTrackId());
  const [musicVolume, setMusicVolume] = useState(romanticMusic.getVolume());
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [musicActiveTab, setMusicActiveTab] = useState<'tracks' | 'streaming' | 'custom'>('tracks');
  const [customSongInput, setCustomSongInput] = useState('');
  const [customSongTitleInput, setCustomSongTitleInput] = useState('');
  const [streamingTrack, setStreamingTrack] = useState<StreamingTrackInfo | null>(null);
  const [streamingInputUrl, setStreamingInputUrl] = useState('');
  const [streamingInputTitle, setStreamingInputTitle] = useState('');
  const [streamingProviderTab, setStreamingProviderTab] = useState<StreamingProvider>('spotify');
  const [linkedAccounts, setLinkedAccounts] = useState<Record<string, LinkedAccount>>(() => getLinkedAccounts());
  const [accountInputId, setAccountInputId] = useState('');
  const [isLinkingAccount, setIsLinkingAccount] = useState(false);
  const [showStreamingDock, setShowStreamingDock] = useState(true);
  const [showScreenShareDock, setShowScreenShareDock] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(videoCallService.isScreenSharing);
  const [partnerScreenSharing, setPartnerScreenSharing] = useState(videoCallService.partnerScreenSharing);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(videoCallService.screenStream);
  const [remoteScreenStream, setRemoteScreenStream] = useState<MediaStream | null>(videoCallService.remoteScreenStream);
  const [screenSharerName, setScreenSharerName] = useState<string>('');
  const [callDuration, setCallDuration] = useState(0);
  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);
  const [touchingHeart, setTouchingHeart] = useState(false);
  const [partnerTouching, setPartnerTouching] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioAutoplayBlocked, setAudioAutoplayBlocked] = useState(false);
  const [syncToast, setSyncToast] = useState<{ message: string; icon: string } | null>(null);
  const [iceState, setIceState] = useState<string>(videoCallService.iceConnectionState || 'new');
  const [showNetworkSettings, setShowNetworkSettings] = useState(false);
  const [meteredAppInput, setMeteredAppInput] = useState(() => getMeteredCredentials().appName);
  const [meteredKeyInput, setMeteredKeyInput] = useState(() => getMeteredCredentials().apiKey);

  // Cool Phone / Eco Mode: automatically enabled on mobile phones & tablets to prevent high CPU usage & overheating
  const [ecoMode, setEcoMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
  });

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamingIframeRef = useRef<HTMLIFrameElement | null>(null);
  const hasUnlockedAudio = useRef(false);
  const streamingStartedAt = useRef<number>(Date.now());
  const [showSyncListenPrompt, setShowSyncListenPrompt] = useState(false);

  // Set user role on mount
  useEffect(() => {
    videoCallService.setMyRole(profile.currentUserRole);
  }, [profile.currentUserRole]);

  // Auto-unlock web audio policy on any user gesture inside the call window
  useEffect(() => {
    const unlockOnGesture = () => {
      hasUnlockedAudio.current = true;
      romanticMusic.unlockAudio();
    };
    window.addEventListener('pointerdown', unlockOnGesture, { passive: true });
    window.addEventListener('touchstart', unlockOnGesture, { passive: true });
    window.addEventListener('click', unlockOnGesture, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlockOnGesture);
      window.removeEventListener('touchstart', unlockOnGesture);
      window.removeEventListener('click', unlockOnGesture);
    };
  }, []);

  // Subscribe to call state changes, screen sharing, music, and bidirectional theme-sync
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
      setIsScreenSharing(state.isScreenSharing);
      setPartnerScreenSharing(state.partnerScreenSharing);
      setScreenStream(state.screenStream);
      setRemoteScreenStream(state.remoteScreenStream || null);
      setScreenSharerName(state.screenSharerName || '');
      if (state.iceConnectionState) setIceState(state.iceConnectionState);
    });

    const unsubReaction = videoCallService.onReaction((reaction) => {
      setReactions((prev) => [...prev.slice(-20), reaction]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 3500);

      if (reaction.emoji === '💋' || reaction.emoji === '💖' || reaction.emoji === '💍') {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { x: reaction.x / 100, y: reaction.y / 100 },
          colors: ['#f43f5e', '#ec4899', '#fbbf24'],
        });
      }
    });

    // Bidirectional theme and filter sync listener from partner
    const unsubThemeSync = videoCallService.onThemeSync((info) => {
      if (info.themeId) setActiveTheme(info.themeId);
      if (info.filterId) setActiveFilter(info.filterId);

      const themeObj = ROMANTIC_THEMES.find((t) => t.id === info.themeId);
      const filterObj = ROMANTIC_FILTERS.find((f) => f.id === info.filterId);
      const sender = info.senderName || partnerName || 'Your Love';

      let msg = '';
      let icon = '✨';
      if (themeObj && filterObj) {
        msg = `${sender} set atmosphere to ${themeObj.name} & ${filterObj.name} filter!`;
        icon = themeObj.icon;
      } else if (themeObj) {
        msg = `${sender} changed the atmosphere to ${themeObj.name}!`;
        icon = themeObj.icon;
      } else if (filterObj) {
        msg = `${sender} applied the ${filterObj.name} filter!`;
        icon = filterObj.icon;
      }

      if (msg) {
        setSyncToast({ message: msg, icon });
        setTimeout(() => setSyncToast(null), 4500);
        soundFx.playPop(700, 0.08);
        confetti({
          particleCount: 20,
          spread: 50,
          origin: { y: 0.2 },
          colors: ['#f43f5e', '#ec4899', '#fbbf24'],
        });
      }
    });

    // Screen sharing sync listener from partner
    const unsubScreenShare = videoCallService.onScreenShare((info) => {
      setPartnerScreenSharing(info.isScreenSharing);
      if (info.sharerName) setScreenSharerName(info.sharerName);
      const sender = info.sharerName || partnerName || 'Your Partner';
      setSyncToast({
        message: info.isScreenSharing
          ? `${sender} started sharing their screen 🖥️`
          : `${sender} stopped sharing screen ⏹️`,
        icon: '🖥️',
      });
      setTimeout(() => setSyncToast(null), 4000);
      soundFx.playPop(info.isScreenSharing ? 720 : 480, 0.08);
      if (info.isScreenSharing) {
        setShowScreenShareDock(true);
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.25 },
          colors: ['#38bdf8', '#818cf8', '#c084fc'],
        });
      }
    });

    // Synchronized romantic music listener from partner
    const unsubMusicSync = videoCallService.onMusicSync((info) => {
      // 1. If partner played or updated an online streaming track (Spotify / Apple Music / YouTube)
      if (info.streamingEmbedUrl) {
        romanticMusic.pauseForStreaming();
        if (info.startedAt) {
          streamingStartedAt.current = info.startedAt;
        }

        const incomingSpotifyUri =
          info.spotifyUri ||
          (info.streamingProvider === 'spotify'
            ? extractSpotifyUri(info.streamingOriginalUrl || info.streamingEmbedUrl)
            : undefined);

        setStreamingTrack({
          provider: (info.streamingProvider as StreamingProvider) || 'spotify',
          embedUrl: info.streamingEmbedUrl,
          originalUrl: info.streamingOriginalUrl || info.streamingEmbedUrl,
          spotifyUri: incomingSpotifyUri,
          title: info.streamingTitle || 'Online Stream',
          subtitle: info.streamingSubtitle || `${info.streamingProvider || 'Online'} stream`,
          icon: info.streamingProvider === 'spotify' ? '🟢' : info.streamingProvider === 'apple-music' ? '🍎' : '▶️',
          type: 'track',
          height: info.streamingProvider === 'apple-music' ? 152 : 200,
        });
        setMusicPlaying(info.isPlaying ?? true);
        setShowStreamingDock(true);

        // Send play/pause/seek commands to the embedded player (works for YouTube-based embeds
        // which now includes Spotify tracks; harmlessly ignored by Apple Music embeds)
        const sendIframeCommands = () => {
          if (streamingIframeRef.current?.contentWindow) {
            if (info.isPlaying === false) {
              streamingIframeRef.current.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
                '*'
              );
              return;
            }
            streamingIframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
              '*'
            );
            streamingIframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'unMute', args: '' }),
              '*'
            );
            if (info.startedAt) {
              const elapsed = Math.max(0, Math.floor((Date.now() - info.startedAt) / 1000));
              if (elapsed > 1) {
                streamingIframeRef.current.contentWindow.postMessage(
                  JSON.stringify({ event: 'command', func: 'seekTo', args: [elapsed, true] }),
                  '*'
                );
              }
            }
          }
        };

        // If audio has already been unlocked on this device, immediately start playing & unmute
        if (hasUnlockedAudio.current) {
          setShowSyncListenPrompt(false);
          // Send commands at multiple intervals to catch player readiness
          setTimeout(sendIframeCommands, 350);
          setTimeout(sendIframeCommands, 900);
          setTimeout(sendIframeCommands, 2000);
        } else {
          // If first time receiving streaming music on this device, prompt once to unlock audio
          setShowSyncListenPrompt(true);
        }

        const sender = info.senderName || partnerName || 'Your Love';
        const isPause = info.isPlaying === false;
        setSyncToast({
          message: isPause
            ? `${sender} paused music ⏸️`
            : `${sender} playing "${info.streamingTitle || 'song'}" together! 🎶`,
          icon: info.streamingProvider === 'spotify' ? '🟢' : info.streamingProvider === 'apple-music' ? '🍎' : '▶️',
        });
        setTimeout(() => setSyncToast(null), 3500);
        return;
      }

      // If partner stopped streaming or switched to soundscapes
      setStreamingTrack(null);
      setShowSyncListenPrompt(false);

      if (info.trackId && info.trackId !== 'none') {
        setActiveMusicTrackId(info.trackId);
        if (info.trackId === 'custom-song' && info.customUrl) {
          romanticMusic.playCustomAudio(info.customUrl, info.customTitle);
        } else {
          romanticMusic.playTrack(info.trackId);
        }
      }
      if (info.volume !== undefined) {
        romanticMusic.setVolume(info.volume);
        setMusicVolume(info.volume);
      }
      if (info.isPlaying !== undefined) {
        setMusicPlaying(info.isPlaying);
        if (streamingIframeRef.current?.contentWindow) {
          const cmd = info.isPlaying ? 'playVideo' : 'pauseVideo';
          streamingIframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: cmd, args: '' }),
            '*'
          );
        }
        if (info.isPlaying) romanticMusic.resume();
        else romanticMusic.pause();
      }

      const sender = info.senderName || partnerName || 'Your Love';
      const trk = ROMANTIC_TRACKS.find((t) => t.id === info.trackId);
      const title = trk ? trk.title : info.customTitle || 'Romantic Ambience';
      setSyncToast({
        message: info.isPlaying
          ? `${sender} played ${title} 🎶`
          : `${sender} paused the music ⏸️`,
        icon: trk ? trk.icon : '🎵',
      });
      setTimeout(() => setSyncToast(null), 3500);
    });

    const unsubTrackChange = romanticMusic.onTrackChange((s) => {
      setActiveMusicTrackId(s.activeTrackId);
      setMusicPlaying(s.isPlaying);
      setMusicVolume(s.volume);
    });

    return () => {
      unsubState();
      unsubReaction();
      unsubThemeSync();
      unsubScreenShare();
      unsubMusicSync();
      unsubTrackChange();
    };
  }, [partnerName]);

  // Attach local camera stream to video tags (always user's face, never replaced by screen share)
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

  // Attach screen share stream to dedicated separate screen share video window
  useEffect(() => {
    if (screenShareVideoRef.current) {
      const activeScreenStream = isScreenSharing ? screenStream : remoteScreenStream;
      if ((isScreenSharing || partnerScreenSharing) && activeScreenStream) {
        screenShareVideoRef.current.srcObject = activeScreenStream;
        screenShareVideoRef.current.play().catch((err) => console.log('Autoplay screen share stream:', err));
      } else {
        screenShareVideoRef.current.srcObject = null;
      }
    }
  }, [isScreenSharing, screenStream, partnerScreenSharing, remoteScreenStream, showScreenShareDock]);

  // Attach remote stream to video and dedicated audio elements
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

    if (remoteAudioRef.current) {
      if (remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current
          .play()
          .then(() => {
            setAudioAutoplayBlocked(false);
          })
          .catch((err) => {
            console.warn('Autoplay remote audio blocked by browser policy:', err);
            setAudioAutoplayBlocked(true);
          });
      } else {
        remoteAudioRef.current.srcObject = null;
        setAudioAutoplayBlocked(false);
      }
    }
  }, [remoteStream, callStatus, viewMode]);

  const handleEnableAudio = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current
        .play()
        .then(() => setAudioAutoplayBlocked(false))
        .catch(() => {});
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.play().catch(() => {});
    }
  };

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

  // Select theme with instant bidirectional sync to partner
  const handleSelectTheme = (themeId: RomanticThemeId) => {
    setActiveTheme(themeId);
    videoCallService.setTheme(themeId, true, profile.currentUserRole, currentUserName);
    setShowThemes(false);
    const themeObj = ROMANTIC_THEMES.find((t) => t.id === themeId);
    if (themeObj) {
      setSyncToast({
        message: `Atmosphere set to ${themeObj.name} for both of you!`,
        icon: themeObj.icon,
      });
      setTimeout(() => setSyncToast(null), 3500);
      soundFx.playPop(650, 0.08);
    }
  };

  // Select filter with instant bidirectional sync to partner
  const handleSelectFilter = (filterId: RomanticFilterId) => {
    setActiveFilter(filterId);
    videoCallService.setFilter(filterId, true, profile.currentUserRole, currentUserName);
    setShowFilters(false);
    const filterObj = ROMANTIC_FILTERS.find((f) => f.id === filterId);
    if (filterObj) {
      setSyncToast({
        message: `Applied ${filterObj.name} filter for both of you!`,
        icon: filterObj.icon,
      });
      setTimeout(() => setSyncToast(null), 3500);
      soundFx.playPop(650, 0.08);
    }
  };

  const handleSendReaction = (emoji: string) => {
    const x = Math.floor(Math.random() * 60) + 20;
    const y = Math.floor(Math.random() * 50) + 30;
    videoCallService.sendReaction(emoji, x, y, profile.currentUserRole);
  };

  const handleToggleScreenShare = async () => {
    try {
      setPermissionError(null);
      if (isScreenSharing) {
        await videoCallService.stopScreenShare();
        soundFx.playPop(520, 0.08);
      } else {
        const ok = await videoCallService.startScreenShare();
        if (ok) {
          setShowScreenShareDock(true);
          soundFx.playPop(750, 0.08);
          confetti({
            particleCount: 20,
            spread: 50,
            origin: { y: 0.3 },
            colors: ['#38bdf8', '#818cf8', '#c084fc'],
          });
        }
      }
    } catch (err: any) {
      console.warn('Screen share error:', err);
      setPermissionError('Could not share screen: ' + (err.message || 'Permission denied'));
      setTimeout(() => setPermissionError(null), 5000);
    }
  };

  const handleSelectTrack = (trackId: string) => {
    setStreamingTrack(null);
    romanticMusic.playTrack(trackId);
    setActiveMusicTrackId(trackId);
    setMusicPlaying(true);
    videoCallService.syncMusic({
      trackId,
      isPlaying: true,
      volume: romanticMusic.getVolume(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
    });
    const trk = ROMANTIC_TRACKS.find((t) => t.id === trackId);
    if (trk) {
      setSyncToast({
        message: `Playing "${trk.title}" for both of you!`,
        icon: trk.icon,
      });
      setTimeout(() => setSyncToast(null), 3500);
    }
  };

  const handleTapToListenTogether = () => {
    hasUnlockedAudio.current = true;
    setShowSyncListenPrompt(false);
    romanticMusic.unlockAudio();

    if (streamingIframeRef.current?.contentWindow) {
      streamingIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
        '*'
      );
      streamingIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'unMute', args: '' }),
        '*'
      );
      const elapsed = Math.max(0, Math.floor((Date.now() - streamingStartedAt.current) / 1000));
      if (elapsed > 1) {
        streamingIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [elapsed, true] }),
          '*'
        );
      }
    }
  };

  const handleIframeLoaded = () => {
    if (streamingIframeRef.current?.contentWindow && musicPlaying) {
      streamingIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
        '*'
      );
      streamingIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'unMute', args: '' }),
        '*'
      );
      const elapsed = Math.max(0, Math.floor((Date.now() - streamingStartedAt.current) / 1000));
      if (elapsed > 1) {
        streamingIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [elapsed, true] }),
          '*'
        );
      }
    }
  };

  const handleToggleMusicPlay = () => {
    if (streamingTrack) {
      const nextPlaying = !musicPlaying;
      setMusicPlaying(nextPlaying);

      if (streamingIframeRef.current?.contentWindow) {
        const cmd = nextPlaying ? 'playVideo' : 'pauseVideo';
        streamingIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: cmd, args: '' }),
          '*'
        );
      }

      videoCallService.syncMusic({
        trackId: 'streaming-track',
        isPlaying: nextPlaying,
        streamingProvider: streamingTrack.provider,
        streamingEmbedUrl: streamingTrack.embedUrl,
        streamingOriginalUrl: streamingTrack.originalUrl,
        streamingTitle: streamingTrack.title,
        streamingSubtitle: streamingTrack.subtitle,
        spotifyUri: streamingTrack.spotifyUri,
        startedAt: streamingStartedAt.current,
        senderRole: profile.currentUserRole,
        senderName: currentUserName,
      });
      setSyncToast({
        message: nextPlaying ? 'Resumed streaming for both!' : 'Paused streaming for both',
        icon: nextPlaying ? streamingTrack.icon : '⏸️',
      });
      setTimeout(() => setSyncToast(null), 2500);
      return;
    }

    romanticMusic.togglePlay();
    const nextPlaying = romanticMusic.getIsPlaying();
    setMusicPlaying(nextPlaying);
    videoCallService.syncMusic({
      trackId: romanticMusic.getActiveTrackId(),
      isPlaying: nextPlaying,
      volume: romanticMusic.getVolume(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
    });
    setSyncToast({
      message: nextPlaying ? 'Resumed background music for both!' : 'Paused background music for both',
      icon: nextPlaying ? '🎶' : '⏸️',
    });
    setTimeout(() => setSyncToast(null), 2500);
  };

  const handleNextMusicTrack = () => {
    if (streamingTrack) {
      const providerPresets = ROMANTIC_STREAMING_PRESETS.filter((p) => p.provider === streamingTrack.provider);
      const presets = providerPresets.length > 0 ? providerPresets : ROMANTIC_STREAMING_PRESETS;
      const curIdx = presets.findIndex(
        (p) => p.originalUrl === streamingTrack.originalUrl || p.embedUrl === streamingTrack.embedUrl
      );
      const nextIdx = curIdx >= 0 ? (curIdx + 1) % presets.length : 0;
      handleSelectStreamingPreset(presets[nextIdx]);
      return;
    }

    romanticMusic.nextTrack();
    const trk = romanticMusic.getActiveTrack();
    setActiveMusicTrackId(trk.id);
    setMusicPlaying(true);
    videoCallService.syncMusic({
      trackId: trk.id,
      isPlaying: true,
      volume: romanticMusic.getVolume(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
    });
    setSyncToast({
      message: `Switched to ${trk.title} for both!`,
      icon: trk.icon,
    });
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handlePrevMusicTrack = () => {
    if (streamingTrack) {
      const providerPresets = ROMANTIC_STREAMING_PRESETS.filter((p) => p.provider === streamingTrack.provider);
      const presets = providerPresets.length > 0 ? providerPresets : ROMANTIC_STREAMING_PRESETS;
      const curIdx = presets.findIndex(
        (p) => p.originalUrl === streamingTrack.originalUrl || p.embedUrl === streamingTrack.embedUrl
      );
      const prevIdx = curIdx > 0 ? curIdx - 1 : presets.length - 1;
      handleSelectStreamingPreset(presets[prevIdx]);
      return;
    }

    romanticMusic.previousTrack();
    const trk = romanticMusic.getActiveTrack();
    setActiveMusicTrackId(trk.id);
    setMusicPlaying(true);
    videoCallService.syncMusic({
      trackId: trk.id,
      isPlaying: true,
      volume: romanticMusic.getVolume(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
    });
    setSyncToast({
      message: `Switched to ${trk.title} for both!`,
      icon: trk.icon,
    });
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleVolumeChange = (vol: number) => {
    setMusicVolume(vol);
    romanticMusic.setVolume(vol);
    if (streamingIframeRef.current?.contentWindow && streamingTrack?.provider === 'youtube') {
      streamingIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [Math.round(vol * 100)] }),
        '*'
      );
    }
  };

  const handlePlayCustomSong = () => {
    if (!customSongInput.trim()) return;
    setStreamingTrack(null);
    const title = customSongTitleInput.trim() || 'Our Special Song';
    romanticMusic.playCustomAudio(customSongInput.trim(), title);
    setActiveMusicTrackId('custom-song');
    setMusicPlaying(true);
    videoCallService.syncMusic({
      trackId: 'custom-song',
      isPlaying: true,
      volume: romanticMusic.getVolume(),
      customUrl: customSongInput.trim(),
      customTitle: title,
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
    });
    setSyncToast({
      message: `Playing "${title}" for both of you!`,
      icon: '💖',
    });
    setTimeout(() => setSyncToast(null), 3500);
  };

  const handleUploadCustomAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStreamingTrack(null);
    const fileUrl = URL.createObjectURL(file);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
    setCustomSongInput(fileUrl);
    setCustomSongTitleInput(cleanTitle);
    romanticMusic.playCustomAudio(fileUrl, cleanTitle);
    setActiveMusicTrackId('custom-song');
    setMusicPlaying(true);
    videoCallService.syncMusic({
      trackId: 'custom-song',
      isPlaying: true,
      volume: romanticMusic.getVolume(),
      customUrl: fileUrl,
      customTitle: cleanTitle,
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
    });
    setSyncToast({
      message: `Loaded & playing "${cleanTitle}" for both!`,
      icon: '💖',
    });
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Streaming Handlers (Spotify / Apple Music / YouTube)
  const handleSelectStreamingPreset = (preset: StreamingTrackInfo) => {
    // If a YouTube video was playing, pause it before loading the new preset
    if (streamingIframeRef.current?.contentWindow) {
      try {
        streamingIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
          '*'
        );
      } catch {}
    }
    romanticMusic.pauseForStreaming();
    hasUnlockedAudio.current = true;
    const now = Date.now();
    streamingStartedAt.current = now;
    setStreamingTrack(preset);
    setMusicPlaying(true);
    setShowStreamingDock(true);
    setShowSyncListenPrompt(false);

    videoCallService.syncMusic({
      trackId: 'streaming-track',
      isPlaying: true,
      streamingProvider: preset.provider,
      streamingEmbedUrl: preset.embedUrl,
      streamingOriginalUrl: preset.originalUrl,
      streamingTitle: preset.title,
      streamingSubtitle: preset.subtitle,
      spotifyUri: preset.spotifyUri,
      startedAt: now,
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
    });
    setSyncToast({
      message: `Playing "${preset.title}" via ${preset.provider.toUpperCase()} for both! 🎶`,
      icon: preset.icon,
    });
    setTimeout(() => setSyncToast(null), 3500);
  };

  const handlePlayStreamingUrl = () => {
    if (!streamingInputUrl.trim()) return;
    const rawUrl = streamingInputUrl.trim();
    const parsed = parseStreamingUrl(rawUrl, streamingInputTitle.trim());
    if (!parsed) {
      setSyncToast({
        message: 'Could not recognize streaming link. Try a Spotify, Apple Music, or YouTube link!',
        icon: '⚠️',
      });
      setTimeout(() => setSyncToast(null), 3500);
      return;
    }
    // If a YouTube video was playing, pause it before loading the new track
    if (streamingIframeRef.current?.contentWindow) {
      try {
        streamingIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
          '*'
        );
      } catch {}
    }
    romanticMusic.pauseForStreaming();
    hasUnlockedAudio.current = true;
    const now = Date.now();
    streamingStartedAt.current = now;
    setStreamingTrack(parsed);
    setMusicPlaying(true);
    setShowStreamingDock(true);
    setShowSyncListenPrompt(false);

    if (parsed.provider === 'spotify') {
      // Fetch accurate metadata via Spotify oEmbed if no custom title was typed
      if (!streamingInputTitle.trim()) {
        fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(parsed.originalUrl)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.title) {
              const fullTitle = data.author_name ? `${data.title} — ${data.author_name}` : data.title;
              setStreamingTrack((prev) => (prev ? { ...prev, title: fullTitle } : prev));
              videoCallService.syncMusic({
                trackId: 'streaming-track',
                isPlaying: true,
                streamingProvider: 'spotify',
                streamingEmbedUrl: parsed!.embedUrl,
                streamingOriginalUrl: parsed!.originalUrl,
                streamingTitle: fullTitle,
                streamingSubtitle: parsed!.subtitle,
                spotifyUri: parsed!.spotifyUri,
                startedAt: now,
                senderRole: profile.currentUserRole,
                senderName: currentUserName,
              });
            }
          })
          .catch(() => {});
      }
    }

    videoCallService.syncMusic({
      trackId: 'streaming-track',
      isPlaying: true,
      streamingProvider: parsed.provider,
      streamingEmbedUrl: parsed.embedUrl,
      streamingOriginalUrl: parsed.originalUrl,
      streamingTitle: parsed.title,
      streamingSubtitle: parsed.subtitle,
      spotifyUri: parsed.spotifyUri,
      startedAt: now,
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
    });
    setSyncToast({
      message: `Streaming "${parsed.title}" for both of you!`,
      icon: parsed.icon,
    });
    setTimeout(() => setSyncToast(null), 3500);
    setStreamingInputUrl('');
    setStreamingInputTitle('');
  };

  const handleStopStreaming = () => {
    if (streamingIframeRef.current?.contentWindow) {
      streamingIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
        '*'
      );
    }
    setStreamingTrack(null);
    setMusicPlaying(false);
    setShowSyncListenPrompt(false);
    videoCallService.syncMusic({
      trackId: 'none',
      isPlaying: false,
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
    });
    setSyncToast({
      message: 'Stopped streaming music',
      icon: '⏹️',
    });
    setTimeout(() => setSyncToast(null), 2500);
  };

  const handleLinkAccount = (provider: StreamingProvider) => {
    if (!accountInputId.trim()) return;
    saveLinkedAccount({
      provider,
      accountIdentifier: accountInputId.trim(),
      displayName: accountInputId.trim(),
      connectedAt: Date.now(),
    });
    setLinkedAccounts(getLinkedAccounts());
    setAccountInputId('');
    setIsLinkingAccount(false);
    setSyncToast({
      message: `Linked your ${provider === 'spotify' ? 'Spotify' : provider === 'apple-music' ? 'Apple Music' : 'YouTube'} account!`,
      icon: '✅',
    });
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleUnlinkAccount = (provider: StreamingProvider) => {
    removeLinkedAccount(provider);
    setLinkedAccounts(getLinkedAccounts());
    setSyncToast({
      message: `Unlinked ${provider} account`,
      icon: '🗑️',
    });
    setTimeout(() => setSyncToast(null), 2500);
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

  const resolvedEmbedUrl = useMemo(() => {
    if (!streamingTrack) return '';
    // Append origin param for any YouTube-based embed (includes Spotify synced streams)
    if (
      streamingTrack.embedUrl.includes('youtube') &&
      typeof window !== 'undefined' &&
      !streamingTrack.embedUrl.includes('origin=')
    ) {
      return `${streamingTrack.embedUrl}&origin=${encodeURIComponent(window.location.origin)}`;
    }
    return streamingTrack.embedUrl;
  }, [streamingTrack]);

  const currentTrackConfig = streamingTrack
    ? {
        id: 'streaming-track',
        title: streamingTrack.title,
        subtitle: streamingTrack.subtitle,
        genre: `${streamingTrack.provider.toUpperCase()} Stream`,
        icon: streamingTrack.icon,
        duration: 'Online Stream',
        bpm: undefined,
        description: `Streaming together via ${streamingTrack.provider}.`,
        gradient:
          streamingTrack.provider === 'spotify'
            ? 'from-emerald-950 via-slate-900 to-black'
            : streamingTrack.provider === 'apple-music'
            ? 'from-rose-950 via-slate-900 to-black'
            : 'from-red-950 via-slate-900 to-black',
        glowColor:
          streamingTrack.provider === 'spotify'
            ? 'rgba(34, 197, 94, 0.45)'
            : 'rgba(244, 63, 94, 0.45)',
      }
    : ROMANTIC_TRACKS.find((t) => t.id === activeMusicTrackId) || {
        id: 'custom-song',
        title: customSongTitleInput || 'Our Special Song',
        subtitle: 'Custom couple track',
        genre: 'Couple Choice',
        icon: '💖',
        duration: 'Streaming',
        bpm: 72,
        description: 'Your shared personal song playing softly in the background.',
        gradient: 'from-pink-900 via-rose-900 to-purple-950',
        glowColor: 'rgba(244, 63, 94, 0.45)',
      };

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 bg-gradient-to-br ${currentThemeConfig.gradient} min-h-[580px] md:min-h-[640px] flex flex-col justify-between border-2 ${currentThemeConfig.accentBorder} select-none`}>
      {/* CSS Animation Keyframes for Realistic Romantic Atmospheres */}
      <style>{`
        @keyframes floatSlow {
          0% { transform: translateY(0) scale(0.95); opacity: 0; }
          20% { opacity: 0.85; }
          80% { opacity: 0.85; }
          100% { transform: translateY(-280px) scale(1.1); opacity: 0; }
        }
        @keyframes petalFall {
          0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(520px) rotate(360deg) translateX(80px); opacity: 0; }
        }
        @keyframes sakuraFall {
          0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
          15% { opacity: 0.95; }
          85% { opacity: 0.95; }
          100% { transform: translateY(520px) rotate(540deg) translateX(120px); opacity: 0; }
        }
        @keyframes candleFlicker1 {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          30% { opacity: 0.45; transform: scale(1.08); }
          60% { opacity: 0.28; transform: scale(0.95); }
          85% { opacity: 0.42; transform: scale(1.04); }
        }
        @keyframes candleFlicker2 {
          0%, 100% { opacity: 0.32; transform: scale(1); }
          25% { opacity: 0.42; transform: scale(1.05); }
          55% { opacity: 0.25; transform: scale(0.92); }
          80% { opacity: 0.38; transform: scale(1.06); }
        }
        @keyframes auroraWave1 {
          0%, 100% { transform: translateY(0) scaleX(1); opacity: 0.6; }
          50% { transform: translateY(-18px) scaleX(1.1); opacity: 0.9; }
        }
        @keyframes auroraWave2 {
          0%, 100% { transform: translateY(0) scaleX(1); opacity: 0.5; }
          50% { transform: translateY(16px) scaleX(1.08); opacity: 0.85; }
        }
        /* New Keyframes */
        @keyframes shootingStar {
          0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateX(-400px) translateY(400px) rotate(-45deg); opacity: 0; }
        }
        @keyframes sparkleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 1; }
        }
        @keyframes smokeDrift {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-150px) translateX(30px) scale(1.5); opacity: 0; }
        }
        @keyframes petalSwirl {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.9; }
          25% { transform: translateY(130px) translateX(50px); }
          50% { transform: translateY(260px) translateX(-30px); }
          75% { transform: translateY(390px) translateX(40px); opacity: 0.9; }
          100% { transform: translateY(520px) translateX(-20px); opacity: 0; }
        }
        @keyframes bokehDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes flickerGlow {
          0%, 100% { opacity: 1; }
          25% { opacity: 0.8; }
          50% { opacity: 0.95; }
          75% { opacity: 0.7; }
        }
        @keyframes grainShift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-1%, 1%); }
          50% { transform: translate(1%, -1%); }
          75% { transform: translate(1%, 1%); }
        }
        @keyframes lightLeak {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        .animate-float-slow {
          animation: floatSlow 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-petal-fall {
          animation: petalFall linear infinite;
        }
        .animate-sakura-fall {
          animation: sakuraFall linear infinite;
        }
        .animate-candle-flicker-1 {
          animation: candleFlicker1 2.8s ease-in-out infinite;
        }
        .animate-candle-flicker-2 {
          animation: candleFlicker2 3.4s ease-in-out infinite;
        }
        .animate-aurora-wave-1 {
          animation: auroraWave1 6s ease-in-out infinite;
        }
        .animate-aurora-wave-2 {
          animation: auroraWave2 8s ease-in-out infinite;
        }
        
        /* New Utilities */
        .animate-shooting-star {
          animation: shootingStar 3s ease-out infinite;
        }
        .animate-sparkle-float {
          animation: sparkleFloat 3s ease-in-out infinite;
        }
        .animate-smoke-drift {
          animation: smokeDrift 4s ease-out infinite;
        }
        .animate-petal-swirl {
          animation: petalSwirl 6s ease-in-out infinite;
        }
        .animate-bokeh-drift {
          animation: bokehDrift 15s ease-in-out infinite;
        }
        .animate-flicker-glow {
          animation: flickerGlow 0.2s infinite alternate;
        }
        .animate-grain-shift {
          animation: grainShift 0.5s steps(2) infinite;
        }
        .animate-light-leak {
          animation: lightLeak 8s ease-in-out infinite;
        }
      `}</style>

      {/* Dedicated Remote Audio Playback Element */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Atmospheric Background Animation Layer */}
      <AtmosphericBackground themeId={activeTheme} ecoMode={ecoMode} />

      {/* Bidirectional Sync Toast Banner */}
      {syncToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white font-extrabold text-xs md:text-sm shadow-2xl border-2 border-white/80 flex items-center gap-2.5 ring-4 ring-rose-400/30">
            <span className="text-xl">{syncToast.icon}</span>
            <span>{syncToast.message}</span>
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          </div>
        </div>
      )}

      {/* Audio Autoplay Unblock Prompt */}
      {audioAutoplayBlocked && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <button
            type="button"
            onClick={handleEnableAudio}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white font-extrabold text-xs shadow-2xl border-2 border-white/80 flex items-center gap-2 cursor-pointer active:scale-95 ring-4 ring-rose-400/40"
          >
            <Volume2 className="w-4 h-4 animate-spin" />
            <span>Tap to hear {partnerName}'s voice 🔊</span>
          </button>
        </div>
      )}

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
              <p className="text-[11px] text-rose-200/90 font-medium">
                Atmosphere: <strong className="text-white">{currentThemeConfig.name}</strong> • Filter: <strong className="text-amber-200">{currentFilterConfig.name}</strong>
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-400/30">Synced ⚡</span>
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Background Theme Selector Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowThemes((v) => !v);
              setShowFilters(false);
              setShowMusicModal(false);
              setShowNetworkSettings(false);
            }}
            title="Choose Romantic Atmosphere (Syncs for both)"
            className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition active:scale-95 border border-white/20 flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer"
          >
            <Palette className="w-4 h-4 text-pink-300" />
            <span className="hidden sm:inline">Atmosphere</span>
          </button>

          {/* Video Filter Selector Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowFilters((v) => !v);
              setShowThemes(false);
              setShowMusicModal(false);
              setShowNetworkSettings(false);
            }}
            title="Flattering Video Filter (Syncs for both)"
            className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition active:scale-95 border border-white/20 flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer"
          >
            <Wand2 className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Romantic Jukebox / Music Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowMusicModal((v) => !v);
              setShowThemes(false);
              setShowFilters(false);
              setShowNetworkSettings(false);
            }}
            title="Romantic Music Jukebox (Listen together while talking)"
            className={`px-2.5 py-1.5 rounded-xl transition active:scale-95 border flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer ${
              musicPlaying
                ? 'bg-rose-500/30 hover:bg-rose-500/40 text-rose-200 border-rose-400/50 ring-2 ring-rose-400/30'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
            }`}
          >
            <Disc className={`w-4 h-4 ${musicPlaying ? 'text-pink-400 animate-spin' : 'text-pink-300'}`} />
            <span className="hidden sm:inline">Music</span>
            {musicPlaying && (
              <span className="flex items-center gap-0.5 ml-0.5">
                <span className="w-1 h-2.5 bg-rose-400 animate-pulse rounded-full" />
                <span className="w-1 h-3.5 bg-pink-400 animate-pulse rounded-full delay-75" />
                <span className="w-1 h-2 bg-rose-300 animate-pulse rounded-full delay-150" />
              </span>
            )}
          </button>

          {/* Screen Share Quick Button (During Active Call) */}
          {callStatus !== 'idle' && (
            <button
              type="button"
              onClick={handleToggleScreenShare}
              title={isScreenSharing ? 'Stop sharing screen' : 'Share screen (Watch movies, photos, apps together)'}
              className={`px-2.5 py-1.5 rounded-xl transition active:scale-95 border flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer ${
                isScreenSharing
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-400/50 ring-2 ring-indigo-400/50 animate-pulse'
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
              }`}
            >
              {isScreenSharing ? <ScreenShareOff className="w-4 h-4 text-white" /> : <MonitorUp className="w-4 h-4 text-indigo-300" />}
              <span className="hidden sm:inline">{isScreenSharing ? 'Sharing' : 'Share'}</span>
            </button>
          )}

          {/* Global Network / TURN Status Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowNetworkSettings((v) => !v);
              setShowThemes(false);
              setShowFilters(false);
              setShowMusicModal(false);
            }}
            title="Global Network & TURN Relay Settings"
            className={`px-2.5 py-1.5 rounded-xl transition active:scale-95 border flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer ${
              iceState === 'connected'
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
                : iceState === 'failed'
                ? 'bg-rose-500/30 hover:bg-rose-500/40 text-rose-200 border-rose-400/50 animate-pulse'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
            }`}
          >
            <Globe className="w-4 h-4 text-sky-300" />
            <span className="hidden sm:inline">Network</span>
            <span className={`w-1.5 h-1.5 rounded-full ${iceState === 'connected' ? 'bg-emerald-400' : iceState === 'failed' ? 'bg-rose-500' : 'bg-amber-400'}`} />
          </button>

          {/* Cool Phone / Battery Saver Mode Toggle */}
          <button
            type="button"
            onClick={() => setEcoMode((prev) => !prev)}
            title={ecoMode ? 'Cool Phone / Battery Saver Mode is ON (Click to toggle full VFX)' : 'Enable Cool Phone / Battery Saver Mode'}
            className={`px-2.5 py-1.5 rounded-xl transition active:scale-95 border flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer ${
              ecoMode
                ? 'bg-cyan-500/30 hover:bg-cyan-500/40 text-cyan-200 border-cyan-400/50 ring-2 ring-cyan-400/30'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
            }`}
          >
            <span className={ecoMode ? 'animate-pulse' : ''}>❄️</span>
            <span className="hidden sm:inline">{ecoMode ? 'Cool Phone: ON' : 'Cool Phone'}</span>
          </button>

          {/* Quick Play/Pause Background Music */}
          <button
            type="button"
            onClick={handleToggleMusicPlay}
            title={musicPlaying ? 'Pause background music' : 'Play background music'}
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
        <div className="absolute top-16 right-4 z-50 w-80 max-w-[90vw] rounded-2xl bg-slate-900/95 p-4 border border-rose-400/50 shadow-2xl backdrop-blur-xl text-white animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Romantic Atmospheres
              </span>
              <p className="text-[10px] text-slate-400">Syncs instantly for both you & {partnerName}</p>
            </div>
            <button onClick={() => setShowThemes(false)} className="text-xs text-slate-400 hover:text-white p-1">✕</button>
          </div>
          <div className="space-y-2">
            {ROMANTIC_THEMES.map((theme) => {
              const isSelected = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500/30 border-2 border-rose-400 ring-2 ring-rose-400/50 shadow-lg'
                      : 'bg-white/5 hover:bg-white/15 border border-white/10'
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-black/40 shrink-0">{theme.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs font-extrabold text-white truncate">{theme.name}</div>
                      {isSelected && <span className="text-[10px] text-rose-300 font-bold flex items-center gap-0.5 shrink-0"><Check className="w-3 h-3" /> Both</span>}
                    </div>
                    <div className="text-[10px] text-rose-200/70 font-semibold">{theme.subtitle}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{theme.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= FILTERS MODAL POPOVER ================= */}
      {showFilters && (
        <div className="absolute top-16 right-4 sm:right-28 z-50 w-80 max-w-[90vw] rounded-2xl bg-slate-900/95 p-4 border border-amber-400/50 shadow-2xl backdrop-blur-xl text-white animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> Flattering Video Filters
              </span>
              <p className="text-[10px] text-slate-400">Applied automatically to both videos</p>
            </div>
            <button onClick={() => setShowFilters(false)} className="text-xs text-slate-400 hover:text-white p-1">✕</button>
          </div>
          <div className="space-y-2">
            {ROMANTIC_FILTERS.map((filt) => {
              const isSelected = activeFilter === filt.id;
              return (
                <button
                  key={filt.id}
                  type="button"
                  onClick={() => handleSelectFilter(filt.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/30 border-2 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                      : 'bg-white/5 hover:bg-white/15 border border-white/10'
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-black/40 shrink-0">{filt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs font-extrabold text-white truncate">{filt.name}</div>
                      {isSelected && <span className="text-[10px] text-amber-300 font-bold flex items-center gap-0.5 shrink-0"><Check className="w-3 h-3" /> Both</span>}
                    </div>
                    <div className="text-[10px] text-amber-200/70 font-semibold">{filt.subtitle}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{filt.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= NETWORK & GLOBAL TURN SETTINGS DRAWER ================= */}
      {showNetworkSettings && (
        <div className="absolute top-20 right-4 md:right-8 z-50 w-80 md:w-96 rounded-2xl bg-slate-900/95 border border-white/20 backdrop-blur-xl p-4 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-400" />
              <div>
                <h4 className="text-sm font-extrabold text-white">Global Network Settings</h4>
                <p className="text-[10px] text-slate-300">Connect across different Wi-Fi & cellular networks</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowNetworkSettings(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Connection Diagnostics */}
          <div className="space-y-2 mb-4 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">WebRTC ICE Link:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  iceState === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : iceState === 'failed'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                }`}>
                  {iceState === 'connected' ? 'Connected (Relay/P2P) 🟢' : iceState === 'failed' ? 'Failed (Check key) 🔴' : `${iceState} 🟡`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Default TURN Relay:</span>
                <span className="text-emerald-300 font-semibold text-[11px]">
                  {meteredAppInput && meteredKeyInput ? 'Dedicated Metered Grid 🌐' : 'Live Global Relay (UDP/TCP/TLS) ⚡'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">My Client ID:</span>
                <span className="text-slate-200 font-mono text-[10px] truncate max-w-[150px]">{videoCallService.myPeerId || 'Initializing...'}</span>
              </div>
            </div>
          </div>

          {/* Dedicated Metered Account (Optional) */}
          <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-400/30 mb-3 space-y-2 text-xs">
            <div className="font-extrabold text-sky-200 flex items-center justify-between">
              <span>Dedicated Metered TURN</span>
              <span className="text-[10px] text-sky-400 font-normal">Optional</span>
            </div>
            <p className="text-[10px] text-sky-200/80 leading-relaxed">
              For dedicated high-speed relays between India & USA, sign up free at{' '}
              <a
                href="https://dashboard.metered.ca/signup"
                target="_blank"
                rel="noreferrer"
                className="underline text-sky-300 hover:text-white font-bold"
              >
                dashboard.metered.ca
              </a>{' '}
              (20GB/month free, no card required) and paste below:
            </p>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-300 font-semibold block">App Subdomain (e.g. "mycoupleapp"):</label>
              <input
                type="text"
                value={meteredAppInput}
                onChange={(e) => setMeteredAppInput(e.target.value)}
                placeholder="mycoupleapp"
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/20 text-white text-xs focus:outline-none focus:border-sky-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-300 font-semibold block">API Key:</label>
              <input
                type="password"
                value={meteredKeyInput}
                onChange={(e) => setMeteredKeyInput(e.target.value)}
                placeholder="API Key from Metered Dashboard"
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/20 text-white text-xs focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMeteredCredentials(meteredAppInput, meteredKeyInput);
                videoCallService.refreshPeer().catch(() => {});
                setSyncToast({
                  message: meteredAppInput && meteredKeyInput ? 'Saved custom Metered TURN settings!' : 'Reset to verified Global Relay servers!',
                  icon: '🌍',
                });
                setTimeout(() => setSyncToast(null), 3000);
                setShowNetworkSettings(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition active:scale-95 text-center cursor-pointer"
            >
              Save Settings
            </button>
            <button
              type="button"
              onClick={() => setShowNetworkSettings(false)}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold text-xs transition active:scale-95 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= ROMANTIC JUKEBOX & MUSIC PLAYER MODAL ================= */}
      {showMusicModal && (
        <div className="absolute top-16 right-4 sm:right-16 z-50 w-88 max-w-[92vw] rounded-2xl bg-slate-900/95 p-4 border border-rose-400/50 shadow-2xl backdrop-blur-xl text-white animate-fade-in max-h-[82vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 shadow-md">
                <Music className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  Couple Jukebox 🎶
                </h3>
                <p className="text-[10px] text-slate-300">Synchronized background audio while talking</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowMusicModal(false)}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Now Playing Mini-Banner inside modal */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950/60 via-purple-950/60 to-slate-900/80 border border-rose-500/30 mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`text-2xl p-2 rounded-xl bg-black/40 shrink-0 ${musicPlaying ? 'animate-pulse' : ''}`}>
                {currentTrackConfig.icon}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-white truncate flex items-center gap-1.5">
                  <span>{currentTrackConfig.title}</span>
                  {musicPlaying && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  )}
                </div>
                <div className="text-[10px] text-rose-200/80 font-medium truncate">
                  {currentTrackConfig.genre} • {musicPlaying ? 'Playing for both' : 'Paused'}
                </div>
              </div>
            </div>

            {/* Quick Play/Pause button */}
            <button
              type="button"
              onClick={handleToggleMusicPlay}
              className={`p-2.5 rounded-full transition active:scale-95 shrink-0 cursor-pointer ${
                musicPlaying
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 ring-2 ring-rose-400/40'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {musicPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>
          </div>

          {/* Tabs: Romantic Soundscapes vs Online Streaming vs Custom Song */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 mb-3">
            <button
              type="button"
              onClick={() => setMusicActiveTab('tracks')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                musicActiveTab === 'tracks'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🎹 Ambience</span>
            </button>
            <button
              type="button"
              onClick={() => setMusicActiveTab('streaming')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                musicActiveTab === 'streaming'
                  ? 'bg-gradient-to-r from-emerald-600 via-rose-600 to-red-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Streaming 🟢🍎</span>
            </button>
            <button
              type="button"
              onClick={() => setMusicActiveTab('custom')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                musicActiveTab === 'custom'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>💖 Upload</span>
            </button>
          </div>

          {/* TAB 1: Soundscapes list */}
          {musicActiveTab === 'tracks' && (
            <div className="space-y-2 mb-4">
              {ROMANTIC_TRACKS.map((track) => {
                const isSelected = activeMusicTrackId === track.id && !streamingTrack;
                const isThisPlaying = isSelected && musicPlaying;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleSelectTrack(track.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/30 border-2 border-rose-400 ring-2 ring-rose-400/40 shadow-lg'
                        : 'bg-white/5 hover:bg-white/15 border border-white/10'
                    }`}
                  >
                    <span className="text-2xl p-2 rounded-xl bg-black/40 shrink-0">
                      {track.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="text-xs font-extrabold text-white truncate">{track.title}</div>
                        {isSelected && (
                          <span className="text-[10px] text-rose-300 font-bold flex items-center gap-1 shrink-0">
                            {isThisPlaying ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                <span>Playing</span>
                              </>
                            ) : (
                              <span>Selected</span>
                            )}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-rose-200/70 font-semibold flex items-center gap-2">
                        <span>{track.genre}</span>
                        <span>•</span>
                        <span>{track.duration}</span>
                        {track.bpm && (
                          <>
                            <span>•</span>
                            <span>{track.bpm} BPM</span>
                          </>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{track.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: Online Streaming (Spotify / Apple Music / YouTube) */}
          {musicActiveTab === 'streaming' && (
            <div className="space-y-3 mb-4 text-xs">
              {/* Provider Sub-tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setStreamingProviderTab('spotify');
                    setIsLinkingAccount(false);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-extrabold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    streamingProviderTab === 'spotify'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>🟢</span>
                  <span>Spotify</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStreamingProviderTab('apple-music');
                    setIsLinkingAccount(false);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-extrabold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    streamingProviderTab === 'apple-music'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>🍎</span>
                  <span>Apple Music</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStreamingProviderTab('youtube');
                    setIsLinkingAccount(false);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-extrabold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    streamingProviderTab === 'youtube'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>▶️</span>
                  <span>YouTube</span>
                </button>
              </div>

              {/* Account Linking Status Card */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Link2 className="w-3.5 h-3.5 text-pink-300" />
                    <span>
                      {streamingProviderTab === 'spotify'
                        ? 'Spotify Account'
                        : streamingProviderTab === 'apple-music'
                        ? 'Apple Music Account'
                        : 'YouTube Music'}
                    </span>
                  </div>
                  {linkedAccounts[streamingProviderTab] && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-extrabold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Linked</span>
                    </span>
                  )}
                </div>

                {linkedAccounts[streamingProviderTab] ? (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/40 border border-emerald-500/30">
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white truncate">
                        @{linkedAccounts[streamingProviderTab].displayName}
                      </div>
                      <div className="text-[9px] text-emerald-300/80">
                        Ready to play couple favorites
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnlinkAccount(streamingProviderTab)}
                      className="p-1 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white transition cursor-pointer"
                      title="Unlink account"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div>
                    {!isLinkingAccount ? (
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-slate-300">
                          {streamingProviderTab === 'spotify'
                            ? 'Link your Spotify handle or ID to play playlists together.'
                            : streamingProviderTab === 'apple-music'
                            ? 'Link your Apple ID/profile or sign in directly in the player.'
                            : 'Play any romantic YouTube video or lo-fi live stream.'}
                        </p>
                        {streamingProviderTab !== 'youtube' && (
                          <button
                            type="button"
                            onClick={() => setIsLinkingAccount(true)}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold shrink-0 transition cursor-pointer border border-white/10"
                          >
                            + Link
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[10px] text-slate-300 font-semibold block">
                          {streamingProviderTab === 'spotify'
                            ? 'Spotify Username, Profile link, or Client ID:'
                            : 'Apple Music Profile handle or User ID:'}
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={accountInputId}
                            onChange={(e) => setAccountInputId(e.target.value)}
                            placeholder={streamingProviderTab === 'spotify' ? 'e.g. spotify_username' : 'e.g. user_handle'}
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/20 text-white text-xs focus:outline-none focus:border-pink-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleLinkAccount(streamingProviderTab)}
                            disabled={!accountInputId.trim()}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsLinkingAccount(false)}
                            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Spotify Real-Time Sync Status */}
              {streamingProviderTab === 'spotify' && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-slate-200 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base text-emerald-400">🟢</span>
                      <div className="min-w-0">
                        <div className="font-extrabold text-white text-xs truncate">Spotify Synced Listening</div>
                        <div className="text-[10px] text-emerald-300/80 truncate">Both partners hear the same song in real time</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-400/30 shrink-0">
                      Synced ⚡
                    </span>
                  </div>
                </div>
              )}

              {/* Paste Any Streaming URL */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-white font-bold">
                  <span>Paste {streamingProviderTab === 'spotify' ? 'Spotify' : streamingProviderTab === 'apple-music' ? 'Apple Music' : 'YouTube'} Link:</span>
                  <span className="text-[10px] text-pink-300 font-normal">Track / Playlist / Album</span>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={streamingInputUrl}
                    onChange={(e) => setStreamingInputUrl(e.target.value)}
                    placeholder={
                      streamingProviderTab === 'spotify'
                        ? 'https://open.spotify.com/track/...'
                        : streamingProviderTab === 'apple-music'
                        ? 'https://music.apple.com/us/album/...'
                        : 'https://youtube.com/watch?v=...'
                    }
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/20 text-white text-xs focus:outline-none focus:border-pink-400"
                  />
                  <button
                    type="button"
                    onClick={handlePlayStreamingUrl}
                    disabled={!streamingInputUrl.trim()}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <span>Play</span>
                    <Sparkles className="w-3 h-3 text-amber-300" />
                  </button>
                </div>
              </div>

              {/* Curated 1-Click Couple Playlists */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-rose-300 flex items-center justify-between px-1">
                  <span>Romantic Curated Presets</span>
                  <span className="text-[9px] text-slate-400 font-normal">1-Click Listen Together</span>
                </div>
                <div className="space-y-1.5">
                  {ROMANTIC_STREAMING_PRESETS.filter((p) => p.provider === streamingProviderTab).map((preset) => {
                    const isSelected = streamingTrack?.originalUrl === preset.originalUrl;
                    return (
                      <button
                        key={preset.originalUrl}
                        type="button"
                        onClick={() => handleSelectStreamingPreset(preset)}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition cursor-pointer ${
                          isSelected
                            ? 'bg-rose-500/30 border-2 border-rose-400 ring-2 ring-rose-400/40 shadow-lg'
                            : 'bg-white/5 hover:bg-white/15 border border-white/10'
                        }`}
                      >
                        <span className="text-xl p-1.5 rounded-lg bg-black/40 shrink-0">
                          {preset.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <div className="text-xs font-extrabold text-white truncate">{preset.title}</div>
                            {isSelected && (
                              <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                <span>Active</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] text-slate-400 truncate">{preset.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Custom Song / Audio */}
          {musicActiveTab === 'custom' && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3 mb-4 text-xs">
              <div>
                <div className="font-extrabold text-white flex items-center gap-1.5 mb-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                  <span>Play "Our Special Song"</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Stream your favorite song together or upload an MP3/audio file from your device.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-300 font-semibold block">Song Title (e.g. "Perfect - Ed Sheeran"):</label>
                <input
                  type="text"
                  value={customSongTitleInput}
                  onChange={(e) => setCustomSongTitleInput(e.target.value)}
                  placeholder="Song Title"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/20 text-white text-xs focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-300 font-semibold block">Audio URL (Direct MP3, M4A, Stream):</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customSongInput}
                    onChange={(e) => setCustomSongInput(e.target.value)}
                    placeholder="https://example.com/our-song.mp3"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/20 text-white text-xs focus:outline-none focus:border-rose-400"
                  />
                  <button
                    type="button"
                    onClick={handlePlayCustomSong}
                    disabled={!customSongInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Play
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="text-[10px] text-slate-300 font-semibold block mb-1.5">Or Upload from Device:</label>
                <label className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 border border-dashed border-white/30 text-white text-xs font-semibold cursor-pointer transition">
                  <Upload className="w-4 h-4 text-pink-300" />
                  <span>Choose MP3 or Audio file</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleUploadCustomAudio}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Volume Control Slider */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-rose-300" />
                <span>Background Volume:</span>
              </span>
              <span className="text-rose-300 font-extrabold">{Math.round(musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <button
                type="button"
                onClick={() => handleVolumeChange(0.12)}
                className="hover:text-rose-300 transition"
              >
                Whisper 12%
              </button>
              <button
                type="button"
                onClick={() => handleVolumeChange(0.22)}
                className="text-rose-300 font-bold hover:underline"
              >
                Cozy 22% (Talk mode)
              </button>
              <button
                type="button"
                onClick={() => handleVolumeChange(0.40)}
                className="hover:text-rose-300 transition"
              >
                Cinema 40%
              </button>
            </div>
            <p className="text-[9px] text-slate-400 italic text-center">
              Cozy volume allows you and {partnerName} to talk clearly with romantic background melodies.
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-rose-200/80 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Realtime Synced for Both</span>
            </span>
            <button
              type="button"
              onClick={() => setShowMusicModal(false)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold"
            >
              Done
            </button>
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
                <div
                  className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 bg-black/70 flex items-center justify-center group"
                  style={{
                    boxShadow: `0 0 35px ${currentFilterConfig.frameGlow}, 0 0 15px ${currentThemeConfig.glowColor}`,
                    border: `2px solid ${currentFilterConfig.frameGlow}`,
                  }}
                >
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    onLoadedMetadata={() => {
                      remoteVideoRef.current?.play().catch(() => {});
                    }}
                    style={{ filter: ecoMode ? undefined : currentFilterConfig.cssFilter }}
                    className={`w-full h-full transition-opacity duration-300 object-cover ${
                      remoteStream ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {remoteStream && (
                    <div className={`absolute inset-0 pointer-events-none transition-all ${currentFilterConfig.overlayClass}`} />
                  )}
                  {remoteStream && <FilterOverlayEffect filterId={activeFilter} ecoMode={ecoMode} />}

                  {!remoteStream && (
                    /* Waiting / Ringing Placeholder */
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-black/50">
                      <div className="relative mb-3">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-rose-400 shadow-xl bg-white animate-pulse">
                          <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
                        </div>
                        <span className="absolute -top-1 -right-1 text-2xl animate-spin">✨</span>
                      </div>
                      <p className="text-sm font-extrabold text-rose-300">
                        {callStatus === 'calling' ? `Calling ${partnerName}...` : `Connecting with ${partnerName}...`}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-rose-200">
                        <span className={`w-2 h-2 rounded-full ${iceState === 'connected' ? 'bg-emerald-400' : iceState === 'failed' ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'}`} />
                        <span>{iceState === 'connected' ? 'Link Connected 🟢' : iceState === 'failed' ? 'Relay Error (Click Network) 🔴' : 'Negotiating Relay (STUN/TURN)... 🟡'}</span>
                      </div>
                    </div>
                  )}

                  {/* Active Filter Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-lg backdrop-blur-md flex items-center gap-1.5 border border-white/20 bg-black/50 text-white">
                    <span>{currentFilterConfig.icon}</span>
                    <span>{currentFilterConfig.name}</span>
                  </div>

                  {/* Partner Name Badge */}
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <span>{partnerRole === 'boyfriend' ? '👑' : '🌸'}</span>
                    <span>{partnerName}</span>
                  </div>
                </div>

                {/* 2. Self (Local) Container */}
                <div
                  className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 bg-black/70 flex items-center justify-center group"
                  style={{
                    boxShadow: `0 0 35px ${currentFilterConfig.frameGlow}, 0 0 15px ${currentThemeConfig.glowColor}`,
                    border: `2px solid ${currentFilterConfig.frameGlow}`,
                  }}
                >
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => {
                      localVideoRef.current?.play().catch(() => {});
                    }}
                    style={{ filter: ecoMode ? undefined : currentFilterConfig.cssFilter }}
                    className={`w-full h-full transition-opacity duration-300 object-cover -scale-x-100 ${
                      localStream && !isVideoOff ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {localStream && !isVideoOff && (
                    <div className={`absolute inset-0 pointer-events-none transition-all ${currentFilterConfig.overlayClass}`} />
                  )}
                  {localStream && !isVideoOff && <FilterOverlayEffect filterId={activeFilter} ecoMode={ecoMode} />}

                  {/* Self Screen Sharing Banner */}
                  {isScreenSharing && (
                    <div className="absolute top-3 left-3 z-30 px-3 py-1.5 rounded-full bg-indigo-600/90 text-white text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-md border border-indigo-400/50">
                      <MonitorUp className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>Sharing Screen 🖥️</span>
                      <button
                        type="button"
                        onClick={handleToggleScreenShare}
                        className="ml-1.5 px-2 py-0.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold cursor-pointer transition active:scale-95"
                      >
                        Stop
                      </button>
                    </div>
                  )}

                  {(!localStream || isVideoOff) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900/80">
                      <VideoOff className="w-12 h-12 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-300">Camera is turned off</p>
                    </div>
                  )}

                  {/* Active Filter Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-lg backdrop-blur-md flex items-center gap-1.5 border border-white/20 bg-black/50 text-white">
                    <span>{currentFilterConfig.icon}</span>
                    <span>{currentFilterConfig.name}</span>
                  </div>

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
              <div
                className="relative w-full h-[440px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 bg-black/70 flex items-center justify-center"
                style={{
                  boxShadow: `0 0 40px ${currentFilterConfig.frameGlow}, 0 0 15px ${currentThemeConfig.glowColor}`,
                  border: `2px solid ${currentFilterConfig.frameGlow}`,
                }}
              >
                {/* Main View: Partner face camera */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  onLoadedMetadata={() => {
                    remoteVideoRef.current?.play().catch(() => {});
                  }}
                  style={{ filter: ecoMode ? undefined : currentFilterConfig.cssFilter }}
                  className={`w-full h-full transition-opacity duration-300 object-cover ${
                    remoteStream ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                {remoteStream && (
                  <div className={`absolute inset-0 pointer-events-none transition-all ${currentFilterConfig.overlayClass}`} />
                )}
                {remoteStream && <FilterOverlayEffect filterId={activeFilter} ecoMode={ecoMode} />}

                {!remoteStream && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-black/50">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-rose-400 shadow-xl bg-white mb-3 animate-pulse">
                      <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-extrabold text-rose-300">
                      {callStatus === 'calling' ? `Calling ${partnerName}...` : `Connecting with ${partnerName}...`}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-rose-200">
                      <span className={`w-2 h-2 rounded-full ${iceState === 'connected' ? 'bg-emerald-400' : iceState === 'failed' ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'}`} />
                      <span>{iceState === 'connected' ? 'Link Connected 🟢' : iceState === 'failed' ? 'Relay Error (Click Network) 🔴' : 'Negotiating Relay (STUN/TURN)... 🟡'}</span>
                    </div>
                  </div>
                )}

                {/* Main View Filter Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-extrabold shadow-lg backdrop-blur-md flex items-center gap-1.5 border border-white/20 bg-black/60 text-white">
                  <span>{currentFilterConfig.icon}</span>
                  <span>{currentFilterConfig.name}</span>
                </div>

                {/* Floating Self Camera / Screen PiP */}
                <div
                  className="absolute top-4 right-4 w-32 h-44 md:w-36 md:h-48 rounded-2xl overflow-hidden shadow-2xl bg-black z-20"
                  style={{
                    border: `2px solid ${currentFilterConfig.frameGlow}`,
                    boxShadow: `0 0 20px ${currentFilterConfig.frameGlow}`,
                  }}
                >
                  <video
                    ref={pipVideoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => {
                      pipVideoRef.current?.play().catch(() => {});
                    }}
                    style={{ filter: ecoMode ? undefined : currentFilterConfig.cssFilter }}
                    className={`w-full h-full transition-opacity duration-300 object-cover -scale-x-100 ${
                      localStream && !isVideoOff ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {localStream && !isVideoOff && (
                    <div className={`absolute inset-0 pointer-events-none transition-all ${currentFilterConfig.overlayClass}`} />
                  )}
                  {localStream && !isVideoOff && <FilterOverlayEffect filterId={activeFilter} ecoMode={ecoMode} />}

                  {isScreenSharing && (
                    <div className="absolute top-1 left-1 z-30 px-1.5 py-0.5 rounded-full bg-indigo-600/90 text-white text-[9px] font-bold flex items-center gap-1">
                      <MonitorUp className="w-2.5 h-2.5 text-amber-300" />
                      <span>Sharing</span>
                    </div>
                  )}

                  {(!localStream || isVideoOff) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-[10px]">
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

      {/* ================= SEPARATE SCREEN SHARE WINDOW (DEDICATED DOCK) ================= */}
      {(isScreenSharing || partnerScreenSharing) && (
        <div
          className={`relative z-25 mx-3 md:mx-6 mb-2 rounded-2xl bg-black/90 backdrop-blur-xl border shadow-2xl overflow-hidden transition-all duration-300 ${
            showScreenShareDock ? 'p-3' : 'px-3 py-1.5'
          }`}
          style={{
            borderColor: 'rgba(99, 102, 241, 0.7)',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.35)',
          }}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 mb-2 text-white text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">🖥️</span>
              <div className="min-w-0">
                <div className="font-extrabold truncate flex items-center gap-1.5">
                  <span className="truncate">
                    {isScreenSharing ? 'Your Shared Screen' : `${screenSharerName || partnerName}'s Shared Screen`}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/25 text-indigo-300 text-[9px] font-bold border border-indigo-400/40 shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                    Live Screen ⚡
                  </span>
                </div>
                {showScreenShareDock && (
                  <p className="text-[10px] text-slate-300 truncate">
                    {isScreenSharing
                      ? 'Broadcasting in separate window • Your camera remains active'
                      : `${partnerName} is broadcasting their screen in real time`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Picture-in-Picture / Pop-out button */}
              <button
                type="button"
                onClick={() => {
                  if (screenShareVideoRef.current) {
                    if (document.pictureInPictureElement) {
                      document.exitPictureInPicture().catch(() => {});
                    } else {
                      screenShareVideoRef.current.requestPictureInPicture?.().catch(() => {});
                    }
                  }
                }}
                title="Pop out into floating window (Picture-in-Picture)"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={() => {
                  if (screenShareVideoRef.current) {
                    if (document.fullscreenElement) {
                      document.exitFullscreen?.().catch(() => {});
                    } else {
                      screenShareVideoRef.current.requestFullscreen?.().catch(() => {});
                    }
                  }
                }}
                title="Fullscreen screen share"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Minimize/Maximize Toggle */}
              <button
                type="button"
                onClick={() => setShowScreenShareDock((d) => !d)}
                title={showScreenShareDock ? 'Minimize screen share' : 'Expand screen share'}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                {showScreenShareDock ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>

              {/* Stop / Close */}
              {isScreenSharing ? (
                <button
                  type="button"
                  onClick={handleToggleScreenShare}
                  title="Stop sharing screen"
                  className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <ScreenShareOff className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowScreenShareDock(false)}
                  title="Close screen share view"
                  className="p-1.5 rounded-lg bg-rose-600/70 hover:bg-rose-600 text-white transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active Screen Share Video Player */}
          {showScreenShareDock && (
            <div className="relative rounded-xl overflow-hidden bg-black/90 shadow-inner flex items-center justify-center min-h-[160px] md:min-h-[220px]">
              <video
                ref={screenShareVideoRef}
                autoPlay
                playsInline
                muted={isScreenSharing}
                className={`w-full max-h-[260px] md:max-h-[380px] object-contain bg-black rounded-xl transition-opacity duration-300 ${
                  (isScreenSharing && screenStream) || (partnerScreenSharing && remoteScreenStream) ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {partnerScreenSharing && !remoteScreenStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950/85 z-10">
                  <div className="w-9 h-9 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-xs font-bold text-indigo-300">
                    Connecting to {screenSharerName || partnerName}'s shared screen...
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Live stream will display here in a moment
                  </p>
                </div>
              )}
              {isScreenSharing && (
                <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-emerald-300 font-semibold border border-white/10 flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Broadcasting Live</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= ONLINE STREAMING EMBED PLAYER (SPOTIFY / APPLE MUSIC / YOUTUBE) ================= */}
      {streamingTrack && (
        <div
          className={`relative z-25 mx-3 md:mx-6 mb-2 rounded-2xl bg-black/90 backdrop-blur-xl border shadow-2xl overflow-hidden transition-all duration-300 ${
            showStreamingDock ? 'p-3' : 'px-3 py-1.5'
          }`}
          style={{
            borderColor:
              streamingTrack.provider === 'spotify'
                ? 'rgba(34, 197, 94, 0.6)'
                : streamingTrack.provider === 'apple-music'
                ? 'rgba(244, 63, 94, 0.6)'
                : 'rgba(239, 68, 68, 0.6)',
            boxShadow:
              streamingTrack.provider === 'spotify'
                ? '0 0 25px rgba(34, 197, 94, 0.25)'
                : streamingTrack.provider === 'apple-music'
                ? '0 0 25px rgba(244, 63, 94, 0.25)'
                : '0 0 25px rgba(239, 68, 68, 0.25)',
          }}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 mb-2 text-white text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{streamingTrack.icon}</span>
              <div className="min-w-0">
                <div className="font-extrabold truncate flex items-center gap-1.5">
                  <span className="truncate">{streamingTrack.title}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-400/30 shrink-0">
                    Synced for Both ⚡
                  </span>
                </div>
                {showStreamingDock && (
                  <p className="text-[10px] text-slate-300 truncate">
                    {streamingTrack.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* External Link */}
              <a
                href={streamingTrack.originalUrl}
                target="_blank"
                rel="noreferrer"
                title={`Open in ${streamingTrack.provider}`}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Minimize/Maximize Toggle */}
              <button
                type="button"
                onClick={() => setShowStreamingDock((d) => !d)}
                title={showStreamingDock ? 'Minimize player' : 'Expand player'}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                {showStreamingDock ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>

              {/* Stop / Close Player */}
              <button
                type="button"
                onClick={handleStopStreaming}
                title="Stop streaming for both"
                className="p-1.5 rounded-lg bg-rose-600/70 hover:bg-rose-600 text-white transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Synchronized Listening Prompt (Unblocks Browser Audio Policy) */}
          {showSyncListenPrompt && (
            <div className="flex items-center justify-between p-3 mb-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 text-white shadow-xl animate-pulse border border-white/30">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl shrink-0">🎶</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight truncate">
                    {partnerName} started streaming "{streamingTrack.title}"!
                  </p>
                  <p className="text-[10px] text-rose-100 truncate">
                    Tap to start synchronized listening together 🔊
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTapToListenTogether}
                className="px-3.5 py-1.5 rounded-lg bg-white text-rose-600 font-extrabold text-xs shadow-md hover:bg-rose-50 active:scale-95 transition cursor-pointer shrink-0 ml-2"
              >
                Listen Together ▶️
              </button>
            </div>
          )}

          {/* Active Streaming Player */}
          {showStreamingDock && (
            <div className="rounded-xl overflow-hidden bg-black/80 shadow-inner">
              <iframe
                ref={streamingIframeRef}
                key={resolvedEmbedUrl}
                src={resolvedEmbedUrl}
                onLoad={handleIframeLoaded}
                width="100%"
                height={streamingTrack.height || 200}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                className="w-full rounded-xl transition-all"
                title={streamingTrack.title}
              />
            </div>
          )}
        </div>
      )}

      {/* ================= NOW PLAYING MINI-JUKEBOX CAPSULE ================= */}
      {callStatus !== 'idle' && (
        <div className="relative z-20 px-3 md:px-5 py-2 bg-black/40 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-2.5 text-white">
          {/* Track Info (Clickable to open full Jukebox modal) */}
          <div
            onClick={() => setShowMusicModal(true)}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-90 transition group"
            title="Click to open Couple Jukebox"
          >
            <div className={`p-2 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-600 text-white shadow-md shrink-0 ${musicPlaying ? 'animate-pulse' : ''}`}>
              <Disc className={`w-4 h-4 ${musicPlaying ? 'animate-spin' : ''}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-white truncate group-hover:text-rose-300 transition">
                  {currentTrackConfig.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-400/30 shrink-0">
                  {currentTrackConfig.icon}
                </span>
              </div>
              <div className="text-[10px] text-slate-300 flex items-center gap-1.5">
                <span>{currentTrackConfig.genre}</span>
                <span>•</span>
                <span className="text-emerald-300 font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Synced ⚡
                </span>
              </div>
            </div>
          </div>

          {/* Quick Player Controls */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            {/* Prev Track */}
            <button
              type="button"
              onClick={handlePrevMusicTrack}
              title="Previous Track"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Play/Pause */}
            <button
              type="button"
              onClick={handleToggleMusicPlay}
              title={musicPlaying ? 'Pause synchronized music' : 'Play synchronized music'}
              className={`p-2 rounded-full transition active:scale-95 cursor-pointer ${
                musicPlaying
                  ? 'bg-rose-500 hover:bg-rose-600 text-white ring-2 ring-rose-400/40 shadow-md shadow-rose-500/30'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {musicPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
            </button>

            {/* Next Track */}
            <button
              type="button"
              onClick={handleNextMusicTrack}
              title="Next Track"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Volume slider mini */}
            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-white/15">
              <Volume2 className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={musicVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 md:w-20 accent-rose-500 cursor-pointer h-1"
                title={`Volume: ${Math.round(musicVolume * 100)}%`}
              />
              <span className="text-[10px] text-rose-300 font-bold w-7">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>

            {/* Jukebox Opener Button */}
            <button
              type="button"
              onClick={() => {
                setShowMusicModal((v) => !v);
                setShowThemes(false);
                setShowFilters(false);
                setShowNetworkSettings(false);
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/30 text-rose-200 hover:text-white transition text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Open full Couple Jukebox"
            >
              <Music className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Jukebox</span>
            </button>
          </div>
        </div>
      )}

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
              className="p-1.5 md:p-2 rounded-xl bg-white/10 hover:bg-rose-500/40 text-lg md:text-xl transition active:scale-125 transform shadow-xs hover:shadow-rose-400/30 shrink-0 cursor-pointer"
            >
              {item.emoji}
            </button>
          ))}
        </div>
      )}

      {/* ================= BOTTOM IN-CALL CONTROLS BAR ================= */}
      {callStatus !== 'idle' && (
        <div className="relative z-20 flex items-center justify-center gap-2.5 sm:gap-4 md:gap-6 p-4 bg-black/60 backdrop-blur-md border-t border-white/15">
          {/* Mute Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            className={`p-3 md:p-3.5 rounded-full transition shadow-lg active:scale-95 cursor-pointer ${
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
            className={`p-3 md:p-3.5 rounded-full transition shadow-lg active:scale-95 cursor-pointer ${
              isVideoOff
                ? 'bg-rose-600 text-white ring-4 ring-rose-400/30'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Screen Share Toggle */}
          <button
            type="button"
            onClick={handleToggleScreenShare}
            title={isScreenSharing ? 'Stop sharing screen' : 'Share screen (Watch movies, photos, apps together)'}
            className={`p-3 md:p-3.5 rounded-full transition shadow-lg active:scale-95 cursor-pointer ${
              isScreenSharing
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-400/50 shadow-indigo-600/40 animate-pulse'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            {isScreenSharing ? <ScreenShareOff className="w-5 h-5" /> : <MonitorUp className="w-5 h-5 text-indigo-300" />}
          </button>

          {/* Romantic Jukebox & Music Together Button */}
          <button
            type="button"
            onClick={() => {
              setShowMusicModal((v) => !v);
              setShowThemes(false);
              setShowFilters(false);
              setShowNetworkSettings(false);
            }}
            title="Romantic Music Jukebox (Listen together)"
            className={`p-3 md:p-3.5 rounded-full transition shadow-lg active:scale-95 cursor-pointer ${
              musicPlaying
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white ring-4 ring-pink-400/40 shadow-rose-500/30'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <Disc className={`w-5 h-5 ${musicPlaying ? 'animate-spin text-white' : 'text-pink-300'}`} />
          </button>

          {/* Soul Heart Connection Hold Button */}
          <button
            type="button"
            onMouseDown={handleTouchHeartStart}
            onMouseUp={handleTouchHeartEnd}
            onTouchStart={handleTouchHeartStart}
            onTouchEnd={handleTouchHeartEnd}
            title="Press & hold to connect your soul heart with your partner's video!"
            className={`px-4 md:px-6 py-3 rounded-full font-extrabold text-xs md:text-sm flex items-center gap-2 transition shadow-xl active:scale-95 select-none cursor-pointer ${
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
            className="p-3 md:p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/40 ring-4 ring-rose-500/30 transition active:scale-95 cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
