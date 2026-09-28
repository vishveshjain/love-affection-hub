import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  Bell,
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
  const { profile, currentUserName, currentUserPhoto, partnerName, partnerPhoto, switchCurrentUserRole } = useCouple();

  const [questions, setQuestions] = useState<TelepathyQuestion[]>(CURATED_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Directly track My Choice and Partner Choice for 100% deterministic, collision-free sync
  const [myChoice, setMyChoice] = useState<'A' | 'B' | null>(null);
  const [partnerChoice, setPartnerChoice] = useState<'A' | 'B' | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [nudgeMessage, setNudgeMessage] = useState<string>('');

  const [score, setScore] = useState<TelepathyScore>(() => loadTelepathyScore());
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);

  // Custom dilemma state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newOptAText, setNewOptAText] = useState<string>('');
  const [newOptAEmoji, setNewOptAEmoji] = useState<string>('✨');
  const [newOptBText, setNewOptBText] = useState<string>('');
  const [newOptBEmoji, setNewOptBEmoji] = useState<string>('💖');

  // Stable references for realtime callback
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const myChoiceRef = useRef(myChoice);
  myChoiceRef.current = myChoice;

  const partnerChoiceRef = useRef(partnerChoice);
  partnerChoiceRef.current = partnerChoice;

  const isRevealedRef = useRef(isRevealed);
  isRevealedRef.current = isRevealed;

  const questionsRef = useRef(questions);
  questionsRef.current = questions;

  const scoreRef = useRef(score);
  scoreRef.current = score;

  const autoAdvanceTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  const currentQ = questions[currentIndex % questions.length];

  // Helper to publish messages over realtimeHub
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

  // Perform Reveal logic and record score
  const executeReveal = (
    myC: 'A' | 'B' | null,
    partnerC: 'A' | 'B' | null,
    qIndex: number,
    shouldBroadcast = false
  ) => {
    setIsRevealed(true);
    isRevealedRef.current = true;
    setMyChoice(myC);
    setPartnerChoice(partnerC);

    const bothVoted = Boolean(myC && partnerC);
    const isMatch = Boolean(bothVoted && myC === partnerC);

    // Only count towards telepathy score if BOTH partners genuinely participated!
    if (bothVoted && myC && partnerC) {
      const targetQ = questionsRef.current[qIndex % questionsRef.current.length];
      const isBf = profile.currentUserRole === 'boyfriend';
      const bfChoice = isBf ? myC : partnerC;
      const gfChoice = isBf ? partnerC : myC;

      const updatedScore: TelepathyScore = {
        totalRounds: scoreRef.current.totalRounds + 1,
        totalMatches: isMatch ? scoreRef.current.totalMatches + 1 : scoreRef.current.totalMatches,
        history: [
          {
            questionId: targetQ.id,
            questionTitle: targetQ.title,
            boyfriendChoice: bfChoice,
            girlfriendChoice: gfChoice,
            isMatch,
            timestamp: Date.now(),
          },
          ...scoreRef.current.history,
        ],
      };

      setScore(updatedScore);
      saveTelepathyScore(updatedScore);

      if (isMatch) {
        soundFx.playCelebration();
        confetti({
          particleCount: 85,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#fbbf24', '#8b5cf6'],
        });
      } else {
        soundFx.playKiss();
      }
    } else {
      soundFx.playPop(550, 0.08);
    }

    if (shouldBroadcast) {
      broadcast('FORCE_REVEAL', {
        questionIndex: qIndex,
        choiceFromSender: myC,
        choiceFromReceiver: partnerC,
      });
    }

    // Begin countdown to next dilemma so both advance seamlessly
    startAutoAdvance();
  };

  // Automatic countdown timer before advancing to the next question
  const startAutoAdvance = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setAutoAdvanceCountdown(4);

    countdownIntervalRef.current = setInterval(() => {
      setAutoAdvanceCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    autoAdvanceTimerRef.current = setTimeout(() => {
      handleNext(true); // broadcast next question
    }, 4200);
  };

  // Advance to next question for both partners
  const handleNext = (shouldBroadcast = true) => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const nextIdx = (currentIndexRef.current + 1) % questionsRef.current.length;
    setCurrentIndex(nextIdx);
    setMyChoice(null);
    setPartnerChoice(null);
    setIsRevealed(false);
    setAutoAdvanceCountdown(null);
    setNudgeMessage('');
    soundFx.playPop(480, 0.08);

    if (shouldBroadcast) {
      broadcast('ADVANCE_QUESTION', { nextIndex: nextIdx });
    }
  };

  // Local Vote click
  const handleVote = (choice: 'A' | 'B') => {
    if (myChoice || isRevealed) return; // already voted or revealed

    setMyChoice(choice);
    soundFx.playPop(600, 0.08);

    const existingPartnerChoice = partnerChoiceRef.current;

    // Send my vote to partner immediately
    broadcast('PARTNER_VOTED', {
      questionIndex: currentIndexRef.current,
      choice,
      senderName: currentUserName,
    });

    // If partner had already voted, both are now done — trigger reveal!
    if (existingPartnerChoice) {
      executeReveal(choice, existingPartnerChoice, currentIndexRef.current, true);
    }
  };

  // Manual Reveal button (when partner hasn't answered yet or skipping)
  const handleManualReveal = () => {
    if (isRevealed) return;
    executeReveal(myChoiceRef.current, partnerChoiceRef.current, currentIndexRef.current, true);
  };

  // Nudge partner to vote
  const handleNudgePartner = () => {
    soundFx.playCelebration();
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.6 },
    });
    setNudgeMessage(`Sent a playful love buzz to ${partnerName}! 💖`);
    setTimeout(() => setNudgeMessage(''), 3000);

    broadcast('NUDGE', {
      senderName: currentUserName,
      questionIndex: currentIndexRef.current,
    });
  };

  // Persistent Real-time synchronization
  useEffect(() => {
    // Request current state from partner on mount
    broadcast('REQUEST_SYNC', {});

    const unsub = realtimeHub.subscribe((msg) => {
      if (msg.type === 'TELEPATHY_EVENT' && msg.data) {
        const { action, payload } = msg.data;

        if (action === 'REQUEST_SYNC') {
          // Send current state to newly joined partner
          broadcast('SYNC_STATE', {
            questionIndex: currentIndexRef.current,
            senderChoice: myChoiceRef.current,
            receiverChoice: partnerChoiceRef.current,
            isRevealed: isRevealedRef.current,
          });
        } else if (action === 'SYNC_STATE') {
          if (payload) {
            setCurrentIndex(payload.questionIndex ?? 0);
            setPartnerChoice(payload.senderChoice ?? null);
            setIsRevealed(Boolean(payload.isRevealed));
          }
        } else if (action === 'PARTNER_VOTED') {
          // Partner has voted on their screen!
          if (payload.questionIndex !== undefined) {
            setCurrentIndex(payload.questionIndex);
          }

          setPartnerChoice(payload.choice);
          soundFx.playPop(520, 0.05);

          const myExistingChoice = myChoiceRef.current;

          // If I have also already voted, trigger reveal on this screen too!
          if (myExistingChoice && !isRevealedRef.current) {
            executeReveal(myExistingChoice, payload.choice, payload.questionIndex ?? currentIndexRef.current, false);
          }
        } else if (action === 'FORCE_REVEAL') {
          // Remote reveal triggered!
          if (payload.questionIndex !== undefined) {
            setCurrentIndex(payload.questionIndex);
          }
          // The sender's choice is my partner's choice!
          executeReveal(
            myChoiceRef.current,
            payload.choiceFromSender,
            payload.questionIndex ?? currentIndexRef.current,
            false
          );
        } else if (action === 'ADVANCE_QUESTION') {
          // Question automatically changed by partner or countdown!
          if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

          setCurrentIndex(payload.nextIndex);
          setMyChoice(null);
          setPartnerChoice(null);
          setIsRevealed(false);
          setAutoAdvanceCountdown(null);
          setNudgeMessage('');
          soundFx.playPop(480, 0.08);
        } else if (action === 'NUDGE') {
          soundFx.playCelebration();
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.5 },
          });
          setNudgeMessage(`${payload.senderName || 'Your partner'} wants you to pick your answer! 💕`);
          setTimeout(() => setNudgeMessage(''), 4000);
        } else if (action === 'ADD_CUSTOM') {
          setQuestions((prev) => [...prev, payload.question]);
          soundFx.playPop(580, 0.08);
        }
      }
    });

    return () => {
      unsub();
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

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
    const newIdx = updated.length - 1;
    setCurrentIndex(newIdx);
    setMyChoice(null);
    setPartnerChoice(null);
    setIsRevealed(false);
    setAutoAdvanceCountdown(null);
    setShowAddCustom(false);
    setNewTitle('');
    setNewOptAText('');
    setNewOptBText('');

    soundFx.playCelebration();
    broadcast('ADD_CUSTOM', { question: newQ });
    broadcast('ADVANCE_QUESTION', { nextIndex: newIdx });
  };

  const matchPercentage =
    score.totalRounds > 0 ? Math.round((score.totalMatches / score.totalRounds) * 100) : 100;

  const bothVoted = Boolean(myChoice && partnerChoice);
  const isMatch = Boolean(bothVoted && myChoice === partnerChoice);

  // Figure out who picked Option A and Option B
  const pickedA: string[] = [];
  const pickedB: string[] = [];

  if (myChoice === 'A') pickedA.push(currentUserName);
  if (partnerChoice === 'A') pickedA.push(partnerName);
  if (myChoice === 'B') pickedB.push(currentUserName);
  if (partnerChoice === 'B') pickedB.push(partnerName);

  return (
    <div className="relative bg-gradient-to-b from-white/95 via-purple-50/40 to-pink-50/40 backdrop-blur-md rounded-3xl border border-purple-100 shadow-xl p-4 sm:p-7 space-y-5">
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
                Live 100% Sync
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Pick your secret choice simultaneously — both screens reveal and advance together in real time!
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

      {/* Role Pill Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-purple-50/70 p-2.5 rounded-2xl border border-purple-100 text-xs">
        <span className="font-semibold text-slate-600">
          This device is voting as:{' '}
          <span className="font-black text-purple-800">{currentUserName}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => switchCurrentUserRole('boyfriend')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
              profile.currentUserRole === 'boyfriend'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            🤴 {profile.boyfriendName}
          </button>
          <button
            type="button"
            onClick={() => switchCurrentUserRole('girlfriend')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
              profile.currentUserRole === 'girlfriend'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            👸 {profile.girlfriendName}
          </button>
        </div>
      </div>

      {/* Live Status Indicators (My choice & Partner choice) */}
      <div className="flex items-center justify-between bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-blue-400 shrink-0">
            <img src={currentUserPhoto} alt={currentUserName} className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-slate-700">{currentUserName} (You):</span>
          {myChoice ? (
            <span className="flex items-center gap-1 text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Check className="w-3 h-3" /> Locked In!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-400 font-medium italic">
              <Clock className="w-3 h-3 animate-spin" /> Pick an option below...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">{partnerName}:</span>
          {partnerChoice ? (
            <span className="flex items-center gap-1 text-pink-600 font-extrabold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
              <Check className="w-3 h-3" /> Locked In!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-400 font-medium italic">
              <Clock className="w-3 h-3 animate-spin" /> Thinking...
            </span>
          )}
          <div className="w-7 h-7 rounded-full overflow-hidden border border-pink-400 shrink-0">
            <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Nudge Alert Message */}
      {nudgeMessage && (
        <div className="p-2.5 rounded-xl bg-pink-100 border border-pink-300 text-pink-900 text-center text-xs font-bold animate-bounce">
          {nudgeMessage}
        </div>
      )}

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
            onClick={() => handleVote('A')}
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
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {pickedA.map((name, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold"
                    >
                      {name}
                    </span>
                  ))}
                  {pickedA.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">Neither</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* OPTION B */}
          <div
            onClick={() => handleVote('B')}
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
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {pickedB.map((name, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[11px] font-bold"
                    >
                      {name}
                    </span>
                  ))}
                  {pickedB.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">Neither</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Revealed Outcome Banner & Countdown */}
        {isRevealed && (
          <div
            className={`p-4 rounded-2xl border text-center space-y-2 animate-fade-in ${
              bothVoted
                ? isMatch
                  ? 'bg-gradient-to-r from-amber-50 via-pink-50 to-purple-50 border-amber-300 text-amber-950'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-950'
                : 'bg-gradient-to-r from-slate-50 to-purple-50 border-purple-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-base font-black">
              {bothVoted ? (
                isMatch ? (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 animate-spin" />
                    <span>✨ 100% Soul Telepathy Match! ✨</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-indigo-500 animate-bounce" />
                    <span>⚡ Opposites Attract! Perfect Balance! ⚡</span>
                  </>
                )
              ) : (
                <>
                  <Clock className="w-5 h-5 text-purple-500" />
                  <span>Waiting for {partnerName}'s choice! ⏳</span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-600">
              {bothVoted ? (
                isMatch
                  ? `${currentUserName} & ${partnerName} both picked Option ${myChoice}! Soulmate synchronicity!`
                  : `${currentUserName} picked Option ${myChoice}, while ${partnerName} picked Option ${partnerChoice}! Unique tastes make your bond special.`
              ) : (
                `Only ${myChoice ? currentUserName : partnerName} has voted so far. Telepathy harmony updates once both of you vote!`
              )}
            </p>

            {/* Live Auto-Advance Indicator */}
            {autoAdvanceCountdown !== null && autoAdvanceCountdown > 0 && (
              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-bold text-purple-700 animate-pulse">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                <span>Advancing to next dilemma in {autoAdvanceCountdown}s...</span>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
          {!isRevealed ? (
            <>
              {/* If I have chosen, but partner hasn't */}
              {myChoice && !partnerChoice && (
                <button
                  type="button"
                  onClick={handleNudgePartner}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-xs text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 transition cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Nudge {partnerName} 🔔</span>
                </button>
              )}

              {/* Reveal Answers button */}
              <button
                type="button"
                onClick={handleManualReveal}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:scale-102 active:scale-98 shadow-md shadow-purple-500/25 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {bothVoted ? 'Reveal Both Answers!' : 'Reveal / Skip Dilemma'}
                </span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleNext(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:scale-102 active:scale-98 shadow-md shadow-pink-500/25 transition cursor-pointer"
            >
              <span>Next Dilemma Now</span>
              <ArrowRight className="w-4 h-4" />
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
                    Create a dilemma for {currentUserName} & {partnerName} to vote on together!
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
                    {score.totalMatches} matches out of {score.totalRounds} rounds played together ({matchPercentage}% Harmony)
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
                  No rounds played yet. Both vote on dilemmas together to build your telepathy score!
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
