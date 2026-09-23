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
} from '../utils/storage';
import { soundFx } from '../utils/audio';

import { getRandomWhisper } from '../utils/whispers';
import { realtimeHub, getRoomKey } from '../utils/realtime';

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
  updateProfile: (updates: Partial<CoupleProfile>) => void;
  switchCurrentUserRole: (role: UserRole) => void;
  triggerAction: (action: AffectionActionType, customMsg?: string, skipPublish?: boolean) => void;
  dismissAction: () => void;
  setShowOnboarding: (show: boolean) => void;
  updateCoupons: (coupons: ScratchCoupon[]) => void;
  resetAllData: () => void;
}

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

export const CoupleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<CoupleProfile>(loadProfile);
  const [stats, setStats] = useState<AffectionStats>(loadStats);
  const [coupons, setCoupons] = useState<ScratchCoupon[]>(loadCoupons);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!profile.isConfigured);

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
  }, [stats]);

  useEffect(() => {
    saveCoupons(coupons);
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
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const switchCurrentUserRole = (role: UserRole) => {
    setProfile((prev) => ({ ...prev, currentUserRole: role }));
    soundFx.playPop(520, 0.08);
  };

  const triggerAction = (action: AffectionActionType, customMsg?: string, skipPublish = false) => {
    const senderRole = skipPublish ? partnerRole : profile.currentUserRole;
    const targetRole = skipPublish ? profile.currentUserRole : partnerRole;
    const senderName = skipPublish ? partnerName : currentUserName;
    const targetName = skipPublish ? currentUserName : partnerName;

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

    if (!skipPublish) {
      realtimeHub.publish({
        type: 'LIVE_AFFECTION',
        senderRole: profile.currentUserRole,
        senderName,
        data: { action, customMsg: finalMsg },
        timestamp: Date.now(),
      });
    }

    // Auto-dismiss after 4.2 seconds
    setTimeout(() => {
      setActionState((prev) => ({ ...prev, active: false }));
    }, 4200);
  };

  useEffect(() => {
    realtimeHub.connect(getRoomKey());
    const unsubscribe = realtimeHub.subscribe((payload) => {
      if (payload.type === 'LIVE_AFFECTION') {
        const isFresh = Date.now() - (payload.timestamp || 0) < 15000;
        if (payload.senderRole !== profile.currentUserRole && payload.data?.action && isFresh) {
          triggerAction(payload.data.action, payload.data.customMsg, true);
        }
      }
    });
    return unsubscribe;
  }, [profile.currentUserRole]);

  const dismissAction = () => {
    setActionState((prev) => ({ ...prev, active: false }));
  };

  const updateCoupons = (newCoupons: ScratchCoupon[]) => {
    setCoupons(newCoupons);
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
        updateProfile,
        switchCurrentUserRole,
        triggerAction,
        dismissAction,
        setShowOnboarding,
        updateCoupons,
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
