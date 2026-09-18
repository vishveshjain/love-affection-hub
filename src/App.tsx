import React, { useState } from 'react';
import { CoupleProvider, useCouple } from './context/CoupleContext';
import { FloatingParticles } from './components/FloatingParticles';
import { Navbar } from './components/Navbar';
import { OnboardingModal } from './components/OnboardingModal';
import { AffectionStage } from './components/AffectionStage';
import { ActionMenu } from './components/ActionMenu';
import { LoveCounter } from './components/LoveCounter';
import { LiveCoupleChat } from './components/chat/LiveCoupleChat';
import { DreamJournal } from './components/dreams/DreamJournal';
import { LoveNotesJourney } from './components/notes/LoveNotesJourney';
import { FlamesGame } from './components/games/FlamesGame';
import { ScratchCoupons } from './components/games/ScratchCoupons';
import { AffectionWheel } from './components/games/AffectionWheel';
import { CoupleQuiz } from './components/games/CoupleQuiz';
import { MemoryWall } from './components/games/MemoryWall';
import { soundFx } from './utils/audio';
import {
  MessageCircle,
  Moon,
  StickyNote,
  Flame,
  Ticket,
  Sparkles,
  HelpCircle,
  Camera,
  Heart,
  RefreshCw,
} from 'lucide-react';

type GameTab =
  | 'chat'
  | 'dreams'
  | 'notes'
  | 'flames'
  | 'coupons'
  | 'wheel'
  | 'quiz'
  | 'memories';

const MainContent: React.FC = () => {
  const { profile, resetAllData } = useCouple();
  const [activeTab, setActiveTab] = useState<GameTab>('chat');

  const tabs: { id: GameTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'chat',
      label: 'Live Couple Chat',
      icon: <MessageCircle className="w-4 h-4 text-emerald-500" />,
      badge: 'Live',
    },
    {
      id: 'dreams',
      label: 'Telling Dreams',
      icon: <Moon className="w-4 h-4 text-purple-500 fill-purple-400" />,
    },
    {
      id: 'notes',
      label: 'Love Notes & Journey',
      icon: <StickyNote className="w-4 h-4 text-rose-500" />,
    },
    {
      id: 'flames',
      label: 'FLAMES Game',
      icon: <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />,
    },
    {
      id: 'coupons',
      label: 'Love Coupons',
      icon: <Ticket className="w-4 h-4 text-pink-500" />,
      badge: 'Scratch',
    },
    {
      id: 'wheel',
      label: 'Spin the Wheel',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
    },
    {
      id: 'quiz',
      label: 'Chemistry Quiz',
      icon: <HelpCircle className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'memories',
      label: 'Memory Wall',
      icon: <Camera className="w-4 h-4 text-amber-500" />,
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* Background Interactive Particles Canvas */}
      <FloatingParticles />

      {/* Top Navbar */}
      <Navbar />

      {/* Onboarding / Setup Modal */}
      <OnboardingModal />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-2 sm:px-4 py-6 space-y-8">
        {/* Affection Stage with Couple Photos & Animated Physics */}
        <AffectionStage />

        {/* Dynamic Action Buttons (Give a kiss, Hug, Carry, Feed, Whisper, etc.) */}
        <ActionMenu />

        {/* Live Anniversary Stopwatch Counter */}
        <LoveCounter />

        {/* Interactive Features & Love Games Suite */}
        <section className="max-w-4xl mx-auto px-4 py-2">
          {/* Game Tabs Navigation */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    soundFx.playPop(540, 0.05);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all shadow-xs ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-400/25 scale-102'
                      : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-600 border border-rose-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded-md font-extrabold ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : tab.badge === 'Live'
                          ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                          : 'bg-pink-100 text-pink-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab View */}
          <div className="mt-4 transition-all duration-300">
            {activeTab === 'chat' && <LiveCoupleChat />}
            {activeTab === 'dreams' && <DreamJournal />}
            {activeTab === 'notes' && <LoveNotesJourney />}
            {activeTab === 'flames' && <FlamesGame />}
            {activeTab === 'coupons' && <ScratchCoupons />}
            {activeTab === 'wheel' && <AffectionWheel />}
            {activeTab === 'quiz' && <CoupleQuiz />}
            {activeTab === 'memories' && <MemoryWall />}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 mt-12 border-t border-rose-100/80 bg-white/60 backdrop-blur-md text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1">
            <span>Crafted with endless devotion for</span>
            <span className="font-bold text-rose-600">
              {profile.boyfriendName} & {profile.girlfriendName}
            </span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          </p>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all couple data and start fresh with Vishvesh & Laura?')) {
                resetAllData();
              }
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition text-[11px]"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Data</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <CoupleProvider>
      <MainContent />
    </CoupleProvider>
  );
}

export default App;
