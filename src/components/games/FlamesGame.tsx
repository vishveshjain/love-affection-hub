import React, { useState, useEffect } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { calculateFlames } from '../../utils/flames';
import { FlamesResult } from '../../types';
import { soundFx } from '../../utils/audio';
import { realtimeHub, getClientId } from '../../utils/realtime';
import confetti from 'canvas-confetti';
import { Flame, Sparkles, RotateCcw, Heart, Zap, Award } from 'lucide-react';

export const FlamesGame: React.FC = () => {
  const { profile, currentUserName } = useCouple();

  const [name1, setName1] = useState(profile.boyfriendName);
  const [name2, setName2] = useState(profile.girlfriendName);
  const [result, setResult] = useState<FlamesResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  const runFlamesLogic = (n1: string, n2: string, fromRemote: boolean = false) => {
    setName1(n1);
    setName2(n2);
    soundFx.playPop(520, 0.08);

    const res = calculateFlames(n1, n2);
    setIsAnimating(true);
    setActiveStep(1);

    if (!fromRemote) {
      realtimeHub.publish({
        type: 'FLAMES_RUN',
        clientId: getClientId(),
        senderRole: profile.currentUserRole,
        senderName: currentUserName,
        data: { name1: n1, name2: n2 },
        timestamp: Date.now(),
      });
    }

    // Step 1: Cross-out animation
    setTimeout(() => {
      soundFx.playPop(620, 0.08);
      setActiveStep(2);
    }, 1200);

    // Step 2: Elimination sequence
    setTimeout(() => {
      soundFx.playPop(720, 0.08);
      setActiveStep(3);
    }, 2200);

    // Step 3: Final Reveal
    setTimeout(() => {
      setResult(res);
      setIsAnimating(false);
      soundFx.playCelebration();
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#fbbf24', '#8b5cf6'],
      });
    }, 3200);
  };

  const handleRunFlames = () => {
    if (!name1.trim() || !name2.trim()) return;
    runFlamesLogic(name1.trim(), name2.trim(), false);
  };

  useEffect(() => {
    const unsub = realtimeHub.subscribe((payload) => {
      if (payload.type === 'FLAMES_RUN' && payload.data?.name1 && payload.data?.name2) {
        runFlamesLogic(payload.data.name1, payload.data.name2, true);
      }
    });
    return unsub;
  }, []);

  const handleReset = () => {
    setResult(null);
    setIsAnimating(false);
    setActiveStep(0);
    soundFx.playPop(480, 0.05);
  };

  const flamesLetters = [
    { letter: 'F', word: 'Friends', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { letter: 'L', word: 'Lovers', color: 'bg-rose-100 text-rose-700 border-rose-300' },
    { letter: 'A', word: 'Affection', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    { letter: 'M', word: 'Marriage', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { letter: 'E', word: 'Enemies', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { letter: 'S', word: 'Soulmates', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  ];

  return (
    <div className="p-6 md:p-8 rounded-3xl glass-card border border-rose-200 shadow-xl relative overflow-hidden">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-bold mb-2">
          <Flame className="w-3.5 h-3.5 fill-rose-500" /> Classic Romance Game
        </span>
        <h3 className="text-2xl font-extrabold text-slate-800">
          The Legendary FLAMES Calculator 🔥
        </h3>
        <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Strike out common letters to reveal the destiny of your love: Friends, Lovers, Affection, Marriage, or Soulmates!
        </p>
      </div>

      {/* Name Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
            Boyfriend's Name
          </label>
          <input
            type="text"
            value={name1}
            onChange={(e) => setName1(e.target.value)}
            placeholder="Boyfriend"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold text-slate-800 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
            Girlfriend's Name
          </label>
          <input
            type="text"
            value={name2}
            onChange={(e) => setName2(e.target.value)}
            placeholder="Girlfriend"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold text-slate-800 text-sm"
          />
        </div>
      </div>

      {/* Action Button */}
      {!result && !isAnimating && (
        <div className="text-center mb-6">
          <button
            type="button"
            onClick={handleRunFlames}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:opacity-95 text-white font-bold text-base shadow-lg shadow-rose-500/25 transition-all transform active:scale-95"
          >
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>Discover Our Destiny</span>
          </button>
        </div>
      )}

      {/* ANIMATION SEQUENCE */}
      {isAnimating && (
        <div className="max-w-md mx-auto my-6 p-6 rounded-2xl bg-rose-50/70 border border-rose-200 text-center space-y-4 animate-pulse">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500 animate-spin" />
            <span className="font-bold text-slate-700 text-sm">
              {activeStep === 1 && 'Striking out common letters...'}
              {activeStep === 2 && 'Summing the remaining cosmic letters...'}
              {activeStep === 3 && 'Cycling through F-L-A-M-E-S...'}
            </span>
          </div>

          <div className="flex justify-center gap-2 text-2xl font-black text-rose-600">
            {['F', 'L', 'A', 'M', 'E', 'S'].map((l, i) => (
              <span
                key={l}
                className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center animate-bounce"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* RESULT DISPLAY */}
      {result && (
        <div className="max-w-md mx-auto my-4 p-6 rounded-3xl bg-gradient-to-b from-rose-50 via-white to-pink-50 border-2 border-rose-300 shadow-xl text-center animate-fade-in relative">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-extrabold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" /> Destiny Confirmed
          </span>

          <div className="my-3">
            <span className="text-6xl filter drop-shadow">
              {result.resultLetter === 'L' && '💖'}
              {result.resultLetter === 'M' && '💍'}
              {result.resultLetter === 'A' && '🫂'}
              {result.resultLetter === 'S' && '✨'}
              {result.resultLetter === 'F' && '👫'}
              {result.resultLetter === 'E' && '🔥'}
            </span>
            <h4 className="text-3xl font-black text-slate-800 mt-2">
              {result.resultWord}
            </h4>
          </div>

          {/* Love percentage meter */}
          <div className="my-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Love Compatibility</span>
              <span className="text-rose-600 font-black text-sm">{result.percentage}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-1000"
                style={{ width: `${result.percentage}%` }}
              />
            </div>
          </div>

          <p className="text-sm font-medium text-slate-700 mt-3 leading-relaxed">
            "{result.description}"
          </p>

          <div className="mt-4 p-3 rounded-xl bg-white border border-rose-200 text-xs text-rose-700 font-semibold shadow-xs">
            💡 Couple Advice: {result.advice}
          </div>

          {/* FLAMES Letter badges */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-4">
            {flamesLetters.map(({ letter, word, color }) => {
              const isWinner = result.resultLetter === letter;
              return (
                <span
                  key={letter}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${color} ${
                    isWinner ? 'ring-2 ring-rose-500 scale-110 shadow-sm' : 'opacity-60 line-through'
                  }`}
                >
                  {letter} - {word}
                </span>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Test Different Names</span>
          </button>
        </div>
      )}
    </div>
  );
};
