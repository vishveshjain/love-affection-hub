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
    | 'theme-sync';
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
  sentAt?: number;
}

const VERIFIED_STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
  { urls: 'stun:stun.nextcloud.com:443' },
];

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
}) => void;

type ReactionListener = (reaction: { id: string; emoji: string; x: number; y: number; senderRole?: UserRole }) => void;

export type ThemeSyncListener = (info: {
  themeId?: RomanticThemeId;
  filterId?: RomanticFilterId;
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

  public status: 'idle' | 'calling' | 'incoming' | 'connected' = 'idle';
  public currentCallId: string | null = null;
  public myRole?: UserRole;
  public callerRole?: UserRole;
  public callerName?: string;
  public isMuted: boolean = false;
  public isVideoOff: boolean = false;
  public activeTheme: RomanticThemeId = getInitialTheme();
  public activeFilter: RomanticFilterId = getInitialFilter();
  public partnerTouchingHeart: boolean = false;

  private stateListeners: Set<CallStateListener> = new Set();
  private reactionListeners: Set<ReactionListener> = new Set();
  private themeSyncListeners: Set<ThemeSyncListener> = new Set();

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

  public setMyRole(role: UserRole) {
    this.myRole = role;
  }

  // Ensure PeerJS connection is active with unique client identifier
  public async ensurePeer(): Promise<string> {
    if (this.peer && !this.peer.destroyed && !this.peer.disconnected && this.myPeerId) {
      return this.myPeerId;
    }

    return new Promise((resolve) => {
      try {
        const PeerConstructor = (Peer as any).Peer || Peer;
        const cleanClient = getClientId().replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        const preferredId = `love_${this.myRole || 'nest'}_${cleanClient}`;

        const p = new PeerConstructor(preferredId, {
          config: {
            iceServers: VERIFIED_STUN_SERVERS,
            iceCandidatePoolSize: 10,
          },
        });

        p.on('open', (id: string) => {
          this.peer = p;
          this.myPeerId = id;
          console.log('PeerJS ready with ID:', id);
          resolve(id);
        });

        p.on('call', async (incomingCall: any) => {
          console.log('PeerJS incoming media call from:', incomingCall.peer);
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
              config: { iceServers: VERIFIED_STUN_SERVERS },
            });
            p2.on('open', (id: string) => {
              this.peer = p2;
              this.myPeerId = id;
              resolve(id);
            });
            p2.on('call', async (incomingCall: any) => {
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

  // Attach audio & video stream event listeners to active media call
  private attachMediaCallListeners(call: any) {
    call.on('stream', (remoteMediaStream: MediaStream) => {
      console.log('PeerJS remote stream received successfully!', remoteMediaStream.getTracks());
      this.remoteStream = remoteMediaStream;
      this.status = 'connected';
      romanticMusic.stopRinging();
      romanticMusic.playConnectedChime();
      romanticMusic.startRomanticAmbience(0.18);
      this.notify();
    });

    call.on('close', () => {
      if (this.status !== 'idle') {
        this.endCall(false);
      }
    });

    call.on('error', (err: any) => {
      console.warn('PeerJS media call error:', err);
    });
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

    // Connect to caller peer directly if known
    if (this.partnerPeerId) {
      this.connectPeerMedia(this.partnerPeerId);
    }
  }

  // Decline incoming call
  public async declineCall(myRole: UserRole) {
    clearInterval(this.callInviteTimer);
    this.callInviteTimer = null;
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
}

export const videoCallService = new RomanticVideoCallService();
