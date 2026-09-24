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
  | 'FLAMES_RUN'
  | 'PHOTO_UPDATE'
  | 'VIDEO_CALL_SIGNAL';

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

// Primary authoritative realtime server that supports CORS, SSE, and worldwide access
const NTFY_SERVER = 'https://ntfy.adminforge.de';

const MEDIA_SERVERS = [
  'https://ntfy.envs.net',
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

    // Monitor partner presence freshness every 3 seconds
    if (typeof window !== 'undefined') {
      this.presenceCheckTimer = setInterval(() => {
        const isOnline = Date.now() - this.lastPartnerTimestamp < 26000;
        this.notifyPresence(isOnline, this.partnerName);
      }, 3000);

      window.addEventListener('focus', () => this.sendHeartbeat());
      window.addEventListener('online', () => this.sendHeartbeat());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.sendHeartbeat();
        }
      });
    }
  }

  public setUserInfo(role: 'boyfriend' | 'girlfriend', name: string) {
    this.currentRole = role;
    this.currentUserName = name;
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

    // Fallback poll every 4 seconds for mobile network resilience
    this.fallbackPollTimer = setInterval(() => {
      this.pollRecentUpdates(topic);
    }, 4000);

    // Start sending heartbeat to signal presence
    this.startHeartbeat();
  }

  private initEventSource(topic: string) {
    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      const sseUrl = `${NTFY_SERVER}/${topic}/sse`;
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.notifyStatus(true);
      };

      this.eventSource.onmessage = async (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === 'message') {
            const payload = await this.parseMessageOrAttachment(parsed);
            if (payload) {
              payload.isHistorical = false;
              this.handleIncoming(payload);
            }
          }
        } catch {
          // Ignore
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.notifyStatus(false);
        // Reconnect to the same authoritative server
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          if (this.currentRoomKey) {
            this.initEventSource(topic);
          }
        }, 2000);
      };
    } catch (e) {
      console.error('Failed to init EventSource:', e);
      this.isConnected = false;
      this.notifyStatus(false);
    }
  }

  private async parseMessageOrAttachment(parsed: any): Promise<RealtimePayload | null> {
    if (parsed.message) {
      try {
        const payload: RealtimePayload = JSON.parse(parsed.message);
        if (!payload.id && parsed.id) payload.id = parsed.id;
        return payload;
      } catch {
        // message might not be direct JSON if ntfy formatted it as attachment notice
      }
    }
    if (parsed.attachment && parsed.attachment.url) {
      try {
        const res = await fetch(parsed.attachment.url);
        if (res.ok) {
          const text = await res.text();
          const payload: RealtimePayload = JSON.parse(text);
          if (!payload.id && parsed.id) payload.id = parsed.id;
          return payload;
        }
      } catch {
        // Ignore
      }
    }
    return null;
  }

  private async fetchRecentHistory(topic: string) {
    try {
      const res = await fetch(`${NTFY_SERVER}/${topic}/json?poll=1&since=all`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.event === 'message') {
              const payload = await this.parseMessageOrAttachment(parsed);
              if (!payload) continue;
              
              if (payload.id) this.seenIds.add(payload.id);

              // Check if partner was active recently in historical messages (immediate presence on load)
              const msgTime = payload.timestamp || (parsed.time ? parsed.time * 1000 : 0);
              if (
                msgTime &&
                Date.now() - msgTime < 26000 &&
                payload.clientId !== getClientId() &&
                payload.senderRole !== this.currentRole
              ) {
                this.lastPartnerTimestamp = Math.max(this.lastPartnerTimestamp, msgTime);
                if (payload.senderName) this.partnerName = payload.senderName;
                this.notifyPresence(true, this.partnerName);
              }

              // Dispatch historical state (Chat, Dreams, Notes, Milestones, Coupons, Memories)
              if (
                payload.type === 'CHAT_MESSAGE' ||
                payload.type === 'DREAM_UPDATE' ||
                payload.type === 'NOTE_UPDATE' ||
                payload.type === 'JOURNEY_UPDATE' ||
                payload.type === 'COUPON_UPDATE' ||
                payload.type === 'MEMORY_UPDATE' ||
                payload.type === 'PHOTO_UPDATE'
              ) {
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
      const res = await fetch(`${NTFY_SERVER}/${topic}/json?poll=1&since=10s`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.event === 'message') {
              const payload = await this.parseMessageOrAttachment(parsed);
              if (payload) {
                payload.isHistorical = false;
                this.handleIncoming(payload);
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

  private startHeartbeat() {
    clearInterval(this.heartbeatTimer);
    this.sendHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, 8000);
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

    // Any event received from partner proves partner is actively online right now!
    this.lastPartnerTimestamp = Date.now();
    if (payload.senderName) this.partnerName = payload.senderName;
    this.notifyPresence(true, this.partnerName);

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

    // Publish to the authoritative NTFY server with automatic retry on transient mobile errors
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(`${NTFY_SERVER}/${topic}`, {
          method: 'POST',
          body: bodyStr,
          keepalive: true,
        });
        if (res.ok) return true;
      } catch {
        if (attempt === 0) await new Promise((r) => setTimeout(r, 200));
      }
    }

    return false;
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
    const isOnline = Date.now() - this.lastPartnerTimestamp < 26000;
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

  public async sendPhoto(role: 'boyfriend' | 'girlfriend', photoDataUrl: string): Promise<void> {
    if (!photoDataUrl || photoDataUrl.length < 50) return;

    // 1. Upload to persistent media topic with direct file URL
    const room = this.currentRoomKey || getRoomKey();
    const mediaTopic = `${getTopicName(room)}-media-v2`;
    let fileUrl = '';

    for (const server of MEDIA_SERVERS) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);
      try {
        const res = await fetch(`${server}/${mediaTopic}`, {
          method: 'PUT',
          headers: {
            Filename: `${role}_avatar.txt`,
            Title: `${role}_avatar`,
          },
          body: photoDataUrl,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const json = await res.json();
          if (json?.attachment?.url) {
            fileUrl = json.attachment.url;
            break;
          }
        }
      } catch (e) {
        clearTimeout(timeoutId);
        console.warn(`Media upload fallback on ${server}:`, e);
      }
    }

    if (fileUrl) {
      await this.publish({
        type: 'PHOTO_UPDATE',
        clientId: getClientId(),
        senderRole: this.currentRole,
        senderName: this.currentUserName,
        data: {
          role,
          photoUrl: fileUrl,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      });
      return;
    }

    // 2. Direct embedded photo if payload fits within single message
    if (photoDataUrl.length <= 3400) {
      await this.publish({
        type: 'PHOTO_UPDATE',
        clientId: getClientId(),
        senderRole: this.currentRole,
        senderName: this.currentUserName,
        data: {
          role,
          photo: photoDataUrl,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      });
      return;
    }

    // 3. Fallback: chunked delivery with gentle rate limiting
    const CHUNK_SIZE = 3000;
    const total = Math.ceil(photoDataUrl.length / CHUNK_SIZE);
    const photoId = `photo_${role}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    for (let index = 0; index < total; index++) {
      const chunk = photoDataUrl.substring(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE);
      await this.publish({
        type: 'PHOTO_UPDATE',
        clientId: getClientId(),
        senderRole: this.currentRole,
        senderName: this.currentUserName,
        data: {
          role,
          photoId,
          index,
          total,
          chunk,
        },
        timestamp: Date.now(),
      });
      if (index < total - 1) {
        await new Promise((r) => setTimeout(r, 450));
      }
    }
  }

  public async fetchLatestStoredPhotos(): Promise<{ boyfriendPhoto?: string; girlfriendPhoto?: string }> {
    const room = this.currentRoomKey || getRoomKey();
    const mediaTopic = `${getTopicName(room)}-media-v2`;
    const result: { boyfriendPhoto?: string; girlfriendPhoto?: string } = {};

    for (const server of MEDIA_SERVERS) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      try {
        const res = await fetch(`${server}/${mediaTopic}/json?poll=1`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) continue;
        const text = await res.text();
        const lines = text.trim().split('\n');

        // Process in reverse to get the newest uploaded photo for each role
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (!line) continue;
          try {
            const parsed = JSON.parse(line);
            const title = parsed.title || '';
            const url = parsed.attachment?.url;
            if (url) {
              if (title.includes('boyfriend') && !result.boyfriendPhoto) {
                const fileController = new AbortController();
                const fileTimeout = setTimeout(() => fileController.abort(), 6000);
                const fileRes = await fetch(url, { signal: fileController.signal });
                clearTimeout(fileTimeout);
                if (fileRes.ok) {
                  const photoStr = await fileRes.text();
                  if (photoStr.startsWith('data:image/')) {
                    result.boyfriendPhoto = photoStr;
                  }
                }
              } else if (title.includes('girlfriend') && !result.girlfriendPhoto) {
                const fileController = new AbortController();
                const fileTimeout = setTimeout(() => fileController.abort(), 6000);
                const fileRes = await fetch(url, { signal: fileController.signal });
                clearTimeout(fileTimeout);
                if (fileRes.ok) {
                  const photoStr = await fileRes.text();
                  if (photoStr.startsWith('data:image/')) {
                    result.girlfriendPhoto = photoStr;
                  }
                }
              }
            }
            if (result.boyfriendPhoto && result.girlfriendPhoto) break;
          } catch {
            // Ignore parse errors on individual lines
          }
        }
        if (result.boyfriendPhoto || result.girlfriendPhoto) break;
      } catch (e) {
        clearTimeout(timeoutId);
        console.warn(`Failed to poll stored photos from ${server}:`, e);
      }
    }

    return result;
  }
}

export const realtimeHub = new RealtimeService();
