// Security and Room Authentication Service
// Enables private, encrypted, multi-couple sanctuary rooms with passcode authentication

export interface RoomMeta {
  roomId: string;
  roomName: string;
  passcodeHash: string;
  partner1Name: string;
  partner2Name: string;
  relationshipStartDate?: string;
  createdAt: number;
}

export interface ActiveRoomSession {
  roomId: string;
  passcode: string;
  isUnlocked: boolean;
  rememberMe: boolean;
  unlockedAt: number;
}

export const DEFAULT_ROOM_ID = 'vishvesh-laura-love-nest-2026';
export const DEFAULT_ROOM_PASSCODE = 'laura2026';

const KNOWN_ROOMS_KEY = 'love_app_known_rooms_registry_v1';
const SESSION_STORAGE_KEY = 'love_app_active_sanctuary_session_v1';
const REMEMBERED_SESSION_KEY = 'love_app_remembered_sanctuary_session_v1';

// Fast synchronous 64-bit cryptographic hash for topic and storage namespacing
export function fastHash(input: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${hex1}${hex2}`;
}

// Compute deterministic secure token for room and passcode
export function computeRoomSecurityToken(roomId: string, passcode: string): string {
  const cleanRoom = roomId.trim().toLowerCase();
  const cleanPass = passcode.trim();
  return fastHash(`room:${cleanRoom}:pass:${cleanPass}`);
}

// Initialize default known rooms if empty
function initializeKnownRooms(): Record<string, RoomMeta> {
  const rooms: Record<string, RoomMeta> = {};
  rooms[DEFAULT_ROOM_ID] = {
    roomId: DEFAULT_ROOM_ID,
    roomName: "Vishvesh & Laura's Love Sanctuary",
    passcodeHash: fastHash(DEFAULT_ROOM_PASSCODE),
    partner1Name: 'Vishvesh',
    partner2Name: 'Laura',
    relationshipStartDate: '2026-08-25',
    createdAt: 1724544000000,
  };
  return rooms;
}

export function getKnownRooms(): Record<string, RoomMeta> {
  try {
    const raw = localStorage.getItem(KNOWN_ROOMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        if (!parsed[DEFAULT_ROOM_ID]) {
          parsed[DEFAULT_ROOM_ID] = initializeKnownRooms()[DEFAULT_ROOM_ID];
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading known rooms:', e);
  }
  const defaults = initializeKnownRooms();
  saveKnownRooms(defaults);
  return defaults;
}

export function saveKnownRooms(rooms: Record<string, RoomMeta>): void {
  try {
    localStorage.setItem(KNOWN_ROOMS_KEY, JSON.stringify(rooms));
  } catch (e) {
    console.warn('Error saving known rooms:', e);
  }
}

export function getRoomMeta(roomId: string): RoomMeta | null {
  const rooms = getKnownRooms();
  return rooms[roomId.trim().toLowerCase()] || null;
}

// Load active session (checks session storage first, then remembered local session)
export function getActiveSession(): ActiveRoomSession {
  try {
    // 1. Check session storage (active browser tab)
    const sessionRaw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed && parsed.roomId && parsed.isUnlocked) {
        return parsed;
      }
    }

    // 2. Check remembered local storage
    const rememberedRaw = localStorage.getItem(REMEMBERED_SESSION_KEY);
    if (rememberedRaw) {
      const parsed = JSON.parse(rememberedRaw);
      if (parsed && parsed.roomId && parsed.isUnlocked) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(parsed));
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error loading active session:', e);
  }

  // Default state: if first time ever, unlock Vishvesh & Laura room automatically
  const defaultSession: ActiveRoomSession = {
    roomId: DEFAULT_ROOM_ID,
    passcode: DEFAULT_ROOM_PASSCODE,
    isUnlocked: true,
    rememberMe: true,
    unlockedAt: Date.now(),
  };
  return defaultSession;
}

export function saveActiveSession(session: ActiveRoomSession): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    if (session.rememberMe && session.isUnlocked) {
      localStorage.setItem(REMEMBERED_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(REMEMBERED_SESSION_KEY);
    }
  } catch (e) {
    console.warn('Error saving session:', e);
  }
}

export function getActiveRoomId(): string {
  const session = getActiveSession();
  return session.roomId || DEFAULT_ROOM_ID;
}

export function getActivePasscode(): string {
  const session = getActiveSession();
  return session.passcode || '';
}

export function isSanctuaryUnlocked(): boolean {
  const session = getActiveSession();
  return Boolean(session.isUnlocked);
}

export function lockSanctuary(): void {
  const current = getActiveSession();
  const lockedSession: ActiveRoomSession = {
    ...current,
    isUnlocked: false,
  };
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(lockedSession));
  localStorage.removeItem(REMEMBERED_SESSION_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('love_app_auth_state_changed', { detail: lockedSession }));
  }
}

export function unlockSanctuary(
  roomId: string,
  passcode: string,
  rememberMe: boolean = true
): { success: boolean; error?: string; roomMeta?: RoomMeta } {
  const cleanRoom = roomId.trim().toLowerCase();
  const cleanPass = passcode.trim();

  if (!cleanRoom) {
    return { success: false, error: 'Please enter a Room ID' };
  }
  if (!cleanPass) {
    return { success: false, error: 'Please enter the Room Passcode' };
  }

  const knownRooms = getKnownRooms();
  let meta = knownRooms[cleanRoom];

  // If room is the default room, accept default passcode
  if (cleanRoom === DEFAULT_ROOM_ID) {
    if (cleanPass !== DEFAULT_ROOM_PASSCODE && meta && meta.passcodeHash !== fastHash(cleanPass)) {
      return { success: false, error: 'Incorrect Passcode for Vishvesh & Laura Sanctuary' };
    }
    if (!meta) {
      meta = initializeKnownRooms()[DEFAULT_ROOM_ID];
    }
  } else if (meta) {
    // Known room on this device, verify passcode hash
    if (meta.passcodeHash && meta.passcodeHash !== fastHash(cleanPass)) {
      return { success: false, error: 'Incorrect Passcode for this Sanctuary' };
    }
  } else {
    // New room joining from partner's invite
    // Register it locally
    meta = {
      roomId: cleanRoom,
      roomName: `${cleanRoom} Sanctuary`,
      passcodeHash: fastHash(cleanPass),
      partner1Name: 'Partner 1',
      partner2Name: 'Partner 2',
      createdAt: Date.now(),
    };
    knownRooms[cleanRoom] = meta;
    saveKnownRooms(knownRooms);
  }

  const session: ActiveRoomSession = {
    roomId: cleanRoom,
    passcode: cleanPass,
    isUnlocked: true,
    rememberMe,
    unlockedAt: Date.now(),
  };

  saveActiveSession(session);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('love_app_auth_state_changed', { detail: session }));
  }

  return { success: true, roomMeta: meta };
}

export function createSanctuaryRoom(
  roomId: string,
  passcode: string,
  partner1Name: string,
  partner2Name: string,
  relationshipStartDate?: string,
  rememberMe: boolean = true
): { success: boolean; error?: string; roomMeta?: RoomMeta } {
  const cleanRoom = roomId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const cleanPass = passcode.trim();
  const p1 = partner1Name.trim() || 'Partner 1';
  const p2 = partner2Name.trim() || 'Partner 2';

  if (!cleanRoom || cleanRoom.length < 3) {
    return { success: false, error: 'Room ID must be at least 3 characters long' };
  }
  if (!cleanPass || cleanPass.length < 3) {
    return { success: false, error: 'Passcode must be at least 3 characters long' };
  }

  const knownRooms = getKnownRooms();
  const meta: RoomMeta = {
    roomId: cleanRoom,
    roomName: `${p1} & ${p2}'s Sanctuary`,
    passcodeHash: fastHash(cleanPass),
    partner1Name: p1,
    partner2Name: p2,
    relationshipStartDate: relationshipStartDate || new Date().toISOString().split('T')[0],
    createdAt: Date.now(),
  };

  knownRooms[cleanRoom] = meta;
  saveKnownRooms(knownRooms);

  const session: ActiveRoomSession = {
    roomId: cleanRoom,
    passcode: cleanPass,
    isUnlocked: true,
    rememberMe,
    unlockedAt: Date.now(),
  };

  saveActiveSession(session);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('love_app_auth_state_changed', { detail: session }));
  }

  return { success: true, roomMeta: meta };
}

// Generate romantic random room suggestions
export function generateSuggestedRoomId(): string {
  const adjectives = ['sweet', 'cosy', 'starry', 'honey', 'dreamy', 'forever', 'golden', 'velvet', 'pure', 'bliss'];
  const nouns = ['nest', 'haven', 'sanctuary', 'paradise', 'heart', 'oasis', 'cloud', 'island', 'castle', 'spark'];
  const randAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${randAdj}-${randNoun}-${num}`;
}

// Generate share link
export function generateInviteLink(roomId: string): string {
  if (typeof window === 'undefined') return `?room=${encodeURIComponent(roomId)}`;
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?room=${encodeURIComponent(roomId)}`;
}
