import React, { useState, useEffect, useRef } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { HelpCircle, Sparkles, Award } from 'lucide-react';

const WHEEL_SLICES = [
  { text: 'Steal 3 Kisses', icon: '💋', color: '#f43f5e' },
  { text: '30-Sec Bear Hug', icon: '🫂', color: '#ec4899' },
  { text: 'Take Cute Selfie', icon: '📸', color: '#a855f7' },
  { text: 'Say 3 Compliments', icon: '✨', color: '#3b82f6' },
  { text: '30s Slow Dance', icon: '💃', color: '#10b981' },
  { text: 'Feed Sweet Bite', icon: '🍓', color: '#f59e0b' },
  { text: 'Forehead Kiss', icon: '💖', color: '#fb7185' },
  { text: 'Wildcard Choice', icon: '👑', color: '#8b5cf6' },
];

import { realtimeHub, getClientId } from '../../utils/realtime';

export const AffectionWheel: React.FC = () => {
  const { profile, currentUserName, partnerName } = useCouple();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedSlice, setSelectedSlice] = useState<(typeof WHEEL_SLICES)[0] | null>(null);
  const [spinnerLabel, setSpinnerLabel] = useState<string>('');

  const spin = (incomingIndex?: number, remoteSpinner?: string) => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedSlice(null);
    if (remoteSpinner) {
      setSpinnerLabel(`${remoteSpinner} is spinning the wheel! 🎡`);
    } else {
      setSpinnerLabel('');
    }
    soundFx.playPop(600, 0.08);

    const sliceCount = WHEEL_SLICES.length;
    const sliceAngle = 360 / sliceCount;
    const randomIndex = typeof incomingIndex === 'number' ? incomingIndex : Math.floor(Math.random() * sliceCount);

    if (typeof incomingIndex !== 'number') {
      realtimeHub.publish({
        type: 'WHEEL_SPIN',
        clientId: getClientId(),
        senderRole: profile.currentUserRole,
        senderName: currentUserName,
        data: { randomIndex, spinnerName: currentUserName },
        timestamp: Date.now(),
      });
    }

    // Extra spins (4 to 6 full rotations) + target slice angle
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 2));
    const targetAngle = extraSpins + (360 - (randomIndex * sliceAngle + sliceAngle / 2));
    const newRotation = rotation + targetAngle;

    setRotation(newRotation);

    // Play spinning ticks
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      soundFx.playPop(480 + (tickCount % 5) * 30, 0.02);
      tickCount++;
      if (tickCount > 24) clearInterval(tickInterval);
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setSelectedSlice(WHEEL_SLICES[randomIndex]);
      soundFx.playCelebration();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#fbbf24', '#3b82f6'],
      });
    }, 3800);
  };

  useEffect(() => {
    const unsub = realtimeHub.subscribe((payload) => {
      if (payload.type === 'WHEEL_SPIN' && typeof payload.data?.randomIndex === 'number') {
        spin(payload.data.randomIndex, payload.data.spinnerName || partnerName);
      }
    });
    return unsub;
  }, [rotation, isSpinning, partnerName]);

  const sliceAngle = 360 / WHEEL_SLICES.length;

  return (
    <div className="p-6 md:p-8 rounded-3xl glass-card border border-rose-200 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
        <Sparkles className="w-3.5 h-3.5" /> Fun Couple Roulette
      </span>
      <h3 className="text-2xl font-extrabold text-slate-800">
        The Affection Spin Wheel 🎡
      </h3>
      {spinnerLabel && (
        <div className="mt-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold animate-pulse">
          {spinnerLabel}
        </div>
      )}
      <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-md">
        Spin the wheel of romantic dares and sweet duties for you and {partnerName}!
      </p>

      {/* Wheel Stage */}
      <div className="relative my-8 w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        {/* Pointer Needle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-rose-600 filter drop-shadow-md" />

        {/* Outer Ring Shadow */}
        <div className="absolute inset-0 rounded-full border-8 border-white/80 shadow-2xl pointer-events-none z-10" />

        {/* Rotating SVG Wheel */}
        <div
          className="w-full h-full rounded-full overflow-hidden transition-transform duration-[3800ms] ease-out shadow-inner"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.2, 1)',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {WHEEL_SLICES.map((slice, index) => {
              const startDeg = index * sliceAngle;
              const endDeg = (index + 1) * sliceAngle;

              const x1 = 50 + 50 * Math.cos((Math.PI * (startDeg - 90)) / 180);
              const y1 = 50 + 50 * Math.sin((Math.PI * (startDeg - 90)) / 180);
              const x2 = 50 + 50 * Math.cos((Math.PI * (endDeg - 90)) / 180);
              const y2 = 50 + 50 * Math.sin((Math.PI * (endDeg - 90)) / 180);

              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

              // Text position along middle of wedge
              const midDeg = (startDeg + endDeg) / 2;
              const textX = 50 + 32 * Math.cos((Math.PI * (midDeg - 90)) / 180);
              const textY = 50 + 32 * Math.sin((Math.PI * (midDeg - 90)) / 180);

              return (
                <g key={index}>
                  <path d={pathData} fill={slice.color} stroke="#ffffff" strokeWidth="0.8" />
                  <text
                    x={textX}
                    y={textY}
                    fill="#ffffff"
                    fontSize="4"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midDeg}, ${textX}, ${textY})`}
                  >
                    {slice.icon}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Spin Hub */}
        <button
          type="button"
          disabled={isSpinning}
          onClick={() => spin()}
          className="absolute z-20 w-16 h-16 rounded-full bg-white shadow-xl border-4 border-rose-500 text-rose-600 font-extrabold text-xs flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition disabled:opacity-80"
        >
          <span>SPIN</span>
          <span className="text-[10px]">💖</span>
        </button>
      </div>

      {/* Result Announcement */}
      {selectedSlice && !isSpinning && (
        <div className="max-w-md w-full p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 border-2 border-rose-300 shadow-lg text-center animate-fade-in">
          <div className="text-3xl mb-1">{selectedSlice.icon}</div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Dare Selected!
          </span>
          <h4 className="text-xl font-black text-slate-800 mt-0.5">
            {selectedSlice.text}
          </h4>
          <p className="text-xs text-slate-600 mt-1">
            Now perform this loving action together with {partnerName}!
          </p>
        </div>
      )}
    </div>
  );
};
