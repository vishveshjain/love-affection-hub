import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
import {
  saveCloudData,
  startAutoCloudSync,
  onCloudDataLoaded,
  saveMemoriesToLocal,
  fetchCloudData,
  pushToCloudNow,
  savePhotoToCloud,
  fetchPhotosFromCloud,
  onPhotosLoaded,
} from '../utils/cloudStore';

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

  const profileRef = useRef(profile);
  profileRef.current = profile;

  const photoAssembler = useRef(
    new Map<
      string,
      {
        chunks: string[];
        total: number;
        role: 'boyfriend' | 'girlfriend';
        updatedAt: number;
        receivedCount: number;
      }
    >()
  );

  const isBroadcastingPhoto = useRef(false);
  const broadcastMyPhoto = async () => {
    if (isBroadcastingPhoto.current) return;
    const current = profileRef.current;
    const myRole = current.currentUserRole;
    const myPhoto = myRole === 'boyfriend' ? current.boyfriendPhoto : current.girlfriendPhoto;
    const myUpdatedAt =
      (myRole === 'boyfriend' ? current.boyfriendPhotoUpdatedAt : current.girlfriendPhotoUpdatedAt) || Date.now();

    if (isCustomPhoto(myPhoto)) {
      isBroadcastingPhoto.current = true;
      try {
        await realtimeHub.publishPhotoInChunks(myRole, myPhoto, myUpdatedAt);
      } catch (err) {
        console.warn('Error broadcasting photo chunks:', err);
      } finally {
        isBroadcastingPhoto.current = false;
      }
    }
  };

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
          if (isCustomPhoto(updates.boyfriendPhoto)) {
            const now = Date.now();
            next.boyfriendPhotoUpdatedAt = now;
            realtimeHub.publishPhotoInChunks('boyfriend', updates.boyfriendPhoto, now);
            savePhotoToCloud('boyfriend', updates.boyfriendPhoto, now).catch(() => {});
          }
        }
      }
      if (updates.girlfriendPhoto) {
        if (isCustomPhoto(updates.girlfriendPhoto) || !isCustomPhoto(prev.girlfriendPhoto)) {
          next.girlfriendPhoto = updates.girlfriendPhoto;
          if (isCustomPhoto(updates.girlfriendPhoto)) {
            const now = Date.now();
            next.girlfriendPhotoUpdatedAt = now;
            realtimeHub.publishPhotoInChunks('girlfriend', updates.girlfriendPhoto, now);
            savePhotoToCloud('girlfriend', updates.girlfriendPhoto, now).catch(() => {});
          }
        }
      }

      return next;
    });
  };

  const updateProfilePhoto = async (role: UserRole, photoDataUrl: string) => {
    const isBf = role === 'boyfriend';
    const now = Date.now();

    setProfile((prev) => ({
      ...prev,
      [isBf ? 'boyfriendPhoto' : 'girlfriendPhoto']: photoDataUrl,
      [isBf ? 'boyfriendPhotoUpdatedAt' : 'girlfriendPhotoUpdatedAt']: now,
    }));

    // Save to local profile
    const currentProf = loadProfile();
    currentProf[isBf ? 'boyfriendPhoto' : 'girlfriendPhoto'] = photoDataUrl;
    if (isBf) {
      currentProf.boyfriendPhotoUpdatedAt = now;
    } else {
      currentProf.girlfriendPhotoUpdatedAt = now;
    }
    saveProfile(currentProf);

    // Stream directly across real-time broker in chunks (bypasses CORS, size limits & cloud latency)
    await realtimeHub.publishPhotoInChunks(role === 'boyfriend' ? 'boyfriend' : 'girlfriend', photoDataUrl, now);

    // Also attempt cloud bin save as background backup
    savePhotoToCloud(role === 'boyfriend' ? 'boyfriend' : 'girlfriend', photoDataUrl, now).catch(() => {});

    soundFx.playCelebration();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
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
    });

    const unsubPhotos = onPhotosLoaded((photos) => {
      setProfile((prev) => {
        let changed = false;
        const next = { ...prev };
        if (
          isCustomPhoto(photos.boyfriendPhoto) &&
          (photos.boyfriendUpdatedAt || 0) >= (prev.boyfriendPhotoUpdatedAt || 0) &&
          prev.boyfriendPhoto !== photos.boyfriendPhoto
        ) {
          next.boyfriendPhoto = photos.boyfriendPhoto!;
          next.boyfriendPhotoUpdatedAt = photos.boyfriendUpdatedAt;
          changed = true;
        }
        if (
          isCustomPhoto(photos.girlfriendPhoto) &&
          (photos.girlfriendUpdatedAt || 0) >= (prev.girlfriendPhotoUpdatedAt || 0) &&
          prev.girlfriendPhoto !== photos.girlfriendPhoto
        ) {
          next.girlfriendPhoto = photos.girlfriendPhoto!;
          next.girlfriendPhotoUpdatedAt = photos.girlfriendUpdatedAt;
          changed = true;
        }
        return changed ? next : prev;
      });
    });

    const unsubPresence = realtimeHub.onPartnerPresenceChange((online) => {
      setPartnerOnline(online);
      if (online) {
        // Partner is online! Broadcast our photo and request partner's photo
        broadcastMyPhoto();
        realtimeHub.requestPartnerPhotos();
      }
    });

    // Request partner's photo and share ours on mount
    realtimeHub.requestPartnerPhotos();
    broadcastMyPhoto();

    const unsubEvents = realtimeHub.subscribe((payload) => {
      // realtimeHub already eliminates self-echo via clientId
      if (payload.type === 'LIVE_AFFECTION') {
        if (payload.data?.action && !payload.isHistorical) {
          triggerAction(payload.data.action, payload.data.customMsg, payload);
        }
      } else if (payload.type === 'PHOTO_REQUEST') {
        // Partner is requesting photos, broadcast our custom photo if set
        broadcastMyPhoto();
      } else if (payload.type === 'PHOTO_CHUNK') {
        const { photoId, role, chunkIndex, totalChunks, chunkData, updatedAt } = payload.data || {};
        if (photoId && role && typeof chunkIndex === 'number' && totalChunks && chunkData) {
          let entry = photoAssembler.current.get(photoId);
          if (!entry) {
            entry = {
              chunks: new Array(totalChunks),
              total: totalChunks,
              role,
              updatedAt: updatedAt || Date.now(),
              receivedCount: 0,
            };
            photoAssembler.current.set(photoId, entry);
          }
          if (!entry.chunks[chunkIndex]) {
            entry.chunks[chunkIndex] = chunkData;
            entry.receivedCount++;
          }
          if (entry.receivedCount === entry.total) {
            const fullPhotoUrl = entry.chunks.join('');
            photoAssembler.current.delete(photoId);

            const isBf = entry.role === 'boyfriend';
            const incomingTime = entry.updatedAt;

            setProfile((prev) => {
              const currentTime = (isBf ? prev.boyfriendPhotoUpdatedAt : prev.girlfriendPhotoUpdatedAt) || 0;
              const currentPhoto = isBf ? prev.boyfriendPhoto : prev.girlfriendPhoto;
              if (incomingTime >= currentTime || !isCustomPhoto(currentPhoto)) {
                const next = {
                  ...prev,
                  [isBf ? 'boyfriendPhoto' : 'girlfriendPhoto']: fullPhotoUrl,
                  [isBf ? 'boyfriendPhotoUpdatedAt' : 'girlfriendPhotoUpdatedAt']: incomingTime,
                };
                saveProfile(next);
                return next;
              }
              return prev;
            });

            if (!payload.isHistorical) {
              soundFx.playCelebration();
              confetti({
                particleCount: 50,
                spread: 65,
                origin: { y: 0.5 },
              });
            }
          }
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
          const { role, updatedAt } = payload.data;

          // Immediately fetch the partner's fresh HD photo from their dedicated cloud bin
          fetchPhotosFromCloud().then((cloudPhotos) => {
            if (cloudPhotos) {
              const isBf = role === 'boyfriend';
              const freshPhoto = isBf ? cloudPhotos.boyfriendPhoto : cloudPhotos.girlfriendPhoto;
              const photoTime = (isBf ? cloudPhotos.boyfriendUpdatedAt : cloudPhotos.girlfriendUpdatedAt) || updatedAt || Date.now();
              if (isCustomPhoto(freshPhoto)) {
                setProfile((prev) => {
                  const currentTime = (isBf ? prev.boyfriendPhotoUpdatedAt : prev.girlfriendPhotoUpdatedAt) || 0;
                  if (photoTime >= currentTime) {
                    return {
                      ...prev,
                      [isBf ? 'boyfriendPhoto' : 'girlfriendPhoto']: freshPhoto,
                      [isBf ? 'boyfriendPhotoUpdatedAt' : 'girlfriendPhotoUpdatedAt']: photoTime,
                    };
                  }
                  return prev;
                });
                soundFx.playCelebration();
                confetti({
                  particleCount: 50,
                  spread: 65,
                  origin: { y: 0.5 },
                });
              }
            }
          });
        }
      }
    });

    return () => {
      unsubCloudSync();
      unsubCloudData();
      unsubPhotos();
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
