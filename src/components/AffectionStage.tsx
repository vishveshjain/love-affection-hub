import React, { useState, useRef } from 'react';
import { useCouple } from '../context/CoupleContext';
import { Heart, Sparkles, X, Smile, Star, Camera } from 'lucide-react';
import { fileToDataUrl } from '../utils/storage';

const MOOD_OPTIONS = [
  'Totally smitten 🥰',
  'Needs 100 kisses 🥺💋',
  'Loving you 3000 ❤️',
  'Needs warm cuddles 🧸',
  'Playful monster 😈',
  'Sleepy sweetheart 😴',
  'Proudest partner 🌟',
];

export const AffectionStage: React.FC = () => {
  const {
    profile,
    updateProfile,
    updateProfilePhoto,
    actionState,
    dismissAction,
    stats,
    setShowOnboarding,
    partnerOnline,
    partnerName,
    broadcastMoodChange,
  } = useCouple();
  const [editingBfMood, setEditingBfMood] = useState(false);
  const [editingGfMood, setEditingGfMood] = useState(false);
  const [lastKissTarget, setLastKissTarget] = useState<'boyfriend' | 'girlfriend' | null>(null);

  const bfPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const gfPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const handleBfPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const dataUrl = await fileToDataUrl(e.target.files[0]);
        updateProfilePhoto('boyfriend', dataUrl);
      } catch (err) {
        console.error('Error updating boyfriend photo', err);
      }
    }
  };

  const handleGfPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const dataUrl = await fileToDataUrl(e.target.files[0]);
        updateProfilePhoto('girlfriend', dataUrl);
      } catch (err) {
        console.error('Error updating girlfriend photo', err);
      }
    }
  };

  // When a kiss action triggers, track the receiver to show lipstick mark
  React.useEffect(() => {
    if (actionState.active && actionState.action === 'kiss') {
      setLastKissTarget(actionState.targetRole);
    }
  }, [actionState]);

  // Determine stage layout animations based on active action
  const isKissing = actionState.active && actionState.action === 'kiss';
  const isHugging = actionState.active && actionState.action === 'hug';
  const isCarrying = actionState.active && actionState.action === 'carry';
  const isHandholding = actionState.active && actionState.action === 'handhold';
  const isTickling = actionState.active && actionState.action === 'tickle';
  const isFeeding = actionState.active && actionState.action === 'feed';

  const bfIsSender = actionState.senderRole === 'boyfriend';

  return (
    <section className="relative w-full py-6 px-4">
      {/* Live Internet Presence Status Banner */}
      <div className="max-w-md mx-auto mb-4 flex items-center justify-center">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
            partnerOnline
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 ring-2 ring-emerald-400/20 animate-pulse'
              : 'bg-white/80 text-slate-500 border border-rose-100'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              partnerOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-400' : 'bg-slate-300'
            }`}
          />
          {partnerOnline ? (
            <span>🟢 {partnerName} is online with you right now! 💕</span>
          ) : (
            <span>Waiting for {partnerName} to connect...</span>
          )}
        </div>
      </div>
      {/* Active Action Floating Banner */}
      {actionState.active && (
        <div className="max-w-xl mx-auto mb-6 p-4 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white shadow-xl shadow-rose-500/25 flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-spin">💖</span>
            <div>
              <p className="font-bold text-sm md:text-base leading-tight">
                {actionState.sweetMessage}
              </p>
              <p className="text-xs text-rose-100 font-medium">Affection meter rising!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissAction}
            className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* The Couple Stage Container */}
      <div className="relative max-w-4xl mx-auto min-h-[380px] md:min-h-[420px] flex flex-col md:flex-row items-center justify-around gap-6 p-6 md:p-10 rounded-3xl glass-panel-romantic shadow-xl border border-rose-200/80 overflow-hidden">
        {/* Decorative Background Aura */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-pink-100/30 to-purple-100/20 pointer-events-none" />

        {/* Dynamic Hug Aura & Heart Halo when hugging */}
        {isHugging && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 animate-pulse">
            <div className="w-80 h-80 md:w-[450px] md:h-[450px] rounded-full bg-gradient-to-tr from-pink-400/35 via-rose-300/35 to-purple-400/35 blur-3xl animate-ping" />
            <div className="absolute -top-4 text-4xl animate-bounce">🫂💖✨</div>
          </div>
        )}

        {/* Dynamic Connecting Handhold Destiny Thread & Clasping Hands */}
        {isHandholding && (
          <div className="absolute inset-x-1/4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center pointer-events-none animate-pulse">
            <div className="w-full h-1.5 bg-gradient-to-r from-blue-400 via-rose-400 to-pink-400 rounded-full shadow-lg shadow-rose-300" />
            <div className="flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full bg-white/95 border border-rose-300 shadow-md">
              <span className="text-2xl animate-bounce">🤝</span>
              <span className="text-xs font-bold text-rose-600">Holding My Angel Tight</span>
              <span className="text-lg">💍✨</span>
            </div>
          </div>
        )}

        {/* Flying projectile for Kiss */}
        {isKissing && (
          <div
            className={`absolute top-1/3 z-30 pointer-events-none ${
              bfIsSender
                ? 'left-[25%] animate-fly-kiss-ltr'
                : 'right-[25%] animate-fly-kiss-rtl'
            }`}
          >
            <span className="text-4xl md:text-6xl drop-shadow-lg">💋</span>
          </div>
        )}

        {/* Feeding animation projectile */}
        {isFeeding && (
          <div
            className={`absolute top-1/3 z-30 pointer-events-none ${
              bfIsSender
                ? 'left-[25%] animate-fly-kiss-ltr'
                : 'right-[25%] animate-fly-kiss-rtl'
            }`}
          >
            <div className="flex items-center gap-1 text-4xl md:text-5xl drop-shadow-lg animate-bounce">
              <span>🍓</span>
              <span className="text-2xl">🧁✨</span>
            </div>
          </div>
        )}

        {/* ================= BOYFRIEND CARD (VISHVESH) ================= */}
        <div
          className={`relative z-10 flex flex-col items-center text-center transition-all duration-700 ease-out transform ${
            isHugging
              ? 'md:translate-x-32 translate-y-6 scale-105'
              : isCarrying
              ? 'md:translate-x-28 md:translate-y-6 scale-110'
              : isTickling && actionState.targetRole === 'boyfriend'
              ? 'animate-wiggle'
              : 'hover:scale-102'
          }`}
        >
          {/* Active Speaker / Current User Halo */}
          <div className="relative">
            {profile.currentUserRole === 'boyfriend' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1 whitespace-nowrap">
                <Sparkles className="w-3 h-3" /> You are interacting
              </span>
            )}

            {/* Boyfriend Photo Frame */}
            <div
              onClick={() => {
                if (profile.currentUserRole === 'boyfriend') {
                  bfPhotoInputRef.current?.click();
                }
              }}
              className={`relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 transition-all duration-300 shadow-xl bg-white ${
                profile.currentUserRole === 'boyfriend'
                  ? 'border-blue-500 ring-4 ring-blue-300/60 cursor-pointer group'
                  : 'border-slate-300 hover:border-blue-400'
              } ${lastKissTarget === 'boyfriend' && isKissing ? 'ring-8 ring-rose-400 animate-bounce' : ''}`}
            >
              <img
                src={profile.boyfriendPhoto}
                alt={profile.boyfriendName}
                className="w-full h-full object-cover"
              />

              {/* Camera hover badge if current user is boyfriend */}
              {profile.currentUserRole === 'boyfriend' && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-bold gap-1 pointer-events-none">
                  <Camera className="w-5 h-5 text-white animate-pulse" />
                  <span>Change Photo</span>
                </div>
              )}

              {/* Lipstick Kiss Stamp when kissed! */}
              {lastKissTarget === 'boyfriend' && (
                <div className="absolute top-4 right-4 text-3xl md:text-4xl animate-wiggle drop-shadow-md select-none pointer-events-none">
                  💋
                </div>
              )}

              {/* Blush effect when kissed */}
              {lastKissTarget === 'boyfriend' && isKissing && (
                <div className="absolute inset-0 bg-rose-500/20 mix-blend-color-burn pointer-events-none" />
              )}
            </div>

            {/* Direct Camera button on avatar ring for Boyfriend */}
            {profile.currentUserRole === 'boyfriend' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  bfPhotoInputRef.current?.click();
                }}
                title="Upload my profile picture"
                className="absolute bottom-0 right-2 z-20 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-2 border-white hover:scale-110 active:scale-95 transition"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Crown emoji on Boyfriend */}
            <span className="absolute -bottom-2 left-2 text-2xl filter drop-shadow">
              🤴
            </span>

            {/* ================= BOYFRIEND'S ANIMATED ARMS REACHING OUT TO LAURA ================= */}
            {isHugging && (
              <div className="absolute top-1/2 -right-16 md:-right-24 -translate-y-1/2 z-30 pointer-events-none transition-all duration-500">
                <svg
                  width="140"
                  height="100"
                  viewBox="0 0 140 100"
                  fill="none"
                  className="animate-pulse filter drop-shadow-md"
                >
                  {/* Blue sleeve arm curving towards Laura */}
                  <path
                    d="M 10 50 C 45 25, 85 35, 125 55"
                    stroke="#3b82f6"
                    strokeWidth="22"
                    strokeLinecap="round"
                  />
                  {/* Forearm & Hand clasping Laura's back */}
                  <path
                    d="M 105 50 C 120 58, 130 68, 135 80"
                    stroke="#fed7aa"
                    strokeWidth="18"
                    strokeLinecap="round"
                  />
                  {/* Hugging fingers */}
                  <circle cx="134" cy="82" r="7" fill="#fed7aa" />
                  <circle cx="127" cy="87" r="6" fill="#fed7aa" />
                </svg>
              </div>
            )}
          </div>

          <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 mt-4 flex items-center gap-1.5">
            <span>{profile.boyfriendName}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
              Boyfriend
            </span>
          </h3>

          {/* Interactive Mood Pill */}
          <div className="mt-2 relative">
            {editingBfMood ? (
              <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-48 bg-white shadow-2xl rounded-2xl p-2 border border-slate-200 z-30 space-y-1">
                {MOOD_OPTIONS.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => {
                      broadcastMoodChange('boyfriend', mood);
                      setEditingBfMood(false);
                    }}
                    className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition truncate"
                  >
                    {mood}
                  </button>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingBfMood(true)}
                title="Click to update mood"
                className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-white/90 border border-blue-200 text-slate-700 hover:bg-blue-50 transition shadow-xs"
              >
                <Smile className="w-3 h-3 text-blue-500" />
                <span>{profile.boyfriendMood}</span>
              </button>
            )}
          </div>

          {/* Change My Photo Button or Sync Status */}
          <input
            type="file"
            ref={bfPhotoInputRef}
            onChange={handleBfPhotoUpload}
            accept="image/*"
            className="hidden"
          />
          {profile.currentUserRole === 'boyfriend' ? (
            <button
              type="button"
              onClick={() => bfPhotoInputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-[11px] font-bold transition shadow-xs active:scale-95"
            >
              <Camera className="w-3 h-3 text-blue-600" />
              <span>Change My Photo 📷</span>
            </button>
          ) : (
            <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
              <span>Live synced from {profile.boyfriendName}</span>
            </div>
          )}
        </div>

        {/* ================= CENTER LOVE BRIDGE & STATS ================= */}
        <div className="relative z-10 flex flex-col items-center justify-center my-2 md:my-0">
          {/* Heart Emblem */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-400/40 animate-heartbeat">
            <Heart className="w-8 h-8 md:w-10 md:h-10 fill-white" />
          </div>

          <span className="text-xs font-romantic text-2xl md:text-3xl text-rose-600 font-bold mt-2">
            Vishvesh & Laura Forever
          </span>

          {/* Quick Stats Pills */}
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-600 flex-wrap justify-center">
            <div className="px-2.5 py-1 rounded-xl bg-white/80 border border-rose-200 shadow-xs flex items-center gap-1 font-semibold">
              <span>💋</span>
              <span>{stats.totalKisses} Kisses</span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-white/80 border border-rose-200 shadow-xs flex items-center gap-1 font-semibold">
              <span>🫂</span>
              <span>{stats.totalHugs} Hugs</span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-white/80 border border-rose-200 shadow-xs flex items-center gap-1 font-semibold">
              <span>👑</span>
              <span>{stats.totalCarries} Carries</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-rose-200 text-slate-700 hover:text-rose-600 text-[11px] font-bold shadow-xs hover:bg-rose-50 transition active:scale-95"
          >
            <span>📸 Update Photos &amp; Names</span>
          </button>
        </div>

        {/* ================= GIRLFRIEND CARD (LAURA / MY ANGEL) ================= */}
        <div
          className={`relative z-10 flex flex-col items-center text-center transition-all duration-700 ease-out transform ${
            isHugging
              ? 'md:-translate-x-32 -translate-y-6 scale-105'
              : isCarrying
              ? 'md:-translate-x-28 md:-translate-y-20 -rotate-3 scale-110'
              : isTickling && actionState.targetRole === 'girlfriend'
              ? 'animate-wiggle'
              : 'hover:scale-102'
          }`}
        >
          {/* Active Speaker / Current User Halo */}
          <div className="relative">
            {profile.currentUserRole === 'girlfriend' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1 whitespace-nowrap">
                <Sparkles className="w-3 h-3" /> You are interacting
              </span>
            )}

            {/* Girlfriend Photo Frame */}
            <div
              onClick={() => {
                if (profile.currentUserRole === 'girlfriend') {
                  gfPhotoInputRef.current?.click();
                }
              }}
              className={`relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 transition-all duration-300 shadow-xl bg-white ${
                profile.currentUserRole === 'girlfriend'
                  ? 'border-rose-500 ring-4 ring-rose-300/60 cursor-pointer group'
                  : 'border-slate-300 hover:border-rose-400'
              } ${lastKissTarget === 'girlfriend' && isKissing ? 'ring-8 ring-rose-400 animate-bounce' : ''}`}
            >
              <img
                src={profile.girlfriendPhoto}
                alt={profile.girlfriendName}
                className="w-full h-full object-cover"
              />

              {/* Camera hover badge if current user is girlfriend */}
              {profile.currentUserRole === 'girlfriend' && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-bold gap-1 pointer-events-none">
                  <Camera className="w-5 h-5 text-white animate-pulse" />
                  <span>Change Photo</span>
                </div>
              )}

              {/* Lipstick Kiss Stamp when kissed! */}
              {lastKissTarget === 'girlfriend' && (
                <div className="absolute top-4 right-4 text-3xl md:text-4xl animate-wiggle drop-shadow-md select-none pointer-events-none">
                  💋
                </div>
              )}

              {/* Blush effect when kissed */}
              {lastKissTarget === 'girlfriend' && isKissing && (
                <div className="absolute inset-0 bg-rose-500/20 mix-blend-color-burn pointer-events-none" />
              )}
            </div>

            {/* Direct Camera button on avatar ring for Girlfriend */}
            {profile.currentUserRole === 'girlfriend' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  gfPhotoInputRef.current?.click();
                }}
                title="Upload my profile picture"
                className="absolute bottom-0 right-2 z-20 p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg border-2 border-white hover:scale-110 active:scale-95 transition"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Tiara / Angel wings emoji on Girlfriend */}
            <span className="absolute -bottom-2 left-2 text-2xl filter drop-shadow">
              👼
            </span>

            {/* ================= GIRLFRIEND'S ANIMATED ARMS REACHING OUT TO VISHVESH ================= */}
            {isHugging && (
              <div className="absolute top-1/2 -left-16 md:-left-24 -translate-y-1/2 z-30 pointer-events-none transition-all duration-500">
                <svg
                  width="140"
                  height="100"
                  viewBox="0 0 140 100"
                  fill="none"
                  className="animate-pulse filter drop-shadow-md"
                >
                  {/* Pink sleeve arm curving towards Vishvesh */}
                  <path
                    d="M 130 50 C 95 25, 55 35, 15 55"
                    stroke="#ec4899"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  {/* Forearm & Hand clasping Vishvesh's back */}
                  <path
                    d="M 35 50 C 20 58, 10 68, 5 80"
                    stroke="#fed7aa"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  {/* Hugging fingers */}
                  <circle cx="6" cy="82" r="6.5" fill="#fed7aa" />
                  <circle cx="13" cy="87" r="5.5" fill="#fed7aa" />
                </svg>
              </div>
            )}

            {/* ================= CARRYING: SUPPORTIVE ARMS CRADLING LAURA ================= */}
            {isCarrying && (
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-48 text-center animate-bounce">
                <svg width="180" height="70" viewBox="0 0 180 70" fill="none" className="mx-auto">
                  {/* Vishvesh's strong protective arms lifting Laura */}
                  <path
                    d="M 10 60 Q 50 15 90 28 Q 130 15 170 60"
                    stroke="#3b82f6"
                    strokeWidth="18"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 40 32 Q 90 52 140 32"
                    stroke="#fed7aa"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/95 border border-rose-300 text-[11px] font-black text-rose-600 shadow-md">
                  <span>👑 Carried in Vishvesh's Arms ✨</span>
                </div>
              </div>
            )}
          </div>

          <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 mt-4 flex items-center gap-1.5">
            <span>{profile.girlfriendName}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">
              My Angel
            </span>
          </h3>

          {/* Interactive Mood Pill */}
          <div className="mt-2 relative">
            {editingGfMood ? (
              <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-48 bg-white shadow-2xl rounded-2xl p-2 border border-slate-200 z-30 space-y-1">
                {MOOD_OPTIONS.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => {
                      broadcastMoodChange('girlfriend', mood);
                      setEditingGfMood(false);
                    }}
                    className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition truncate"
                  >
                    {mood}
                  </button>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingGfMood(true)}
                title="Click to update mood"
                className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-white/90 border border-rose-200 text-slate-700 hover:bg-rose-50 transition shadow-xs"
              >
                <Smile className="w-3 h-3 text-rose-500" />
                <span>{profile.girlfriendMood}</span>
              </button>
            )}
          </div>

          {/* Change My Photo Button or Sync Status */}
          <input
            type="file"
            ref={gfPhotoInputRef}
            onChange={handleGfPhotoUpload}
            accept="image/*"
            className="hidden"
          />
          {profile.currentUserRole === 'girlfriend' ? (
            <button
              type="button"
              onClick={() => gfPhotoInputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[11px] font-bold transition shadow-xs active:scale-95"
            >
              <Camera className="w-3 h-3 text-rose-600" />
              <span>Change My Photo 📷</span>
            </button>
          ) : (
            <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block animate-pulse" />
              <span>Live synced from {profile.girlfriendName}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
