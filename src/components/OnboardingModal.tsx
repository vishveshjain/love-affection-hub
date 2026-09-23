import React, { useState, useRef } from 'react';
import { useCouple } from '../context/CoupleContext';
import { UserRole } from '../types';
import { fileToDataUrl, DEFAULT_BOYFRIEND_AVATAR, DEFAULT_GIRLFRIEND_AVATAR } from '../utils/storage';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Upload, ArrowRight, UserCheck, Calendar } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { profile, updateProfile, showOnboarding, setShowOnboarding } = useCouple();

  const [step, setStep] = useState<number>(1);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(profile.currentUserRole);
  const [boyfriendName, setBoyfriendName] = useState(profile.boyfriendName || 'Vishvesh');
  const [girlfriendName, setGirlfriendName] = useState(
    profile.girlfriendName && profile.girlfriendName !== 'My Angel'
      ? profile.girlfriendName
      : 'Laura'
  );
  const [boyfriendPhoto, setBoyfriendPhoto] = useState(profile.boyfriendPhoto || DEFAULT_BOYFRIEND_AVATAR);
  const [girlfriendPhoto, setGirlfriendPhoto] = useState(profile.girlfriendPhoto || DEFAULT_GIRLFRIEND_AVATAR);
  const [relationshipStartDate, setRelationshipStartDate] = useState(profile.relationshipStartDate || '2026-08-25');

  const bfFileInputRef = useRef<HTMLInputElement | null>(null);
  const gfFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!showOnboarding) return null;

  const handleBfPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const dataUrl = await fileToDataUrl(e.target.files[0]);
        setBoyfriendPhoto(dataUrl);
        soundFx.playPop(600, 0.08);
      } catch (err) {
        console.error('Error reading photo', err);
      }
    }
  };

  const handleGfPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const dataUrl = await fileToDataUrl(e.target.files[0]);
        setGirlfriendPhoto(dataUrl);
        soundFx.playPop(600, 0.08);
      } catch (err) {
        console.error('Error reading photo', err);
      }
    }
  };

  const handleFinish = () => {
    updateProfile({
      currentUserRole,
      boyfriendName: boyfriendName.trim() || 'Vishvesh',
      girlfriendName: girlfriendName.trim() || 'Laura',
      boyfriendPhoto,
      girlfriendPhoto,
      relationshipStartDate,
      isConfigured: true,
    });
    setShowOnboarding(false);
    soundFx.playCelebration();
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#ec4899', '#a855f7', '#fbbf24'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white/95 p-6 md:p-8 shadow-2xl border border-rose-200">
        {/* Floating background heart badges */}
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-rose-200/50 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-28 h-28 bg-purple-200/50 rounded-full blur-xl pointer-events-none" />

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-10 bg-gradient-to-r from-rose-500 to-pink-500'
                  : s < step
                  ? 'w-6 bg-rose-300'
                  : 'w-4 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: Who are you? */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-rose-600 bg-rose-50 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Welcome to Our Love Nest
              </span>
              <h2 className="text-2xl font-bold text-slate-800">Who is visiting today?</h2>
              <p className="text-sm text-slate-500 mt-1">
                Tell us who is interacting so we can personalize all the kisses and hugs!
              </p>
            </div>

            {/* Role Picker */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setCurrentUserRole('boyfriend');
                  soundFx.playPop(520, 0.05);
                }}
                className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${
                  currentUserRole === 'boyfriend'
                    ? 'border-blue-500 bg-blue-50/70 shadow-md scale-102 ring-2 ring-blue-300/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-400 bg-blue-100 mb-3 shadow-inner">
                  <img
                    src={boyfriendPhoto}
                    alt="Boyfriend"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-slate-800">I am Boyfriend</span>
                <span className="text-xs text-slate-500 mt-0.5">The Handsome Prince 🤴</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentUserRole('girlfriend');
                  soundFx.playPop(560, 0.05);
                }}
                className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${
                  currentUserRole === 'girlfriend'
                    ? 'border-rose-500 bg-rose-50/70 shadow-md scale-102 ring-2 ring-rose-300/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-rose-400 bg-rose-100 mb-3 shadow-inner">
                  <img
                    src={girlfriendPhoto}
                    alt="Girlfriend"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-slate-800">I am Girlfriend</span>
                <span className="text-xs text-slate-500 mt-0.5">The Beautiful Queen 👸</span>
              </button>
            </div>

            {/* Names Input */}
            <div className="space-y-3 pt-2">
              <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 text-[11px] text-rose-700 font-medium">
                💡 Default names are prefilled as <strong>Vishvesh</strong> &amp; <strong>Laura</strong>. You can keep them or change them right here!
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Boyfriend's Name
                </label>
                <input
                  type="text"
                  value={boyfriendName}
                  onChange={(e) => setBoyfriendName(e.target.value)}
                  placeholder="e.g. Vishvesh"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold text-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Girlfriend's Name
                </label>
                <input
                  type="text"
                  value={girlfriendName}
                  onChange={(e) => setGirlfriendName(e.target.value)}
                  placeholder="e.g. Laura"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold text-slate-800 text-sm"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playPop(620, 0.08);
                setStep(2);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-rose-500/25 transition-all active:scale-98"
            >
              <span>Next: Upload Photos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Photo Uploads */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-pink-600 bg-pink-50 rounded-full mb-2">
                <Heart className="w-3.5 h-3.5 fill-pink-500" /> Couple Photos
              </span>
              <h2 className="text-2xl font-bold text-slate-800">Add Your Photos</h2>
              <p className="text-sm text-slate-500 mt-1">
                Upload pictures of you and your sweetheart, or stick with cute avatars!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Boyfriend Photo Card */}
              <div className="flex flex-col items-center p-4 rounded-2xl border border-blue-200 bg-blue-50/40">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-3 border-blue-400 shadow-md mb-2">
                  <img
                    src={boyfriendPhoto}
                    alt="Boyfriend"
                    className="w-full h-full object-cover"
                  />
                  <div
                    onClick={() => bfFileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-xs font-medium"
                  >
                    <Upload className="w-4 h-4 mb-1" />
                    <span>Change</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-800 mb-2 truncate max-w-full">
                  {boyfriendName}
                </span>
                <input
                  type="file"
                  ref={bfFileInputRef}
                  onChange={handleBfPhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bfFileInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                </button>
              </div>

              {/* Girlfriend Photo Card */}
              <div className="flex flex-col items-center p-4 rounded-2xl border border-rose-200 bg-rose-50/40">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-3 border-rose-400 shadow-md mb-2">
                  <img
                    src={girlfriendPhoto}
                    alt="Girlfriend"
                    className="w-full h-full object-cover"
                  />
                  <div
                    onClick={() => gfFileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-xs font-medium"
                  >
                    <Upload className="w-4 h-4 mb-1" />
                    <span>Change</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-800 mb-2 truncate max-w-full">
                  {girlfriendName}
                </span>
                <input
                  type="file"
                  ref={gfFileInputRef}
                  onChange={handleGfPhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => gfFileInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop(620, 0.08);
                  setStep(3);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-rose-500/25 transition-all active:scale-98"
              >
                <span>Next: Special Anniversary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Anniversary & Ready */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-purple-600 bg-purple-50 rounded-full mb-2">
                <Calendar className="w-3.5 h-3.5" /> Love Milestone
              </span>
              <h2 className="text-2xl font-bold text-slate-800">Our Love Story Began</h2>
              <p className="text-sm text-slate-500 mt-1">
                Choose your anniversary date or when you first fell for each other!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 border border-rose-200">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Anniversary Date
              </label>
              <input
                type="date"
                value={relationshipStartDate}
                onChange={(e) => setRelationshipStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium text-slate-800 text-sm bg-white"
              />
            </div>

            <div className="rounded-2xl p-4 bg-rose-50/60 border border-rose-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-600">
                You can change photos, switch between girlfriend/boyfriend view, or edit names anytime from the top bar!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:opacity-95 text-white font-bold text-base shadow-xl shadow-rose-500/30 transition-all transform active:scale-98"
              >
                <UserCheck className="w-5 h-5" />
                <span>Enter Our Love Nest 💖</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
