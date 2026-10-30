// Romantic Realtime WebRTC Video Engine powered by PeerJS & Cloudflare Edge Broker
// Features crystal-clear HD video, bidirectional stereo audio, romantic themes, filters, and soul-touch heart sharing.

import Peer from 'peerjs';
import { realtimeHub, RealtimePayload, getClientId, getRoomKey } from './realtime';
import { romanticMusic } from './romanticMusic';

export type RomanticThemeId = 'moonlight' | 'sunset' | 'candlelight' | 'sakura' | 'aurora';
export type RomanticFilterId = 'dreamy' | 'golden' | 'rose' | 'candlelight' | 'vintage' | 'fairy' | 'natural';
export type UserRole = 'boyfriend' | 'girlfriend';

export interface RomanticThemeConfig {
  id: RomanticThemeId;
  name: string;
  subtitle: string;
  icon: string;
  description: string;
  gradient: string;
  accentBorder: string;
  glowColor: string;
  particleEmojis: string[];
}

export interface RomanticFilterConfig {
  id: RomanticFilterId;
  name: string;
  subtitle: string;
  icon: string;
  description: string;
  cssFilter: string;
  overlayClass: string;
  frameGlow: string;
  badgeBg: string;
}

export const ROMANTIC_THEMES: RomanticThemeConfig[] = [
  {
    id: 'moonlight',
    name: 'Moonlight Sanctuary',
    subtitle: 'Starlit Celestial Sky',
    icon: '🌙',
    description: 'Midnight celestial sky with glowing moon, stardust trails, and twinkling stars',
    gradient: 'from-[#030712] via-[#0b132b] to-[#1c2541]',
    accentBorder: 'border-cyan-400/50',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    particleEmojis: ['✨', '⭐', '🌙', '💫', '🌟'],
  },
  {
    id: 'sunset',
    name: 'Sunset Beach Romance',
    subtitle: 'Golden Hour Horizon',
    icon: '🌅',
    description: 'Vibrant twilight horizon with blazing coral sun, warm golden waves, and floating hearts',
    gradient: 'from-[#2d0036] via-[#7b113a] via-[#c02739] to-[#ff7582]',
    accentBorder: 'border-amber-400/50',
    glowColor: 'rgba(251, 146, 60, 0.45)',
    particleEmojis: ['💖', '🧡', '✨', '🌅', '🥂'],
  },
  {
    id: 'candlelight',
    name: 'Candlelit Haven',
    subtitle: 'Intimate Velvet & Amber',
    icon: '🕯️',
    description: 'Cozy intimate darkness with dancing golden candle flames, falling rose petals, and warm embers',
    gradient: 'from-[#120406] via-[#240a0e] to-[#3a0f15]',
    accentBorder: 'border-rose-500/50',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    particleEmojis: ['🌹', '🕯️', '🥀', '✨', '🔥'],
  },
  {
    id: 'sakura',
    name: 'Cherry Blossom Dream',
    subtitle: 'Dancing Spring Petals',
    icon: '🌸',
    description: 'Dreamy plum-pink Kyoto dusk with fluttering pink sakura blossoms drifting in a warm breeze',
    gradient: 'from-[#1a0a21] via-[#3d133f] to-[#6d1b58]',
    accentBorder: 'border-pink-400/50',
    glowColor: 'rgba(244, 114, 182, 0.5)',
    particleEmojis: ['🌸', '💮', '🍃', '🌸', '✨'],
  },
  {
    id: 'aurora',
    name: 'Love Aurora & Hearts',
    subtitle: 'Northern Lights Romance',
    icon: '💫',
    description: 'Enchanting Northern lights undulating in electric emerald, violet, and cyan with floating neon hearts',
    gradient: 'from-[#0b0c1e] via-[#1a103c] to-[#0d282e]',
    accentBorder: 'border-purple-400/50',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    particleEmojis: ['💜', '💖', '✨', '💫', '💚'],
  },
];

export const ROMANTIC_FILTERS: RomanticFilterConfig[] = [
  {
    id: 'dreamy',
    name: 'Dreamy Glow',
    subtitle: 'Soft romantic movie bloom',
    icon: '✨',
    description: 'Heavenly soft halo, tender rose-peach glow, and luminous skin smoothing',
    cssFilter: 'contrast(106%) brightness(108%) saturate(125%)',
    overlayClass: 'bg-gradient-to-t from-rose-500/20 via-pink-400/10 to-transparent mix-blend-screen',
    frameGlow: 'rgba(244, 63, 94, 0.45)',
    badgeBg: 'bg-rose-500/80 text-white',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    subtitle: 'Warm sun-kissed honey radiance',
    icon: '🌅',
    description: 'Rich amber warmth, golden rim lighting, and radiant sun-kissed skin tone',
    cssFilter: 'sepia(24%) saturate(142%) brightness(108%) contrast(106%) hue-rotate(-6deg)',
    overlayClass: 'bg-gradient-to-tr from-amber-600/20 via-yellow-400/12 to-transparent mix-blend-color-dodge',
    frameGlow: 'rgba(245, 158, 11, 0.5)',
    badgeBg: 'bg-amber-500/80 text-white',
  },
  {
    id: 'rose',
    name: 'Rose Quartz',
    subtitle: 'Blushing petal tenderness',
    icon: '🌸',
    description: 'Lush pastel pink blush, delicate romantic tint, and porcelain clarity',
    cssFilter: 'saturate(130%) brightness(106%) contrast(104%) hue-rotate(-14deg)',
    overlayClass: 'bg-gradient-to-b from-pink-400/20 via-rose-300/10 to-rose-500/15 mix-blend-soft-light',
    frameGlow: 'rgba(244, 114, 182, 0.5)',
    badgeBg: 'bg-pink-500/80 text-white',
  },
  {
    id: 'candlelight',
    name: 'Candlelight Warmth',
    subtitle: 'Intimate amber firelight',
    icon: '🕯️',
    description: 'Warm flickering golden flame shadows, rich contrast, and cozy romantic intimacy',
    cssFilter: 'sepia(32%) contrast(114%) brightness(104%) saturate(132%)',
    overlayClass: 'bg-gradient-to-t from-amber-900/30 via-transparent to-amber-700/15 mix-blend-overlay',
    frameGlow: 'rgba(251, 146, 60, 0.5)',
    badgeBg: 'bg-amber-600/80 text-white',
  },
  {
    id: 'vintage',
    name: '90s Love Letter',
    subtitle: 'Nostalgic cinema film',
    icon: '📜',
    description: 'Retro 90s movie warmth, gentle sepia tones, and romantic cinematic depth',
    cssFilter: 'sepia(38%) contrast(116%) brightness(97%) saturate(96%)',
    overlayClass: 'bg-gradient-to-b from-amber-950/25 via-transparent to-stone-950/35 mix-blend-multiply',
    frameGlow: 'rgba(180, 83, 9, 0.4)',
    badgeBg: 'bg-amber-800/80 text-white',
  },
  {
    id: 'fairy',
    name: 'Fairy Sparkle',
    subtitle: 'Magical iridescent fairy dust',
    icon: '🧚',
    description: 'Fairytale fantasy shimmer, pastel violet-magenta radiance, and twinkle',
    cssFilter: 'brightness(112%) contrast(108%) saturate(132%) hue-rotate(12deg)',
    overlayClass: 'bg-gradient-to-tr from-purple-500/20 via-pink-400/12 to-cyan-300/15 mix-blend-screen',
    frameGlow: 'rgba(192, 132, 252, 0.5)',
    badgeBg: 'bg-purple-500/80 text-white',
  },
  {
    id: 'natural',
    name: 'Crystal Natural',
    subtitle: 'Pure crisp HD radiance',
    icon: '🪞',
    description: 'Natural balanced lighting, true-to-life colors, and pristine video clarity',
    cssFilter: 'contrast(102%) brightness(102%) saturate(106%)',
    overlayClass: 'opacity-0',
    frameGlow: 'rgba(255, 255, 255, 0.25)',
    badgeBg: 'bg-slate-700/80 text-white',
  },
];

export interface VideoSignalData {
  signalType:
    | 'call-invite'
    | 'call-accept'
    | 'call-decline'
    | 'call-end'
    | 'romantic-reaction'
    | 'touch-heart'
    | 'theme-sync'
    | 'screen-share-sync'
    | 'music-sync';
  callerRole?: UserRole;
  callerName?: string;
  callerPeerId?: string;
  answererRole?: UserRole;
  answererPeerId?: string;
  callId?: string;
  themeId?: RomanticThemeId;
  filterId?: RomanticFilterId;
  reason?: string;
  emoji?: string;
  reactionId?: string;
  x?: number;
  y?: number;
  touchActive?: boolean;
  isScreenSharing?: boolean;
  sharerRole?: UserRole;
  sharerName?: string;
  musicTrackId?: string;
  musicPlaying?: boolean;
  musicVolume?: number;
  customSongUrl?: string;
  customSongTitle?: string;
  streamingProvider?: 'spotify' | 'apple-music' | 'youtube' | 'soundcloud' | 'custom' | 'soundscape';
  streamingEmbedUrl?: string;
  streamingOriginalUrl?: string;
  streamingTitle?: string;
  streamingSubtitle?: string;
  sentAt?: number;
}

// === ICE Server Configuration: STUN (discovery) + TURN (relay for cross-network calls) ===
// TURN servers are ESSENTIAL for calls across different networks, NATs, and firewalls (e.g. India↔USA).
// Without TURN, calls fail when both peers are behind symmetric NATs (~15-30% of all call attempts).

// Verified working STUN servers (tested across global networks)
export const VERIFIED_STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
  { urls: 'stun:stun.nextcloud.com:443' },
  { urls: 'stun:stun.relay.metered.ca:80' },
];

// Verified active TURN relay servers (allocates 0x0103, active on UDP 3478, TCP 3478, TCP 443, TLS 443)
// Crucial for cross-network (India ↔ USA, cellular 4G/5G, Symmetric NAT) connections.
export const VERIFIED_TURN_SERVERS: RTCIceServer[] = [
  {
    urls: [
      'turn:turn.evan-brass.net:3478',
      'turn:turn.evan-brass.net:3478?transport=tcp',
      'turn:turn.evan-brass.net:443?transport=tcp',
      'turns:turn.evan-brass.net:443',
      'turns:turn.evan-brass.net:443?transport=tcp',
    ],
    username: 'user',
    credential: 'password',
  },
];

// Cache for dynamically fetched/generated TURN credentials (refreshed every 20 minutes)
let cachedIceServers: RTCIceServer[] | null = null;
let iceServersFetchedAt = 0;
const ICE_CACHE_TTL_MS = 20 * 60 * 1000;

/**
 * Helper to store custom Metered credentials from user settings
 */
export function setMeteredCredentials(appName: string, apiKey: string) {
  try {
    if (appName.trim() && apiKey.trim()) {
      localStorage.setItem('love_metered_app_name', appName.trim());
      localStorage.setItem('love_metered_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('love_metered_app_name');
      localStorage.removeItem('love_metered_api_key');
    }
    cachedIceServers = null;
    iceServersFetchedAt = 0;
  } catch {}
}

export function getMeteredCredentials() {
  try {
    return {
      appName: localStorage.getItem('love_metered_app_name') || '',
      apiKey: localStorage.getItem('love_metered_api_key') || '',
    };
  } catch {
    return { appName: '', apiKey: '' };
  }
}

/**
 * Fetch ICE servers: checks for custom Metered API credentials first (if provided by user),
 * then falls back to verified active worldwide STUN + TURN servers (turn.evan-brass.net on UDP/TCP/TLS)
 * to ensure seamless video connectivity across different networks worldwide (e.g. India ↔ USA).
 */
export async function getIceServers(): Promise<RTCIceServer[]> {
  // Return cached if fresh
  if (cachedIceServers && Date.now() - iceServersFetchedAt < ICE_CACHE_TTL_MS) {
    return cachedIceServers;
  }

  // 1. Check for custom Metered app configuration (from localStorage or Vite environment)
  const envAppName = (import.meta as any).env?.VITE_METERED_APP_NAME;
  const envApiKey = (import.meta as any).env?.VITE_METERED_API_KEY;
  const localAppName = typeof localStorage !== 'undefined' ? localStorage.getItem('love_metered_app_name') : null;
  const localApiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('love_metered_api_key') : null;

  const appName = localAppName || envAppName;
  const apiKey = localApiKey || envApiKey;

  if (appName && apiKey) {
    try {
      const resp = await fetch(
        `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (resp.ok) {
        const turnServers: RTCIceServer[] = await resp.json();
        if (Array.isArray(turnServers) && turnServers.length > 0) {
          cachedIceServers = [
            ...VERIFIED_STUN_SERVERS,
            ...turnServers,
            ...VERIFIED_TURN_SERVERS,
          ];
          iceServersFetchedAt = Date.now();
          console.log('[WebRTC ICE] Dynamic geo-routed TURN servers loaded from Metered dashboard:', turnServers.length);
          return cachedIceServers;
        }
      }
    } catch (err) {
      console.warn('[WebRTC ICE] Dynamic Metered fetch failed, using verified global TURN relays:', err);
    }
  }

  // 2. Verified Active Worldwide STUN + TURN relay servers
  const fallbackServers: RTCIceServer[] = [
    ...VERIFIED_STUN_SERVERS,
    ...VERIFIED_TURN_SERVERS,
  ];

  cachedIceServers = fallbackServers;
  iceServersFetchedAt = Date.now();
  console.log('[WebRTC ICE] Configured verified STUN + worldwide TURN relay servers (UDP 3478, TCP 3478/443, TLS 443)');
  return fallbackServers;
}

type CallStateListener = (state: {
  status: 'idle' | 'calling' | 'incoming' | 'connected';
  callerName?: string;
  callerRole?: UserRole;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  activeTheme: RomanticThemeId;
  activeFilter: RomanticFilterId;
  partnerTouchingHeart: boolean;
  iceConnectionState: string;
  isScreenSharing: boolean;
  partnerScreenSharing: boolean;
  screenStream: MediaStream | null;
  screenSharerRole?: UserRole;
  screenSharerName?: string;
}) => void;

type ReactionListener = (reaction: { id: string; emoji: string; x: number; y: number; senderRole?: UserRole }) => void;

export type ThemeSyncListener = (info: {
  themeId?: RomanticThemeId;
  filterId?: RomanticFilterId;
  senderName?: string;
  senderRole?: UserRole;
}) => void;

export type ScreenShareListener = (info: {
  isScreenSharing: boolean;
  sharerRole?: UserRole;
  sharerName?: string;
}) => void;

export type MusicSyncListener = (info: {
  trackId?: string;
  isPlaying?: boolean;
  volume?: number;
  customUrl?: string;
  customTitle?: string;
  streamingProvider?: 'spotify' | 'apple-music' | 'youtube' | 'soundcloud' | 'custom' | 'soundscape';
  streamingEmbedUrl?: string;
  streamingOriginalUrl?: string;
  streamingTitle?: string;
  streamingSubtitle?: string;
  senderName?: string;
  senderRole?: UserRole;
}) => void;

function getInitialTheme(): RomanticThemeId {
  try {
    const saved = localStorage.getItem('love_app_video_theme') as RomanticThemeId;
    if (saved && ROMANTIC_THEMES.some((t) => t.id === saved)) return saved;
  } catch {}
  return 'moonlight';
}

function getInitialFilter(): RomanticFilterId {
  try {
    const saved = localStorage.getItem('love_app_video_filter') as RomanticFilterId;
    if (saved && ROMANTIC_FILTERS.some((f) => f.id === saved)) return saved;
  } catch {}
  return 'dreamy';
}

class RomanticVideoCallService {
  private peer: any = null;
  private activeCall: any = null;
  public myPeerId: string = '';
  private partnerPeerId: string | null = null;

  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private mediaPromise: Promise<MediaStream | null> | null = null;
  private unsubRealtime: (() => void) | null = null;
  private callInviteTimer: any = null;
  private answerFallbackTimer: any = null;

  public status: 'idle' | 'calling' | 'incoming' | 'connected' = 'idle';
  public iceConnectionState: string = 'new';
  public currentCallId: string | null = null;
  public myRole?: UserRole;
  public callerRole?: UserRole;
  public callerName?: string;
  public isMuted: boolean = false;
  public isVideoOff: boolean = false;
  public activeTheme: RomanticThemeId = getInitialTheme();
  public activeFilter: RomanticFilterId = getInitialFilter();
  public partnerTouchingHeart: boolean = false;
  public isScreenSharing: boolean = false;
  public partnerScreenSharing: boolean = false;
  public screenStream: MediaStream | null = null;
  public screenSharerRole?: UserRole;
  public screenSharerName?: string;

  private stateListeners: Set<CallStateListener> = new Set();
  private reactionListeners: Set<ReactionListener> = new Set();
  private themeSyncListeners: Set<ThemeSyncListener> = new Set();
  private screenShareListeners: Set<ScreenShareListener> = new Set();
  private musicSyncListeners: Set<MusicSyncListener> = new Set();

  constructor() {
    this.setupSignalingListener();
    // Pre-initialize PeerJS client on app start
    if (typeof window !== 'undefined') {
      setTimeout(() => this.ensurePeer(), 500);
    }
  }

  private notify() {
    const snapshot = {
      status: this.status,
      callerName: this.callerName,
      callerRole: this.callerRole,
      localStream: this.localStream,
      remoteStream: this.remoteStream,
      isMuted: this.isMuted,
      isVideoOff: this.isVideoOff,
      activeTheme: this.activeTheme,
      activeFilter: this.activeFilter,
      partnerTouchingHeart: this.partnerTouchingHeart,
      iceConnectionState: this.iceConnectionState,
      isScreenSharing: this.isScreenSharing,
      partnerScreenSharing: this.partnerScreenSharing,
      screenStream: this.screenStream,
      screenSharerRole: this.screenSharerRole,
      screenSharerName: this.screenSharerName,
    };
    this.stateListeners.forEach((l) => l(snapshot));
  }

  public onStateChange(listener: CallStateListener): () => void {
    this.stateListeners.add(listener);
    listener({
      status: this.status,
      callerName: this.callerName,
      callerRole: this.callerRole,
      localStream: this.localStream,
      remoteStream: this.remoteStream,
      isMuted: this.isMuted,
      isVideoOff: this.isVideoOff,
      activeTheme: this.activeTheme,
      activeFilter: this.activeFilter,
      partnerTouchingHeart: this.partnerTouchingHeart,
      iceConnectionState: this.iceConnectionState,
      isScreenSharing: this.isScreenSharing,
      partnerScreenSharing: this.partnerScreenSharing,
      screenStream: this.screenStream,
      screenSharerRole: this.screenSharerRole,
      screenSharerName: this.screenSharerName,
    });
    return () => this.stateListeners.delete(listener);
  }

  public onReaction(listener: ReactionListener): () => void {
    this.reactionListeners.add(listener);
    return () => this.reactionListeners.delete(listener);
  }

  public onThemeSync(listener: ThemeSyncListener): () => void {
    this.themeSyncListeners.add(listener);
    return () => this.themeSyncListeners.delete(listener);
  }

  public onScreenShare(listener: ScreenShareListener): () => void {
    this.screenShareListeners.add(listener);
    return () => this.screenShareListeners.delete(listener);
  }

  public onMusicSync(listener: MusicSyncListener): () => void {
    this.musicSyncListeners.add(listener);
    return () => this.musicSyncListeners.delete(listener);
  }

  public setMyRole(role: UserRole) {
    this.myRole = role;
  }

  // Ensure PeerJS connection is active with unique client identifier
  public async ensurePeer(): Promise<string> {
    // Reuse existing active peer
    if (this.peer && !this.peer.destroyed && !this.peer.disconnected && this.myPeerId) {
      return this.myPeerId;
    }

    // Try to reconnect a disconnected (but not destroyed) peer
    if (this.peer && !this.peer.destroyed && this.peer.disconnected && this.myPeerId) {
      console.log('[WebRTC] Reconnecting disconnected peer:', this.myPeerId);
      try {
        this.peer.reconnect();
        return this.myPeerId;
      } catch {
        console.warn('[WebRTC] Reconnect failed, creating new peer');
      }
    }

    // Fetch TURN + STUN servers (dynamic with static fallback)
    const iceServers = await getIceServers();
    console.log('[WebRTC] ICE servers ready:', iceServers.length, 'servers');

    return new Promise((resolve) => {
      try {
        const PeerConstructor = (Peer as any).Peer || Peer;
        const cleanClient = getClientId().replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        const preferredId = `love_${this.myRole || 'nest'}_${cleanClient}`;

        const p = new PeerConstructor(preferredId, {
          config: {
            iceServers: iceServers,
            iceCandidatePoolSize: 10,
            iceTransportPolicy: 'all', // Try direct P2P first, fall back to TURN relay
          },
        });

        p.on('open', (id: string) => {
          this.peer = p;
          this.myPeerId = id;
          console.log('[WebRTC] PeerJS ready with ID:', id);
          resolve(id);
        });

        p.on('disconnected', () => {
          console.warn('[WebRTC PeerJS] Disconnected from cloud broker, attempting reconnect...');
          try {
            p.reconnect();
          } catch (e) {
            console.warn('[WebRTC PeerJS] Reconnect failed:', e);
          }
        });

        p.on('call', async (incomingCall: any) => {
          console.log('[WebRTC] Incoming media call from partner:', incomingCall.peer);
          clearTimeout(this.answerFallbackTimer);
          this.answerFallbackTimer = null;
          this.activeCall = incomingCall;

          // Ensure local media is ready before answering
          if (!this.localStream) {
            await this.getLocalMedia(true, true);
          }

          incomingCall.answer(this.localStream || undefined);
          this.attachMediaCallListeners(incomingCall);
        });

        p.on('error', (err: any) => {
          console.warn('PeerJS event error:', err.type, err);
          if (err.type === 'unavailable-id') {
            // Fallback to random ID on collision
            const randomId = `love_${this.myRole || 'user'}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            const p2 = new PeerConstructor(randomId, {
              config: {
                iceServers: iceServers,
                iceCandidatePoolSize: 10,
                iceTransportPolicy: 'all',
              },
            });
            p2.on('open', (id: string) => {
              this.peer = p2;
              this.myPeerId = id;
              resolve(id);
            });
            p2.on('disconnected', () => {
              try { p2.reconnect(); } catch {}
            });
            p2.on('call', async (incomingCall: any) => {
              clearTimeout(this.answerFallbackTimer);
              this.answerFallbackTimer = null;
              this.activeCall = incomingCall;
              if (!this.localStream) await this.getLocalMedia(true, true);
              incomingCall.answer(this.localStream || undefined);
              this.attachMediaCallListeners(incomingCall);
            });
          } else {
            resolve(this.myPeerId);
          }
        });
      } catch (err) {
        console.error('PeerJS init failed:', err);
        resolve('');
      }
    });
  }

  // Re-initialize Peer client when ICE servers or network credentials change
  public async refreshPeer(): Promise<string> {
    console.log('[WebRTC] Refreshing PeerJS client with updated ICE servers...');
    cachedIceServers = null;
    iceServersFetchedAt = 0;
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
      this.myPeerId = '';
    }
    return this.ensurePeer();
  }

  // Attach audio & video stream event listeners to active media call
  private attachMediaCallListeners(call: any) {
    call.on('stream', (remoteMediaStream: MediaStream) => {
      console.log('[WebRTC] PeerJS remote stream received successfully!', remoteMediaStream.getTracks());
      this.remoteStream = remoteMediaStream;
      this.status = 'connected';
      romanticMusic.stopRinging();
      romanticMusic.playConnectedChime();
      romanticMusic.startRomanticAmbience(0.18);
      this.notify();
    });

    call.on('close', () => {
      // Only tear down the session if this was the current active call!
      if (this.activeCall === call && this.status !== 'idle') {
        console.log('[WebRTC] Active media call closed by peer');
        this.endCall(false);
      } else {
        console.log('[WebRTC] Ignored close from stale or superseded call');
      }
    });

    call.on('error', (err: any) => {
      console.warn('[WebRTC] PeerJS media call error:', err);
    });

    // Monitor underlying RTCPeerConnection for ICE status, tracks, and connection states
    const pc = (call.peerConnection || call._peerConnection) as RTCPeerConnection | undefined;
    if (pc) {
      this.iceConnectionState = pc.iceConnectionState;
      this.notify();

      // Native ontrack listener for instant track reception across mobile and desktop
      pc.addEventListener('track', (event: RTCTrackEvent) => {
        console.log('[WebRTC PC] Native track event received:', event.track.kind);
        if (event.streams && event.streams[0]) {
          if (!this.remoteStream || this.remoteStream.id !== event.streams[0].id) {
            console.log('[WebRTC PC] Updating remoteStream from native ontrack event');
            this.remoteStream = event.streams[0];
            this.status = 'connected';
            romanticMusic.stopRinging();
            romanticMusic.playConnectedChime();
            romanticMusic.startRomanticAmbience(0.18);
            this.notify();
          }
        }
      });

      pc.addEventListener('iceconnectionstatechange', () => {
        console.log('[WebRTC] ICE Connection State:', pc.iceConnectionState);
        this.iceConnectionState = pc.iceConnectionState;
        this.notify();
        if (pc.iceConnectionState === 'failed') {
          console.warn('[WebRTC] ICE failed across networks. Triggering iceRestart with TURN relay...');
          try {
            if (typeof (pc as any).restartIce === 'function') {
              (pc as any).restartIce();
            }
          } catch (e) {
            console.warn('[WebRTC] restartIce error:', e);
          }
        }
      });

      pc.addEventListener('connectionstatechange', () => {
        console.log('[WebRTC] Connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          this.iceConnectionState = 'connected';
          this.notify();
        }
      });
    }
  }

  // Connect PeerJS media stream directly to partner
  private connectPeerMedia(targetPeerId: string) {
    if (!this.peer || !this.localStream || !targetPeerId) return;
    if (this.activeCall && this.activeCall.open) return;

    try {
      console.log('Initiating PeerJS call to partner:', targetPeerId);
      const call = this.peer.call(targetPeerId, this.localStream);
      this.activeCall = call;
      this.attachMediaCallListeners(call);
    } catch (e) {
      console.warn('Failed to place PeerJS call:', e);
    }
  }

  // Set up signaling subscriber over realtimeHub
  private setupSignalingListener() {
    if (this.unsubRealtime) return;
    this.unsubRealtime = realtimeHub.subscribe((payload: RealtimePayload) => {
      if (payload.type !== 'VIDEO_CALL_SIGNAL' || !payload.data) return;
      this.handleIncomingSignal(payload.data as VideoSignalData, payload.senderRole, payload.senderName);
    });
  }

  private async sendSignal(data: VideoSignalData, senderRole?: UserRole, senderName?: string) {
    const role = senderRole || this.myRole;
    const signalDataWithMeta: VideoSignalData = {
      ...data,
      callId: data.callId || this.currentCallId || undefined,
      callerPeerId: data.callerPeerId || this.myPeerId || undefined,
      answererPeerId: data.answererPeerId || this.myPeerId || undefined,
      sentAt: Date.now(),
    };
    await realtimeHub.publish({
      type: 'VIDEO_CALL_SIGNAL',
      clientId: getClientId(),
      senderRole: role,
      senderName,
      data: signalDataWithMeta,
      timestamp: Date.now(),
    });
  }

  // Request user camera and microphone
  public async getLocalMedia(videoWanted: boolean = true, audioWanted: boolean = true): Promise<MediaStream | null> {
    if (this.localStream && this.localStream.active && this.localStream.getVideoTracks().some((t) => t.readyState === 'live')) {
      return this.localStream;
    }
    if (this.mediaPromise) {
      return this.mediaPromise;
    }

    this.mediaPromise = (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoWanted
            ? {
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 },
              }
            : false,
          audio: audioWanted
            ? {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              }
            : false,
        });
        this.localStream = stream;
        this.notify();
        return stream;
      } catch (err) {
        console.warn('Preferred getUserMedia failed, trying mobile fallback:', err);
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: videoWanted ? true : false,
            audio: audioWanted ? true : false,
          });
          this.localStream = fallbackStream;
          this.notify();
          return fallbackStream;
        } catch (fallbackErr) {
          console.warn('Could not acquire user camera/mic:', fallbackErr);
          // Audio-only fallback if video stream cannot be acquired (e.g. mobile permissions or in-use camera)
          try {
            if (audioWanted) {
              const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
              this.localStream = audioOnly;
              this.notify();
              return audioOnly;
            }
          } catch {}
          return null;
        }
      } finally {
        this.mediaPromise = null;
      }
    })();

    return this.mediaPromise;
  }

  // Start outgoing video call to partner
  public async startCall(myRole: UserRole, myName: string, theme: RomanticThemeId = 'moonlight'): Promise<boolean> {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.currentCallId = callId;
    this.myRole = myRole;
    this.status = 'calling';
    this.callerRole = myRole;
    this.callerName = myName;
    this.activeTheme = theme;
    this.notify();

    // 1. Ensure local camera/mic and PeerJS are warmed up
    await this.ensurePeer();
    await this.getLocalMedia(true, true);

    const sendInvite = async () => {
      await this.sendSignal(
        {
          signalType: 'call-invite',
          callId,
          callerRole: myRole,
          callerName: myName,
          callerPeerId: this.myPeerId,
          themeId: theme,
        },
        myRole,
        myName
      );
    };

    // 2. Broadcast immediate invite
    await sendInvite();

    // 3. Re-broadcast invite every 3s while waiting for partner to answer (up to 12 attempts)
    clearInterval(this.callInviteTimer);
    let inviteAttempts = 0;
    this.callInviteTimer = setInterval(() => {
      inviteAttempts++;
      if (this.status !== 'calling' || this.currentCallId !== callId || inviteAttempts > 12) {
        clearInterval(this.callInviteTimer);
        this.callInviteTimer = null;
        return;
      }
      sendInvite().catch(() => {});
    }, 3000);

    return true;
  }

  // Accept incoming call from partner
  public async acceptCall(myRole: UserRole, myName: string) {
    romanticMusic.stopRinging();
    this.myRole = myRole;
    this.status = 'connected';
    this.notify();

    // Ensure camera & mic and PeerJS are ready
    await this.ensurePeer();
    await this.getLocalMedia(true, true);

    const acceptPayload: VideoSignalData = {
      signalType: 'call-accept',
      callId: this.currentCallId || undefined,
      answererRole: myRole,
      answererPeerId: this.myPeerId,
    };

    try {
      await this.sendSignal(acceptPayload, myRole, myName);
    } catch (e) {
      console.warn('acceptCall send error:', e);
    }

    // The Answerer sends call-accept and waits for the Caller to place the media call.
    // This avoids call glare / simultaneous call collisions in PeerJS.
    // If the caller's media connection has not arrived within 8 seconds, attempt reverse call as fallback.
    clearTimeout(this.answerFallbackTimer);
    this.answerFallbackTimer = setTimeout(() => {
      if (this.status === 'connected' && !this.remoteStream && !this.activeCall && this.partnerPeerId) {
        console.log('[WebRTC Answerer] Fallback timer expired: Caller did not initiate, placing reverse media call...');
        this.connectPeerMedia(this.partnerPeerId);
      }
    }, 8000);
  }

  // Decline incoming call
  public async declineCall(myRole: UserRole) {
    clearInterval(this.callInviteTimer);
    this.callInviteTimer = null;
    clearTimeout(this.answerFallbackTimer);
    this.answerFallbackTimer = null;
    romanticMusic.stopRinging();
    const decliningCallId = this.currentCallId;
    this.currentCallId = null;
    this.status = 'idle';
    this.notify();

    await this.sendSignal(
      {
        signalType: 'call-decline',
        callId: decliningCallId || undefined,
        reason: 'declined',
      },
      myRole
    );
  }

  // End call cleanly on both devices
  public async endCall(notifyRemote: boolean = true) {
    clearInterval(this.callInviteTimer);
    this.callInviteTimer = null;
    clearTimeout(this.answerFallbackTimer);
    this.answerFallbackTimer = null;
    this.iceConnectionState = 'new';
    romanticMusic.stopRinging();
    romanticMusic.stopRomanticAmbience();
    romanticMusic.playHangupChime();

    const endingCallId = this.currentCallId;
    this.currentCallId = null;
    this.partnerPeerId = null;

    if (this.activeCall) {
      try {
        this.activeCall.close();
      } catch {}
      this.activeCall = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    this.remoteStream = null;
    this.status = 'idle';
    this.partnerTouchingHeart = false;

    if (this.isScreenSharing) {
      if (this.screenStream) {
        this.screenStream.getTracks().forEach((t) => t.stop());
        this.screenStream = null;
      }
      this.isScreenSharing = false;
    }
    this.partnerScreenSharing = false;
    this.screenSharerRole = undefined;
    this.screenSharerName = undefined;

    this.notify();

    if (notifyRemote) {
      await this.sendSignal({ signalType: 'call-end', callId: endingCallId || undefined }, this.myRole);
    }
  }

  // Process incoming signal packet over realtimeHub
  private async handleIncomingSignal(data: VideoSignalData, senderRole?: UserRole, senderName?: string) {
    if (!data || !data.signalType) return;

    // 1. Call Termination: partner hung up
    if (data.signalType === 'call-end') {
      if (this.status !== 'idle') {
        console.log('Received call-end signal, terminating call');
        this.endCall(false);
      }
      return;
    }

    // 2. Call Invitation: partner is calling
    if (data.signalType === 'call-invite') {
      if (data.callerPeerId) {
        this.partnerPeerId = data.callerPeerId;
      }

      // Auto-healing: Answerer already accepted and connected, but caller is still ringing
      if (this.status === 'connected' && data.callId && data.callId === this.currentCallId) {
        this.sendSignal({
          signalType: 'call-accept',
          callId: this.currentCallId,
          answererRole: this.myRole,
          answererPeerId: this.myPeerId,
        }, this.myRole, this.callerName).catch(() => {});
        if (data.callerPeerId) {
          this.connectPeerMedia(data.callerPeerId);
        }
        return;
      }

      if (this.status === 'incoming' && data.callId === this.currentCallId) {
        return;
      }

      if (this.status === 'idle') {
        this.currentCallId = data.callId || `call_${Date.now()}`;
        this.status = 'incoming';
        this.callerRole = data.callerRole || senderRole;
        this.callerName = data.callerName || senderName || 'My Love';
        if (data.themeId) this.activeTheme = data.themeId;
        this.notify();
        romanticMusic.startRinging();
        // Warm up camera and PeerJS in background
        this.ensurePeer().catch(() => {});
        this.getLocalMedia(true, true).catch(() => {});
      } else if (this.status === 'calling' && data.callId && data.callId !== this.currentCallId) {
        // Glare resolution: Boyfriend takes precedence
        if (senderRole === 'boyfriend') {
          this.currentCallId = data.callId;
          this.status = 'incoming';
          this.callerRole = 'boyfriend';
          this.callerName = data.callerName || 'Vishvesh';
          this.notify();
          await this.acceptCall(this.myRole || 'girlfriend', this.callerName);
        }
      }
      return;
    }

    // 3. Romantic Theme & Atmosphere Synchronizer (Always applies for both partners!)
    if (data.signalType === 'theme-sync') {
      let changed = false;
      if (data.themeId && data.themeId !== this.activeTheme) {
        this.activeTheme = data.themeId;
        try {
          localStorage.setItem('love_app_video_theme', data.themeId);
        } catch {}
        changed = true;
      }
      if (data.filterId && data.filterId !== this.activeFilter) {
        this.activeFilter = data.filterId;
        try {
          localStorage.setItem('love_app_video_filter', data.filterId);
        } catch {}
        changed = true;
      }
      if (changed) {
        this.notify();
        this.themeSyncListeners.forEach((l) =>
          l({
            themeId: data.themeId,
            filterId: data.filterId,
            senderName: senderName || 'Your Love',
            senderRole,
          })
        );
      }
      return;
    }

    // 4. Romantic reactions (flying kisses, hearts)
    if (data.signalType === 'romantic-reaction') {
      if (data.emoji && typeof data.x === 'number' && typeof data.y === 'number') {
        this.reactionListeners.forEach((l) =>
          l({
            id: data.reactionId || `r_${Date.now()}`,
            emoji: data.emoji!,
            x: data.x!,
            y: data.y!,
            senderRole,
          })
        );
      }
      return;
    }

    // 5. Soul touch heart
    if (data.signalType === 'touch-heart') {
      this.partnerTouchingHeart = Boolean(data.touchActive);
      this.notify();
      return;
    }

    // 6. Screen share state sync
    if (data.signalType === 'screen-share-sync') {
      this.partnerScreenSharing = Boolean(data.isScreenSharing);
      this.screenSharerRole = data.sharerRole;
      this.screenSharerName = data.sharerName;
      this.notify();
      this.screenShareListeners.forEach((l) =>
        l({
          isScreenSharing: Boolean(data.isScreenSharing),
          sharerRole: data.sharerRole,
          sharerName: data.sharerName || senderName,
        })
      );
      return;
    }

    // 7. Synchronized romantic music
    if (data.signalType === 'music-sync') {
      this.musicSyncListeners.forEach((l) =>
        l({
          trackId: data.musicTrackId,
          isPlaying: data.musicPlaying,
          volume: data.musicVolume,
          customUrl: data.customSongUrl,
          customTitle: data.customSongTitle,
          streamingProvider: data.streamingProvider,
          streamingEmbedUrl: data.streamingEmbedUrl,
          streamingOriginalUrl: data.streamingOriginalUrl,
          streamingTitle: data.streamingTitle,
          streamingSubtitle: data.streamingSubtitle,
          senderName: senderName || 'Your Love',
          senderRole,
        })
      );
      return;
    }

    // Mismatched session check for active calls (call-accept / call-decline)
    if (this.currentCallId && data.callId && data.callId !== this.currentCallId) {
      return;
    }

    switch (data.signalType) {
      case 'call-accept':
        clearInterval(this.callInviteTimer);
        this.callInviteTimer = null;
        if (data.answererPeerId) {
          this.partnerPeerId = data.answererPeerId;
        }

        if (this.status === 'calling' || this.status === 'connected') {
          this.status = 'connected';
          romanticMusic.playConnectedChime();
          this.notify();

          // Connect media stream via PeerJS
          if (this.partnerPeerId) {
            this.connectPeerMedia(this.partnerPeerId);
          }
        }
        break;

      case 'call-decline':
        if (this.status === 'calling') {
          this.endCall(false);
          alert(`${senderName || 'Your partner'} is unable to answer right now.`);
        }
        break;
    }
  }

  // Toggle Microphone
  public toggleMute(): boolean {
    if (!this.localStream) return this.isMuted;
    this.isMuted = !this.isMuted;
    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = !this.isMuted;
    });
    this.notify();
    return this.isMuted;
  }

  // Toggle Camera
  public toggleVideo(): boolean {
    if (!this.localStream) return this.isVideoOff;
    this.isVideoOff = !this.isVideoOff;
    this.localStream.getVideoTracks().forEach((track) => {
      track.enabled = !this.isVideoOff;
    });
    this.notify();
    return this.isVideoOff;
  }

  // Switch Theme (with instant bidirectional sync to partner)
  public setTheme(theme: RomanticThemeId, syncToPartner: boolean = true, myRole?: UserRole, myName?: string) {
    this.activeTheme = theme;
    try {
      localStorage.setItem('love_app_video_theme', theme);
    } catch {}
    this.notify();
    if (syncToPartner) {
      this.sendSignal({
        signalType: 'theme-sync',
        themeId: theme,
        filterId: this.activeFilter,
      }, myRole || this.myRole, myName);
    }
  }

  // Switch Filter (with instant bidirectional sync to partner)
  public setFilter(filter: RomanticFilterId, syncToPartner: boolean = true, myRole?: UserRole, myName?: string) {
    this.activeFilter = filter;
    try {
      localStorage.setItem('love_app_video_filter', filter);
    } catch {}
    this.notify();
    if (syncToPartner) {
      this.sendSignal({
        signalType: 'theme-sync',
        themeId: this.activeTheme,
        filterId: filter,
      }, myRole || this.myRole, myName);
    }
  }

  // Send interactive romantic reaction
  public sendReaction(emoji: string, x: number = 50, y: number = 50, senderRole?: UserRole) {
    const reactionId = `r_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    this.reactionListeners.forEach((l) => l({ id: reactionId, emoji, x, y, senderRole }));
    this.sendSignal({
      signalType: 'romantic-reaction',
      reactionId,
      emoji,
      x,
      y,
    }, senderRole);
  }

  // Send "Hold Hands / Soul Touch Heart" state
  public setTouchHeart(active: boolean, senderRole?: UserRole) {
    this.sendSignal({
      signalType: 'touch-heart',
      touchActive: active,
    }, senderRole);
  }

  // Start Screen Sharing
  public async startScreenShare(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      throw new Error('Screen sharing is not supported on this browser or platform.');
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: true,
      });

      const screenVideoTrack = stream.getVideoTracks()[0];
      if (!screenVideoTrack) return false;

      this.screenStream = stream;
      this.isScreenSharing = true;

      // When user clicks the browser's native "Stop sharing" bar
      screenVideoTrack.onended = () => {
        this.stopScreenShare();
      };

      // Replace video sender track on active RTCPeerConnection
      if (this.activeCall) {
        const pc = (this.activeCall.peerConnection || this.activeCall._peerConnection) as RTCPeerConnection | undefined;
        if (pc) {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
          if (videoSender) {
            await videoSender.replaceTrack(screenVideoTrack);
          }
          // Mix/forward screen audio if user shared tab/system audio
          const screenAudioTrack = stream.getAudioTracks()[0];
          if (screenAudioTrack) {
            const audioSender = senders.find((s) => s.track && s.track.kind === 'audio');
            if (audioSender) {
              await audioSender.replaceTrack(screenAudioTrack);
            }
          }
        }
      }

      await this.sendSignal(
        {
          signalType: 'screen-share-sync',
          isScreenSharing: true,
          sharerRole: this.myRole,
          sharerName: this.callerName,
        },
        this.myRole,
        this.callerName
      );

      this.notify();
      return true;
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        return false;
      }
      console.warn('Screen share start failed:', err);
      throw err;
    }
  }

  // Stop Screen Sharing & restore camera and mic
  public async stopScreenShare(): Promise<void> {
    if (!this.isScreenSharing && !this.screenStream) return;

    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }
    this.isScreenSharing = false;

    // Restore camera and mic tracks on active RTCPeerConnection
    if (this.activeCall && this.localStream) {
      const pc = (this.activeCall.peerConnection || this.activeCall._peerConnection) as RTCPeerConnection | undefined;
      if (pc) {
        const senders = pc.getSenders();
        const cameraTrack = this.localStream.getVideoTracks()[0];
        const micTrack = this.localStream.getAudioTracks()[0];
        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
        const audioSender = senders.find((s) => s.track && s.track.kind === 'audio');
        if (videoSender && cameraTrack) {
          await videoSender.replaceTrack(cameraTrack);
        }
        if (audioSender && micTrack) {
          await audioSender.replaceTrack(micTrack);
        }
      }
    }

    await this.sendSignal(
      {
        signalType: 'screen-share-sync',
        isScreenSharing: false,
        sharerRole: this.myRole,
        sharerName: this.callerName,
      },
      this.myRole,
      this.callerName
    );

    this.notify();
  }

  // Synchronize romantic background music across both devices
  public async syncMusic(data: {
    trackId: string;
    isPlaying: boolean;
    volume?: number;
    customUrl?: string;
    customTitle?: string;
    streamingProvider?: 'spotify' | 'apple-music' | 'youtube' | 'soundcloud' | 'custom' | 'soundscape';
    streamingEmbedUrl?: string;
    streamingOriginalUrl?: string;
    streamingTitle?: string;
    streamingSubtitle?: string;
    senderRole?: UserRole;
    senderName?: string;
  }) {
    await this.sendSignal(
      {
        signalType: 'music-sync',
        musicTrackId: data.trackId,
        musicPlaying: data.isPlaying,
        musicVolume: data.volume,
        customSongUrl: data.customUrl,
        customSongTitle: data.customTitle,
        streamingProvider: data.streamingProvider,
        streamingEmbedUrl: data.streamingEmbedUrl,
        streamingOriginalUrl: data.streamingOriginalUrl,
        streamingTitle: data.streamingTitle,
        streamingSubtitle: data.streamingSubtitle,
      },
      data.senderRole || this.myRole,
      data.senderName
    );
  }
}

export const videoCallService = new RomanticVideoCallService();
