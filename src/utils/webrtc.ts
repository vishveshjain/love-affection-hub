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
    | 'webrtc-offer-chunk'
    | 'webrtc-answer-chunk'
    | 'webrtc-ice'
    | 'webrtc-ice-batch'
    | 'romantic-reaction'
    | 'touch-heart'
    | 'theme-sync';
  callerRole?: UserRole;
  callerName?: string;
  answererRole?: UserRole;
  sdp?: RTCSessionDescriptionInit;
  compressedSdp?: string;
  transmissionId?: string;
  chunkIndex?: number;
  totalChunks?: number;
  chunkData?: string;
  candidate?: RTCIceCandidateInit;
  candidates?: RTCIceCandidateInit[];
  emoji?: string;
  reactionId?: string;
  x?: number;
  y?: number;
  touchActive?: boolean;
  themeId?: RomanticThemeId;
  filterId?: RomanticFilterId;
  reason?: string;
  callId?: string;
  sentAt?: number;
}

// Compress text with built-in browser deflate-raw to fit large SDP into a single message
async function compressString(str: string): Promise<string> {
  if (typeof CompressionStream !== 'undefined') {
    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    writer.write(new TextEncoder().encode(str));
    writer.close();
    const compressedBuf = await new Response(cs.readable).arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(compressedBuf);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  return '';
}

// Decompress base64 deflate-raw payload back to full SDP string
async function decompressString(b64: string): Promise<string> {
  if (typeof DecompressionStream !== 'undefined') {
    const binStr = atob(b64);
    const u8 = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) u8[i] = binStr.charCodeAt(i);
    const ds = new DecompressionStream('deflate-raw');
    const dWriter = ds.writable.getWriter();
    dWriter.write(u8);
    dWriter.close();
    return await new Response(ds.readable).text();
  }
  return '';
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:openrelay.metered.ca:80' },
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp',
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
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
  private sdpChunkBuffers = new Map<
    string,
    { chunks: (string | undefined)[]; total: number; timer: any; senderRole?: UserRole }
  >();
  private mediaPromise: Promise<MediaStream | null> | null = null;
  private offerRetryTimer: any = null;
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
    const role = senderRole || this.myRole;
    const signalDataWithMeta: VideoSignalData = {
      ...data,
      callId: data.callId || this.currentCallId || undefined,
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

  // Safely attach local tracks to active RTCPeerConnection
  private attachLocalStreamToPc(pc: RTCPeerConnection | null) {
    if (!pc || !this.localStream) return;
    try {
      const senders = pc.getSenders();
      this.localStream.getTracks().forEach((track) => {
        const existingSender = senders.find((s) => s.track?.kind === track.kind);
        if (existingSender) {
          existingSender.replaceTrack(track).catch(() => {});
        } else {
          try {
            pc.addTrack(track, this.localStream!);
          } catch (err) {
            console.warn('addTrack failed, continuing:', err);
          }
        }
      });
    } catch (e) {
      console.warn('attachLocalStreamToPc caught error:', e);
    }
  }

  // Request user camera and microphone (deduplicated & tuned for mobile front camera + clear voice)
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
        this.attachLocalStreamToPc(this.peerConnection);
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
          this.attachLocalStreamToPc(this.peerConnection);
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

  // Start outgoing video call to partner (sends call invitation immediately with 0ms delay and re-broadcasts)
  public async startCall(myRole: UserRole, myName: string, theme: RomanticThemeId = 'moonlight'): Promise<boolean> {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.currentCallId = callId;
    this.myRole = myRole;
    this.status = 'calling';
    this.callerRole = myRole;
    this.callerName = myName;
    this.activeTheme = theme;
    this.notify();

    // Start soft romantic ambience during calling
    romanticMusic.startRomanticAmbience(0.2);

    // 1. Broadcast call invitation to partner IMMEDIATELY (0ms delay for instant ringing)
    const sendInvite = () => {
      this.sendSignal(
        {
          signalType: 'call-invite',
          callId,
          callerRole: myRole,
          callerName: myName,
          themeId: theme,
        },
        myRole,
        myName
      ).catch(() => {});
    };
    sendInvite();

    // 2. Clear any prior invite loop and re-broadcast every 2.5s while in 'calling' state (up to 15 attempts = 37.5s)
    clearInterval(this.callInviteTimer);
    let inviteAttempts = 0;
    this.callInviteTimer = setInterval(() => {
      inviteAttempts++;
      if (this.status !== 'calling' || this.currentCallId !== callId || inviteAttempts > 15) {
        clearInterval(this.callInviteTimer);
        this.callInviteTimer = null;
        return;
      }
      console.log(`Re-broadcasting call-invite (attempt ${inviteAttempts + 1})...`);
      sendInvite();
    }, 2500);

    // 3. Pre-acquire local camera & mic in background while phone is ringing
    this.getLocalMedia(true, true).catch((err) => {
      console.warn('Caller background getLocalMedia:', err);
    });

    return true;
  }

  // Accept incoming call from partner (sends accept signal with awaited reliable dispatch)
  public async acceptCall(myRole: UserRole, myName: string) {
    romanticMusic.stopRinging();
    romanticMusic.playConnectedChime();
    romanticMusic.startRomanticAmbience(0.18);

    this.myRole = myRole;
    this.status = 'connected';
    this.notify();

    const acceptPayload: VideoSignalData = {
      signalType: 'call-accept',
      callId: this.currentCallId || undefined,
      answererRole: myRole,
    };

    // Dispatch accept signal with await + keepalive so Android Chrome can't abort it during component unmount.
    // If this single packet is lost, the caller's call-invite retry loop will trigger the auto-healing echo
    // (answerer re-sends call-accept when receiving a repeated call-invite while already connected).
    try {
      await this.sendSignal(acceptPayload, myRole, myName);
    } catch (e) {
      console.warn('acceptCall send error:', e);
    }

    // Acquire camera & mic in parallel so answerer is ready when offer arrives
    this.getLocalMedia(true, true).catch((err) => {
      console.warn('Answerer background getLocalMedia:', err);
    });
  }

  // Decline incoming call
  public async declineCall(myRole: UserRole) {
    clearInterval(this.callInviteTimer);
    this.callInviteTimer = null;
    romanticMusic.stopRinging();
    const decliningCallId = this.currentCallId;
    this.status = 'idle';
    this.currentCallId = null;
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

  // End call
  public async endCall(notifyRemote: boolean = true) {
    clearInterval(this.callInviteTimer);
    this.callInviteTimer = null;
    clearTimeout(this.offerRetryTimer);
    this.offerRetryTimer = null;
    romanticMusic.stopRinging();
    romanticMusic.stopRomanticAmbience();
    romanticMusic.playHangupChime();

    const endingCallId = this.currentCallId;
    this.currentCallId = null;
    this.mediaPromise = null;
    this.sdpChunkBuffers.clear();

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
      // Send call-end signal to partner reliably with endingCallId
      await this.sendSignal({ signalType: 'call-end', callId: endingCallId || undefined }, this.myRole);
      // Repeat after 150ms to ensure delivery over mobile networks
      setTimeout(() => {
        this.sendSignal({ signalType: 'call-end', callId: endingCallId || undefined }, this.myRole).catch(() => {});
      }, 150);
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
  private createPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch {}
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peerConnection = pc;

    // Attach local stream tracks immediately if already acquired
    this.attachLocalStreamToPc(pc);

    // Ensure bidirectional audio & video transceivers exist
    try {
      const transceivers = pc.getTransceivers();
      if (!transceivers.some((t) => t.receiver.track.kind === 'audio')) {
        pc.addTransceiver('audio', { direction: 'sendrecv' });
      }
      if (!transceivers.some((t) => t.receiver.track.kind === 'video')) {
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

    // Trickle ICE candidates with leading-edge batching window (flush every 80ms)
    let iceTimer: any = null;
    let pendingIce: RTCIceCandidateInit[] = [];

    const flushIce = () => {
      iceTimer = null;
      if (pendingIce.length > 0) {
        const batch = [...pendingIce];
        pendingIce = [];
        this.sendSignal(
          {
            signalType: 'webrtc-ice-batch',
            callId: this.currentCallId || undefined,
            candidates: batch,
          },
          this.myRole
        );
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        pendingIce.push(event.candidate.toJSON());
        if (!iceTimer) {
          iceTimer = setTimeout(flushIce, 80);
        }
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('WebRTC connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        this.status = 'connected';
        this.notify();
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.warn('WebRTC connection state:', pc.connectionState);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('WebRTC ice connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        this.status = 'connected';
        this.notify();
      }
    };

    return pc;
  }

  // Send SDP Offer or Answer using single-message deflate-raw compression with chunked fallback
  private async sendSdpSignal(
    type: 'webrtc-offer' | 'webrtc-answer',
    sdp: RTCSessionDescriptionInit,
    senderRole?: UserRole
  ) {
    const role = senderRole || this.myRole;
    const rawSdp = sdp.sdp || '';
    const serialized = JSON.stringify({ type: sdp.type, sdp: rawSdp });

    // Primary: Compress large SDP into single ~2.5KB base64 string to bypass ntfy limits & token-bucket rate limits
    try {
      const compressed = await compressString(serialized);
      if (compressed && compressed.length < 3800) {
        console.log(`Sending compressed single-message ${type} (${compressed.length} bytes base64)`);
        await this.sendSignal(
          {
            signalType: type,
            callId: this.currentCallId || undefined,
            compressedSdp: compressed,
          },
          role
        );
        return;
      }
    } catch (e) {
      console.warn('SDP compression failed, attempting chunked fallback:', e);
    }

    // Secondary fallback: sub-1KB chunked delivery
    await this.sendSdpInChunks(type, sdp, role);
  }

  // Transmit large SDP payloads across ntfy safely in sub-1KB chunks (fallback)
  private async sendSdpInChunks(
    type: 'webrtc-offer' | 'webrtc-answer',
    sdp: RTCSessionDescriptionInit,
    senderRole?: UserRole
  ) {
    const rawSdp = sdp.sdp || '';
    const serialized = JSON.stringify({ type: sdp.type, sdp: rawSdp });
    const CHUNK_SIZE = 900;
    const totalChunks = Math.ceil(serialized.length / CHUNK_SIZE);
    const transmissionId = `sdp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const chunkSignalType = type === 'webrtc-offer' ? 'webrtc-offer-chunk' : 'webrtc-answer-chunk';

    for (let i = 0; i < totalChunks; i++) {
      const chunkData = serialized.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      await this.sendSignal(
        {
          signalType: chunkSignalType,
          callId: this.currentCallId || undefined,
          transmissionId,
          chunkIndex: i,
          totalChunks,
          chunkData,
        },
        senderRole
      );
      if (totalChunks > 1) {
        await new Promise((r) => setTimeout(r, 40));
      }
    }
  }

  // Reassemble received SDP chunks and process when complete
  private handleSdpChunk(
    isOffer: boolean,
    transmissionId: string,
    chunkIndex: number,
    totalChunks: number,
    chunkData: string,
    senderRole?: UserRole
  ) {
    let entry = this.sdpChunkBuffers.get(transmissionId);
    if (!entry) {
      entry = {
        chunks: new Array(totalChunks),
        total: totalChunks,
        timer: setTimeout(() => {
          this.sdpChunkBuffers.delete(transmissionId);
        }, 15000),
        senderRole,
      };
      this.sdpChunkBuffers.set(transmissionId, entry);
    }

    entry.chunks[chunkIndex] = chunkData;

    // Check if all chunks have arrived
    const receivedCount = entry.chunks.filter((c) => c !== undefined).length;
    if (receivedCount === entry.total) {
      clearTimeout(entry.timer);
      this.sdpChunkBuffers.delete(transmissionId);
      const fullSdpString = entry.chunks.join('');
      try {
        const sdp = JSON.parse(fullSdpString) as RTCSessionDescriptionInit;
        if (isOffer) {
          this.handleWebRTCOffer(sdp, entry.senderRole || senderRole);
        } else {
          this.handleWebRTCAnswer(sdp);
        }
      } catch (err) {
        console.error('Failed to parse reassembled SDP:', err);
      }
    }
  }

  // Create & send WebRTC Offer (Caller)
  private async initiateWebRTCOffer(myRole?: UserRole) {
    clearTimeout(this.offerRetryTimer);

    // If a PeerConnection already exists with a pending or active offer, don't destroy it.
    // Just re-send the existing offer. This prevents the race where duplicate call-accept
    // signals cause repeated PC destruction.
    if (
      this.peerConnection &&
      this.peerConnection.localDescription &&
      (this.peerConnection.signalingState === 'have-local-offer' || this.peerConnection.signalingState === 'stable') &&
      this.peerConnection.connectionState !== 'failed' &&
      this.peerConnection.connectionState !== 'closed'
    ) {
      console.log('PC already has a local offer/stable state, re-sending existing offer instead of recreating');
      await this.sendSdpSignal('webrtc-offer', this.peerConnection.localDescription, this.myRole || myRole);
      return;
    }

    if (!this.localStream) {
      await this.getLocalMedia(true, true);
    }
    const pc = this.createPeerConnection();
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      // Wait briefly so initial STUN/TURN candidates are embedded directly into SDP offer
      await this.waitForIceGathering(pc, 900);

      const finalOffer = pc.localDescription || offer;
      await this.sendSdpSignal('webrtc-offer', finalOffer, this.myRole || myRole);

      // Resilience against mobile packet drop: retry sending offer every 2.5s if no answer has arrived yet (up to 4 attempts)
      let offerAttempts = 0;
      const retryOffer = () => {
        if (this.peerConnection === pc && !pc.remoteDescription && this.status === 'connected' && offerAttempts < 4) {
          offerAttempts++;
          console.log(`Re-transmitting WebRTC offer to partner (attempt ${offerAttempts})...`);
          this.sendSdpSignal('webrtc-offer', finalOffer, this.myRole || myRole).catch(() => {});
          this.offerRetryTimer = setTimeout(retryOffer, 2500);
        }
      };
      this.offerRetryTimer = setTimeout(retryOffer, 2500);
    } catch (e) {
      console.error('Failed to create WebRTC offer:', e);
    }
  }

  // Handle incoming WebRTC Offer & respond with Answer (Answerer)
  private async handleWebRTCOffer(offerSdp: RTCSessionDescriptionInit, senderRole?: UserRole) {
    clearTimeout(this.offerRetryTimer);

    // If we already have a live, working peer connection with both descriptions set
    // AND the connection isn't dead, just re-send the existing answer instead of destroying it.
    if (
      this.peerConnection &&
      this.peerConnection.localDescription &&
      this.peerConnection.remoteDescription &&
      this.peerConnection.connectionState !== 'failed' &&
      this.peerConnection.connectionState !== 'closed'
    ) {
      console.log('Active PC already has answer, re-sending existing answer to caller');
      await this.sendSdpSignal('webrtc-answer', this.peerConnection.localDescription, this.myRole);
      return;
    }

    // Ensure Answerer has acquired camera & mic before creating answer
    if (!this.localStream) {
      await this.getLocalMedia(true, true);
    }

    const pc = this.createPeerConnection();
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Wait briefly so initial STUN/TURN candidates are embedded directly into SDP answer
      await this.waitForIceGathering(pc, 900);

      // Process any early candidates received before remote description was ready
      while (this.queuedCandidates.length > 0) {
        const cand = this.queuedCandidates.shift();
        if (cand) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch {}
        }
      }

      const finalAnswer = pc.localDescription || answer;
      await this.sendSdpSignal('webrtc-answer', finalAnswer, this.myRole);

      // Re-send answer after 300ms as a confirmation packet for mobile packet loss
      setTimeout(() => {
        if (this.peerConnection === pc && pc.localDescription) {
          this.sendSdpSignal('webrtc-answer', pc.localDescription, this.myRole).catch(() => {});
        }
      }, 300);
    } catch (e) {
      console.error('Failed to handle WebRTC offer:', e);
    }
  }

  // Handle incoming WebRTC Answer (Caller)
  private async handleWebRTCAnswer(answerSdp: RTCSessionDescriptionInit) {
    clearTimeout(this.offerRetryTimer);
    if (!this.peerConnection) return;
    try {
      const state = this.peerConnection.signalingState;
      if (state === 'have-local-offer') {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerSdp));
        console.log('WebRTC answer accepted, remote description set successfully');
        while (this.queuedCandidates.length > 0) {
          const cand = this.queuedCandidates.shift();
          if (cand) await this.peerConnection.addIceCandidate(new RTCIceCandidate(cand));
        }
      } else if (state === 'stable') {
        // Duplicate answer for an already-established session, just drain any queued candidates
        console.log('Ignoring duplicate WebRTC answer (already stable)');
        while (this.queuedCandidates.length > 0) {
          const cand = this.queuedCandidates.shift();
          if (cand) {
            try { await this.peerConnection.addIceCandidate(new RTCIceCandidate(cand)); } catch {}
          }
        }
      } else {
        console.warn('Received WebRTC answer in unexpected signalingState:', state);
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
    if (!data || !data.signalType) return;

    // 1. Stale packet rejection: Ignore any packet older than 15 seconds (prevents ntfy cache replay interference)
    const now = Date.now();
    if (data.sentAt && now - data.sentAt > 15000) {
      console.log('Ignoring stale video signal older than 15s:', data.signalType);
      return;
    }

    // 2. Call Termination: If partner ended the call, immediately tear down without requiring session match
    if (data.signalType === 'call-end') {
      if (this.status !== 'idle') {
        console.log('Received call-end signal, ending call');
        this.endCall(false);
      }
      return;
    }

    // 3. Call Invitation & Glare Resolution:
    if (data.signalType === 'call-invite') {
      // Auto-healing: Answerer already accepted and connected, but caller is still calling because they haven't received call-accept yet!
      if (this.status === 'connected' && data.callId && data.callId === this.currentCallId) {
        console.log('Received repeated call-invite for active call; echoing call-accept to heal caller state');
        this.sendSignal({
          signalType: 'call-accept',
          callId: this.currentCallId,
          answererRole: this.myRole,
        }, this.myRole, this.callerName).catch(() => {});
        return;
      }
      if (this.status === 'incoming' && data.callId === this.currentCallId) {
        // Already ringing for this call; keep ringing
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
        // Warm up user media in background while ringing so answering is instantaneous
        this.getLocalMedia(true, true).catch(() => {});
      } else if (this.status === 'calling' && data.callId && data.callId !== this.currentCallId) {
        // Glare resolution: both partners tapped "Call" at the exact same moment
        // Boyfriend caller takes precedence so both connect cleanly to the same call
        if (senderRole === 'boyfriend') {
          console.log('Resolving call glare: adopting boyfriend call invite');
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

    // For in-call signals, ignore if they belong to a different or previous call session
    if (this.currentCallId && data.callId && data.callId !== this.currentCallId) {
      console.log(`Ignoring signal for mismatched call session ${data.callId} (active: ${this.currentCallId})`);
      return;
    }

    switch (data.signalType) {
      case 'call-accept':
        clearInterval(this.callInviteTimer);
        this.callInviteTimer = null;
        if (this.status === 'calling') {
          this.status = 'connected';
          romanticMusic.playConnectedChime();
          this.notify();
          // Caller creates exactly ONE PeerConnection and kicks off the WebRTC offer.
          // The offer retry loop handles delivery reliability from here.
          await this.initiateWebRTCOffer(this.callerRole || this.myRole);
        }
        // If already connected, silently ignore duplicate call-accept signals.
        // Re-initiating the offer would destroy the active PeerConnection.
        break;

      case 'call-decline':
        if (this.status === 'calling') {
          this.endCall(false);
          alert(`${senderName || 'Your partner'} is unable to answer right now.`);
        }
        break;

      case 'webrtc-offer-chunk':
        if (
          data.transmissionId &&
          typeof data.chunkIndex === 'number' &&
          typeof data.totalChunks === 'number' &&
          data.chunkData
        ) {
          this.handleSdpChunk(
            true,
            data.transmissionId,
            data.chunkIndex,
            data.totalChunks,
            data.chunkData,
            senderRole
          );
        }
        break;

      case 'webrtc-answer-chunk':
        if (
          data.transmissionId &&
          typeof data.chunkIndex === 'number' &&
          typeof data.totalChunks === 'number' &&
          data.chunkData
        ) {
          this.handleSdpChunk(
            false,
            data.transmissionId,
            data.chunkIndex,
            data.totalChunks,
            data.chunkData,
            senderRole
          );
        }
        break;

      case 'webrtc-offer':
        if (data.compressedSdp) {
          try {
            const decompressed = await decompressString(data.compressedSdp);
            const parsed = JSON.parse(decompressed) as RTCSessionDescriptionInit;
            await this.handleWebRTCOffer(parsed, senderRole);
          } catch (err) {
            console.error('Failed to decompress or parse WebRTC offer:', err);
          }
        } else if (data.sdp) {
          await this.handleWebRTCOffer(data.sdp, senderRole);
        }
        break;

      case 'webrtc-answer':
        if (data.compressedSdp) {
          try {
            const decompressed = await decompressString(data.compressedSdp);
            const parsed = JSON.parse(decompressed) as RTCSessionDescriptionInit;
            await this.handleWebRTCAnswer(parsed);
          } catch (err) {
            console.error('Failed to decompress or parse WebRTC answer:', err);
          }
        } else if (data.sdp) {
          await this.handleWebRTCAnswer(data.sdp);
        }
        break;

      case 'webrtc-ice':
        if (data.candidate) {
          await this.handleIceCandidate(data.candidate);
        }
        break;

      case 'webrtc-ice-batch':
        if (data.candidates && Array.isArray(data.candidates)) {
          data.candidates.forEach((c) => this.handleIceCandidate(c));
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
