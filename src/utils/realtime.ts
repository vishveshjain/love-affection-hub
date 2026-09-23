// Realtime Internet Sync Engine using ntfy.sh pub/sub over SSE (Server-Sent Events) and CORS POST
// Enables true cross-device, cross-network, cross-country real-time communication without requiring private servers.

export type RealtimeEventType = 'CHAT_MESSAGE' | 'LOVE_BUZZ' | 'LIVE_AFFECTION' | 'HEARTBEAT';

export interface RealtimePayload {
  type: RealtimeEventType;
  senderRole: 'boyfriend' | 'girlfriend';
  senderName: string;
  data: any;
  timestamp: number;
}

const DEFAULT_ROOM_KEY = 'vishvesh-laura-love-nest-2026';
const ROOM_STORAGE_KEY = 'love_app_realtime_room_key_v1';

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
  // Sanitize for ntfy topic naming: letters, numbers, hyphens
  const clean = roomKey.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return `love-${clean}`;
}

export class RealtimeService {
  private eventSource: EventSource | null = null;
  private currentRoomKey: string = '';
  private listeners: ((payload: RealtimePayload) => void)[] = [];
  private statusListeners: ((isConnected: boolean) => void)[] = [];
  private broadcastChannel: BroadcastChannel | null = null;
  private isConnected: boolean = false;

  constructor() {
    try {
      this.broadcastChannel = new BroadcastChannel('love_cross_tab_sync');
      this.broadcastChannel.onmessage = (e) => {
        if (e.data && e.data.type) {
          this.notifyListeners(e.data);
        }
      };
    } catch {
      // Ignore
    }
  }

  public connect(roomKey: string) {
    if (this.eventSource && this.currentRoomKey === roomKey) {
      return;
    }

    this.disconnect();
    this.currentRoomKey = roomKey;
    const topic = getTopicName(roomKey);

    // Initial historical message fetch (last 12 hours) from ntfy cache
    this.fetchRecentHistory(topic);

    // Open real-time SSE stream across the internet
    try {
      const sseUrl = `https://ntfy.sh/${topic}/sse`;
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
            this.notifyListeners(payload);
          }
        } catch {
          // Ignore non-json or ping messages
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.notifyStatus(false);
      };
    } catch (e) {
      console.error('Failed to connect EventSource:', e);
      this.isConnected = false;
      this.notifyStatus(false);
    }
  }

  private async fetchRecentHistory(topic: string) {
    try {
      const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=all`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.event === 'message' && parsed.message) {
              const payload: RealtimePayload = JSON.parse(parsed.message);
              this.notifyListeners(payload);
            }
          } catch {
            // Ignore
          }
        }
      }
    } catch {
      // Ignore network errors on history fetch
    }
  }

  public async publish(payload: RealtimePayload): Promise<boolean> {
    const topic = getTopicName(this.currentRoomKey || getRoomKey());

    // Broadcast locally to any other open tabs on this device
    try {
      this.broadcastChannel?.postMessage(payload);
    } catch {
      // Ignore
    }

    // Publish to the internet via ntfy.sh
    try {
      const res = await fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Title': `Love Hub from ${payload.senderName}`,
        },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to publish realtime message to internet:', e);
      return false;
    }
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

  public disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
    this.notifyStatus(false);
  }
}

export const realtimeHub = new RealtimeService();
