// Realtime Internet Sync Engine using high-availability European and global ntfy clusters with automatic failover
// Enables true cross-device, cross-network, cross-country real-time communication.

export type RealtimeEventType =
  | 'CHAT_MESSAGE'
  | 'LOVE_BUZZ'
  | 'LIVE_AFFECTION'
  | 'HEARTBEAT'
  | 'MOOD_UPDATE'
  | 'COUPON_UPDATE'
  | 'DREAM_UPDATE'
  | 'NOTE_UPDATE'
  | 'JOURNEY_UPDATE'
  | 'MEMORY_UPDATE'
  | 'WHEEL_SPIN'
  | 'QUIZ_UPDATE'
  | 'FLAMES_RUN';

export interface RealtimePayload {
  id?: string;
  clientId: string;
  type: RealtimeEventType;
  senderRole?: 'boyfriend' | 'girlfriend';
  senderName?: string;
  targetRole?: 'boyfriend' | 'girlfriend';
  targetName?: string;
  data: any;
  timestamp: number;
  isHistorical?: boolean;
}

const DEFAULT_ROOM_KEY = 'vishvesh-laura-love-nest-2026';
const ROOM_STORAGE_KEY = 'love_app_realtime_room_key_v1';
const CLIENT_STORAGE_KEY = 'love_app_client_id_v2';

// Primary and fallback high-availability servers that support CORS and worldwide access
const SERVERS = [
  'https://ntfy.tedomum.fr',
  'https://ntfy.adminforge.de',
];

let cachedClientId = '';

export function getClientId(): string {
  if (cachedClientId) return cachedClientId;
  try {
    let saved = sessionStorage.getItem(CLIENT_STORAGE_KEY);
    if (!saved) {
      saved = 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      sessionStorage.setItem(CLIENT_STORAGE_KEY, saved);
    }
    cachedClientId = saved;
    return saved;
  } catch {
    cachedClientId = 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    return cachedClientId;
  }
}

export function getRoomKey(): string {
  try {
    const saved = localStorage.getItem(ROOM_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // Ignore
  }
  return DEFAULT_ROOM_KEY;
}

export function setRoomKey(key: string): void {
  try {
    localStorage.setItem(ROOM_STORAGE_KEY, key.trim() || DEFAULT_ROOM_KEY);
  } catch {
    // Ignore
  }
}

export function getTopicName(roomKey: string): string {
  const clean = roomKey.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return `love-${clean}`;
}

export class RealtimeService {
  private eventSource: EventSource | null = null;
  private currentRoomKey: string = '';
  private currentServerIndex: number = 0;
  private listeners: ((payload: RealtimePayload) => void)[] = [];
  private statusListeners: ((isConnected: boolean) => void)[] = [];
  private presenceListeners: ((isOnline: boolean, partnerName?: string) => void)[] = [];
  private broadcastChannel: BroadcastChannel | null = null;
  private isConnected: boolean = false;
  private seenIds = new Set<string>();
  private reconnectTimer: any = null;
  private fallbackPollTimer: any = null;
  private heartbeatTimer: any = null;
  private presenceCheckTimer: any = null;
  private lastPartnerTimestamp: number = 0;
  private partnerName: string = '';
  private currentRole: 'boyfriend' | 'girlfriend' = 'boyfriend';
  private currentUserName: string = 'Vishvesh';

  constructor() {
    getClientId();
    try {
      this.broadcastChannel = new BroadcastChannel('love_cross_tab_sync');
      this.broadcastChannel.onmessage = (e) => {
        if (e.data && e.data.type) {
          this.handleIncoming(e.data);
        }
      };
    } catch {
      // Ignore
    }

    // Monitor partner presence freshness every 4 seconds
    if (typeof window !== 'undefined') {
      this.presenceCheckTimer = setInterval(() => {
        const isOnline = Date.now() - this.lastPartnerTimestamp < 35000;
        this.notifyPresence(isOnline, this.partnerName);
      }, 4000);
    }
  }

  public setUserInfo(role: 'boyfriend' | 'girlfriend', name: string) {
    this.currentRole = role;
    this.currentUserName = name;
  }

  private get activeServer(): string {
    return SERVERS[this.currentServerIndex % SERVERS.length];
  }

  public connect(roomKey: string) {
    if (this.eventSource && this.currentRoomKey === roomKey) {
      return;
    }

    this.disconnect();
    this.currentRoomKey = roomKey;
    const topic = getTopicName(roomKey);

    // Initial historical message fetch
    this.fetchRecentHistory(topic);

    // Connect SSE
    this.initEventSource(topic);

    // Fallback poll every 5 seconds for mobile network resilience
    this.fallbackPollTimer = setInterval(() => {
      this.pollRecentUpdates(topic);
    }, 5000);

    // Start sending heartbeat to signal presence
    this.startHeartbeat();
  }

  private initEventSource(topic: string) {
    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      const sseUrl = `${this.activeServer}/${topic}/sse`;
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.notifyStatus(true);
      };

      this.eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === 'message' && parsed.message) {
            const payload: RealtimePayload = JSON.parse(parsed.message);
            if (!payload.id && parsed.id) payload.id = parsed.id;
            payload.isHistorical = false;
            this.handleIncoming(payload);
          }
        } catch {
          // Ignore
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.notifyStatus(false);
        // Switch to fallback server on error
        this.currentServerIndex = (this.currentServerIndex + 1) % SERVERS.length;
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          if (this.currentRoomKey) {
            this.initEventSource(topic);
          }
        }, 2500);
      };
    } catch (e) {
      console.error('Failed to init EventSource:', e);
      this.isConnected = false;
      this.notifyStatus(false);
    }
  }

  private async fetchRecentHistory(topic: string) {
    try {
      const res = await fetch(`${this.activeServer}/${topic}/json?poll=1&since=all`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.event === 'message' && parsed.message) {
              const payload: RealtimePayload = JSON.parse(parsed.message);
              if (!payload.id && parsed.id) payload.id = parsed.id;
              
              if (payload.id) this.seenIds.add(payload.id);

              // ONLY dispatch historical CHAT_MESSAGE, NOT LIVE_AFFECTION
              if (payload.type === 'CHAT_MESSAGE') {
                payload.isHistorical = true;
                this.notifyListeners(payload);
              }
            }
          } catch {
            // Ignore
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  private async pollRecentUpdates(topic: string) {
    try {
      const res = await fetch(`${this.activeServer}/${topic}/json?poll=1&since=30s`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.event === 'message' && parsed.message) {
              const payload: RealtimePayload = JSON.parse(parsed.message);
              if (!payload.id && parsed.id) payload.id = parsed.id;
              payload.isHistorical = false;
              this.handleIncoming(payload);
            }
          } catch {
            // Ignore
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  private startHeartbeat() {
    clearInterval(this.heartbeatTimer);
    this.sendHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, 15000);
  }

  private sendHeartbeat() {
    this.publish({
      type: 'HEARTBEAT',
      clientId: getClientId(),
      senderRole: this.currentRole,
      senderName: this.currentUserName,
      data: { role: this.currentRole, name: this.currentUserName },
      timestamp: Date.now(),
    });
  }

  private handleIncoming(payload: RealtimePayload) {
    if (!payload || !payload.type) return;

    // Echo suppression: Ignore anything sent by this exact client/tab
    if (payload.clientId && payload.clientId === getClientId()) {
      return;
    }

    // Deduplicate by message ID
    if (payload.id) {
      if (this.seenIds.has(payload.id)) return;
      this.seenIds.add(payload.id);
      if (this.seenIds.size > 2000) {
        const it = this.seenIds.values();
        for (let i = 0; i < 500; i++) {
          const val = it.next().value;
          if (val) this.seenIds.delete(val);
        }
      }
    }

    // Handle heartbeat presence
    if (payload.type === 'HEARTBEAT') {
      this.lastPartnerTimestamp = Date.now();
      if (payload.senderName) this.partnerName = payload.senderName;
      this.notifyPresence(true, this.partnerName);
    }

    this.notifyListeners(payload);
  }

  public async publish(payload: Omit<RealtimePayload, 'clientId'> & { clientId?: string }): Promise<boolean> {
    const fullPayload: RealtimePayload = {
      ...payload,
      id: payload.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      clientId: payload.clientId || getClientId(),
      timestamp: payload.timestamp || Date.now(),
    };

    if (fullPayload.id) {
      this.seenIds.add(fullPayload.id);
    }

    // Broadcast locally to any other open tabs on this device
    try {
      this.broadcastChannel?.postMessage(fullPayload);
    } catch {
      // Ignore
    }

    const topic = getTopicName(this.currentRoomKey || getRoomKey());
    const bodyStr = JSON.stringify(fullPayload);

    // Broadcast to ALL servers simultaneously so that partner receives it on whichever server they are connected to!
    const results = await Promise.allSettled(
      SERVERS.map((server) =>
        fetch(`${server}/${topic}`, {
          method: 'POST',
          body: bodyStr,
        })
      )
    );

    return results.some((r) => r.status === 'fulfilled' && (r.value as Response).ok);
  }

  public subscribe(callback: (payload: RealtimePayload) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public onConnectionChange(callback: (isConnected: boolean) => void) {
    this.statusListeners.push(callback);
    callback(this.isConnected);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== callback);
    };
  }

  public onPartnerPresenceChange(callback: (isOnline: boolean, partnerName?: string) => void) {
    this.presenceListeners.push(callback);
    const isOnline = Date.now() - this.lastPartnerTimestamp < 35000;
    callback(isOnline, this.partnerName);
    return () => {
      this.presenceListeners = this.presenceListeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners(payload: RealtimePayload) {
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('Listener error:', err);
      }
    });
  }

  private notifyStatus(connected: boolean) {
    this.statusListeners.forEach((listener) => {
      try {
        listener(connected);
      } catch {
        // Ignore
      }
    });
  }

  private notifyPresence(isOnline: boolean, name?: string) {
    this.presenceListeners.forEach((listener) => {
      try {
        listener(isOnline, name);
      } catch {
        // Ignore
      }
    });
  }

  public disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    clearTimeout(this.reconnectTimer);
    clearInterval(this.fallbackPollTimer);
    clearInterval(this.heartbeatTimer);
    this.isConnected = false;
    this.notifyStatus(false);
  }
}

export const realtimeHub = new RealtimeService();
