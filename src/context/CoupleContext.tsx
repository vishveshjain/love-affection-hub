import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  CoupleProfile,
  AffectionStats,
  AffectionActionType,
  ActionAnimationState,
  UserRole,
  ScratchCoupon,
} from '../types';
import {
  loadProfile,
  saveProfile,
  loadStats,
  saveStats,
  loadCoupons,
  saveCoupons,
  saveDreams,
  saveLoveNotes,
  saveMilestones,
  isCustomPhoto,
} from '../utils/storage';
import { soundFx } from '../utils/audio';

import { getRandomWhisper } from '../utils/whispers';
import { realtimeHub, getRoomKey, getClientId, RealtimePayload } from '../utils/realtime';
import { saveCloudData, startAutoCloudSync, onCloudDataLoaded, saveMemoriesToLocal, fetchCloudData, pushToCloudNow } from '../utils/cloudStore';

interface CoupleContextType {
  profile: CoupleProfile;
  stats: AffectionStats;
  actionState: ActionAnimationState;
  showOnboarding: boolean;
  coupons: ScratchCoupon[];
  currentUserName: string;
  currentUserPhoto: string;
  partnerName: string;
  partnerPhoto: string;
  partnerRole: UserRole;
  partnerOnline: boolean;
  updateProfile: (updates: Partial<CoupleProfile>) => void;
  switchCurrentUserRole: (role: UserRole) => void;
  triggerAction: (action: AffectionActionType, customMsg?: string, incomingPayload?: RealtimePayload | boolean) => void;
  dismissAction: () => void;
  setShowOnboarding: (show: boolean) => void;
  updateCoupons: (coupons: ScratchCoupon[]) => void;
  updateProfilePhoto: (role: UserRole, photoDataUrl: string) => void;
  broadcastMoodChange: (role: 'boyfriend' | 'girlfriend', mood: string) => void;
  broadcastCouponChange: (coupons: ScratchCoupon[]) => void;
  resetAllData: () => void;
}

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

export const CoupleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<CoupleProfile>(loadProfile);
  const [stats, setStats] = useState<AffectionStats>(loadStats);
  const [coupons, setCoupons] = useState<ScratchCoupon[]>(loadCoupons);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!profile.isConfigured);
  const [partnerOnline, setPartnerOnline] = useState<boolean>(false);

  const [actionState, setActionState] = useState<ActionAnimationState>({
    active: false,
    action: null,
    senderRole: profile.currentUserRole,
    targetRole: profile.currentUserRole === 'boyfriend' ? 'girlfriend' : 'boyfriend',
    senderName: '',
    targetName: '',
    sweetMessage: '',
  });

  // Keep state in sync with local storage
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveStats(stats);
    saveCloudData({ stats });
  }, [stats]);

  useEffect(() => {
    saveCoupons(coupons);
    saveCloudData({ coupons });
  }, [coupons]);

  const currentUserName =
    profile.currentUserRole === 'boyfriend' ? profile.boyfriendName : profile.girlfriendName;
  const currentUserPhoto =
    profile.currentUserRole === 'boyfriend' ? profile.boyfriendPhoto : profile.girlfriendPhoto;

  const partnerRole: UserRole =
    profile.currentUserRole === 'boyfriend' ? 'girlfriend' : 'boyfriend';
  const partnerName =
    partnerRole === 'boyfriend' ? profile.boyfriendName : profile.girlfriendName;
  const partnerPhoto =
    partnerRole === 'boyfriend' ? profile.boyfriendPhoto : profile.girlfriendPhoto;

  const updateProfile = (updates: Partial<CoupleProfile>) => {
    setProfile((prev) => {
      const next = { ...prev };

      if (updates.currentUserRole) next.currentUserRole = updates.currentUserRole;
      if (updates.boyfriendName) next.boyfriendName = updates.boyfriendName;
      if (updates.girlfriendName) next.girlfriendName = updates.girlfriendName;
      if (updates.boyfriendMood) next.boyfriendMood = updates.boyfriendMood;
      if (updates.girlfriendMood) next.girlfriendMood = updates.girlfriendMood;
      if (updates.relationshipStartDate) next.relationshipStartDate = updates.relationshipStartDate;
      if (typeof updates.isConfigured === 'boolean') next.isConfigured = updates.isConfigured;
      if (typeof updates.soundEnabled === 'boolean') next.soundEnabled = updates.soundEnabled;
      if (typeof updates.ambientMusicEnabled === 'boolean') next.ambientMusicEnabled = updates.ambientMusicEnabled;

      // Only overwrite photo if updates provides a real custom photo, or if prev didn't have one
      if (updates.boyfriendPhoto) {
        if (isCustomPhoto(updates.boyfriendPhoto) || !isCustomPhoto(prev.boyfriendPhoto)) {
          next.boyfriendPhoto = updates.boyfriendPhoto;
        }
      }
      if (updates.girlfriendPhoto) {
        if (isCustomPhoto(updates.girlfriendPhoto) || !isCustomPhoto(prev.girlfriendPhoto)) {
          next.girlfriendPhoto = updates.girlfriendPhoto;
        }
      }

      if (isCustomPhoto(updates.boyfriendPhoto) || isCustomPhoto(updates.girlfriendPhoto)) {
        saveCloudData({
          ...(isCustomPhoto(next.boyfriendPhoto) ? { boyfriendPhoto: next.boyfriendPhoto } : {}),
          ...(isCustomPhoto(next.girlfriendPhoto) ? { girlfriendPhoto: next.girlfriendPhoto } : {}),
        });
      }
      return next;
    });
  };

  const updateProfilePhoto = (role: UserRole, photoDataUrl: string) => {
    const isBf = role === 'boyfriend';
    setProfile((prev) => ({
      ...prev,
      [isBf ? 'boyfriendPhoto' : 'girlfriendPhoto']: photoDataUrl,
    }));
    saveCloudData({
      [isBf ? 'boyfriendPhoto' : 'girlfriendPhoto']: photoDataUrl,
    });
    soundFx.playCelebration();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
    });

    // Immediately push high-resolution photo to cloud store, then notify partner
    pushToCloudNow().then(() => {
      realtimeHub.publish({
        type: 'PHOTO_UPDATE',
        clientId: getClientId(),
        senderRole: profile.currentUserRole,
        senderName: currentUserName,
        data: {
          role,
          hasCloudPhoto: true,
        },
        timestamp: Date.now(),
      });
    });
  };

  const switchCurrentUserRole = (role: UserRole) => {
    setProfile((prev) => ({ ...prev, currentUserRole: role }));
    soundFx.playPop(520, 0.08);
  };

  const triggerAction = (
    action: AffectionActionType,
    customMsg?: string,
    incomingPayload?: RealtimePayload | boolean
  ) => {
    const isRemote = typeof incomingPayload === 'object' && incomingPayload !== null;
    const remotePayload = isRemote ? (incomingPayload as RealtimePayload) : undefined;

    // If remotely triggered by partner, preserve their exact senderRole/targetRole
    const senderRole: UserRole = remotePayload?.senderRole || profile.currentUserRole;
    const targetRole: UserRole = remotePayload?.targetRole || partnerRole;
    const senderName: string = remotePayload?.senderName || currentUserName;
    const targetName: string = remotePayload?.targetName || partnerName;

    let defaultMsg = '';
    switch (action) {
      case 'kiss':
        defaultMsg = `💋 ${senderName} sent a warm, passionate kiss to ${targetName}!`;
        if (profile.soundEnabled) soundFx.playKiss();
        // Heart confetti burst
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#fb7185', '#fda4af', '#e11d48'],
          shapes: ['circle'],
        });
        setStats((prev) => ({ ...prev, totalKisses: prev.totalKisses + 1 }));
        break;

      case 'hug':
        defaultMsg =
          senderRole === 'boyfriend'
            ? `🫂 ${profile.boyfriendName} wraps his arms around his angel ${profile.girlfriendName} in a warm, tight embrace!`
            : `🫂 ${profile.girlfriendName} wraps her arms around ${profile.boyfriendName} with all her love!`;
        if (profile.soundEnabled) soundFx.playHug();
        confetti({
          particleCount: 40,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#c084fc', '#f472b6', '#fed7aa'],
        });
        setStats((prev) => ({ ...prev, totalHugs: prev.totalHugs + 1 }));
        break;

      case 'carry':
        if (senderRole === 'boyfriend') {
          defaultMsg = `👑 ${profile.boyfriendName} gently sweeps his angel ${profile.girlfriendName} into his arms like a true princess!`;
        } else {
          defaultMsg = `👑 ${profile.girlfriendName} leaps into ${profile.boyfriendName}'s strong arms and snuggles close!`;
        }
        if (profile.soundEnabled) soundFx.playCarry();
        confetti({
          particleCount: 70,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#f43f5e', '#ec4899', '#a855f7'],
        });
        setStats((prev) => ({ ...prev, totalCarries: prev.totalCarries + 1 }));
        break;

      case 'handhold':
        defaultMsg =
          senderRole === 'boyfriend'
            ? `🤝 ${profile.boyfriendName} holds his angel ${profile.girlfriendName}'s hand, bound by destiny!`
            : `🤝 ${profile.girlfriendName} intertwines her fingers with ${profile.boyfriendName}'s hand!`;
        if (profile.soundEnabled) soundFx.playHug();
        setStats((prev) => ({ ...prev, totalHandHolds: prev.totalHandHolds + 1 }));
        break;

      case 'feed':
        defaultMsg =
          senderRole === 'boyfriend'
            ? `🍓 ${profile.boyfriendName} lovingly feeds sweet treats and strawberries to his angel ${profile.girlfriendName}!`
            : `🍓 ${profile.girlfriendName} feeds delicious sweet treats and chocolates to ${profile.boyfriendName}!`;
        if (profile.soundEnabled) soundFx.playPop(680, 0.12);
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#fda4af', '#fcd34d', '#f43f5e'],
        });
        setStats((prev) => ({ ...prev, totalTreats: prev.totalTreats + 1 }));
        break;

      case 'tickle':
        defaultMsg = `🪶 Tickle attack on ${targetName}! Can you hear the adorable giggles?`;
        if (profile.soundEnabled) soundFx.playTickle();
        setStats((prev) => ({ ...prev, totalTickles: prev.totalTickles + 1 }));
        break;

      case 'headpat':
        defaultMsg = `💆 Gentle head pats and hair ruffling for ${targetName}. You are so precious!`;
        if (profile.soundEnabled) soundFx.playPop(550, 0.1);
        break;

      case 'whisper':
        defaultMsg = customMsg || getRandomWhisper(senderName, targetName);
        if (profile.soundEnabled) soundFx.playRomanticSigh();
        break;
    }

    const finalMsg = customMsg || defaultMsg;

    setActionState({
      active: true,
      action,
      senderRole,
      targetRole,
      senderName,
      targetName,
      sweetMessage: finalMsg,
    });

    // Only publish if this was locally initiated
    if (!isRemote && incomingPayload !== true) {
      realtimeHub.publish({
        type: 'LIVE_AFFECTION',
        clientId: getClientId(),
        senderRole: profile.currentUserRole,
        targetRole: partnerRole,
        senderName: currentUserName,
        targetName: partnerName,
        data: { action, customMsg: finalMsg },
        timestamp: Date.now(),
      });
    }

    // Auto-dismiss after 4.2 seconds
    setTimeout(() => {
      setActionState((prev) => ({ ...prev, active: false }));
    }, 4200);
  };

  const broadcastMoodChange = (role: 'boyfriend' | 'girlfriend', mood: string) => {
    setProfile((prev) => ({
      ...prev,
      [role === 'boyfriend' ? 'boyfriendMood' : 'girlfriendMood']: mood,
    }));
    realtimeHub.publish({
      type: 'MOOD_UPDATE',
      clientId: getClientId(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      data: { role, mood },
      timestamp: Date.now(),
    });
  };

  const broadcastCouponChange = (newCoupons: ScratchCoupon[]) => {
    setCoupons(newCoupons);
    realtimeHub.publish({
      type: 'COUPON_UPDATE',
      clientId: getClientId(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      data: { coupons: newCoupons },
      timestamp: Date.now(),
    });
  };

  const updateCoupons = (newCoupons: ScratchCoupon[]) => {
    broadcastCouponChange(newCoupons);
  };

  useEffect(() => {
    realtimeHub.connect(getRoomKey());
    realtimeHub.setUserInfo(profile.currentUserRole, currentUserName);

    // Initialize cloud persistence & recurring background sync
    const unsubCloudSync = startAutoCloudSync(25000);

    const unsubCloudData = onCloudDataLoaded((cloudData) => {
      if (Array.isArray(cloudData.coupons) && cloudData.coupons.length > 0) {
        setCoupons(cloudData.coupons);
      }
      if (cloudData.stats) {
        setStats(cloudData.stats);
      }
      if (isCustomPhoto(cloudData.boyfriendPhoto)) {
        setProfile((prev) => (prev.boyfriendPhoto === cloudData.boyfriendPhoto ? prev : { ...prev, boyfriendPhoto: cloudData.boyfriendPhoto! }));
      }
      if (isCustomPhoto(cloudData.girlfriendPhoto)) {
        setProfile((prev) => (prev.girlfriendPhoto === cloudData.girlfriendPhoto ? prev : { ...prev, girlfriendPhoto: cloudData.girlfriendPhoto! }));
      }
    });

    const unsubPresence = realtimeHub.onPartnerPresenceChange((online) => {
      setPartnerOnline(online);
    });

    const unsubEvents = realtimeHub.subscribe((payload) => {
      // realtimeHub already eliminates self-echo via clientId
      if (payload.type === 'LIVE_AFFECTION') {
        if (payload.data?.action && !payload.isHistorical) {
          triggerAction(payload.data.action, payload.data.customMsg, payload);
        }
      } else if (payload.type === 'MOOD_UPDATE') {
        if (payload.data?.role && payload.data?.mood) {
          setProfile((prev) => ({
            ...prev,
            [payload.data.role === 'boyfriend' ? 'boyfriendMood' : 'girlfriendMood']: payload.data.mood,
          }));
        }
      } else if (payload.type === 'COUPON_UPDATE') {
        if (Array.isArray(payload.data?.coupons)) {
          setCoupons(payload.data.coupons);
        }
      } else if (payload.type === 'DREAM_UPDATE') {
        if (Array.isArray(payload.data?.dreams)) {
          saveDreams(payload.data.dreams);
          saveCloudData({ dreams: payload.data.dreams });
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('love_app_dreams_sync', { detail: payload.data.dreams }));
          }
        }
      } else if (payload.type === 'NOTE_UPDATE') {
        if (Array.isArray(payload.data?.notes)) {
          saveLoveNotes(payload.data.notes);
          saveCloudData({ notes: payload.data.notes });
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('love_app_notes_sync', { detail: payload.data.notes }));
          }
        }
      } else if (payload.type === 'JOURNEY_UPDATE') {
        if (Array.isArray(payload.data?.milestones)) {
          saveMilestones(payload.data.milestones);
          saveCloudData({ milestones: payload.data.milestones });
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('love_app_milestones_sync', { detail: payload.data.milestones }));
          }
        }
      } else if (payload.type === 'MEMORY_UPDATE') {
        if (Array.isArray(payload.data?.memories)) {
          saveMemoriesToLocal(payload.data.memories);
          saveCloudData({ memories: payload.data.memories });
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('love_app_memories_sync', { detail: payload.data.memories }));
          }
        }
      } else if (payload.type === 'PHOTO_UPDATE') {
        if (payload.data?.role) {
          const { role, photo } = payload.data;
          soundFx.playCelebration();
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.5 },
          });

          if (isCustomPhoto(photo)) {
            setProfile((prev) => ({
              ...prev,
              [role === 'boyfriend' ? 'boyfriendPhoto' : 'girlfriendPhoto']: photo,
            }));
          }

          // Fetch the high-resolution photo from the cloud store
          fetchCloudData();
          setTimeout(() => {
            fetchCloudData();
          }, 1200);
        }
      }
    });

    return () => {
      unsubCloudSync();
      unsubCloudData();
      unsubPresence();
      unsubEvents();
    };
  }, [profile.currentUserRole, currentUserName, partnerRole, partnerName]);

  const dismissAction = () => {
    setActionState((prev) => ({ ...prev, active: false }));
  };

  const resetAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <CoupleContext.Provider
      value={{
        profile,
        stats,
        actionState,
        showOnboarding,
        coupons,
        currentUserName,
        currentUserPhoto,
        partnerName,
        partnerPhoto,
        partnerRole,
        partnerOnline,
        updateProfile,
        updateProfilePhoto,
        switchCurrentUserRole,
        triggerAction,
        dismissAction,
        setShowOnboarding,
        updateCoupons,
        broadcastMoodChange,
        broadcastCouponChange,
        resetAllData,
      }}
    >
      {children}
    </CoupleContext.Provider>
  );
};

export const useCouple = () => {
  const ctx = useContext(CoupleContext);
  if (!ctx) {
    throw new Error('useCouple must be used within a CoupleProvider');
  }
  return ctx;
};
