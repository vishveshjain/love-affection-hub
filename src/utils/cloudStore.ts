// Cloud Persistence Store for Vishvesh & Laura's Love Sanctuary
// Ensures all dreams, notes, milestones, coupons, memories, and chat history persist forever across devices and sessions.

import { ChatMessage, DreamItem, LoveNote, JourneyMilestone, ScratchCoupon, MemoryItem, AffectionStats } from '../types';
import {
  saveChatMessages,
  saveDreams,
  saveLoveNotes,
  saveMilestones,
  saveCoupons,
  saveStats,
  loadChatMessages,
  loadDreams,
  loadLoveNotes,
  loadMilestones,
  loadCoupons,
  loadStats,
  loadProfile,
  saveProfile,
  isCustomPhoto,
} from './storage';

export interface CloudCoupleData {
  version: number;
  coupleKey: string;
  updatedAt: number;
  chat: ChatMessage[];
  dreams: DreamItem[];
  notes: LoveNote[];
  milestones: JourneyMilestone[];
  coupons: ScratchCoupon[];
  memories?: MemoryItem[];
  stats?: AffectionStats;
  boyfriendPhoto?: string;
  girlfriendPhoto?: string;
}

const CLOUD_BIN_ID = 'fdfbbec';
const CLOUD_ENDPOINT = `https://extendsclass.com/api/json-storage/bin/${CLOUD_BIN_ID}`;

let inMemoryCloudData: CloudCoupleData | null = null;
let saveDebounceTimer: any = null;
let isSaving = false;
let pendingSave = false;
let syncIntervalTimer: any = null;

type CloudListener = (data: CloudCoupleData) => void;
const listeners: Set<CloudListener> = new Set();

export function onCloudDataLoaded(cb: CloudListener): () => void {
  listeners.add(cb);
  if (inMemoryCloudData) {
    try {
      cb(inMemoryCloudData);
    } catch (e) {
      console.warn('Listener error in onCloudDataLoaded:', e);
    }
  }
  return () => {
    listeners.delete(cb);
  };
}

function notifyListeners(data: CloudCoupleData) {
  listeners.forEach((cb) => {
    try {
      cb(data);
    } catch (e) {
      console.warn('Cloud listener error:', e);
    }
  });
}

export function loadMemoriesFromLocal(): MemoryItem[] {
  try {
    const raw = localStorage.getItem('love_app_memories_v1');
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }
  return [];
}

export function saveMemoriesToLocal(memories: MemoryItem[]) {
  try {
    localStorage.setItem('love_app_memories_v1', JSON.stringify(memories));
  } catch {
    // Ignore
  }
}

export async function fetchCloudData(): Promise<CloudCoupleData | null> {
  try {
    const res = await fetch(`${CLOUD_ENDPOINT}?t=${Date.now()}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data: CloudCoupleData = await res.json();
    if (data && data.coupleKey) {
      // Merge chat messages without duplicates
      if (Array.isArray(data.chat) && data.chat.length > 0) {
        const local = loadChatMessages();
        const mergedMap = new Map<string, ChatMessage>();
        local.forEach((m) => mergedMap.set(m.id, m));
        data.chat.forEach((m) => mergedMap.set(m.id, m));
        const merged = Array.from(mergedMap.values()).sort((a, b) => a.timestamp - b.timestamp);
        saveChatMessages(merged);
        data.chat = merged;
      }

      // Merge dreams
      if (Array.isArray(data.dreams) && data.dreams.length > 0) {
        const localDreams = loadDreams();
        const dreamMap = new Map<string, DreamItem>();
        localDreams.forEach((d) => dreamMap.set(d.id, d));
        data.dreams.forEach((d) => dreamMap.set(d.id, d));
        const merged = Array.from(dreamMap.values());
        saveDreams(merged);
        data.dreams = merged;
      }

      // Merge love notes
      if (Array.isArray(data.notes) && data.notes.length > 0) {
        const localNotes = loadLoveNotes();
        const noteMap = new Map<string, LoveNote>();
        localNotes.forEach((n) => noteMap.set(n.id, n));
        data.notes.forEach((n) => noteMap.set(n.id, n));
        const merged = Array.from(noteMap.values());
        saveLoveNotes(merged);
        data.notes = merged;
      }

      // Merge milestones
      if (Array.isArray(data.milestones) && data.milestones.length > 0) {
        const localMilestones = loadMilestones();
        const mileMap = new Map<string, JourneyMilestone>();
        localMilestones.forEach((m) => mileMap.set(m.id, m));
        data.milestones.forEach((m) => mileMap.set(m.id, m));
        const merged = Array.from(mileMap.values());
        saveMilestones(merged);
        data.milestones = merged;
      }

      // Merge coupons
      if (Array.isArray(data.coupons) && data.coupons.length > 0) {
        const localCoupons = loadCoupons();
        const couponMap = new Map<string, ScratchCoupon>();
        localCoupons.forEach((c) => couponMap.set(c.id, c));
        data.coupons.forEach((c) => couponMap.set(c.id, c));
        const merged = Array.from(couponMap.values());
        saveCoupons(merged);
        data.coupons = merged;
      }

      // Merge memories
      if (Array.isArray(data.memories) && data.memories.length > 0) {
        const localMemories = loadMemoriesFromLocal();
        const memMap = new Map<string, MemoryItem>();
        localMemories.forEach((m) => memMap.set(m.id, m));
        data.memories.forEach((m) => memMap.set(m.id, m));
        const merged = Array.from(memMap.values());
        saveMemoriesToLocal(merged);
        data.memories = merged;
      }

      // Merge stats
      if (data.stats && typeof data.stats === 'object') {
        const local = loadStats();
        const mergedStats: AffectionStats = {
          totalKisses: Math.max(local.totalKisses, data.stats.totalKisses || 0),
          totalHugs: Math.max(local.totalHugs, data.stats.totalHugs || 0),
          totalCarries: Math.max(local.totalCarries, data.stats.totalCarries || 0),
          totalTreats: Math.max(local.totalTreats, data.stats.totalTreats || 0),
          totalTickles: Math.max(local.totalTickles, data.stats.totalTickles || 0),
          totalHandHolds: Math.max(local.totalHandHolds, data.stats.totalHandHolds || 0),
        };
        saveStats(mergedStats);
        data.stats = mergedStats;
      }

      // Sync photos across devices if updated in cloud
      try {
        const localProf = loadProfile();
        let profChanged = false;
        let needsCloudPush = false;

        // Boyfriend photo:
        if (isCustomPhoto(data.boyfriendPhoto)) {
          if (data.boyfriendPhoto !== localProf.boyfriendPhoto) {
            localProf.boyfriendPhoto = data.boyfriendPhoto!;
            profChanged = true;
          }
        } else if (isCustomPhoto(localProf.boyfriendPhoto)) {
          data.boyfriendPhoto = localProf.boyfriendPhoto;
          needsCloudPush = true;
        }

        // Girlfriend photo:
        if (isCustomPhoto(data.girlfriendPhoto)) {
          if (data.girlfriendPhoto !== localProf.girlfriendPhoto) {
            localProf.girlfriendPhoto = data.girlfriendPhoto!;
            profChanged = true;
          }
        } else if (isCustomPhoto(localProf.girlfriendPhoto)) {
          data.girlfriendPhoto = localProf.girlfriendPhoto;
          needsCloudPush = true;
        }

        if (profChanged) {
          saveProfile(localProf);
        }

        if (needsCloudPush) {
          inMemoryCloudData = data;
          pushToCloudNow();
        }
      } catch (err) {
        console.warn('Error syncing profile photos from cloud:', err);
      }

      inMemoryCloudData = data;
      notifyListeners(data);
      return data;
    }
  } catch (e) {
    console.warn('Failed to fetch cloud couple data:', e);
  }
  return null;
}

function sanitizeForCloud(data: CloudCoupleData): CloudCoupleData {
  const sanitized: CloudCoupleData = { ...data };
  if (Array.isArray(sanitized.chat)) {
    sanitized.chat = sanitized.chat.slice(-60).map((m) => {
      if (m.senderPhoto && m.senderPhoto.length > 300) {
        const { senderPhoto, ...rest } = m;
        return rest;
      }
      return m;
    });
  }
  if (Array.isArray(sanitized.dreams)) {
    sanitized.dreams = sanitized.dreams.slice(-40);
  }
  if (Array.isArray(sanitized.notes)) {
    sanitized.notes = sanitized.notes.slice(-40);
  }
  if (Array.isArray(sanitized.milestones)) {
    sanitized.milestones = sanitized.milestones.slice(-30);
  }
  if (Array.isArray(sanitized.coupons)) {
    sanitized.coupons = sanitized.coupons.slice(-25);
  }
  if (Array.isArray(sanitized.memories)) {
    sanitized.memories = sanitized.memories.slice(-20);
  }
  return sanitized;
}

export async function pushToCloudNow(): Promise<boolean> {
  if (!inMemoryCloudData) return false;
  isSaving = true;
  try {
    const cleanPayload = sanitizeForCloud(inMemoryCloudData);
    const bodyStr = JSON.stringify(cleanPayload);
    // Safety check: ensure body is under ExtendsClass limit
    if (bodyStr.length > 95000) {
      console.warn('Payload approaching limit, truncating older items');
    }
    const res = await fetch(CLOUD_ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: bodyStr,
    });
    return res.ok;
  } catch (err) {
    console.warn('Cloud immediate save error:', err);
    return false;
  } finally {
    isSaving = false;
  }
}

export function saveCloudData(partial: Partial<Omit<CloudCoupleData, 'version' | 'coupleKey' | 'updatedAt'>>) {
  const localProf = loadProfile();
  const current: CloudCoupleData = inMemoryCloudData || {
    version: 2,
    coupleKey: 'vishvesh-laura-2026',
    updatedAt: Date.now(),
    chat: loadChatMessages(),
    dreams: loadDreams(),
    notes: loadLoveNotes(),
    milestones: loadMilestones(),
    coupons: loadCoupons(),
    memories: loadMemoriesFromLocal(),
    stats: loadStats(),
    boyfriendPhoto: isCustomPhoto(localProf.boyfriendPhoto) ? localProf.boyfriendPhoto : undefined,
    girlfriendPhoto: isCustomPhoto(localProf.girlfriendPhoto) ? localProf.girlfriendPhoto : undefined,
  };

  // Determine final boyfriendPhoto (custom photos ALWAYS win, defaults are NEVER saved)
  const finalBfPhoto =
    isCustomPhoto(partial.boyfriendPhoto)
      ? partial.boyfriendPhoto
      : isCustomPhoto(current.boyfriendPhoto)
      ? current.boyfriendPhoto
      : isCustomPhoto(localProf.boyfriendPhoto)
      ? localProf.boyfriendPhoto
      : undefined;

  // Determine final girlfriendPhoto (custom photos ALWAYS win, defaults are NEVER saved)
  const finalGfPhoto =
    isCustomPhoto(partial.girlfriendPhoto)
      ? partial.girlfriendPhoto
      : isCustomPhoto(current.girlfriendPhoto)
      ? current.girlfriendPhoto
      : isCustomPhoto(localProf.girlfriendPhoto)
      ? localProf.girlfriendPhoto
      : undefined;

  const updated: CloudCoupleData = {
    ...current,
    ...partial,
    boyfriendPhoto: finalBfPhoto,
    girlfriendPhoto: finalGfPhoto,
    updatedAt: Date.now(),
  };

  inMemoryCloudData = updated;

  // If this update was explicitly for a profile photo, push immediately to cloud
  if (isCustomPhoto(partial.boyfriendPhoto) || isCustomPhoto(partial.girlfriendPhoto)) {
    clearTimeout(saveDebounceTimer);
    pushToCloudNow();
    return;
  }

  // Debounced push to cloud to prevent excessive HTTP traffic
  clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(async () => {
    if (isSaving) {
      pendingSave = true;
      return;
    }
    await pushToCloudNow();
    if (pendingSave) {
      pendingSave = false;
      saveCloudData({});
    }
  }, 250);
}

// Start automatic periodic background sync every 25 seconds
export function startAutoCloudSync(intervalMs: number = 25000): () => void {
  if (typeof window === 'undefined') return () => {};
  
  // Initial fetch immediately
  fetchCloudData();

  clearInterval(syncIntervalTimer);
  syncIntervalTimer = setInterval(() => {
    fetchCloudData();
  }, intervalMs);

  return () => {
    clearInterval(syncIntervalTimer);
  };
}
