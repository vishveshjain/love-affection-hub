import React, { useState, useEffect, useRef } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { TruthOrDareCategory, TruthOrDareItem, TruthOrDareType } from '../../types';
import { soundFx } from '../../utils/audio';
import { realtimeHub, getClientId } from '../../utils/realtime';
import confetti from 'canvas-confetti';
import {
  Flame,
  Sparkles,
  RotateCcw,
  Heart,
  Plus,
  Play,
  Pause,
  Send,
  Timer,
  CheckCircle2,
  Shuffle,
  HelpCircle,
  Eye,
  Smile,
  X,
  Award,
} from 'lucide-react';

const DEFAULT_PROMPTS: TruthOrDareItem[] = [
  // Sweet & Romantic Truths
  {
    id: 'st-1',
    type: 'truth',
    category: 'sweet',
    text: 'What was the exact moment or tiny thing you saw that made you realize you were falling head-over-heels for me?',
    emoji: '💖',
  },
  {
    id: 'st-2',
    type: 'truth',
    category: 'sweet',
    text: 'What is one specific photo or video of us that never fails to make your heart skip a beat?',
    emoji: '📸',
  },
  {
    id: 'st-3',
    type: 'truth',
    category: 'sweet',
    text: 'If we could relive one single 24-hour day from our relationship forever, which day would you choose?',
    emoji: '⏳',
  },
  {
    id: 'st-4',
    type: 'truth',
    category: 'sweet',
    text: 'What is your absolute favorite physical trait or facial expression of mine when I look at you?',
    emoji: '👀',
  },
  {
    id: 'st-5',
    type: 'truth',
    category: 'sweet',
    text: 'What is the sweetest thing I do for you without even realizing it?',
    emoji: '🌸',
  },

  // Sweet & Romantic Dares
  {
    id: 'sd-1',
    type: 'dare',
    category: 'sweet',
    text: 'Look straight into the camera/my eyes for 30 seconds without blinking or breaking eye contact while smiling.',
    emoji: '🥺',
  },
  {
    id: 'sd-2',
    type: 'dare',
    category: 'sweet',
    text: 'Give 5 genuine, non-stop compliments about my personality and beauty in 30 seconds!',
    emoji: '👑',
  },
  {
    id: 'sd-3',
    type: 'dare',
    category: 'sweet',
    text: 'Serenade me right now by singing or humming 15 seconds of our romantic song with maximum passion.',
    emoji: '🎶',
  },
  {
    id: 'sd-4',
    type: 'dare',
    category: 'sweet',
    text: 'Blow 5 dramatic, flying kisses directly into the camera with cute movie sound effects!',
    emoji: '💋',
  },

  // Spicy & Daring Truths
  {
    id: 'spt-1',
    type: 'truth',
    category: 'spicy',
    text: 'What is the most breathless, butterflies-in-the-stomach kiss we have ever shared?',
    emoji: '🔥',
  },
  {
    id: 'spt-2',
    type: 'truth',
    category: 'spicy',
    text: 'What outfit or look of mine drives you completely crazy in the best possible way?',
    emoji: '👗',
  },
  {
    id: 'spt-3',
    type: 'truth',
    category: 'spicy',
    text: 'Where is your favorite place on your body to be kissed or gently stroked?',
    emoji: '✨',
  },
  {
    id: 'spt-4',
    type: 'truth',
    category: 'spicy',
    text: 'If we were stranded alone in a luxury secluded cabin for a stormy weekend, what would our first 2 hours look like?',
    emoji: '🪵',
  },

  // Spicy & Daring Dares
  {
    id: 'spd-1',
    type: 'dare',
    category: 'spicy',
    text: 'Whisper your most irresistible romantic fantasy about us directly into the microphone in a slow, sultry voice.',
    emoji: '🫦',
  },
  {
    id: 'spd-2',
    type: 'dare',
    category: 'spicy',
    text: 'Close your eyes, run your fingertips gently across your lips and neck, and describe exactly how my kisses feel.',
    emoji: '🕯️',
  },
  {
    id: 'spd-3',
    type: 'dare',
    category: 'spicy',
    text: 'Send me a 10-second steamy video or slow-motion photo pose right now in our chat!',
    emoji: '📸',
  },

  // Deep & Soulful Truths
  {
    id: 'dt-1',
    type: 'truth',
    category: 'deep',
    text: 'In what ways do you feel like you have grown or blossomed into a happier person since we met?',
    emoji: '🌱',
  },
  {
    id: 'dt-2',
    type: 'truth',
    category: 'deep',
    text: 'What is a secret dream for our future that you have been holding close to your heart?',
    emoji: '🌌',
  },
  {
    id: 'dt-3',
    type: 'truth',
    category: 'deep',
    text: 'When was a moment you felt the most deeply protected, cherished, and loved by me?',
    emoji: '🛡️',
  },
  {
    id: 'dt-4',
    type: 'truth',
    category: 'deep',
    text: 'What is one promise you want us to make to each other that we will never break, no matter what?',
    emoji: '🤝',
  },

  // Deep & Soulful Dares
  {
    id: 'dd-1',
    type: 'dare',
    category: 'deep',
    text: 'Speak a 1-minute heartfelt letter from the bottom of your soul telling me why you chose me forever.',
    emoji: '📜',
  },
  {
    id: 'dd-2',
    type: 'dare',
    category: 'deep',
    text: 'Put your hand over your heart, close your eyes, and take 3 deep breaths while imagining us in 20 years.',
    emoji: '🤍',
  },

  // Playful & Cheeky Truths
  {
    id: 'pt-1',
    type: 'truth',
    category: 'playful',
    text: 'What is the funniest or most embarrassing thing you have done to try and impress me?',
    emoji: '🤭',
  },
  {
    id: 'pt-2',
    type: 'truth',
    category: 'playful',
    text: 'If I were a cute animal, which animal would I be and why?',
    emoji: '🐾',
  },
  {
    id: 'pt-3',
    type: 'truth',
    category: 'playful',
    text: 'Who is usually the bigger drama queen or king when hungry or tired?',
    emoji: '👑',
  },

  // Playful & Cheeky Dares
  {
    id: 'pd-1',
    type: 'dare',
    category: 'playful',
    text: 'Do your best dramatic impression of how I talk or react when I get excited or sleepy!',
    emoji: '🎭',
  },
  {
    id: 'pd-2',
    type: 'dare',
    category: 'playful',
    text: 'Balancing act: Put a pillow or book on your head and do a slow runway walk without letting it drop!',
    emoji: '🤹',
  },
  {
    id: 'pd-3',
    type: 'dare',
    category: 'playful',
    text: 'Invent a silly 4-line rhyming rap or poem dedicated to my cute cheeks right now!',
    emoji: '🎤',
  },
];

export const TruthOrDare: React.FC = () => {
  const { profile, currentUserName, partnerName, partnerRole } = useCouple();

  const [activeCategory, setActiveCategory] = useState<TruthOrDareCategory | 'all'>('all');
  const [currentPrompt, setCurrentPrompt] = useState<TruthOrDareItem | null>(null);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [sparksCount, setSparksCount] = useState<number>(0);
  const [turn, setTurn] = useState<'boyfriend' | 'girlfriend'>('girlfriend');

  // Dare countdown timer
  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Custom prompt modal
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customType, setCustomType] = useState<TruthOrDareType>('truth');
  const [customCategory, setCustomCategory] = useState<TruthOrDareCategory>('sweet');
  const [customText, setCustomText] = useState<string>('');

  // Real-time synchronization
  useEffect(() => {
    const unsub = realtimeHub.subscribe((msg) => {
      if (msg.type === 'TRUTH_OR_DARE_EVENT' && msg.data) {
        const { action, payload } = msg.data;
        if (action === 'DRAW_CARD') {
          setCurrentPrompt(payload.prompt);
          setIsFlipped(true);
          setTurn(payload.turn);
          soundFx.playPop(580, 0.08);
        } else if (action === 'COMPLETE_ROUND') {
          setSparksCount((prev) => prev + 1);
          soundFx.playCelebration();
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f43f5e', '#ec4899', '#fbbf24', '#8b5cf6'],
          });
        } else if (action === 'SEND_CUSTOM') {
          setCurrentPrompt(payload.prompt);
          setIsFlipped(true);
          setTurn(payload.turn);
          soundFx.playKiss();
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.5 },
          });
        }
      }
    });

    return () => unsub();
  }, []);

  const broadcast = (action: string, payload: any) => {
    realtimeHub.publish({
      type: 'TRUTH_OR_DARE_EVENT',
      clientId: getClientId(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      data: { action, payload },
      timestamp: Date.now(),
    });
  };

  // Timer controls
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            soundFx.playCelebration();
            return 0;
          }
          soundFx.playPop(480, 0.02);
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timerSeconds]);

  const drawCard = (type: TruthOrDareType | 'random') => {
    setIsFlipped(false);
    setIsTimerRunning(false);
    setTimerSeconds(30);

    setTimeout(() => {
      let filtered = DEFAULT_PROMPTS.filter((p) => {
        if (activeCategory !== 'all' && p.category !== activeCategory) return false;
        if (type !== 'random' && p.type !== type) return false;
        return true;
      });

      if (filtered.length === 0) {
        filtered = DEFAULT_PROMPTS.filter((p) => (type !== 'random' ? p.type === type : true));
      }

      const randomChoice = filtered[Math.floor(Math.random() * filtered.length)];
      setCurrentPrompt(randomChoice);
      setIsFlipped(true);
      soundFx.playPop(620, 0.08);

      broadcast('DRAW_CARD', { prompt: randomChoice, turn });
    }, 250);
  };

  const handleCompletePrompt = () => {
    setSparksCount((prev) => prev + 1);
    soundFx.playCelebration();
    confetti({
      particleCount: 65,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24', '#8b5cf6'],
    });

    // Switch turn
    const nextTurn = turn === 'boyfriend' ? 'girlfriend' : 'boyfriend';
    setTurn(nextTurn);

    broadcast('COMPLETE_ROUND', { sparks: sparksCount + 1, nextTurn });
  };

  const handleSendCustomPrompt = () => {
    if (!customText.trim()) return;
    const promptItem: TruthOrDareItem = {
      id: `custom-${Date.now()}`,
      type: customType,
      category: customCategory,
      text: customText.trim(),
      emoji: customType === 'truth' ? '💌' : '🔥',
      isCustom: true,
      authorRole: profile.currentUserRole,
    };

    setCurrentPrompt(promptItem);
    setIsFlipped(true);
    setShowCustomModal(false);
    setCustomText('');
    soundFx.playKiss();

    // Turn is set to partner to answer/perform!
    const targetTurn = partnerRole;
    setTurn(targetTurn);

    broadcast('SEND_CUSTOM', { prompt: promptItem, turn: targetTurn });
  };

  const targetPersonName = turn === 'boyfriend' ? profile.boyfriendName : profile.girlfriendName;

  return (
    <div className="relative bg-gradient-to-b from-white/95 via-rose-50/40 to-pink-50/40 backdrop-blur-md rounded-3xl border border-rose-100 shadow-xl p-4 sm:p-7 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-rose-100/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                Truth or Dare: Romantic Whispers
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700 tracking-wider">
                Intimate Edition
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Sweet confessions, romantic dares & deep heart-to-heart moments between Vishvesh & Laura.
            </p>
          </div>
        </div>

        {/* Sparks Meter & Custom Whisper Button */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Sparks: {sparksCount} 🔥</span>
          </div>

          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Whisper to Partner</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Turn Selector */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Turn Indicator */}
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-500 pl-2">Current Turn:</span>
          <button
            type="button"
            onClick={() => setTurn('boyfriend')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              turn === 'boyfriend'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👑 {profile.boyfriendName}
          </button>
          <button
            type="button"
            onClick={() => setTurn('girlfriend')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              turn === 'girlfriend'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌸 {profile.girlfriendName}
          </button>
          <button
            type="button"
            onClick={() => setTurn((prev) => (prev === 'boyfriend' ? 'girlfriend' : 'boyfriend'))}
            className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            title="Switch Turn"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {[
            { id: 'all', label: 'All Moods', emoji: '✨' },
            { id: 'sweet', label: 'Sweet & Romantic', emoji: '💖' },
            { id: 'spicy', label: 'Spicy & Daring', emoji: '🔥' },
            { id: 'deep', label: 'Deep & Soulful', emoji: '🧠' },
            { id: 'playful', label: 'Playful & Cheeky', emoji: '🤪' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="flex flex-col items-center justify-center space-y-6 py-2">
        {/* The Card */}
        <div className="relative w-full max-w-md min-h-[300px] flex items-center justify-center">
          {currentPrompt ? (
            /* Front of Card (Prompt Revealed) */
            <div className="w-full min-h-[300px] bg-gradient-to-br from-white via-rose-50/50 to-pink-50/80 rounded-3xl border-2 border-rose-200 p-6 flex flex-col justify-between items-center text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between w-full border-b border-rose-100 pb-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    currentPrompt.type === 'truth'
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {currentPrompt.type === 'truth' ? '💌 Romantic Truth' : '🔥 Passionate Dare'}
                </span>

                <span className="text-xs font-extrabold text-slate-500 capitalize">
                  For: {targetPersonName}
                </span>
              </div>

              <div className="space-y-3 px-2 py-4">
                <div className="text-4xl animate-bounce">{currentPrompt.emoji}</div>
                <p className="font-bold text-sm sm:text-base text-slate-800 leading-relaxed font-serif">
                  "{currentPrompt.text}"
                </p>
              </div>

              {/* Actions / Timer if Dare */}
              <div className="w-full flex items-center justify-between pt-2 border-t border-rose-100">
                {currentPrompt.type === 'dare' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTimerRunning((prev) => !prev)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{timerSeconds}s</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(30);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Speak from the heart 💖</span>
                )}

                <button
                  type="button"
                  onClick={handleCompletePrompt}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-102 active:scale-98 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed!</span>
                </button>
              </div>
            </div>
          ) : (
            /* Cover Card (Before First Draw) */
            <div className="w-full min-h-[300px] bg-gradient-to-br from-rose-500 via-pink-600 to-amber-500 rounded-3xl border-2 border-white/40 p-6 flex flex-col justify-between items-center text-white text-center shadow-xl animate-in fade-in duration-200">
              <div className="w-full flex justify-between text-xs text-white/80 font-bold">
                <span>🌹 Whispers & Dares</span>
                <span>👑 Vishvesh & Laura</span>
              </div>

              <div className="space-y-2 py-4">
                <Flame className="w-16 h-16 mx-auto animate-pulse text-amber-200" />
                <h3 className="text-lg font-black tracking-wide">Ready for a Romantic Secret?</h3>
                <p className="text-xs text-pink-100 max-w-xs">
                  Draw a card for <span className="font-black underline">{targetPersonName}</span>!
                </p>
              </div>

              <span className="text-[11px] font-bold text-white/80 bg-white/20 px-3 py-1 rounded-full">
                Tap Truth, Dare, or Surprise Me below! ✨
              </span>
            </div>
          )}
        </div>

        {/* Draw Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
          <button
            type="button"
            onClick={() => drawCard('truth')}
            className="flex-1 min-w-[120px] py-3 px-4 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 shadow-md shadow-rose-500/25 hover:scale-102 active:scale-98 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>💌 Truth</span>
          </button>

          <button
            type="button"
            onClick={() => drawCard('dare')}
            className="flex-1 min-w-[120px] py-3 px-4 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-95 shadow-md shadow-orange-500/25 hover:scale-102 active:scale-98 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4 fill-white" />
            <span>🔥 Dare</span>
          </button>

          <button
            type="button"
            onClick={() => drawCard('random')}
            className="py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs hover:scale-102 active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5"
            title="Random Selection"
          >
            <Shuffle className="w-4 h-4 text-purple-500" />
            <span>Surprise Me</span>
          </button>
        </div>
      </div>

      {/* CUSTOM WHISPER MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-rose-100 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Whisper a Custom Truth or Dare
                  </h3>
                  <p className="text-xs text-slate-500">
                    Write your own question or intimate dare for {partnerName}!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-3">
              {/* Type Switch */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomType('truth')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    customType === 'truth'
                      ? 'bg-pink-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  💌 Secret Truth
                </button>
                <button
                  type="button"
                  onClick={() => setCustomType('dare')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    customType === 'dare'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🔥 Sweet Dare
                </button>
              </div>

              {/* Text Input */}
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={`What would you love to ask or dare ${partnerName} to do right now?`}
                className="w-full h-28 p-3 text-xs sm:text-sm rounded-2xl border border-rose-200 focus:outline-rose-500 bg-rose-50/20"
                maxLength={250}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                It will pop up live on {partnerName}'s screen!
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendCustomPrompt}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 shadow-md shadow-pink-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Whisper</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
