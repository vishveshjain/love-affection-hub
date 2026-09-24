// Romantic Realtime WebRTC Video Engine powered by PeerJS & Cloudflare Edge Broker
// Features crystal-clear HD video, bidirectional stereo audio, romantic themes, filters, and soul-touch heart sharing.

import Peer from 'peerjs';
import { realtimeHub, RealtimePayload, getClientId, getRoomKey } from './realtime';
import { romanticMusic } from './romanticMusic';

export type RomanticThemeId = 'moonlight' | 'sunset' | 'candlelight' | 'sakura' | 'aurora';
export type RomanticFilterId = 'dreamy' | 'golden' | 'rose' | 'vintage' | 'fairy' | 'natural';
export type UserRole = 'boyfriend' | 'girlfriend';

export interface RomanticThemeConfig {
  id: RomanticThemeId;
  name: string;
  icon: string;
  description: string;
  gradient: string;
  particleEmoji: string;
}

export interface RomanticFilterConfig {
  id: RomanticFilterId;
  name: string;
  icon: string;
  cssFilter: string;
  overlayClass: string;
}

export const ROMANTIC_THEMES: RomanticThemeConfig[] = [
  {
    id: 'moonlight',
    name: 'Moonlight Sanctuary',
    icon: '🌙',
    description: 'Deep midnight blue with stardust shimmer and soft moonlight ripples',
    gradient: 'from-slate-950 via-indigo-950 to-purple-950',
    particleEmoji: '✨',
  },
  {
    id: 'sunset',
    name: 'Sunset Beach Romance',
    icon: '🌅',
    description: 'Pastel pink, coral orange, and golden waves of eternal love',
    gradient: 'from-rose-950 via-pink-900 to-amber-950',
    particleEmoji: '💖',
  },
  {
    id: 'candlelight',
    name: 'Candlelit Haven',
    icon: '🕯️',
    description: 'Flickering warm candle glow, red velvet roses, and intimate shadows',
    gradient: 'from-neutral-950 via-rose-950 to-stone-900',
    particleEmoji: '🌹',
  },
  {
    id: 'sakura',
    name: 'Cherry Blossom Dream',
    icon: '🌸',
    description: 'Drifting pink sakura blossoms dancing in a gentle romantic breeze',
    gradient: 'from-pink-950 via-fuchsia-950 to-slate-900',
    particleEmoji: '🌸',
  },
  {
    id: 'aurora',
    name: 'Love Aurora & Hearts',
    icon: '💫',
    description: 'Shimmering Northern lights infused with floating neon love hearts',
    gradient: 'from-purple-950 via-violet-900 to-emerald-950',
    particleEmoji: '💜',
  },
];

export const ROMANTIC_FILTERS: RomanticFilterConfig[] = [
  {
    id: 'dreamy',
    name: 'Dreamy Glow',
    icon: '✨',
    cssFilter: 'contrast(105%) brightness(108%) saturate(115%) blur(0.2px)',
    overlayClass: 'bg-rose-500/10 mix-blend-screen',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    icon: '🌅',
    cssFilter: 'sepia(25%) saturate(135%) brightness(106%) contrast(104%)',
    overlayClass: 'bg-amber-500/15 mix-blend-color-dodge',
  },
  {
    id: 'rose',
    name: 'Rose Quartz',
    icon: '🌸',
    cssFilter: 'hue-rotate(-10deg) saturate(120%) brightness(105%) contrast(103%)',
    overlayClass: 'bg-pink-500/15 mix-blend-soft-light',
  },
  {
    id: 'vintage',
    name: '90s Love Letter',
    icon: '📜',
    cssFilter: 'sepia(35%) contrast(110%) brightness(96%) saturate(90%)',
    overlayClass: 'bg-amber-900/10 mix-blend-multiply',
  },
  {
    id: 'fairy',
    name: 'Fairy Sparkle',
    icon: '🧚',
    cssFilter: 'brightness(112%) contrast(108%) saturate(125%)',
    overlayClass: 'bg-gradient-to-tr from-purple-500/15 via-pink-400/10 to-amber-300/15 mix-blend-screen',
  },
  {
    id: 'natural',
    name: 'Crystal Natural',
    icon: '🪞',
    cssFilter: 'none',
    overlayClass: 'opacity-0',
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
  public activeTheme: RomanticThemeId = 'moonlight';
  public activeFilter: RomanticFilterId = 'dreamy';
  public partnerTouchingHeart: boolean = false;

  private stateListeners: Set<CallStateListener> = new Set();
  private reactionListeners: Set<ReactionListener> = new Set();

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

    // Mismatched session check for active calls
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

      case 'romantic-reaction':
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
        break;

      case 'touch-heart':
        this.partnerTouchingHeart = Boolean(data.touchActive);
        this.notify();
        break;

      case 'theme-sync':
        if (data.themeId) this.activeTheme = data.themeId;
        if (data.filterId) this.activeFilter = data.filterId;
        this.notify();
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

  // Switch Theme (with sync to partner)
  public setTheme(theme: RomanticThemeId, syncToPartner: boolean = true) {
    this.activeTheme = theme;
    this.notify();
    if (syncToPartner) {
      this.sendSignal({ signalType: 'theme-sync', themeId: theme });
    }
  }

  // Switch Filter
  public setFilter(filter: RomanticFilterId, syncToPartner: boolean = false) {
    this.activeFilter = filter;
    this.notify();
    if (syncToPartner) {
      this.sendSignal({ signalType: 'theme-sync', filterId: filter });
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
