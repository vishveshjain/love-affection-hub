import {
  CoupleProfile,
  AffectionStats,
  ScratchCoupon,
  MemoryItem,
  DreamItem,
  LoveNote,
  JourneyMilestone,
  ChatMessage,
} from '../types';

export const DEFAULT_BOYFRIEND_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23dbeafe"/><stop offset="100%" stop-color="%2393c5fd"/></linearGradient></defs><rect width="200" height="200" rx="100" fill="url(%23bg)"/><circle cx="100" cy="115" r="45" fill="%23fed7aa"/><circle cx="100" cy="85" r="40" fill="%23fed7aa"/><path d="M 60 75 Q 100 35 140 75 Q 100 55 60 75 Z" fill="%23334155"/><circle cx="85" cy="85" r="5" fill="%231e293b"/><circle cx="115" cy="85" r="5" fill="%231e293b"/><circle cx="78" cy="95" r="6" fill="%23fda4af" opacity="0.6"/><circle cx="122" cy="95" r="6" fill="%23fda4af" opacity="0.6"/><path d="M 90 102 Q 100 112 110 102" stroke="%23e11d48" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 50 170 Q 100 140 150 170 L 150 200 L 50 200 Z" fill="%233b82f6"/><polygon points="95,145 105,145 100,165" fill="%23f43f5e"/><text x="100" y="190" text-anchor="middle" font-size="20">👑</text></svg>`;

export const DEFAULT_GIRLFRIEND_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fce7f3"/><stop offset="100%" stop-color="%23f472b6"/></linearGradient></defs><rect width="200" height="200" rx="100" fill="url(%23bgG)"/><circle cx="100" cy="115" r="45" fill="%23fed7aa"/><path d="M 55 70 C 45 120, 55 160, 65 170 C 75 160, 80 120, 80 85 Z" fill="%237c2d12"/><path d="M 145 70 C 155 120, 145 160, 135 170 C 125 160, 120 120, 120 85 Z" fill="%237c2d12"/><circle cx="100" cy="85" r="40" fill="%23fed7aa"/><path d="M 60 70 Q 100 40 140 70 Q 100 55 60 70 Z" fill="%237c2d12"/><circle cx="85" cy="85" r="5" fill="%231e293b"/><circle cx="115" cy="85" r="5" fill="%231e293b"/><circle cx="78" cy="95" r="7" fill="%23fb7185" opacity="0.7"/><circle cx="122" cy="95" r="7" fill="%23fb7185" opacity="0.7"/><path d="M 90 102 Q 100 114 110 102" stroke="%23e11d48" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="130" cy="65" r="10" fill="%23ec4899"/><text x="130" y="69" text-anchor="middle" font-size="12" fill="white">🌸</text><path d="M 50 170 Q 100 135 150 170 L 150 200 L 50 200 Z" fill="%23ec4899"/><text x="100" y="190" text-anchor="middle" font-size="20">✨</text></svg>`;

export function isCustomPhoto(photo?: string | null): boolean {
  if (!photo || typeof photo !== 'string' || photo.length < 50) return false;
  if (photo.startsWith('data:image/svg+xml') || photo.includes('<svg')) return false;
  return photo.startsWith('data:image/') || photo.startsWith('http://') || photo.startsWith('https://');
}

export function isDefaultAvatar(photo?: string | null): boolean {
  return !isCustomPhoto(photo);
}

export const DEFAULT_COUPONS: ScratchCoupon[] = [
  {
    id: 'coupon-1',
    title: 'Argument Win Pass',
    icon: '👑',
    description: 'Instant victory in any petty debate or argument, zero complaints allowed!',
    reward: 'Valid immediately. Partner must smile and say "You are right my love!"',
    scratched: false,
    redeemed: false,
  },
  {
    id: 'coupon-2',
    title: 'Unlimited Cuddle Squeeze',
    icon: '🫂',
    description: 'Redeemable for an uninterrupted 30-minute warm snuggle and cuddle session.',
    reward: 'Non-expiring. Can be called at bed time, movie night, or whenever you need love.',
    scratched: false,
    redeemed: false,
  },
  {
    id: 'coupon-3',
    title: 'Late Night Dessert Treat',
    icon: '🍨',
    description: 'Partner must buy or prepare your favorite ice cream, boba, or sweet treat.',
    reward: 'Deliverable within 24 hours of redemption!',
    scratched: false,
    redeemed: false,
  },
  {
    id: 'coupon-4',
    title: 'Back & Shoulder Massage',
    icon: '💆',
    description: '20 minutes of pampering, gentle massage with soothing background vibes.',
    reward: 'Stress relief guaranteed with complete dedication.',
    scratched: false,
    redeemed: false,
  },
  {
    id: 'coupon-5',
    title: 'Movie Night Dictator',
    icon: '🎬',
    description: 'You pick whatever movie or series to watch. Partner must provide snacks and zero spoilers.',
    reward: 'Pick any romantic, action, or comedy flick without debate!',
    scratched: false,
    redeemed: false,
  },
  {
    id: 'coupon-6',
    title: 'Forehead Kiss & Compliments',
    icon: '💋',
    description: '10 genuine reasons why you are the most incredible person in the whole universe.',
    reward: 'Spoken softly with a warm forehead kiss.',
    scratched: false,
    redeemed: false,
  },
];

export const INITIAL_PROFILE: CoupleProfile = {
  currentUserRole: 'boyfriend',
  boyfriendName: 'Vishvesh',
  boyfriendPhoto: DEFAULT_BOYFRIEND_AVATAR,
  boyfriendMood: 'Totally smitten 🥰',
  girlfriendName: 'Laura',
  girlfriendPhoto: DEFAULT_GIRLFRIEND_AVATAR,
  girlfriendMood: 'Needs kisses & attention 🥺💖',
  relationshipStartDate: '2026-08-25',
  isConfigured: false,
  soundEnabled: true,
  ambientMusicEnabled: false,
};

export const INITIAL_STATS: AffectionStats = {
  totalKisses: 0,
  totalHugs: 0,
  totalCarries: 0,
  totalTreats: 0,
  totalTickles: 0,
  totalHandHolds: 0,
};

export const DEFAULT_DREAMS: DreamItem[] = [
  {
    id: 'd1',
    authorRole: 'girlfriend',
    authorName: 'Laura',
    type: 'night_dream',
    title: 'Flying over glowing oceans together',
    content: 'Last night I dreamt we were running on a warm beach, and when you held my hand we started floating into a pastel pink sky!',
    date: 'Just recently',
    hearts: 12,
  },
  {
    id: 'd2',
    authorRole: 'boyfriend',
    authorName: 'Vishvesh',
    type: 'future_dream',
    title: 'Our Cozy Wooden Mountain Cabin',
    content: 'A fireplace crackling, hot chocolate in our mugs, huge soft blankets, and you falling asleep on my chest while it snows outside.',
    date: 'Our Future',
    hearts: 24,
  },
  {
    id: 'd3',
    authorRole: 'girlfriend',
    authorName: 'Laura',
    type: 'future_dream',
    title: 'Under the Paris Lights',
    content: 'Eating warm croissants at 7 AM near the Eiffel tower and getting lost in the cobblestone streets with you.',
    date: 'Our Bucket List',
    hearts: 18,
  },
];

export const DEFAULT_LOVE_NOTES: LoveNote[] = [
  {
    id: 'n1',
    authorRole: 'boyfriend',
    authorName: 'Vishvesh',
    title: 'To My Beautiful Laura 🌹',
    note: 'Just wanted to remind you how unbelievably grateful I am for you. You brighten even the longest days with your smile. I love you so much!',
    color: 'bg-rose-100 border-rose-300 text-rose-900',
    date: 'Today',
  },
  {
    id: 'n2',
    authorRole: 'girlfriend',
    authorName: 'Laura',
    title: 'Good Morning My Vishvesh ☕',
    note: 'Don’t forget to drink water today and remember that your girl is cheering for you non-stop! Sending you 1000 kisses.',
    color: 'bg-pink-100 border-pink-300 text-pink-900',
    date: 'Yesterday',
  },
  {
    id: 'n3',
    authorRole: 'boyfriend',
    authorName: 'Vishvesh',
    title: 'Date Night Promise 🎬',
    note: 'Tonight is your night! Whatever movie you choose, whatever snacks you crave, I am all yours.',
    color: 'bg-purple-100 border-purple-300 text-purple-900',
    date: 'This week',
  },
];

export const DEFAULT_MILESTONES: JourneyMilestone[] = [
  {
    id: 'm1',
    title: 'First Hello & First Spark',
    description: 'The exact moment our paths crossed and everything changed.',
    completed: true,
    completedDate: 'Day 1',
    emoji: '✨',
  },
  {
    id: 'm2',
    title: 'First Date & Butterfly Smiles',
    description: 'Laughing nervously and realizing we could talk for hours.',
    completed: true,
    completedDate: 'Month 1',
    emoji: '☕',
  },
  {
    id: 'm3',
    title: 'Our First Road Trip Together',
    description: 'Blasting music with windows down and singing off-key.',
    completed: true,
    completedDate: 'Summer',
    emoji: '🚗',
  },
  {
    id: 'm4',
    title: 'Watch the Sunrise on a Mountain Peak',
    description: 'Wrap up in one big blanket and watch the sky wake up.',
    completed: false,
    emoji: '🌄',
  },
  {
    id: 'm5',
    title: 'Adopt a Cute Pet Together',
    description: 'A fluffy golden puppy or sweet rescue kitten to love.',
    completed: false,
    emoji: '🐾',
  },
  {
    id: 'm6',
    title: 'Cook a 5-Course Meal from Scratch',
    description: 'Making fresh pasta, sauce on our cheeks, and dancing in the kitchen.',
    completed: false,
    emoji: '🍝',
  },
  {
    id: 'm7',
    title: 'Our Dream Forever Home',
    description: 'A home filled with laughter, plants, good food, and eternal cuddles.',
    completed: false,
    emoji: '🏡',
  },
];

const STORAGE_KEYS = {
  PROFILE: 'love_app_couple_profile_v6',
  STATS: 'love_app_affection_stats_v2',
  COUPONS: 'love_app_scratch_coupons_v2',
  MEMORIES: 'love_app_memories_v2',
  DREAMS: 'love_app_dreams_v2',
  NOTES: 'love_app_notes_v2',
  MILESTONES: 'love_app_milestones_v2',
  CHAT: 'love_app_chat_messages_v2',
};

export function loadProfile(): CoupleProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate defaults if needed
      if (!parsed.girlfriendName || parsed.girlfriendName === 'My Angel') {
        parsed.girlfriendName = 'Laura';
      }
      if (!parsed.boyfriendName) {
        parsed.boyfriendName = 'Vishvesh';
      }
      if (
        !parsed.relationshipStartDate ||
        parsed.relationshipStartDate === '2024-02-14' ||
        parsed.relationshipStartDate === '2024-08-25'
      ) {
        parsed.relationshipStartDate = '2026-08-25';
      }
      return { ...INITIAL_PROFILE, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  return INITIAL_PROFILE;
}

export function saveProfile(profile: CoupleProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadStats(): AffectionStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (raw) {
      return { ...INITIAL_STATS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load stats', e);
  }
  return INITIAL_STATS;
}

export function saveStats(stats: AffectionStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
}

export function loadCoupons(): ScratchCoupon[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load coupons', e);
  }
  return DEFAULT_COUPONS;
}

export function saveCoupons(coupons: ScratchCoupon[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  } catch (e) {
    console.error('Failed to save coupons', e);
  }
}

export function loadDreams(): DreamItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DREAMS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load dreams', e);
  }
  return DEFAULT_DREAMS;
}

export function saveDreams(dreams: DreamItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DREAMS, JSON.stringify(dreams));
  } catch (e) {
    console.error('Failed to save dreams', e);
  }
}

export function loadLoveNotes(): LoveNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load notes', e);
  }
  return DEFAULT_LOVE_NOTES;
}

export function saveLoveNotes(notes: LoveNote[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes', e);
  }
}

export function loadMilestones(): JourneyMilestone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MILESTONES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load milestones', e);
  }
  return DEFAULT_MILESTONES;
}

export function saveMilestones(milestones: JourneyMilestone[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
  } catch (e) {
    console.error('Failed to save milestones', e);
  }
}

export function loadChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT);
    if (raw) {
      const parsed: ChatMessage[] = JSON.parse(raw);
      // Sanitize: strip any giant base64 photos to keep memory & network feather-light
      return parsed.map((m) => {
        if (m.senderPhoto && m.senderPhoto.length > 500) {
          const { senderPhoto, ...rest } = m;
          return rest;
        }
        return m;
      });
    }
  } catch (e) {
    console.error('Failed to load chat', e);
  }
  return [
    {
      id: 'c1',
      senderRole: 'boyfriend',
      senderName: 'Vishvesh',
      text: 'Hey my Laura! Look what I found for us 💖',
      timestamp: Date.now() - 3600000,
    },
    {
      id: 'c2',
      senderRole: 'girlfriend',
      senderName: 'Laura',
      text: 'Vishvesh! This is so cute! Hug me right now! 🥰🫂',
      timestamp: Date.now() - 1800000,
    },
  ];
}

export function saveChatMessages(messages: ChatMessage[]): void {
  try {
    // Sanitize before saving so localStorage quota is never exceeded
    const clean = messages.map((m) => {
      if (m.senderPhoto && m.senderPhoto.length > 500) {
        const { senderPhoto, ...rest } = m;
        return rest;
      }
      return m;
    });
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(clean));
  } catch (e) {
    console.error('Failed to save chat', e);
  }
}

// Convert uploaded file to high-resolution, crisp, Retina-ready base64 Data URL (~380x380 px, ~18-24KB)
// Balanced for razor-sharp clarity on mobile & desktop Retina displays for the 176px Affection Stage,
// while storing safely in ExtendsClass Cloud Storage without blurriness or pixelation.
export function fileToDataUrl(
  file: File,
  maxDimension: number = 380,
  initialQuality: number = 0.84,
  maxChars: number = 28000
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const rawResult = e.target?.result as string;
      if (typeof window === 'undefined' || !window.document) {
        resolve(rawResult);
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(rawResult);
      img.onload = () => {
        try {
          let dim = maxDimension;
          let q = initialQuality;
          let bestResult = '';

          // High-resolution avatar processing: keeps physical pixel density high (360-380px)
          // for razor-sharp appearance in both the 176px Affection Stage and chat bubbles.
          for (let attempt = 0; attempt < 5; attempt++) {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > dim) {
                height = Math.round((height * dim) / width);
                width = dim;
              }
            } else {
              if (height > dim) {
                width = Math.round((width * dim) / height);
                height = dim;
              }
            }

            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            const ctx = canvas.getContext('2d');
            if (!ctx) break;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            const candidate = canvas.toDataURL('image/jpeg', q);
            bestResult = candidate;
            if (candidate.length <= maxChars) {
              break;
            }
            dim = Math.round(dim * 0.90);
            q = Math.max(0.68, q - 0.05);
          }

          resolve(bestResult || rawResult);
        } catch {
          resolve(rawResult);
        }
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  });
}

