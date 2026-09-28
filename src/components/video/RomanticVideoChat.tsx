import React, { useState, useEffect, useRef } from 'react';
import { useCouple } from '../../context/CoupleContext';
import {
  videoCallService,
  ROMANTIC_THEMES,
  ROMANTIC_FILTERS,
  RomanticThemeId,
  RomanticFilterId,
} from '../../utils/webrtc';
import { romanticMusic } from '../../utils/romanticMusic';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  PhoneCall,
  Sparkles,
  Heart,
  Palette,
  Wand2,
  Volume2,
  VolumeX,
  Columns,
  ChevronLeft,
  Check,
} from 'lucide-react';

const ROMANTIC_EMOJIS = [
  { emoji: '💋', label: 'Sweet Kiss', soundFreq: 800 },
  { emoji: '💖', label: 'Hearts Burst', soundFreq: 600 },
  { emoji: '🥰', label: 'In Love', soundFreq: 550 },
  { emoji: '🫂', label: 'Warm Cuddle', soundFreq: 450 },
  { emoji: '🌹', label: 'Red Rose', soundFreq: 520 },
  { emoji: '💍', label: 'Promise', soundFreq: 700 },
  { emoji: '✨', label: 'Magic', soundFreq: 900 },
  { emoji: '🧸', label: 'Teddy Hug', soundFreq: 480 },
  { emoji: '🍓', label: 'Sweet Treat', soundFreq: 640 },
  { emoji: '💌', label: 'Love Letter', soundFreq: 580 },
];

interface RomanticVideoChatProps {
  onClose?: () => void;
}

// ================= ATMOSPHERIC BACKGROUND COMPONENT =================
const AtmosphericBackground: React.FC<{ themeId: RomanticThemeId }> = ({ themeId }) => {
  switch (themeId) {
    case 'moonlight':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Nebula Clouds */}
          <div className="absolute top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-purple-900/5 to-transparent blur-3xl opacity-60 animate-bokeh-drift" style={{ animationDuration: '30s' }} />
          <div className="absolute -bottom-1/4 -right-1/4 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/10 via-indigo-800/5 to-transparent blur-3xl opacity-50 animate-bokeh-drift" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />

          {/* Luminous Crescent Moon with Silver Corona and Rays */}
          <div className="absolute top-6 right-8 md:top-10 md:right-16 w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-slate-100 via-sky-100 to-indigo-200 shadow-[0_0_80px_rgba(186,230,253,0.6)] flex items-center justify-center opacity-95">
            <div className="w-5 h-5 rounded-full bg-slate-300/40 absolute top-4 left-6" />
            <div className="w-8 h-8 rounded-full bg-slate-300/30 absolute bottom-5 right-7" />
            <div className="w-3 h-3 rounded-full bg-slate-300/30 absolute top-12 left-12" />
            <div className="absolute inset-0 rounded-full shadow-[0_0_120px_rgba(255,255,255,0.4)] animate-flicker-glow" style={{ animationDuration: '8s' }} />
          </div>

          {/* Silver rays from the moon */}
          <div className="absolute -top-20 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-white/10 via-sky-200/5 to-transparent blur-2xl transform rotate-[25deg] pointer-events-none opacity-70 animate-light-leak" />
          <div className="absolute -top-10 -right-20 w-[600px] h-[600px] bg-gradient-to-bl from-white/15 via-indigo-200/5 to-transparent blur-3xl transform rotate-12 pointer-events-none opacity-60 animate-light-leak" style={{ animationDelay: '2s' }} />

          {/* Dense Twinkling celestial stars */}
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(255,255,255,${Math.random() * 0.5 + 0.5})`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          ))}

          {/* Shooting Stars */}
          {[1, 2, 3].map((i) => (
            <div
              key={`shooting-${i}`}
              className="absolute h-[1px] w-[100px] bg-gradient-to-r from-transparent via-white to-white animate-shooting-star opacity-0"
              style={{
                top: `${Math.random() * 40}%`,
                left: `${Math.random() * 60 + 20}%`,
                animationDelay: `${Math.random() * 15 + i * 5}s`,
                transform: 'rotate(-45deg)',
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[3px] bg-white rounded-full shadow-[0_0_10px_#fff]" />
            </div>
          ))}

          {/* Drifting cosmic dust */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`dust-${i}`}
              className="absolute w-1 h-1 rounded-full bg-sky-200/40 animate-sparkle-float blur-[1px]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}

          {/* Floating stardust specks */}
          {['✨', '⭐', '✨', '🌟', '🌙'].map((emoji, i) => (
            <div
              key={i}
              className="absolute text-lg text-sky-200/60 select-none animate-float-slow"
              style={{
                left: `${15 + i * 18}%`,
                bottom: `${10 + (i % 3) * 15}%`,
                animationDuration: `${6 + i * 2}s`,
                animationDelay: `${i * 1.3}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      );

    case 'sunset':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Color-shifting sky bands */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-900/40 via-coral-500/30 to-amber-500/40 opacity-80 animate-light-leak" style={{ animationDuration: '12s' }} />

          {/* Setting glowing sun orb at horizon */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-t from-amber-400 via-rose-500 to-transparent blur-xl opacity-70 animate-pulse" />
          
          {/* Sun Rays fanning out */}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[conic-gradient(from_0deg_at_50%_100%,_rgba(251,191,36,0)_0deg,_rgba(251,191,36,0.1)_45deg,_rgba(251,191,36,0)_90deg,_rgba(251,191,36,0.1)_135deg,_rgba(251,191,36,0)_180deg)] opacity-60 animate-bokeh-drift" style={{ animationDuration: '40s' }} />

          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-32 h-32 md:w-44 md:h-44 rounded-full bg-gradient-to-t from-yellow-300 via-amber-400 to-rose-400 shadow-[0_0_100px_rgba(251,191,36,0.9)] opacity-95" />

          {/* Ocean sunset shimmer band and gentle wave ripples */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-amber-600/40 via-rose-500/20 to-transparent blur-md" />
          {[1, 2, 3].map((i) => (
            <div 
              key={`ripple-${i}`}
              className="absolute inset-x-0 h-2 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent blur-[2px] animate-bokeh-drift"
              style={{
                bottom: `${i * 12}px`,
                animationDuration: `${3 + i}s`,
                animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
                transform: `scaleX(${1 + i * 0.1})`,
              }}
            />
          ))}

          {/* Dramatic layered cloud silhouettes at the horizon */}
          <div className="absolute bottom-16 -left-10 w-64 h-16 bg-rose-950/40 rounded-[100px] blur-xl" />
          <div className="absolute bottom-20 -right-10 w-80 h-20 bg-purple-950/30 rounded-[100px] blur-xl" />
          <div className="absolute bottom-10 left-1/4 w-96 h-12 bg-amber-900/40 rounded-[100px] blur-lg" />

          {/* Floating golden light motes */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`mote-${i}`}
              className="absolute w-2 h-2 rounded-full bg-amber-200/60 shadow-[0_0_10px_rgba(253,230,138,0.8)] animate-sparkle-float"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `${Math.random() * 40}%`,
                animationDuration: `${Math.random() * 4 + 4}s`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}

          {/* Floating warm sunset hearts & golden embers */}
          {['💖', '🧡', '✨', '🌅', '🥂', '💖'].map((emoji, i) => (
            <div
              key={i}
              className="absolute text-xl select-none animate-float-slow opacity-80"
              style={{
                left: `${10 + i * 16}%`,
                bottom: `${5 + (i % 4) * 12}%`,
                animationDuration: `${5 + i * 1.5}s`,
                animationDelay: `${i * 0.9}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      );

    case 'candlelight':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Ambient Warm Light Pools */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-600/10 blur-[100px] animate-light-leak" style={{ animationDuration: '7s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-rose-600/10 blur-[100px] animate-light-leak" style={{ animationDuration: '9s', animationDelay: '1s' }} />

          {/* Multiple distinct candle flame shapes with independent flickers */}
          <div className="absolute bottom-8 left-[15%] w-12 h-24 bg-[radial-gradient(ellipse_at_center,_rgba(253,230,138,0.8)_0%,_rgba(245,158,11,0.4)_40%,_transparent_70%)] animate-flicker-glow" style={{ animationDuration: '0.15s' }} />
          <div className="absolute bottom-12 left-[25%] w-8 h-16 bg-[radial-gradient(ellipse_at_center,_rgba(253,230,138,0.7)_0%,_rgba(245,158,11,0.3)_40%,_transparent_70%)] animate-flicker-glow" style={{ animationDuration: '0.2s', animationDelay: '0.1s' }} />
          
          <div className="absolute bottom-6 right-[15%] w-16 h-32 bg-[radial-gradient(ellipse_at_center,_rgba(253,230,138,0.9)_0%,_rgba(245,158,11,0.5)_40%,_transparent_70%)] animate-flicker-glow" style={{ animationDuration: '0.12s' }} />
          <div className="absolute bottom-10 right-[22%] w-10 h-20 bg-[radial-gradient(ellipse_at_center,_rgba(253,230,138,0.7)_0%,_rgba(245,158,11,0.3)_40%,_transparent_70%)] animate-flicker-glow" style={{ animationDuration: '0.18s', animationDelay: '0.05s' }} />

          {/* Bottom candlelight warm flickering glows */}
          <div className="absolute bottom-4 left-8 w-64 h-64 rounded-full bg-gradient-to-tr from-amber-500/40 via-orange-600/20 to-transparent blur-3xl animate-candle-flicker-1" />
          <div className="absolute bottom-4 right-8 w-64 h-64 rounded-full bg-gradient-to-tl from-amber-500/40 via-rose-600/20 to-transparent blur-3xl animate-candle-flicker-2" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-rose-950/40 blur-3xl" />

          {/* Smoke wisps rising from flames */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={`smoke-${i}`}
              className="absolute w-4 h-32 bg-gradient-to-t from-transparent via-white/5 to-transparent blur-md animate-smoke-drift"
              style={{
                left: i % 2 === 0 ? `${15 + i * 2}%` : `${85 - i * 2}%`,
                bottom: '100px',
                animationDuration: `${4 + i}s`,
                animationDelay: `${i * 1.5}s`,
              }}
            />
          ))}

          {/* Drifting red rose petals (Swirling paths) */}
          {[
            { left: '12%', delay: '0s', dur: '7s', rot: '45deg', size: 'text-2xl', z: 'z-10' },
            { left: '28%', delay: '2.5s', dur: '8s', rot: '-30deg', size: 'text-xl', z: 'z-0' },
            { left: '46%', delay: '1s', dur: '6.5s', rot: '60deg', size: 'text-2xl', z: 'z-10' },
            { left: '68%', delay: '3.2s', dur: '7.5s', rot: '-45deg', size: 'text-xl', z: 'z-0' },
            { left: '84%', delay: '1.8s', dur: '8.5s', rot: '25deg', size: 'text-2xl', z: 'z-10' },
            { left: '35%', delay: '4s', dur: '9s', rot: '90deg', size: 'text-3xl', z: 'z-20 blur-[2px]' },
            { left: '75%', delay: '5s', dur: '8.2s', rot: '-15deg', size: 'text-lg', z: 'z-0 blur-[1px]' },
          ].map((petal, i) => (
            <div
              key={i}
              className={`absolute ${petal.size} ${petal.z} select-none animate-petal-swirl`}
              style={{
                left: petal.left,
                top: '-20px',
                animationDelay: petal.delay,
                animationDuration: petal.dur,
              }}
            >
              <div style={{ transform: `rotate(${petal.rot})` }}>{i % 2 === 0 ? '🌹' : '🥀'}</div>
            </div>
          ))}

          {/* Floating warm embers */}
          {['✨', '🔥', '✨', '🕯️', '✨'].map((emoji, i) => (
            <div
              key={i}
              className="absolute text-base text-amber-200 select-none animate-float-slow opacity-75"
              style={{
                left: `${18 + i * 16}%`,
                bottom: `${15 + (i % 3) * 20}%`,
                animationDuration: `${4.5 + i}s`,
                animationDelay: `${i * 1.1}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      );

    case 'sakura':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Distant mountain/torii silhouette in very subtle opacity */}
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-pink-950/20 to-transparent" />
          <div className="absolute bottom-10 left-1/4 w-32 h-32 border-4 border-pink-900/10 opacity-30 transform -skew-x-12 rounded-t-lg" />
          
          {/* Soft pastel sakura petal mist and Bokeh circles */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-pink-400/15 blur-[80px] animate-light-leak" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-fuchsia-400/10 blur-[100px] animate-light-leak" style={{ animationDuration: '11s', animationDelay: '2s' }} />

          {/* Soft pink bokeh circles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`bokeh-${i}`}
              className="absolute rounded-full bg-pink-200/20 blur-md animate-bokeh-drift"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                animationDuration: `${Math.random() * 20 + 20}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}

          {/* Gentle breeze effect - Dancing Pink Sakura Blossoms with windswept movement */}
          {[
            { left: '-5%', delay: '0.2s', dur: '6s', size: 'text-2xl', content: '🌸' },
            { left: '10%', delay: '2.1s', dur: '7.5s', size: 'text-xl', content: '💮' },
            { left: '25%', delay: '1.1s', dur: '6.8s', size: 'text-2xl', content: '🌸' },
            { left: '40%', delay: '3.4s', dur: '8s', size: 'text-lg', content: '🌸' },
            { left: '55%', delay: '0.8s', dur: '7s', size: 'text-3xl', content: '💮' },
            { left: '70%', delay: '2.7s', dur: '6.2s', size: 'text-xl', content: '🍃' },
            { left: '85%', delay: '1.5s', dur: '7.8s', size: 'text-2xl', content: '🌸' },
            { left: '95%', delay: '4.0s', dur: '6.5s', size: 'text-lg', content: '💮' },
            { left: '-10%', delay: '5.2s', dur: '5.5s', size: 'text-4xl', content: '🌸', z: 'blur-[2px] z-20' },
            { left: '30%', delay: '6.1s', dur: '8.5s', size: 'text-sm', content: '🌸', z: 'blur-[1px] z-0' },
            { left: '60%', delay: '4.5s', dur: '7.2s', size: 'text-2xl', content: '🍃' },
            { left: '80%', delay: '7.0s', dur: '6s', size: 'text-3xl', content: '🌸', z: 'blur-[3px] z-20' },
          ].map((sakura, i) => (
            <div
              key={i}
              className={`absolute ${sakura.size} ${sakura.z || 'z-10'} select-none animate-sakura-fall`}
              style={{
                left: sakura.left,
                top: '-50px',
                animationDelay: sakura.delay,
                animationDuration: sakura.dur,
              }}
            >
              {sakura.content}
            </div>
          ))}
        </div>
      );

    case 'aurora':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Faint horizon line glow and subtle star field */}
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-teal-900/40 to-transparent blur-lg" />
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={`astart-${i}`}
              className="absolute rounded-full bg-white/60 animate-pulse"
              style={{
                top: `${Math.random() * 60}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}

          {/* Northern Lights / Multiple Aurora Waves with complex color-shifting */}
          <div className="absolute -top-10 -left-[20%] w-[140%] h-80 bg-gradient-to-br from-emerald-500/30 via-violet-500/25 to-transparent blur-[60px] animate-aurora-wave-1 transform -rotate-6 origin-top-left" />
          <div className="absolute top-10 -right-[10%] w-[120%] h-72 bg-gradient-to-bl from-cyan-400/25 via-purple-500/20 to-transparent blur-[50px] animate-aurora-wave-2 transform rotate-3 origin-top-right" />
          <div className="absolute top-32 -left-[10%] w-[120%] h-64 bg-gradient-to-r from-fuchsia-500/20 via-teal-400/20 to-indigo-500/10 blur-[40px] animate-aurora-wave-1" style={{ animationDelay: '2s', animationDuration: '7s' }} />
          <div className="absolute top-48 right-0 w-[100%] h-48 bg-gradient-to-l from-emerald-400/15 via-blue-500/15 to-transparent blur-[40px] animate-aurora-wave-2" style={{ animationDelay: '1s', animationDuration: '9s' }} />

          {/* Electric sparkle bursts along aurora edges */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`asparkle-${i}`}
              className="absolute w-1 h-1 rounded-full bg-cyan-200 shadow-[0_0_8px_#67e8f9] animate-sparkle-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 40 + 10}%`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}

          {/* Floating neon hearts */}
          {['💜', '💖', '✨', '💫', '💚', '💜'].map((emoji, i) => (
            <div
              key={i}
              className="absolute text-xl select-none animate-float-slow opacity-85 filter drop-shadow-[0_0_15px_rgba(168,85,247,0.9)]"
              style={{
                left: `${12 + i * 15}%`,
                bottom: `${10 + (i % 3) * 18}%`,
                animationDuration: `${5.5 + i}s`,
                animationDelay: `${i * 1.2}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      );
  }
};

// ================= FILTER OVERLAY VISUAL EFFECT COMPONENT =================
const FilterOverlayEffect: React.FC<{ filterId: RomanticFilterId }> = ({ filterId }) => {
  switch (filterId) {
    case 'fairy':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-3xl">
          {/* Luminous vignette and prismatic leaks */}
          <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(255,255,255,0.15)] pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-bl from-pink-300/20 via-purple-300/10 to-transparent rounded-full blur-2xl animate-light-leak" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-cyan-300/20 via-emerald-300/10 to-transparent rounded-full blur-2xl animate-light-leak" style={{ animationDelay: '2s' }} />
          
          {/* Animated sparkles/twinkles */}
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={`fairy-sparkle-${i}`}
              className="absolute rounded-full bg-white shadow-[0_0_5px_#fff] animate-sparkle-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDuration: `${Math.random() * 4 + 2}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
          {/* Golden dust drifting upward */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`fairy-dust-${i}`}
              className="absolute w-1.5 h-1.5 bg-yellow-200/60 rounded-full blur-[1px] animate-smoke-drift"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '-10px',
                animationDuration: `${Math.random() * 5 + 5}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      );
    case 'golden':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-3xl mix-blend-overlay">
          {/* Warm vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(180,83,9,0.3)] pointer-events-none" />
          
          {/* Golden light leak */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-bl from-amber-400/40 via-yellow-500/20 to-transparent rounded-full blur-[60px] animate-light-leak" />
          
          {/* Lens flare circles */}
          <div className="absolute top-[20%] right-[20%] w-24 h-24 rounded-full border border-amber-300/10 bg-amber-400/5 blur-[2px] transform -rotate-45" />
          <div className="absolute top-[35%] right-[35%] w-12 h-12 rounded-full border border-amber-200/15 bg-amber-300/10 blur-[1px] transform -rotate-45" />
          
          {/* Golden particle dust */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`golden-dust-${i}`}
              className="absolute rounded-full bg-amber-300/60 blur-[1px] animate-sparkle-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                animationDuration: `${Math.random() * 6 + 4}s`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      );
    case 'rose':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-3xl">
          {/* Soft pink/rose tint vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(225,29,72,0.15)] bg-rose-500/5 mix-blend-color pointer-events-none" />
          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(244,63,94,0.2)] pointer-events-none" />
          
          {/* Soft-focus bloom effect in corners */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-pink-400/15 rounded-full blur-[50px] animate-light-leak" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-rose-400/15 rounded-full blur-[50px] animate-light-leak" style={{ animationDelay: '2s' }} />

          {/* Floating translucent petal shapes (CSS) */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`rose-petal-${i}`}
              className="absolute bg-rose-300/40 rounded-tl-full rounded-br-full blur-[1px] animate-petal-swirl"
              style={{
                width: `${Math.random() * 10 + 8}px`,
                height: `${Math.random() * 10 + 8}px`,
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDuration: `${Math.random() * 5 + 6}s`,
                animationDelay: `${Math.random() * 6}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      );
    case 'candlelight':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-3xl mix-blend-multiply">
          {/* Amber vignette pulsing & cozy warm wash */}
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(120,53,15,0.7)] bg-amber-900/10 pointer-events-none animate-flicker-glow" style={{ animationDuration: '4s' }} />
          
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-orange-600/30 via-amber-700/10 to-transparent blur-xl" />
          
          {/* Dancing shadow edges */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.3)_100%)] pointer-events-none animate-flicker-glow" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />

          {/* Warm light particles rising */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`candle-ember-${i}`}
              className="absolute w-1.5 h-1.5 bg-orange-300/80 rounded-full blur-[1px] shadow-[0_0_5px_#f97316] animate-smoke-drift"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '-10px',
                animationDuration: `${Math.random() * 4 + 3}s`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      );
    case 'vintage':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-3xl">
          {/* Rounded dark vignette corners (lens) */}
          <div className="absolute inset-0 border-[16px] border-black/40 rounded-3xl pointer-events-none" />
          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.8)] pointer-events-none" />
          
          {/* Film grain noise overlay (CSS repeating linear gradient hack for noise) */}
          <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay animate-grain-shift" 
               style={{ 
                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
               }} 
          />
          
          {/* Faint horizontal scan lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
               style={{ backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 51%)', backgroundSize: '100% 4px' }}
          />

          {/* Sepia-toned light leak */}
          <div className="absolute -top-20 -left-10 w-80 h-96 bg-gradient-to-br from-amber-600/30 via-orange-900/10 to-transparent blur-3xl animate-light-leak" />
        </div>
      );
    case 'dreamy':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-3xl">
          {/* Soft dreamy bloom/glow vignette and pink-lavender color wash */}
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(255,255,255,0.4)] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-300/10 via-purple-300/10 to-indigo-300/10 mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_60%)] pointer-events-none" />

          {/* Soft light rays */}
          <div className="absolute -top-[20%] left-[20%] w-[150%] h-[150%] bg-[conic-gradient(from_90deg_at_0%_0%,_rgba(255,255,255,0)_0deg,_rgba(255,255,255,0.1)_20deg,_rgba(255,255,255,0)_40deg)] opacity-60 animate-bokeh-drift" />

          {/* Floating light bokeh circles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`dreamy-bokeh-${i}`}
              className="absolute rounded-full bg-white/20 blur-md animate-bokeh-drift"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
                animationDuration: `${Math.random() * 15 + 15}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      );
    default:
      return null;
  }
};

export const RomanticVideoChat: React.FC<RomanticVideoChatProps> = ({ onClose }) => {
  const { profile, currentUserName, partnerName, partnerPhoto, partnerRole, partnerOnline } = useCouple();

  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTheme, setActiveTheme] = useState<RomanticThemeId>(videoCallService.activeTheme);
  const [activeFilter, setActiveFilter] = useState<RomanticFilterId>(videoCallService.activeFilter);
  const [viewMode, setViewMode] = useState<'pip' | 'split'>('split');
  const [showThemes, setShowThemes] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);
  const [touchingHeart, setTouchingHeart] = useState(false);
  const [partnerTouching, setPartnerTouching] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioAutoplayBlocked, setAudioAutoplayBlocked] = useState(false);
  const [syncToast, setSyncToast] = useState<{ message: string; icon: string } | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);

  // Set user role on mount
  useEffect(() => {
    videoCallService.setMyRole(profile.currentUserRole);
  }, [profile.currentUserRole]);

  // Subscribe to call state changes and bidirectional theme-sync
  useEffect(() => {
    const unsubState = videoCallService.onStateChange((state) => {
      setCallStatus(state.status);
      setLocalStream(state.localStream);
      setRemoteStream(state.remoteStream);
      setIsMuted(state.isMuted);
      setIsVideoOff(state.isVideoOff);
      setActiveTheme(state.activeTheme);
      setActiveFilter(state.activeFilter);
      setPartnerTouching(state.partnerTouchingHeart);
    });

    const unsubReaction = videoCallService.onReaction((reaction) => {
      setReactions((prev) => [...prev.slice(-20), reaction]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 3500);

      if (reaction.emoji === '💋' || reaction.emoji === '💖' || reaction.emoji === '💍') {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { x: reaction.x / 100, y: reaction.y / 100 },
          colors: ['#f43f5e', '#ec4899', '#fbbf24'],
        });
      }
    });

    // Bidirectional theme and filter sync listener from partner
    const unsubThemeSync = videoCallService.onThemeSync((info) => {
      if (info.themeId) setActiveTheme(info.themeId);
      if (info.filterId) setActiveFilter(info.filterId);

      const themeObj = ROMANTIC_THEMES.find((t) => t.id === info.themeId);
      const filterObj = ROMANTIC_FILTERS.find((f) => f.id === info.filterId);
      const sender = info.senderName || partnerName || 'Your Love';

      let msg = '';
      let icon = '✨';
      if (themeObj && filterObj) {
        msg = `${sender} set atmosphere to ${themeObj.name} & ${filterObj.name} filter!`;
        icon = themeObj.icon;
      } else if (themeObj) {
        msg = `${sender} changed the atmosphere to ${themeObj.name}!`;
        icon = themeObj.icon;
      } else if (filterObj) {
        msg = `${sender} applied the ${filterObj.name} filter!`;
        icon = filterObj.icon;
      }

      if (msg) {
        setSyncToast({ message: msg, icon });
        setTimeout(() => setSyncToast(null), 4500);
        soundFx.playPop(700, 0.08);
        confetti({
          particleCount: 20,
          spread: 50,
          origin: { y: 0.2 },
          colors: ['#f43f5e', '#ec4899', '#fbbf24'],
        });
      }
    });

    return () => {
      unsubState();
      unsubReaction();
      unsubThemeSync();
    };
  }, [partnerName]);

  // Attach local media stream to video tags
  useEffect(() => {
    if (localVideoRef.current) {
      if (localStream && !isVideoOff) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play().catch((err) => console.log('Autoplay local stream:', err));
      } else {
        localVideoRef.current.srcObject = null;
      }
    }
    if (pipVideoRef.current) {
      if (localStream && !isVideoOff) {
        pipVideoRef.current.srcObject = localStream;
        pipVideoRef.current.play().catch((err) => console.log('Autoplay pip stream:', err));
      } else {
        pipVideoRef.current.srcObject = null;
      }
    }
  }, [localStream, isVideoOff, callStatus, viewMode]);

  // Attach remote stream to video and dedicated audio elements
  useEffect(() => {
    if (remoteVideoRef.current) {
      if (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch((err) => {
          console.log('Autoplay remote stream:', err);
        });
      } else {
        remoteVideoRef.current.srcObject = null;
      }
    }

    if (remoteAudioRef.current) {
      if (remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current
          .play()
          .then(() => {
            setAudioAutoplayBlocked(false);
          })
          .catch((err) => {
            console.warn('Autoplay remote audio blocked by browser policy:', err);
            setAudioAutoplayBlocked(true);
          });
      } else {
        remoteAudioRef.current.srcObject = null;
        setAudioAutoplayBlocked(false);
      }
    }
  }, [remoteStream, callStatus, viewMode]);

  const handleEnableAudio = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current
        .play()
        .then(() => setAudioAutoplayBlocked(false))
        .catch(() => {});
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.play().catch(() => {});
    }
  };

  // Call duration counter
  useEffect(() => {
    let timer: any = null;
    if (callStatus === 'connected') {
      timer = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // If partner ends the call while connected or calling, auto-return smoothly to chat
  const prevStatusRef = useRef(callStatus);
  useEffect(() => {
    if ((prevStatusRef.current === 'connected' || prevStatusRef.current === 'calling') && callStatus === 'idle') {
      if (onClose) {
        const t = setTimeout(() => {
          onClose();
        }, 600);
        return () => clearTimeout(t);
      }
    }
    prevStatusRef.current = callStatus;
  }, [callStatus, onClose]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartCall = async () => {
    setPermissionError(null);
    try {
      await videoCallService.startCall(profile.currentUserRole, currentUserName, activeTheme);
      setMusicPlaying(true);
    } catch (err: any) {
      setPermissionError('Camera/Mic permission needed. Please allow permissions in your browser.');
    }
  };

  const handleEndCall = () => {
    videoCallService.endCall(true);
    if (onClose) {
      setTimeout(() => {
        onClose();
      }, 400);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = videoCallService.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleToggleVideo = () => {
    const nextOff = videoCallService.toggleVideo();
    setIsVideoOff(nextOff);
  };

  // Select theme with instant bidirectional sync to partner
  const handleSelectTheme = (themeId: RomanticThemeId) => {
    setActiveTheme(themeId);
    videoCallService.setTheme(themeId, true, profile.currentUserRole, currentUserName);
    setShowThemes(false);
    const themeObj = ROMANTIC_THEMES.find((t) => t.id === themeId);
    if (themeObj) {
      setSyncToast({
        message: `Atmosphere set to ${themeObj.name} for both of you!`,
        icon: themeObj.icon,
      });
      setTimeout(() => setSyncToast(null), 3500);
      soundFx.playPop(650, 0.08);
    }
  };

  // Select filter with instant bidirectional sync to partner
  const handleSelectFilter = (filterId: RomanticFilterId) => {
    setActiveFilter(filterId);
    videoCallService.setFilter(filterId, true, profile.currentUserRole, currentUserName);
    setShowFilters(false);
    const filterObj = ROMANTIC_FILTERS.find((f) => f.id === filterId);
    if (filterObj) {
      setSyncToast({
        message: `Applied ${filterObj.name} filter for both of you!`,
        icon: filterObj.icon,
      });
      setTimeout(() => setSyncToast(null), 3500);
      soundFx.playPop(650, 0.08);
    }
  };

  const handleSendReaction = (emoji: string) => {
    const x = Math.floor(Math.random() * 60) + 20;
    const y = Math.floor(Math.random() * 50) + 30;
    videoCallService.sendReaction(emoji, x, y, profile.currentUserRole);
  };

  const handleToggleMusic = () => {
    if (musicPlaying) {
      romanticMusic.stopRomanticAmbience();
      setMusicPlaying(false);
    } else {
      romanticMusic.startRomanticAmbience(0.2);
      setMusicPlaying(true);
    }
  };

  const handleTouchHeartStart = () => {
    setTouchingHeart(true);
    videoCallService.setTouchHeart(true, profile.currentUserRole);
    if (partnerTouching) {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#fb7185', '#fbbf24', '#c084fc'],
      });
    }
  };

  const handleTouchHeartEnd = () => {
    setTouchingHeart(false);
    videoCallService.setTouchHeart(false, profile.currentUserRole);
  };

  const currentThemeConfig = ROMANTIC_THEMES.find((t) => t.id === activeTheme) || ROMANTIC_THEMES[0];
  const currentFilterConfig = ROMANTIC_FILTERS.find((f) => f.id === activeFilter) || ROMANTIC_FILTERS[0];

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 bg-gradient-to-br ${currentThemeConfig.gradient} min-h-[580px] md:min-h-[640px] flex flex-col justify-between border-2 ${currentThemeConfig.accentBorder} select-none`}>
      {/* CSS Animation Keyframes for Realistic Romantic Atmospheres */}
      <style>{`
        @keyframes floatSlow {
          0% { transform: translateY(0) scale(0.95); opacity: 0; }
          20% { opacity: 0.85; }
          80% { opacity: 0.85; }
          100% { transform: translateY(-280px) scale(1.1); opacity: 0; }
        }
        @keyframes petalFall {
          0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(520px) rotate(360deg) translateX(80px); opacity: 0; }
        }
        @keyframes sakuraFall {
          0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
          15% { opacity: 0.95; }
          85% { opacity: 0.95; }
          100% { transform: translateY(520px) rotate(540deg) translateX(120px); opacity: 0; }
        }
        @keyframes candleFlicker1 {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          30% { opacity: 0.45; transform: scale(1.08); }
          60% { opacity: 0.28; transform: scale(0.95); }
          85% { opacity: 0.42; transform: scale(1.04); }
        }
        @keyframes candleFlicker2 {
          0%, 100% { opacity: 0.32; transform: scale(1); }
          25% { opacity: 0.42; transform: scale(1.05); }
          55% { opacity: 0.25; transform: scale(0.92); }
          80% { opacity: 0.38; transform: scale(1.06); }
        }
        @keyframes auroraWave1 {
          0%, 100% { transform: translateY(0) scaleX(1); opacity: 0.6; }
          50% { transform: translateY(-18px) scaleX(1.1); opacity: 0.9; }
        }
        @keyframes auroraWave2 {
          0%, 100% { transform: translateY(0) scaleX(1); opacity: 0.5; }
          50% { transform: translateY(16px) scaleX(1.08); opacity: 0.85; }
        }
        /* New Keyframes */
        @keyframes shootingStar {
          0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateX(-400px) translateY(400px) rotate(-45deg); opacity: 0; }
        }
        @keyframes sparkleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 1; }
        }
        @keyframes smokeDrift {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-150px) translateX(30px) scale(1.5); opacity: 0; }
        }
        @keyframes petalSwirl {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.9; }
          25% { transform: translateY(130px) translateX(50px); }
          50% { transform: translateY(260px) translateX(-30px); }
          75% { transform: translateY(390px) translateX(40px); opacity: 0.9; }
          100% { transform: translateY(520px) translateX(-20px); opacity: 0; }
        }
        @keyframes bokehDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes flickerGlow {
          0%, 100% { opacity: 1; }
          25% { opacity: 0.8; }
          50% { opacity: 0.95; }
          75% { opacity: 0.7; }
        }
        @keyframes grainShift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-1%, 1%); }
          50% { transform: translate(1%, -1%); }
          75% { transform: translate(1%, 1%); }
        }
        @keyframes lightLeak {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        .animate-float-slow {
          animation: floatSlow 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-petal-fall {
          animation: petalFall linear infinite;
        }
        .animate-sakura-fall {
          animation: sakuraFall linear infinite;
        }
        .animate-candle-flicker-1 {
          animation: candleFlicker1 2.8s ease-in-out infinite;
        }
        .animate-candle-flicker-2 {
          animation: candleFlicker2 3.4s ease-in-out infinite;
        }
        .animate-aurora-wave-1 {
          animation: auroraWave1 6s ease-in-out infinite;
        }
        .animate-aurora-wave-2 {
          animation: auroraWave2 8s ease-in-out infinite;
        }
        
        /* New Utilities */
        .animate-shooting-star {
          animation: shootingStar 3s ease-out infinite;
        }
        .animate-sparkle-float {
          animation: sparkleFloat 3s ease-in-out infinite;
        }
        .animate-smoke-drift {
          animation: smokeDrift 4s ease-out infinite;
        }
        .animate-petal-swirl {
          animation: petalSwirl 6s ease-in-out infinite;
        }
        .animate-bokeh-drift {
          animation: bokehDrift 15s ease-in-out infinite;
        }
        .animate-flicker-glow {
          animation: flickerGlow 0.2s infinite alternate;
        }
        .animate-grain-shift {
          animation: grainShift 0.5s steps(2) infinite;
        }
        .animate-light-leak {
          animation: lightLeak 8s ease-in-out infinite;
        }
      `}</style>

      {/* Dedicated Remote Audio Playback Element */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Atmospheric Background Animation Layer */}
      <AtmosphericBackground themeId={activeTheme} />

      {/* Bidirectional Sync Toast Banner */}
      {syncToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white font-extrabold text-xs md:text-sm shadow-2xl border-2 border-white/80 flex items-center gap-2.5 ring-4 ring-rose-400/30">
            <span className="text-xl">{syncToast.icon}</span>
            <span>{syncToast.message}</span>
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          </div>
        </div>
      )}

      {/* Audio Autoplay Unblock Prompt */}
      {audioAutoplayBlocked && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <button
            type="button"
            onClick={handleEnableAudio}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white font-extrabold text-xs shadow-2xl border-2 border-white/80 flex items-center gap-2 cursor-pointer active:scale-95 ring-4 ring-rose-400/40"
          >
            <Volume2 className="w-4 h-4 animate-spin" />
            <span>Tap to hear {partnerName}'s voice 🔊</span>
          </button>
        </div>
      )}

      {/* ================= TOP HEADER BAR ================= */}
      <div className="relative z-20 flex items-center justify-between p-4 md:px-6 bg-black/40 backdrop-blur-md border-b border-white/10 text-white">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white/10 hover:bg-white/20 text-rose-200 hover:text-white transition active:scale-95 border border-white/15 flex items-center gap-1 text-xs font-bold shrink-0"
              title="Return to Love Hub & Chat"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentThemeConfig.icon}</span>
            <div>
              <h2 className="text-sm md:text-base font-extrabold flex items-center gap-1.5 text-white">
                <span>Romantic Video Sanctuary</span>
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
              </h2>
              <p className="text-[11px] text-rose-200/90 font-medium">
                Atmosphere: <strong className="text-white">{currentThemeConfig.name}</strong> • Filter: <strong className="text-amber-200">{currentFilterConfig.name}</strong>
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-400/30">Synced ⚡</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center Timer / Status */}
        <div className="flex items-center gap-2">
          {callStatus === 'connected' ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Loving for {formatDuration(callDuration)}</span>
            </div>
          ) : callStatus === 'calling' ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold animate-pulse">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span>Calling {partnerName}...</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-rose-200 text-xs font-bold">
              <span>{partnerOnline ? 'Partner Online 🟢' : 'Private Sanctuary 🔒'}</span>
            </div>
          )}
        </div>

        {/* Right Quick Controls */}
        <div className="flex items-center gap-2">
          {/* Background Theme Selector Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowThemes((v) => !v);
              setShowFilters(false);
            }}
            title="Choose Romantic Atmosphere (Syncs for both)"
            className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition active:scale-95 border border-white/20 flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer"
          >
            <Palette className="w-4 h-4 text-pink-300" />
            <span className="hidden sm:inline">Atmosphere</span>
          </button>

          {/* Video Filter Selector Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowFilters((v) => !v);
              setShowThemes(false);
            }}
            title="Flattering Video Filter (Syncs for both)"
            className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition active:scale-95 border border-white/20 flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer"
          >
            <Wand2 className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Ambient Romantic Harmony Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleMusic}
            title={musicPlaying ? 'Mute romantic ambient music' : 'Play romantic ambient music'}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 border border-white/15"
          >
            {musicPlaying ? <Volume2 className="w-4 h-4 text-rose-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Split / Picture-in-Picture Layout Switcher */}
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'split' ? 'pip' : 'split'))}
            title={viewMode === 'split' ? 'Switch to Picture-in-Picture' : 'Switch to Side-by-Side'}
            className="hidden sm:flex p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 border border-white/15"
          >
            <Columns className="w-4 h-4 text-purple-300" />
          </button>
        </div>
      </div>

      {/* ================= THEMES MODAL POPOVER ================= */}
      {showThemes && (
        <div className="absolute top-16 right-4 z-50 w-80 max-w-[90vw] rounded-2xl bg-slate-900/95 p-4 border border-rose-400/50 shadow-2xl backdrop-blur-xl text-white animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Romantic Atmospheres
              </span>
              <p className="text-[10px] text-slate-400">Syncs instantly for both you & {partnerName}</p>
            </div>
            <button onClick={() => setShowThemes(false)} className="text-xs text-slate-400 hover:text-white p-1">✕</button>
          </div>
          <div className="space-y-2">
            {ROMANTIC_THEMES.map((theme) => {
              const isSelected = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500/30 border-2 border-rose-400 ring-2 ring-rose-400/50 shadow-lg'
                      : 'bg-white/5 hover:bg-white/15 border border-white/10'
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-black/40 shrink-0">{theme.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs font-extrabold text-white truncate">{theme.name}</div>
                      {isSelected && <span className="text-[10px] text-rose-300 font-bold flex items-center gap-0.5 shrink-0"><Check className="w-3 h-3" /> Both</span>}
                    </div>
                    <div className="text-[10px] text-rose-200/70 font-semibold">{theme.subtitle}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{theme.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= FILTERS MODAL POPOVER ================= */}
      {showFilters && (
        <div className="absolute top-16 right-4 sm:right-28 z-50 w-80 max-w-[90vw] rounded-2xl bg-slate-900/95 p-4 border border-amber-400/50 shadow-2xl backdrop-blur-xl text-white animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> Flattering Video Filters
              </span>
              <p className="text-[10px] text-slate-400">Applied automatically to both videos</p>
            </div>
            <button onClick={() => setShowFilters(false)} className="text-xs text-slate-400 hover:text-white p-1">✕</button>
          </div>
          <div className="space-y-2">
            {ROMANTIC_FILTERS.map((filt) => {
              const isSelected = activeFilter === filt.id;
              return (
                <button
                  key={filt.id}
                  type="button"
                  onClick={() => handleSelectFilter(filt.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/30 border-2 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                      : 'bg-white/5 hover:bg-white/15 border border-white/10'
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-black/40 shrink-0">{filt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs font-extrabold text-white truncate">{filt.name}</div>
                      {isSelected && <span className="text-[10px] text-amber-300 font-bold flex items-center gap-0.5 shrink-0"><Check className="w-3 h-3" /> Both</span>}
                    </div>
                    <div className="text-[10px] text-amber-200/70 font-semibold">{filt.subtitle}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{filt.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= FLOATING FLYING EMOJIS & KISSES ================= */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.x}%`, top: `${r.y}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-5xl md:text-7xl animate-bounce filter drop-shadow-2xl select-none"
          >
            <span>{r.emoji}</span>
          </div>
        ))}
      </div>

      {/* ================= SOUL TOUCH MERGED HEART ANIMATION ================= */}
      {(touchingHeart || partnerTouching) && (
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center">
          <div
            className={`w-64 h-64 md:w-80 md:h-80 rounded-full flex flex-col items-center justify-center transition-all duration-500 ${
              touchingHeart && partnerTouching
                ? 'scale-125 bg-gradient-to-r from-rose-500/40 via-pink-400/50 to-amber-400/40 blur-2xl animate-ping'
                : 'scale-100 bg-rose-500/20 blur-xl animate-pulse'
            }`}
          />
          <div className="absolute flex flex-col items-center gap-2 animate-bounce">
            <span className="text-7xl md:text-9xl filter drop-shadow-[0_0_35px_rgba(244,63,94,0.8)]">
              {touchingHeart && partnerTouching ? '💖💍✨' : '💖'}
            </span>
            <span className="px-4 py-1.5 rounded-full bg-black/70 text-rose-300 font-extrabold text-xs md:text-sm border border-rose-400 shadow-xl backdrop-blur-md">
              {touchingHeart && partnerTouching
                ? '✨ Our Souls Are Touching Together! ✨'
                : `${touchingHeart ? 'You are reaching out' : `${partnerName} is holding out a heart`}`}
            </span>
          </div>
        </div>
      )}

      {/* ================= MAIN VIDEO STAGE AREA ================= */}
      <div className="relative z-10 flex-1 p-3 md:p-6 flex items-center justify-center">
        {/* Permission warning if any */}
        {permissionError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-full p-3 rounded-2xl bg-amber-500/90 text-slate-900 font-bold text-xs text-center shadow-xl">
            {permissionError}
          </div>
        )}

        {callStatus === 'idle' ? (
          /* IDLE STATE: CALL LAUNCHER BANNER */
          <div className="max-w-md w-full p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-xl text-center shadow-2xl flex flex-col items-center text-white">
            <div className="relative mb-5">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-rose-500 via-pink-400 to-indigo-500 blur-lg opacity-75 animate-pulse" />
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white">
                <img
                  src={partnerPhoto}
                  alt={partnerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 text-2xl">🌹</span>
            </div>

            <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2">
              Romantic Video Sanctuary
            </h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed max-w-xs">
              Talk directly with {partnerName} within an intimate starry paradise with soft ambient music, flattering filters, and flying kisses.
            </p>

            <div className="w-full space-y-3">
              <button
                type="button"
                onClick={handleStartCall}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-sm md:text-base shadow-xl shadow-rose-500/30 flex items-center justify-center gap-2 transition active:scale-95 ring-4 ring-rose-400/25 cursor-pointer"
              >
                <PhoneCall className="w-5 h-5 fill-white" />
                <span>Call My {partnerName} Now</span>
              </button>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-rose-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border border-white/10 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Return to Love Hub & Chat</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ACTIVE / CONNECTED VIDEO STAGE */
          <div className="w-full h-full flex flex-col items-center justify-center">
            {viewMode === 'split' ? (
              /* SIDE-BY-SIDE CINEMA VIEW */
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 h-[440px] md:h-[480px]">
                {/* 1. Partner (Remote) Container */}
                <div
                  className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 bg-black/70 flex items-center justify-center group"
                  style={{
                    boxShadow: `0 0 35px ${currentFilterConfig.frameGlow}, 0 0 15px ${currentThemeConfig.glowColor}`,
                    border: `2px solid ${currentFilterConfig.frameGlow}`,
                  }}
                >
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    onLoadedMetadata={() => {
                      remoteVideoRef.current?.play().catch(() => {});
                    }}
                    style={{ filter: currentFilterConfig.cssFilter }}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${remoteStream ? 'opacity-100' : 'opacity-0'}`}
                  />
                  {remoteStream && (
                    <div className={`absolute inset-0 pointer-events-none transition-all ${currentFilterConfig.overlayClass}`} />
                  )}
                  {remoteStream && <FilterOverlayEffect filterId={activeFilter} />}

                  {!remoteStream && (
                    /* Waiting / Ringing Placeholder */
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-black/50">
                      <div className="relative mb-3">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-rose-400 shadow-xl bg-white animate-pulse">
                          <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
                        </div>
                        <span className="absolute -top-1 -right-1 text-2xl animate-spin">✨</span>
                      </div>
                      <p className="text-sm font-extrabold text-rose-300">
                        {callStatus === 'calling' ? `Calling ${partnerName}...` : `Connecting with ${partnerName}...`}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Waiting for video stream</p>
                    </div>
                  )}

                  {/* Active Filter Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-lg backdrop-blur-md flex items-center gap-1.5 border border-white/20 bg-black/50 text-white">
                    <span>{currentFilterConfig.icon}</span>
                    <span>{currentFilterConfig.name}</span>
                  </div>

                  {/* Partner Name Badge */}
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <span>{partnerRole === 'boyfriend' ? '👑' : '🌸'}</span>
                    <span>{partnerName}</span>
                  </div>
                </div>

                {/* 2. Self (Local) Container */}
                <div
                  className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 bg-black/70 flex items-center justify-center group"
                  style={{
                    boxShadow: `0 0 35px ${currentFilterConfig.frameGlow}, 0 0 15px ${currentThemeConfig.glowColor}`,
                    border: `2px solid ${currentFilterConfig.frameGlow}`,
                  }}
                >
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => {
                      localVideoRef.current?.play().catch(() => {});
                    }}
                    style={{ filter: currentFilterConfig.cssFilter }}
                    className={`w-full h-full object-cover -scale-x-100 transition-opacity duration-300 ${localStream && !isVideoOff ? 'opacity-100' : 'opacity-0'}`}
                  />
                  {localStream && !isVideoOff && (
                    <div className={`absolute inset-0 pointer-events-none transition-all ${currentFilterConfig.overlayClass}`} />
                  )}
                  {localStream && !isVideoOff && <FilterOverlayEffect filterId={activeFilter} />}

                  {(!localStream || isVideoOff) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900/80">
                      <VideoOff className="w-12 h-12 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-300">Camera is turned off</p>
                    </div>
                  )}

                  {/* Active Filter Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-lg backdrop-blur-md flex items-center gap-1.5 border border-white/20 bg-black/50 text-white">
                    <span>{currentFilterConfig.icon}</span>
                    <span>{currentFilterConfig.name}</span>
                  </div>

                  {/* Self Name Badge */}
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <span>{profile.currentUserRole === 'boyfriend' ? '👑' : '🌸'}</span>
                    <span>You ({currentUserName})</span>
                    {isMuted && <MicOff className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                </div>
              </div>
            ) : (
              /* PICTURE-IN-PICTURE (PIP) VIEW */
              <div
                className="relative w-full h-[440px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 bg-black/70 flex items-center justify-center"
                style={{
                  boxShadow: `0 0 40px ${currentFilterConfig.frameGlow}, 0 0 15px ${currentThemeConfig.glowColor}`,
                  border: `2px solid ${currentFilterConfig.frameGlow}`,
                }}
              >
                {/* Main View: Partner */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  onLoadedMetadata={() => {
                    remoteVideoRef.current?.play().catch(() => {});
                  }}
                  style={{ filter: currentFilterConfig.cssFilter }}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${remoteStream ? 'opacity-100' : 'opacity-0'}`}
                />
                {remoteStream && (
                  <div className={`absolute inset-0 pointer-events-none transition-all ${currentFilterConfig.overlayClass}`} />
                )}
                {remoteStream && <FilterOverlayEffect filterId={activeFilter} />}

                {!remoteStream && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-black/50">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-rose-400 shadow-xl bg-white mb-3 animate-pulse">
                      <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-extrabold text-rose-300">
                      {callStatus === 'calling' ? `Calling ${partnerName}...` : `Connecting with ${partnerName}...`}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Waiting for video stream</p>
                  </div>
                )}

                {/* Main View Filter Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-extrabold shadow-lg backdrop-blur-md flex items-center gap-1.5 border border-white/20 bg-black/60 text-white">
                  <span>{currentFilterConfig.icon}</span>
                  <span>{currentFilterConfig.name}</span>
                </div>

                {/* Floating Self Camera PiP */}
                <div
                  className="absolute top-4 right-4 w-32 h-44 md:w-36 md:h-48 rounded-2xl overflow-hidden shadow-2xl bg-black z-20"
                  style={{
                    border: `2px solid ${currentFilterConfig.frameGlow}`,
                    boxShadow: `0 0 20px ${currentFilterConfig.frameGlow}`,
                  }}
                >
                  <video
                    ref={pipVideoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => {
                      pipVideoRef.current?.play().catch(() => {});
                    }}
                    style={{ filter: currentFilterConfig.cssFilter }}
                    className={`w-full h-full object-cover -scale-x-100 transition-opacity duration-300 ${localStream && !isVideoOff ? 'opacity-100' : 'opacity-0'}`}
                  />
                  {localStream && !isVideoOff && (
                    <div className={`absolute inset-0 pointer-events-none transition-all ${currentFilterConfig.overlayClass}`} />
                  )}
                  {localStream && !isVideoOff && <FilterOverlayEffect filterId={activeFilter} />}

                  {(!localStream || isVideoOff) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-[10px]">
                      <VideoOff className="w-6 h-6 mb-1" />
                      <span>Cam Off</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-2 text-[10px] text-white font-bold drop-shadow">
                    You
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= ROMANTIC EMOJI REACTION QUICK BAR ================= */}
      {callStatus !== 'idle' && (
        <div className="relative z-20 px-4 py-2 flex items-center justify-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-none bg-black/30 backdrop-blur-sm border-t border-white/10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300 whitespace-nowrap mr-1 flex items-center gap-1">
            <Heart className="w-3 h-3 fill-rose-400" /> Send Love:
          </span>
          {ROMANTIC_EMOJIS.map((item) => (
            <button
              key={item.emoji}
              type="button"
              onClick={() => handleSendReaction(item.emoji)}
              title={item.label}
              className="p-1.5 md:p-2 rounded-xl bg-white/10 hover:bg-rose-500/40 text-lg md:text-xl transition active:scale-125 transform shadow-xs hover:shadow-rose-400/30 shrink-0 cursor-pointer"
            >
              {item.emoji}
            </button>
          ))}
        </div>
      )}

      {/* ================= BOTTOM IN-CALL CONTROLS BAR ================= */}
      {callStatus !== 'idle' && (
        <div className="relative z-20 flex items-center justify-center gap-3 md:gap-6 p-4 bg-black/60 backdrop-blur-md border-t border-white/15">
          {/* Mute Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            className={`p-3 md:p-3.5 rounded-full transition shadow-lg active:scale-95 cursor-pointer ${
              isMuted
                ? 'bg-rose-600 text-white ring-4 ring-rose-400/30'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle */}
          <button
            type="button"
            onClick={handleToggleVideo}
            title={isVideoOff ? 'Turn video on' : 'Turn video off'}
            className={`p-3 md:p-3.5 rounded-full transition shadow-lg active:scale-95 cursor-pointer ${
              isVideoOff
                ? 'bg-rose-600 text-white ring-4 ring-rose-400/30'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Soul Heart Connection Hold Button */}
          <button
            type="button"
            onMouseDown={handleTouchHeartStart}
            onMouseUp={handleTouchHeartEnd}
            onTouchStart={handleTouchHeartStart}
            onTouchEnd={handleTouchHeartEnd}
            title="Press & hold to connect your soul heart with your partner's video!"
            className={`px-4 md:px-6 py-3 rounded-full font-extrabold text-xs md:text-sm flex items-center gap-2 transition shadow-xl active:scale-95 select-none cursor-pointer ${
              touchingHeart
                ? 'bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300 text-white ring-4 ring-pink-300 animate-pulse'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-rose-500/30'
            }`}
          >
            <Heart className={`w-4 h-4 md:w-5 md:h-5 ${touchingHeart ? 'fill-white animate-ping' : 'fill-white'}`} />
            <span>{touchingHeart ? 'Souls Touching! 💖' : 'Touch Heart'}</span>
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEndCall}
            title="End Video Sanctuary Call"
            className="p-3 md:p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/40 ring-4 ring-rose-500/30 transition active:scale-95 cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
