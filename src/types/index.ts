export type UserRole = 'boyfriend' | 'girlfriend';

export interface CoupleProfile {
  currentUserRole: UserRole; // who is interacting right now
  boyfriendName: string;
  boyfriendPhoto: string;
  boyfriendPhotoUpdatedAt?: number;
  boyfriendMood: string;
  girlfriendName: string;
  girlfriendPhoto: string;
  girlfriendPhotoUpdatedAt?: number;
  girlfriendMood: string;
  relationshipStartDate: string; // YYYY-MM-DD
  isConfigured: boolean;
  soundEnabled: boolean;
  ambientMusicEnabled: boolean;
}

export interface AffectionStats {
  totalKisses: number;
  totalHugs: number;
  totalCarries: number;
  totalTreats: number;
  totalTickles: number;
  totalHandHolds: number;
}

export type AffectionActionType =
  | 'kiss'
  | 'hug'
  | 'carry'
  | 'handhold'
  | 'feed'
  | 'tickle'
  | 'whisper'
  | 'headpat';

export interface ActionAnimationState {
  active: boolean;
  action: AffectionActionType | null;
  senderRole: UserRole;
  targetRole: UserRole;
  senderName: string;
  targetName: string;
  sweetMessage: string;
}

export interface ScratchCoupon {
  id: string;
  title: string;
  icon: string;
  description: string;
  reward: string;
  scratched: boolean;
  redeemed: boolean;
  isCustom?: boolean;
}

export interface MemoryItem {
  id: string;
  date: string;
  title: string;
  description: string;
  emoji: string;
  photoUrl?: string;
}

export interface FlamesResult {
  partner1: string;
  partner2: string;
  commonLetters: string[];
  remainingCount: number;
  stepEliminations: { letter: string; word: string; remaining: string[] }[];
  resultLetter: 'F' | 'L' | 'A' | 'M' | 'E' | 'S';
  resultWord: string;
  description: string;
  percentage: number;
  advice: string;
}

export interface ChatMessage {
  id: string;
  senderClientId?: string;
  senderRole: UserRole;
  senderName: string;
  senderPhoto?: string;
  text: string;
  timestamp: number;
  reaction?: string;
}

export interface DreamItem {
  id: string;
  authorRole: UserRole;
  authorName: string;
  type: 'night_dream' | 'future_dream';
  title: string;
  content: string;
  date: string;
  hearts: number;
}

export interface LoveNote {
  id: string;
  authorRole: UserRole;
  authorName: string;
  title: string;
  note: string;
  color: string;
  date: string;
}

export interface JourneyMilestone {
  id: string;
  title: string;
  description: string;
  targetDate?: string;
  completed: boolean;
  completedDate?: string;
  emoji: string;
}
