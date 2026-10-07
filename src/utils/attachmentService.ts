import { ChatAttachment, ChatAttachmentType } from '../types';
import { getRoomKey } from './realtime';
import { getActivePasscode, computeRoomSecurityToken } from './security';

const NTFY_SERVERS = [
  'https://ntfy.adminforge.de',
  'https://ntfy.envs.net',
];

// Open or get IndexedDB for offline attachment caching
const DB_NAME = 'LoveHubAttachmentsDB';
const DB_VERSION = 1;
const STORE_NAME = 'attachments';

function getDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function cacheAttachmentLocally(attachment: ChatAttachment): Promise<void> {
  try {
    const db = await getDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(attachment);
  } catch (e) {
    console.warn('Failed to cache attachment in IndexedDB', e);
  }
}

export async function getCachedAttachment(id: string): Promise<ChatAttachment | null> {
  try {
    const db = await getDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export function detectAttachmentType(file: File): ChatAttachmentType {
  const mime = file.type.toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'file';
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Convert image file to optimized high-definition Data URL
export function imageToDataUrl(file: File, maxDimension = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const raw = e.target?.result as string;
      if (typeof window === 'undefined' || !window.document || !file.type.startsWith('image/')) {
        resolve(raw);
        return;
      }

      // If GIF or SVG, do not compress through canvas to preserve animations and vectors
      if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
        resolve(raw);
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(raw);
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(raw);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Use WebP if supported, fallback to JPEG
          let candidate = '';
          try {
            candidate = canvas.toDataURL('image/webp', quality);
          } catch {
            candidate = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(candidate || raw);
        } catch {
          resolve(raw);
        }
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
  });
}

// Upload file to cloud/server topic
export async function uploadToCloudServer(file: File): Promise<string | null> {
  const room = getRoomKey() || 'vishvesh-laura-love-nest-2026';
  let topic = `love-hub-${room.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'default'}-attachments`;
  if (room !== 'vishvesh-laura-love-nest-2026') {
    const token = computeRoomSecurityToken(room, getActivePasscode());
    topic = `love-hub-sec-${token.substring(0, 24)}-attachments`;
  }

  const safeFilename = encodeURIComponent(file.name.replace(/[^a-zA-Z0-9._-]/g, '_'));

  for (const server of NTFY_SERVERS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(`${server}/${topic}`, {
        method: 'PUT',
        headers: {
          Filename: safeFilename,
          Title: file.name,
        },
        body: file,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json?.attachment?.url) {
          return json.attachment.url;
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn(`Attachment upload attempt failed on ${server}:`, e);
    }
  }

  return null;
}

// Convert arbitrary file into a local Data URL
export function fileToRawDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}

// Primary processor for any uploaded file in chat
export async function processChatAttachment(
  file: File,
  onProgress?: (status: string) => void
): Promise<ChatAttachment> {
  const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const type = detectAttachmentType(file);

  onProgress?.('Preparing attachment...');

  let url = '';
  let thumbnail: string | undefined = undefined;

  // If image, create an optimized thumbnail first
  if (type === 'image') {
    try {
      thumbnail = await imageToDataUrl(file, 400, 0.7);
    } catch {
      // Ignore
    }
  }

  // Attempt server upload for worldwide accessibility
  onProgress?.('Sending file across cloud...');
  try {
    const cloudUrl = await uploadToCloudServer(file);
    if (cloudUrl) {
      url = cloudUrl;
    }
  } catch (e) {
    console.warn('Cloud upload failed, using local conversion fallback:', e);
  }

  // Fallback to Data URL if cloud upload did not return URL
  if (!url) {
    onProgress?.('Finalizing file...');
    if (type === 'image') {
      url = await imageToDataUrl(file, 1200, 0.85);
    } else {
      url = await fileToRawDataUrl(file);
    }
  }

  const attachment: ChatAttachment = {
    id,
    name: file.name,
    type,
    mimeType: file.type || 'application/octet-stream',
    url,
    size: file.size,
    thumbnail,
  };

  // Cache in IndexedDB for seamless zero-lag local access
  await cacheAttachmentLocally(attachment);

  return attachment;
}
