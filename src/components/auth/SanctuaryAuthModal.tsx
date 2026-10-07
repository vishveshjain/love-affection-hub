import React, { useState, useEffect } from 'react';
import { useCouple } from '../../context/CoupleContext';
import {
  unlockSanctuary,
  createSanctuaryRoom,
  generateSuggestedRoomId,
  getKnownRooms,
  DEFAULT_ROOM_ID,
  DEFAULT_ROOM_PASSCODE,
} from '../../utils/security';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Lock,
  Unlock,
  KeyRound,
  Heart,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Shuffle,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface SanctuaryAuthModalProps {
  initialRoomFromUrl?: string;
}

export const SanctuaryAuthModal: React.FC<SanctuaryAuthModalProps> = ({ initialRoomFromUrl }) => {
  const {
    showAuthModal,
    closeAuthModal,
    isUnlocked,
    activeRoomId,
  } = useCouple();

  const [activeTab, setActiveTab] = useState<'unlock' | 'create'>('unlock');

  // Unlock form state
  const [unlockRoomId, setUnlockRoomId] = useState<string>('');
  const [unlockPasscode, setUnlockPasscode] = useState<string>('');
  const [unlockRemember, setUnlockRemember] = useState<boolean>(true);
  const [showUnlockPass, setShowUnlockPass] = useState<boolean>(false);
  const [unlockError, setUnlockError] = useState<string>('');

  // Create room state
  const [createRoomId, setCreateRoomId] = useState<string>('');
  const [createPasscode, setCreatePasscode] = useState<string>('');
  const [partner1Name, setPartner1Name] = useState<string>('');
  const [partner2Name, setPartner2Name] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [createRemember, setCreateRemember] = useState<boolean>(true);
  const [showCreatePass, setShowCreatePass] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);

  // Sync initial Room ID
  useEffect(() => {
    if (initialRoomFromUrl) {
      setUnlockRoomId(initialRoomFromUrl);
      setActiveTab('unlock');
    } else if (activeRoomId) {
      setUnlockRoomId(activeRoomId);
    }
  }, [initialRoomFromUrl, activeRoomId]);

  if (!showAuthModal) return null;

  const knownRooms = getKnownRooms();
  const roomKeys = Object.keys(knownRooms);

  const handleSuggestRoomId = () => {
    const sug = generateSuggestedRoomId();
    setCreateRoomId(sug);
    soundFx.playPop(520, 0.05);
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError('');
    setLoading(true);

    setTimeout(() => {
      const res = unlockSanctuary(unlockRoomId, unlockPasscode, unlockRemember);
      setLoading(false);

      if (res.success) {
        soundFx.playCelebration();
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#fbbf24', '#8b5cf6'],
        });
        closeAuthModal();
      } else {
        setUnlockError(res.error || 'Failed to unlock room');
        soundFx.playPop(300, 0.12);
      }
    }, 250);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setLoading(true);

    setTimeout(() => {
      const res = createSanctuaryRoom(
        createRoomId,
        createPasscode,
        partner1Name,
        partner2Name,
        startDate,
        createRemember
      );
      setLoading(false);

      if (res.success) {
        soundFx.playCelebration();
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#38bdf8', '#fbbf24'],
        });
        closeAuthModal();
      } else {
        setCreateError(res.error || 'Failed to create room');
        soundFx.playPop(300, 0.12);
      }
    }, 300);
  };

  const handleQuickCreatorEntry = () => {
    setUnlockRoomId(DEFAULT_ROOM_ID);
    setUnlockPasscode(DEFAULT_ROOM_PASSCODE);
    const res = unlockSanctuary(DEFAULT_ROOM_ID, DEFAULT_ROOM_PASSCODE, true);
    if (res.success) {
      soundFx.playCelebration();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
      closeAuthModal();
    }
  };

  return (
    <div
      onClick={(e) => {
        if (isUnlocked && e.target === e.currentTarget) {
          closeAuthModal();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-rose-100 shadow-2xl p-5 sm:p-7 space-y-5 my-8">
        {/* Floating gradient highlights */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-rose-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black bg-gradient-to-r from-rose-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Private Love Sanctuary
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 tracking-wider">
                  Zero Snooping 🔒
                </span>
              </div>
              <p className="text-xs text-slate-500">
                End-to-End Private Space for Couples Anywhere in the World
              </p>
            </div>
          </div>

          {/* Close button only available if sanctuary is already unlocked */}
          {isUnlocked && (
            <button
              type="button"
              onClick={closeAuthModal}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav Tabs: Enter Existing Sanctuary vs Create New Sanctuary */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('unlock');
              soundFx.playPop(520, 0.04);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition cursor-pointer ${
              activeTab === 'unlock'
                ? 'bg-white text-rose-700 shadow-sm border border-rose-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Enter Sanctuary</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              soundFx.playPop(520, 0.04);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white text-purple-700 shadow-sm border border-purple-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Sanctuary</span>
          </button>
        </div>

        {/* ================= TAB 1: UNLOCK / ENTER SANCTUARY ================= */}
        {activeTab === 'unlock' && (
          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            {unlockError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-semibold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{unlockError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide">
                Sanctuary Room Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={unlockRoomId}
                  onChange={(e) => setUnlockRoomId(e.target.value)}
                  placeholder="e.g. starry-haven-2026"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 text-sm font-semibold text-slate-800 focus:outline-none transition"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Both you and your partner share the exact same Room Code to sync together in private.
              </p>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide">
                Secret Passcode / PIN
              </label>
              <div className="relative">
                <input
                  type={showUnlockPass ? 'text' : 'password'}
                  required
                  value={unlockPasscode}
                  onChange={(e) => setUnlockPasscode(e.target.value)}
                  placeholder="Enter your secret passcode"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 text-sm font-semibold text-slate-800 focus:outline-none transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowUnlockPass(!showUnlockPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showUnlockPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unlockRemember}
                  onChange={(e) => setUnlockRemember(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400"
                />
                <span className="font-semibold">Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:scale-[1.01] active:scale-[0.99] text-white font-black text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
            >
              <Unlock className="w-4 h-4" />
              <span>{loading ? 'Unlocking...' : 'Unlock Our Sanctuary 💖'}</span>
            </button>

            {/* Quick 1-Click Entry for Vishvesh & Laura */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleQuickCreatorEntry}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 hover:bg-rose-100/70 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>👑 Quick Access: Vishvesh & Laura's Nest</span>
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              </button>
            </div>

            {/* Recent rooms list if any */}
            {roomKeys.length > 1 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Saved on this device:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {roomKeys.map((rId) => {
                    const r = knownRooms[rId];
                    return (
                      <button
                        key={rId}
                        type="button"
                        onClick={() => {
                          setUnlockRoomId(rId);
                          soundFx.playPop(520, 0.04);
                        }}
                        className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 font-semibold text-slate-700 border border-slate-200 transition cursor-pointer"
                      >
                        {r.partner1Name} & {r.partner2Name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        )}

        {/* ================= TAB 2: CREATE NEW SANCTUARY ================= */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {createError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-semibold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                  Choose A Room Code
                </label>
                <button
                  type="button"
                  onClick={handleSuggestRoomId}
                  className="text-xs text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Suggest Cute Code</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={createRoomId}
                onChange={(e) => setCreateRoomId(e.target.value)}
                placeholder="e.g. honey-paradise-2026"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 text-sm font-semibold text-slate-800 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide">
                Secret Passcode (PIN or Password)
              </label>
              <div className="relative">
                <input
                  type={showCreatePass ? 'text' : 'password'}
                  required
                  value={createPasscode}
                  onChange={(e) => setCreatePasscode(e.target.value)}
                  placeholder="Set your secret password or PIN"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 text-sm font-semibold text-slate-800 focus:outline-none transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePass(!showCreatePass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showCreatePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Partner 1 Name (e.g. He)
                </label>
                <input
                  type="text"
                  required
                  value={partner1Name}
                  onChange={(e) => setPartner1Name(e.target.value)}
                  placeholder="e.g. Romeo / Alex"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-400 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Partner 2 Name (e.g. She)
                </label>
                <input
                  type="text"
                  required
                  value={partner2Name}
                  onChange={(e) => setPartner2Name(e.target.value)}
                  placeholder="e.g. Juliet / Sarah"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-400 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Anniversary / Relationship Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-400 text-xs font-semibold text-slate-800"
              />
            </div>

            <div className="flex items-center text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createRemember}
                  onChange={(e) => setCreateRemember(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-400"
                />
                <span className="font-semibold">Keep me signed in on this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:scale-[1.01] active:scale-[0.99] text-white font-black text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Creating Sanctuary...' : 'Create & Enter Sanctuary ✨'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
