import React, { useState } from 'react';
import { useCouple } from '../context/CoupleContext';
import { soundFx } from '../utils/audio';
import { Heart, Volume2, VolumeX, Music, Settings, User, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    profile,
    updateProfile,
    switchCurrentUserRole,
    setShowOnboarding,
  } = useCouple();

  const [isAmbientOn, setIsAmbientOn] = useState(false);

  const handleToggleSound = () => {
    const nextVal = !profile.soundEnabled;
    updateProfile({ soundEnabled: nextVal });
    if (nextVal) soundFx.playPop(550, 0.08);
  };

  const handleToggleMusic = () => {
    const active = soundFx.toggleAmbient();
    setIsAmbientOn(active);
    updateProfile({ ambientMusicEnabled: active });
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-3 glass-panel border-b border-rose-100 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 flex-wrap">
        {/* Left: Couple Branding */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-md shadow-rose-300">
            <Heart className="w-5 h-5 fill-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-800 text-base md:text-lg tracking-tight">
                {profile.boyfriendName} & {profile.girlfriendName}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-semibold hidden sm:inline-block">
                Forever 💖
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span>Our Love Sanctuary</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </p>
          </div>
        </div>

        {/* Center: Role Switcher Pill */}
        <div className="flex items-center bg-rose-50/80 p-1 rounded-2xl border border-rose-200 text-xs shadow-inner">
          <button
            type="button"
            onClick={() => switchCurrentUserRole('girlfriend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              profile.currentUserRole === 'girlfriend'
                ? 'bg-rose-500 text-white shadow-sm scale-102'
                : 'text-rose-700 hover:text-rose-900 hover:bg-rose-100/60'
            }`}
          >
            <span>👸 {profile.girlfriendName}</span>
          </button>
          <button
            type="button"
            onClick={() => switchCurrentUserRole('boyfriend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              profile.currentUserRole === 'boyfriend'
                ? 'bg-blue-600 text-white shadow-sm scale-102'
                : 'text-blue-700 hover:text-blue-900 hover:bg-blue-100/60'
            }`}
          >
            <span>🤴 {profile.boyfriendName}</span>
          </button>
        </div>

        {/* Right: Audio & Settings Controls */}
        <div className="flex items-center gap-1.5">
          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={profile.soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            className={`p-2 rounded-xl border transition ${
              profile.soundEnabled
                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
            }`}
          >
            {profile.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Dreamy Ambient Music Toggle */}
          <button
            type="button"
            onClick={handleToggleMusic}
            title={isAmbientOn ? 'Stop Ambient Romantic Music' : 'Play Ambient Romantic Music'}
            className={`p-2 rounded-xl border transition ${
              isAmbientOn
                ? 'bg-purple-100 border-purple-300 text-purple-700 animate-pulse'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-purple-50 hover:text-purple-600'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Edit Profile / Photos Modal Trigger */}
          <button
            type="button"
            onClick={() => {
              soundFx.playPop(580, 0.08);
              setShowOnboarding(true);
            }}
            title="Edit Names & Photos"
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-rose-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 text-xs font-semibold shadow-xs transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Edit Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
};
