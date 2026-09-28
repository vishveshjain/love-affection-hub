import React, { useState, useEffect } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { TelepathyQuestion, TelepathyScore } from '../../types';
import { loadTelepathyScore, saveTelepathyScore } from '../../utils/storage';
import { soundFx } from '../../utils/audio';
import { realtimeHub, getClientId } from '../../utils/realtime';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Radio,
  RotateCcw,
  Heart,
  ChevronRight,
  Award,
  Zap,
  Check,
  CheckCircle2,
  Clock,
  Shuffle,
  History,
  X,
  Plus,
} from 'lucide-react';

const CURATED_QUESTIONS: TelepathyQuestion[] = [
  {
    id: 'q1',
    category: 'romantic',
    title: 'The Ultimate Anniversary Getaway',
    optionA: { text: 'Cozy private cabin in the snowy mountains with a fireplace & hot tub', emoji: '🪵' },
    optionB: { text: 'Overwater glass-floor bungalow in the Maldives with sunset views', emoji: '🏝️' },
  },
  {
    id: 'q2',
    category: 'cozy',
    title: 'A Perfect Rainy Sunday Together',
    optionA: { text: 'Binge-watching movies under huge blankets with warm cocoa & popcorn', emoji: '🎬' },
    optionB: { text: 'Baking fresh warm cookies and cooking a gourmet dinner together', emoji: '🍪' },
  },
  {
    id: 'q3',
    category: 'adventure',
    title: 'Midnight Adventure Vibe',
    optionA: { text: 'Spontaneous 2 AM road trip to watch the sunrise at a scenic viewpoint', emoji: '🚗' },
    optionB: { text: 'Midnight rooftop stargazing with fairy lights and deep music', emoji: '🌌' },
  },
  {
    id: 'q4',
    category: 'romantic',
    title: 'Daily Morning Love Language',
    optionA: { text: 'Breakfast in bed with warm cuddles and forehead kisses', emoji: '🥞' },
    optionB: { text: 'A sweet handwritten love note left next to morning coffee', emoji: '💌' },
  },
  {
    id: 'q5',
    category: 'cozy',
    title: 'Our Forever Home Aesthetic',
    optionA: { text: 'Modern glass penthouse overlooking the dazzling city skyline', emoji: '🌆' },
    optionB: { text: 'Charming European countryside villa with a flower garden & patio', emoji: '🏡' },
  },
  {
    id: 'q6',
    category: 'adventure',
    title: 'Crazy Date Night Challenge',
    optionA: { text: 'Dress up in fancy black-tie outfits for cheap street food & desserts', emoji: '👑' },
    optionB: { text: 'Go to a supermarket in silly matching pajamas and buy every snack', emoji: '🛒' },
  },
  {
    id: 'q7',
    category: 'romantic',
    title: 'Long Distance Superpower',
    optionA: { text: 'A magic portal so we could sleep in the same bed every single night', emoji: '🚪' },
    optionB: { text: 'Mind telepathy so we could hear each other’s thoughts & affection 24/7', emoji: '🧠' },
  },
  {
    id: 'q8',
    category: 'playful',
    title: 'Playful Argument Settlement',
    optionA: { text: 'An intense tickle fight until someone begs for mercy and kisses', emoji: '😂' },
    optionB: { text: 'Whoever makes the partner laugh first wins instant victory', emoji: '🎭' },
  },
  {
    id: 'q9',
    category: 'romantic',
    title: 'Slow Dance Atmosphere',
    optionA: { text: 'Barefoot on a warm beach with waves crashing under moonlight', emoji: '🌊' },
    optionB: { text: 'In our kitchen at midnight with only the refrigerator light on', emoji: '☕' },
  },
  {
    id: 'q10',
    category: 'cozy',
    title: 'Bedtime Cuddle Ritual',
    optionA: { text: 'Falling asleep tangled in each other’s arms like koala bears', emoji: '🐨' },
    optionB: { text: 'Talking softly in the dark about our dreams until one of us dozes off', emoji: '🌙' },
  },
  {
    id: 'q11',
    category: 'adventure',
    title: 'Couple Theme Park Date',
    optionA: { text: 'Adrenaline rollercoasters while holding hands for dear life', emoji: '🎢' },
    optionB: { text: 'Eating cotton candy and winning giant plushies at game booths', emoji: '🧸' },
  },
  {
    id: 'q12',
    category: 'romantic',
    title: 'Sweet Memory Keepsake',
    optionA: { text: 'A giant scrapbook filled with photos, tickets, and love letters', emoji: '📖' },
    optionB: { text: 'A digital time capsule video with clips of all our sweetest laughs', emoji: '📽️' },
  },
];

export const WouldYouRather: React.FC = () => {
  const { profile, currentUserName, currentUserPhoto, partnerName, partnerPhoto, partnerRole } = useCouple();

  const [questions, setQuestions] = useState<TelepathyQuestion[]>(CURATED_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [myChoice, setMyChoice] = useState<'A' | 'B' | null>(null);
  const [partnerChoice, setPartnerChoice] = useState<'A' | 'B' | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [score, setScore] = useState<TelepathyScore>(() => loadTelepathyScore());
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);

  // New custom dilemma state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newOptAText, setNewOptAText] = useState<string>('');
  const [newOptAEmoji, setNewOptAEmoji] = useState<string>('✨');
  const [newOptBText, setNewOptBText] = useState<string>('');
  const [newOptBEmoji, setNewOptBEmoji] = useState<string>('💖');

  const currentQ = questions[currentIndex % questions.length];

  // Real-time synchronization
  useEffect(() => {
    const unsub = realtimeHub.subscribe((msg) => {
      if (msg.type === 'TELEPATHY_EVENT' && msg.data) {
        const { action, payload } = msg.data;
        if (action === 'VOTE') {
          // If message is from partner
          if (payload.questionId === currentQ.id) {
            setPartnerChoice(payload.choice);
            soundFx.playPop(520, 0.05);
          }
        } else if (action === 'NEXT_QUESTION') {
          setCurrentIndex(payload.index);
          setMyChoice(null);
          setPartnerChoice(null);
          setIsRevealed(false);
          soundFx.playPop(480, 0.08);
        } else if (action === 'REVEAL') {
          setIsRevealed(true);
          soundFx.playCelebration();
        } else if (action === 'ADD_CUSTOM') {
          setQuestions((prev) => [...prev, payload.question]);
          soundFx.playPop(580, 0.08);
        }
      }
    });

    return () => unsub();
  }, [currentQ.id]);

  const broadcast = (action: string, payload: any) => {
    realtimeHub.publish({
      type: 'TELEPATHY_EVENT',
      clientId: getClientId(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      data: { action, payload },
      timestamp: Date.now(),
    });
  };

  // When both choices are in, automatically trigger reveal!
  useEffect(() => {
    if (myChoice && partnerChoice && !isRevealed) {
      triggerReveal(myChoice, partnerChoice);
    }
  }, [myChoice, partnerChoice, isRevealed]);

  const handleVote = (choice: 'A' | 'B') => {
    if (myChoice) return; // already voted
    setMyChoice(choice);
    soundFx.playPop(600, 0.08);

    broadcast('VOTE', {
      questionId: currentQ.id,
      choice,
      role: profile.currentUserRole,
    });
  };

  const triggerReveal = (c1: 'A' | 'B', c2: 'A' | 'B') => {
    setIsRevealed(true);
    const isMatch = c1 === c2;

    const isBf = profile.currentUserRole === 'boyfriend';
    const bfChoice = isBf ? c1 : c2;
    const gfChoice = isBf ? c2 : c1;

    const updatedScore: TelepathyScore = {
      totalRounds: score.totalRounds + 1,
      totalMatches: isMatch ? score.totalMatches + 1 : score.totalMatches,
      history: [
        {
          questionId: currentQ.id,
          questionTitle: currentQ.title,
          boyfriendChoice: bfChoice,
          girlfriendChoice: gfChoice,
          isMatch,
          timestamp: Date.now(),
        },
        ...score.history,
      ],
    };

    setScore(updatedScore);
    saveTelepathyScore(updatedScore);

    if (isMatch) {
      soundFx.playCelebration();
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#fbbf24', '#8b5cf6'],
      });
    } else {
      soundFx.playKiss();
    }

    broadcast('REVEAL', { isMatch });
  };

  // Manual Reveal button in case partner is offline or delayed
  const handleManualSoloReveal = () => {
    if (!myChoice) return;
    // Simulate partner choice (prefer matching with 70% probability for fun)
    const simulatedPartnerChoice = partnerChoice || (Math.random() > 0.3 ? myChoice : myChoice === 'A' ? 'B' : 'A');
    setPartnerChoice(simulatedPartnerChoice);
    triggerReveal(myChoice, simulatedPartnerChoice);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % questions.length;
    setCurrentIndex(nextIdx);
    setMyChoice(null);
    setPartnerChoice(null);
    setIsRevealed(false);
    soundFx.playPop(480, 0.08);

    broadcast('NEXT_QUESTION', { index: nextIdx });
  };

  const handleAddCustomDilemma = () => {
    if (!newTitle.trim() || !newOptAText.trim() || !newOptBText.trim()) return;
    const newQ: TelepathyQuestion = {
      id: `custom-q-${Date.now()}`,
      category: 'romantic',
      title: newTitle.trim(),
      optionA: { text: newOptAText.trim(), emoji: newOptAEmoji.trim() || '✨' },
      optionB: { text: newOptBText.trim(), emoji: newOptBEmoji.trim() || '💖' },
    };

    const updated = [...questions, newQ];
    setQuestions(updated);
    setCurrentIndex(updated.length - 1);
    setMyChoice(null);
    setPartnerChoice(null);
    setIsRevealed(false);
    setShowAddCustom(false);
    setNewTitle('');
    setNewOptAText('');
    setNewOptBText('');

    soundFx.playCelebration();
    broadcast('ADD_CUSTOM', { question: newQ });
  };

  const isBf = profile.currentUserRole === 'boyfriend';
  const myBfChoice = isBf ? myChoice : partnerChoice;
  const myGfChoice = isBf ? partnerChoice : myChoice;

  const matchPercentage =
    score.totalRounds > 0 ? Math.round((score.totalMatches / score.totalRounds) * 100) : 100;

  const isMatch = myChoice && partnerChoice && myChoice === partnerChoice;

  return (
    <div className="relative bg-gradient-to-b from-white/95 via-purple-50/40 to-pink-50/40 backdrop-blur-md rounded-3xl border border-purple-100 shadow-xl p-4 sm:p-7 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-purple-100/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Would You Rather: Love Telepathy
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-700 tracking-wider">
                Soulmate Sync
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Pick your secret choice simultaneously and see if your thoughts align in perfect harmony!
            </p>
          </div>
        </div>

        {/* Telepathy Harmony Meter & History */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Harmony: {matchPercentage}% ({score.totalMatches}/{score.totalRounds})</span>
          </div>

          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Live Status Indicators (Waiting for Partner / Locked In) */}
      <div className="flex items-center justify-between bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-blue-400 shrink-0">
            <img src={profile.boyfriendPhoto} alt={profile.boyfriendName} className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-slate-700">{profile.boyfriendName}:</span>
          {myBfChoice ? (
            <span className="flex items-center gap-1 text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Check className="w-3 h-3" /> Locked In!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-400 font-medium italic">
              <Clock className="w-3 h-3 animate-spin" /> Thinking...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">{profile.girlfriendName}:</span>
          {myGfChoice ? (
            <span className="flex items-center gap-1 text-pink-600 font-extrabold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
              <Check className="w-3 h-3" /> Locked In!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-400 font-medium italic">
              <Clock className="w-3 h-3 animate-spin" /> Thinking...
            </span>
          )}
          <div className="w-7 h-7 rounded-full overflow-hidden border border-pink-400 shrink-0">
            <img src={profile.girlfriendPhoto} alt={profile.girlfriendName} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Main Dilemma Question Card */}
      <div className="space-y-4 max-w-2xl mx-auto text-center">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 bg-purple-100 px-2.5 py-0.5 rounded-full">
            Dilemma #{currentIndex + 1} of {questions.length}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800">
            {currentQ.title}
          </h3>
          <p className="text-xs text-slate-500">
            Would you rather...
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* OPTION A */}
          <div
            onClick={() => !isRevealed && handleVote('A')}
            className={`group relative rounded-3xl p-5 border-2 text-left transition-all duration-300 flex flex-col justify-between cursor-pointer ${
              myChoice === 'A'
                ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-500 shadow-md ring-2 ring-indigo-400/30 scale-102'
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300'
            } ${isRevealed ? 'cursor-default' : ''}`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{currentQ.optionA.emoji}</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                  Option A
                </span>
              </div>
              <p className="font-bold text-xs sm:text-sm text-slate-800 leading-snug">
                {currentQ.optionA.text}
              </p>
            </div>

            {/* Revealed Avatars Stamp */}
            {isRevealed && (
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Chosen by:</span>
                <div className="flex items-center gap-1.5">
                  {myBfChoice === 'A' && (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
                      <img src={profile.boyfriendPhoto} alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span>{profile.boyfriendName}</span>
                    </div>
                  )}
                  {myGfChoice === 'A' && (
                    <div className="flex items-center gap-1 bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
                      <img src={profile.girlfriendPhoto} alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span>{profile.girlfriendName}</span>
                    </div>
                  )}
                  {myBfChoice !== 'A' && myGfChoice !== 'A' && (
                    <span className="text-[11px] text-slate-400 italic">Neither</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* OPTION B */}
          <div
            onClick={() => !isRevealed && handleVote('B')}
            className={`group relative rounded-3xl p-5 border-2 text-left transition-all duration-300 flex flex-col justify-between cursor-pointer ${
              myChoice === 'B'
                ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-500 shadow-md ring-2 ring-pink-400/30 scale-102'
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-pink-300'
            } ${isRevealed ? 'cursor-default' : ''}`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{currentQ.optionB.emoji}</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-pink-100 text-pink-700">
                  Option B
                </span>
              </div>
              <p className="font-bold text-xs sm:text-sm text-slate-800 leading-snug">
                {currentQ.optionB.text}
              </p>
            </div>

            {/* Revealed Avatars Stamp */}
            {isRevealed && (
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Chosen by:</span>
                <div className="flex items-center gap-1.5">
                  {myBfChoice === 'B' && (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
                      <img src={profile.boyfriendPhoto} alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span>{profile.boyfriendName}</span>
                    </div>
                  )}
                  {myGfChoice === 'B' && (
                    <div className="flex items-center gap-1 bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
                      <img src={profile.girlfriendPhoto} alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span>{profile.girlfriendName}</span>
                    </div>
                  )}
                  {myBfChoice !== 'B' && myGfChoice !== 'B' && (
                    <span className="text-[11px] text-slate-400 italic">Neither</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Revealed Outcome Banner */}
        {isRevealed && (
          <div
            className={`p-4 rounded-2xl border text-center space-y-1.5 animate-fade-in ${
              isMatch
                ? 'bg-gradient-to-r from-amber-50 via-pink-50 to-purple-50 border-amber-300 text-amber-950'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-950'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-base font-black">
              {isMatch ? (
                <>
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>✨ 100% Soul Telepathy Match! ✨</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-indigo-500" />
                  <span>⚡ Opposites Attract! Perfect Balance! ⚡</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-600">
              {isMatch
                ? `Vishvesh & Laura both picked the exact same dream without even speaking a word!`
                : `Different views make your adventures twice as exciting! You complement each other beautifully.`}
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {!isRevealed ? (
            myChoice && (
              <button
                type="button"
                onClick={handleManualSoloReveal}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition cursor-pointer"
              >
                Reveal Answer Now
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:scale-102 active:scale-98 shadow-md shadow-pink-500/25 transition cursor-pointer"
            >
              <span>Next Dilemma</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddCustom(true)}
            className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom</span>
          </button>
        </div>
      </div>

      {/* ADD CUSTOM DILEMMA MODAL */}
      {showAddCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-purple-100 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Add Your Custom Dilemma
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create a dilemma for Vishvesh & Laura to vote on!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCustom(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Dilemma Title (e.g. Midnight Snack Run vs Movie Marathon)"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-purple-200 focus:outline-purple-500"
              />

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newOptAEmoji}
                  onChange={(e) => setNewOptAEmoji(e.target.value)}
                  className="w-12 text-center text-sm px-2 py-2 rounded-xl border border-purple-200"
                  maxLength={4}
                />
                <input
                  type="text"
                  value={newOptAText}
                  onChange={(e) => setNewOptAText(e.target.value)}
                  placeholder="Option A description..."
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-purple-200 focus:outline-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newOptBEmoji}
                  onChange={(e) => setNewOptBEmoji(e.target.value)}
                  className="w-12 text-center text-sm px-2 py-2 rounded-xl border border-purple-200"
                  maxLength={4}
                />
                <input
                  type="text"
                  value={newOptBText}
                  onChange={(e) => setNewOptBText(e.target.value)}
                  placeholder="Option B description..."
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-purple-200 focus:outline-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddCustom(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomDilemma}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-purple-600 hover:bg-purple-700 cursor-pointer"
              >
                Save & Play Dilemma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY DRAWER / MODAL */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[80vh] bg-white rounded-3xl border border-purple-100 shadow-2xl p-6 flex flex-col space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Telepathy History & Stats
                  </h3>
                  <p className="text-xs text-slate-500">
                    {score.totalMatches} matches out of {score.totalRounds} questions ({matchPercentage}% Harmony)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {score.history.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No rounds played yet. Vote on dilemmas to build your telepathy score!
                </div>
              ) : (
                score.history.map((h, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                      h.isMatch
                        ? 'bg-purple-50/60 border-purple-200 text-purple-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="font-bold truncate block">{h.questionTitle}</span>
                      <span className="text-[10px] text-slate-400">
                        {profile.boyfriendName}: Option {h.boyfriendChoice} • {profile.girlfriendName}: Option {h.girlfriendChoice}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                        h.isMatch ? 'bg-purple-200 text-purple-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {h.isMatch ? 'Match ❤️' : 'Different ⚡'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
