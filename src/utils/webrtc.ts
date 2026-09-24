// WebRTC Peer-to-Peer Romantic Video Calling Service
// Enables high-definition, low-latency live video and audio directly between Vishvesh & Laura,
// with signaling orchestrated over realtimeHub.

import { realtimeHub, getClientId, RealtimePayload } from './realtime';
import { UserRole } from '../types';
import { romanticMusic } from './romanticMusic';

export type RomanticThemeId =
  | 'moonlight'
  | 'sunset'
  | 'candlelight'
  | 'sakura'
  | 'aurora';

export type RomanticFilterId =
  | 'dreamy'
  | 'golden'
  | 'rose'
  | 'vintage'
  | 'fairy'
  | 'natural';

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
    icon: '🌌',
    description: 'Starry midnight sky, glowing constellations, and silver moonbeams',
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
    | 'webrtc-offer'
    | 'webrtc-answer'
    | 'webrtc-ice'
    | 'romantic-reaction'
    | 'touch-heart'
    | 'theme-sync';
  callerRole?: UserRole;
  callerName?: string;
  answererRole?: UserRole;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  emoji?: string;
  reactionId?: string;
  x?: number;
  y?: number;
  touchActive?: boolean;
  themeId?: RomanticThemeId;
  filterId?: RomanticFilterId;
  reason?: string;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ],
  iceCandidatePoolSize: 10,
};

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
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private queuedCandidates: RTCIceCandidateInit[] = [];
  private unsubRealtime: (() => void) | null = null;

  public status: 'idle' | 'calling' | 'incoming' | 'connected' = 'idle';
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

  // Set up signaling subscriber over realtimeHub
  private setupSignalingListener() {
    if (this.unsubRealtime) return;
    this.unsubRealtime = realtimeHub.subscribe((payload: RealtimePayload) => {
      if (payload.type !== 'VIDEO_CALL_SIGNAL' || !payload.data) return;
      this.handleIncomingSignal(payload.data as VideoSignalData, payload.senderRole, payload.senderName);
    });
  }

  private async sendSignal(data: VideoSignalData, senderRole?: UserRole, senderName?: string) {
    await realtimeHub.publish({
      type: 'VIDEO_CALL_SIGNAL',
      clientId: getClientId(),
      senderRole,
      senderName,
      data,
      timestamp: Date.now(),
    });
  }

  // Request user camera and microphone
  public async getLocalMedia(videoWanted: boolean = true, audioWanted: boolean = true): Promise<MediaStream | null> {
    if (this.localStream) return this.localStream;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoWanted
          ? {
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              facingMode: 'user',
              frameRate: { ideal: 30 },
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
      console.warn('Could not acquire high-res camera/mic, trying basic fallback:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: videoWanted ? true : false,
          audio: audioWanted ? true : false,
        });
        this.localStream = fallbackStream;
        this.notify();
        return fallbackStream;
      } catch (fallbackErr) {
        console.warn('Could not acquire user camera/mic even with fallback:', fallbackErr);
        return null;
      }
    }
  }

  // Start outgoing video call to partner
  public async startCall(myRole: UserRole, myName: string, theme: RomanticThemeId = 'moonlight'): Promise<boolean> {
    this.status = 'calling';
    this.callerRole = myRole;
    this.callerName = myName;
    this.activeTheme = theme;
    this.notify();

    // Start soft romantic ambience during calling
    romanticMusic.startRomanticAmbience(0.2);

    // Get camera stream
    await this.getLocalMedia(true, true);

    // Broadcast call invitation to partner
    await this.sendSignal(
      {
        signalType: 'call-invite',
        callerRole: myRole,
        callerName: myName,
        themeId: theme,
      },
      myRole,
      myName
    );

    return true;
  }

  // Accept incoming call from partner
  public async acceptCall(myRole: UserRole, myName: string) {
    romanticMusic.stopRinging();
    romanticMusic.playConnectedChime();
    romanticMusic.startRomanticAmbience(0.18);

    this.status = 'connected';
    this.notify();

    await this.getLocalMedia(true, true);

    // Notify caller we accepted
    await this.sendSignal(
      {
        signalType: 'call-accept',
        answererRole: myRole,
      },
      myRole,
      myName
    );

    // Caller will receive 'call-accept' and initiate the WebRTC offer
  }

  // Decline incoming call
  public async declineCall(myRole: UserRole) {
    romanticMusic.stopRinging();
    this.status = 'idle';
    this.notify();

    await this.sendSignal(
      {
        signalType: 'call-decline',
        reason: 'declined',
      },
      myRole
    );
  }

  // End call
  public async endCall(notifyRemote: boolean = true) {
    romanticMusic.stopRinging();
    romanticMusic.stopRomanticAmbience();
    romanticMusic.playHangupChime();

    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch {}
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    this.remoteStream = null;
    this.queuedCandidates = [];
    this.status = 'idle';
    this.partnerTouchingHeart = false;
    this.notify();

    if (notifyRemote) {
      await this.sendSignal({ signalType: 'call-end' });
    }
  }

  // Wait for ICE gathering to complete so all candidates are embedded in SDP
  private async waitForIceGathering(pc: RTCPeerConnection, timeoutMs = 1200): Promise<void> {
    if (pc.iceGatheringState === 'complete') return;
    return new Promise((resolve) => {
      let timeoutId: any = null;
      const checkState = () => {
        if (pc.iceGatheringState === 'complete') {
          clearTimeout(timeoutId);
          pc.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }
      };
      pc.addEventListener('icegatheringstatechange', checkState);
      timeoutId = setTimeout(() => {
        pc.removeEventListener('icegatheringstatechange', checkState);
        resolve();
      }, timeoutMs);
    });
  }

  // Initialize WebRTC PeerConnection
  private createPeerConnection(myRole?: UserRole): RTCPeerConnection {
    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch {}
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peerConnection = pc;

    // Attach local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, this.localStream!);
        } catch (err) {
          console.warn('Failed adding track to peer connection:', err);
        }
      });
    }

    // Ensure bidirectional audio & video transceivers exist
    try {
      const transceivers = pc.getTransceivers();
      if (transceivers.length === 0) {
        pc.addTransceiver('audio', { direction: 'sendrecv' });
        pc.addTransceiver('video', { direction: 'sendrecv' });
      }
    } catch {}

    // Handle remote track arrival - bulletproof handling for Chrome, Safari, Firefox
    pc.ontrack = (event) => {
      console.log('pc.ontrack event received:', event.track.kind, event.streams);

      let targetStream = this.remoteStream;
      if (!targetStream) {
        targetStream = new MediaStream();
      }

      // Add track if not already present
      if (!targetStream.getTracks().some((t) => t.id === event.track.id)) {
        targetStream.addTrack(event.track);
      }

      // Also incorporate any other tracks in event.streams[0] if provided
      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((track) => {
          if (!targetStream!.getTracks().some((t) => t.id === track.id)) {
            targetStream!.addTrack(track);
          }
        });
      }

      // Re-notify whenever track unmutes (first RTP packet arrives)
      event.track.onunmute = () => {
        console.log('Remote track unmuted:', event.track.kind);
        if (this.remoteStream) {
          this.remoteStream = new MediaStream(this.remoteStream.getTracks());
          this.status = 'connected';
          this.notify();
        }
      };

      // Always create a new MediaStream instance so React state setters detect a reference change and re-render
      this.remoteStream = new MediaStream(targetStream.getTracks());
      this.status = 'connected';
      this.notify();
    };

    // Trickle ICE candidates with light debounce to avoid 429
    let iceTimer: any = null;
    let pendingIce: RTCIceCandidateInit[] = [];

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        pendingIce.push(event.candidate.toJSON());
        clearTimeout(iceTimer);
        iceTimer = setTimeout(() => {
          if (pendingIce.length > 0) {
            const batch = [...pendingIce];
            pendingIce = [];
            batch.forEach((cand) => {
              this.sendSignal({
                signalType: 'webrtc-ice',
                candidate: cand,
              }, myRole);
            });
          }
        }, 300);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        this.status = 'connected';
        this.notify();
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.warn('WebRTC connection state:', pc.connectionState);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        this.status = 'connected';
        this.notify();
      }
    };

    return pc;
  }

  // Create & send WebRTC Offer (Caller)
  private async initiateWebRTCOffer(myRole?: UserRole) {
    if (!this.localStream) {
      await this.getLocalMedia(true, true);
    }
    const pc = this.createPeerConnection(myRole);
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      // Wait briefly so STUN candidates are embedded directly into SDP offer
      await this.waitForIceGathering(pc, 1000);

      await this.sendSignal({
        signalType: 'webrtc-offer',
        sdp: pc.localDescription || offer,
      }, myRole);
    } catch (e) {
      console.error('Failed to create WebRTC offer:', e);
    }
  }

  // Handle incoming WebRTC Offer & respond with Answer (Answerer)
  private async handleWebRTCOffer(offerSdp: RTCSessionDescriptionInit, myRole?: UserRole) {
    // Ensure Answerer has acquired camera before creating answer
    if (!this.localStream) {
      await this.getLocalMedia(true, true);
    }

    const pc = this.createPeerConnection(myRole);
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Wait briefly so STUN candidates are embedded directly into SDP answer
      await this.waitForIceGathering(pc, 1000);

      // Process any early candidates received before remote description was ready
      while (this.queuedCandidates.length > 0) {
        const cand = this.queuedCandidates.shift();
        if (cand) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch {}
        }
      }

      await this.sendSignal({
        signalType: 'webrtc-answer',
        sdp: pc.localDescription || answer,
      }, myRole);
    } catch (e) {
      console.error('Failed to handle WebRTC offer:', e);
    }
  }

  // Handle incoming WebRTC Answer (Caller)
  private async handleWebRTCAnswer(answerSdp: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerSdp));
      while (this.queuedCandidates.length > 0) {
        const cand = this.queuedCandidates.shift();
        if (cand) await this.peerConnection.addIceCandidate(new RTCIceCandidate(cand));
      }
    } catch (e) {
      console.error('Failed to set remote answer:', e);
    }
  }

  // Handle incoming ICE Candidate
  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (this.peerConnection && this.peerConnection.remoteDescription) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('Failed to add ICE candidate:', e);
      }
    } else {
      this.queuedCandidates.push(candidate);
    }
  }

  // Process incoming signal packet
  private async handleIncomingSignal(data: VideoSignalData, senderRole?: UserRole, senderName?: string) {
    switch (data.signalType) {
      case 'call-invite':
        if (this.status === 'idle') {
          this.status = 'incoming';
          this.callerRole = data.callerRole || senderRole;
          this.callerName = data.callerName || senderName || 'My Love';
          if (data.themeId) this.activeTheme = data.themeId;
          this.notify();
          romanticMusic.startRinging();
        }
        break;

      case 'call-accept':
        if (this.status === 'calling') {
          this.status = 'connected';
          romanticMusic.playConnectedChime();
          this.notify();
          // Caller now kicks off the WebRTC offer
          await this.initiateWebRTCOffer(this.callerRole);
        }
        break;

      case 'call-decline':
        if (this.status === 'calling') {
          this.endCall(false);
          alert(`${senderName || 'Your partner'} is unable to answer right now.`);
        }
        break;

      case 'call-end':
        this.endCall(false);
        break;

      case 'webrtc-offer':
        if (data.sdp) {
          await this.handleWebRTCOffer(data.sdp, senderRole);
        }
        break;

      case 'webrtc-answer':
        if (data.sdp) {
          await this.handleWebRTCAnswer(data.sdp);
        }
        break;

      case 'webrtc-ice':
        if (data.candidate) {
          await this.handleIceCandidate(data.candidate);
        }
        break;

      case 'romantic-reaction':
        if (data.emoji && typeof data.x === 'number' && typeof data.y === 'number') {
          this.reactionListeners.forEach((l) =>
            l({
              id: data.reactionId || `r_${Date.now()}_${Math.random()}`,
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

  // Switch Theme (with optional sync to partner)
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
    // Dispatch locally immediately
    this.reactionListeners.forEach((l) => l({ id: reactionId, emoji, x, y, senderRole }));
    // Broadcast to partner
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
