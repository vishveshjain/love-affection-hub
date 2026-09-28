import React, { useState, useEffect, useRef } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { MashCategory, MashOption, MashResult } from '../../types';
import { loadMashFortunes, saveMashFortunes } from '../../utils/storage';
import { soundFx } from '../../utils/audio';
import { realtimeHub, getClientId } from '../../utils/realtime';
import confetti from 'canvas-confetti';
import {
  Castle,
  Sparkles,
  RotateCcw,
  Heart,
  Plus,
  Trash2,
  Share2,
  BookmarkCheck,
  Check,
  Compass,
  Scroll,
  Dices,
  Flame,
  Award,
  ChevronDown,
  X,
} from 'lucide-react';

const INITIAL_CATEGORIES: MashCategory[] = [
  {
    id: 'living',
    title: 'M.A.S.H. Living Space',
    icon: '🏰',
    options: [
      { id: 'l1', text: 'Mansion with rooftop pool & private cinema', emoji: '🏰' },
      { id: 'l2', text: 'Apartment in Paris with flower balcony', emoji: '🥐' },
      { id: 'l3', text: 'Shack / Cozy Mountain Log Cabin with fireplace', emoji: '🪵' },
      { id: 'l4', text: 'House / Luxury Oceanfront Beach Villa', emoji: '🏖️' },
    ],
  },
  {
    id: 'honeymoon',
    title: 'Dream Honeymoon & Getaway',
    icon: '✈️',
    options: [
      { id: 'h1', text: 'Santorini Sunset Private Catamaran Cruise', emoji: '🌅' },
      { id: 'h2', text: 'Northern Lights Glass Igloo Snuggles', emoji: '🌌' },
      { id: 'h3', text: 'Maldives Overwater Bungalow with glass floor', emoji: '🏝️' },
      { id: 'h4', text: 'Swiss Alps Luxury Spa & Hot Cocoa Chalet', emoji: '❄️' },
    ],
  },
  {
    id: 'family',
    title: 'Family & Little Angels',
    icon: '👶',
    options: [
      { id: 'f1', text: 'Twin cuties (boy & girl) with mom’s smile & dad’s eyes', emoji: '👶👧' },
      { id: 'f2', text: '3 playful little gigglers playing hide-and-seek', emoji: '🧸' },
      { id: 'f3', text: '1 adorable sweetheart spoiled with endless cuddles', emoji: '🍼' },
      { id: 'f4', text: 'Golden fur-baby first, then 2 sweet toddlers later', emoji: '🐾' },
    ],
  },
  {
    id: 'ride',
    title: 'Our Couple Ride',
    icon: '🚗',
    options: [
      { id: 'r1', text: 'Cherry-Red Vintage Convertible for sunset drives', emoji: '🚗' },
      { id: 'r2', text: 'Sleek Cyber Cruiser / Electric Sports Car', emoji: '⚡' },
      { id: 'r3', text: 'Pastel Tandem Bicycle with a wicker picnic basket', emoji: '🚲' },
      { id: 'r4', text: 'Private Starlit Yacht for midnight sea escapes', emoji: '⛵' },
    ],
  },
  {
    id: 'pet',
    title: 'Beloved Furry Companion',
    icon: '🐾',
    options: [
      { id: 'p1', text: 'Golden Retriever that insists on sleeping between us', emoji: '🐕' },
      { id: 'p2', text: 'Fluffy British Shorthair kitten that purrs nonstop', emoji: '🐱' },
      { id: 'p3', text: 'Chubby French Bulldog who snores adorably', emoji: '🐶' },
      { id: 'p4', text: 'Pair of pastel lovebirds singing morning melodies', emoji: '🦜' },
    ],
  },
  {
    id: 'vibe',
    title: 'Our Couple Vibe & Routine',
    icon: '✨',
    options: [
      { id: 'v1', text: 'Power Couple conquering goals by day, holding hands by night', emoji: '💼' },
      { id: 'v2', text: 'Cozy weekend bakers wearing oversized soft sweaters', emoji: '🍪' },
      { id: 'v3', text: 'Global Nomads with passports packed with stamps', emoji: '🎒' },
      { id: 'v4', text: 'Midnight chefs making pancakes and dancing in pajamas', emoji: '🥞' },
    ],
  },
  {
    id: 'fiftyYears',
    title: 'In 50 Years Together',
    icon: '👵👴',
    options: [
      { id: 'y1', text: 'Rocking chairs on a wrap-around porch watching sunsets', emoji: '🌅' },
      { id: 'y2', text: 'Still stealing kitchen kisses while brewing morning coffee', emoji: '☕' },
      { id: 'y3', text: 'World travelers showing 50 photo scrapbooks to family', emoji: '📸' },
      { id: 'y4', text: 'Still holding hands in grocery aisles like young teenagers', emoji: '💖' },
    ],
  },
];

type GamePhase = 'setup' | 'spiral' | 'eliminating' | 'revealed';

export const MashGame: React.FC = () => {
  const { profile, currentUserName } = useCouple();

  const [categories, setCategories] = useState<MashCategory[]>(() => {
    return JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
  });

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [magicNumber, setMagicNumber] = useState<number>(4);
  const [isSpinningSpiral, setIsSpinningSpiral] = useState<boolean>(false);
  const [spiralAngle, setSpiralAngle] = useState<number>(0);
  const [spiralProgress, setSpiralProgress] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [currentStepCount, setCurrentStepCount] = useState<number>(0);
  const [finalResult, setFinalResult] = useState<MashResult | null>(null);

  // Destiny Vault saved fortunes
  const [savedFortunes, setSavedFortunes] = useState<MashResult[]>(() => loadMashFortunes());
  const [showVault, setShowVault] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isSavedCurrent, setIsSavedCurrent] = useState<boolean>(false);

  // New option addition inputs
  const [addingToCategoryId, setAddingToCategoryId] = useState<string | null>(null);
  const [newOptionText, setNewOptionText] = useState<string>('');
  const [newOptionEmoji, setNewOptionEmoji] = useState<string>('✨');

  // Animation & interval refs
  const spiralTimerRef = useRef<any>(null);
  const eliminationTimerRef = useRef<any>(null);
  const categoriesRef = useRef<MashCategory[]>(categories);
  categoriesRef.current = categories;

  // Real-time synchronization
  useEffect(() => {
    const unsub = realtimeHub.subscribe((msg) => {
      if (msg.type === 'MASH_UPDATE' && msg.data) {
        const { action, payload } = msg.data;
        if (action === 'UPDATE_CATEGORIES' && payload?.categories) {
          setCategories(payload.categories);
        } else if (action === 'START_SPIRAL') {
          setPhase('spiral');
          setIsSpinningSpiral(true);
        } else if (action === 'STOP_SPIRAL' && typeof payload?.magicNumber === 'number') {
          setIsSpinningSpiral(false);
          setMagicNumber(payload.magicNumber);
        } else if (action === 'START_ELIMINATION' && typeof payload?.magicNumber === 'number') {
          setMagicNumber(payload.magicNumber);
          setCategories(payload.categories);
          startEliminationLoop(payload.categories, payload.magicNumber, true);
        } else if (action === 'RESET_GAME') {
          resetGame(true);
        }
      }
    });

    return () => unsub();
  }, []);

  const broadcast = (action: string, payload: any) => {
    realtimeHub.publish({
      type: 'MASH_UPDATE',
      clientId: getClientId(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      data: { action, payload },
      timestamp: Date.now(),
    });
  };

  // Add custom option to category
  const handleAddOption = (catId: string) => {
    if (!newOptionText.trim()) return;
    const updated = categories.map((cat) => {
      if (cat.id === catId) {
        const newOpt: MashOption = {
          id: `opt-${Date.now()}`,
          text: newOptionText.trim(),
          emoji: newOptionEmoji.trim() || '✨',
        };
        return { ...cat, options: [...cat.options, newOpt] };
      }
      return cat;
    });
    setCategories(updated);
    setNewOptionText('');
    setAddingToCategoryId(null);
    soundFx.playPop(580, 0.08);
    broadcast('UPDATE_CATEGORIES', { categories: updated });
  };

  // Remove option from category (ensure at least 2 options remain)
  const handleRemoveOption = (catId: string, optId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat || cat.options.length <= 2) {
      alert('Each category must have at least 2 destiny options to play!');
      return;
    }
    const updated = categories.map((c) => {
      if (c.id === catId) {
        return { ...c, options: c.options.filter((o) => o.id !== optId) };
      }
      return cat;
    });
    setCategories(updated);
    soundFx.playPop(420, 0.06);
    broadcast('UPDATE_CATEGORIES', { categories: updated });
  };

  // Reset to default romantic categories
  const handleResetDefaults = () => {
    const defaults = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
    setCategories(defaults);
    soundFx.playPop(480, 0.08);
    broadcast('UPDATE_CATEGORIES', { categories: defaults });
  };

  // Magic Spiral Spinner Handlers
  const handleStartSpiral = () => {
    setPhase('spiral');
    setIsSpinningSpiral(true);
    setSpiralProgress(0);
    broadcast('START_SPIRAL', {});

    if (spiralTimerRef.current) clearInterval(spiralTimerRef.current);
    spiralTimerRef.current = setInterval(() => {
      setSpiralAngle((prev) => (prev + 35) % 360);
      setSpiralProgress((prev) => Math.min(100, prev + 2.5));
      soundFx.playPop(440 + Math.random() * 200, 0.02);
    }, 60);
  };

  const handleStopSpiral = () => {
    if (spiralTimerRef.current) clearInterval(spiralTimerRef.current);
    setIsSpinningSpiral(false);

    // Calculate destiny magic number between 3 and 10 based on rotation
    const computedNum = 3 + Math.floor(Math.random() * 8); // 3 to 10
    setMagicNumber(computedNum);
    soundFx.playCelebration();
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#c084fc', '#f43f5e', '#fbbf24'],
    });

    broadcast('STOP_SPIRAL', { magicNumber: computedNum });
  };

  // Sequential Elimination Algorithm
  const startEliminationLoop = (cats: MashCategory[], magicNum: number, fromRemote = false) => {
    setPhase('eliminating');
    if (!fromRemote) {
      broadcast('START_ELIMINATION', { categories: cats, magicNumber: magicNum });
    }

    // Clone working state
    const currentCats: MashCategory[] = JSON.parse(JSON.stringify(cats));
    // Clear previous results
    currentCats.forEach((c) => {
      c.result = undefined;
      c.options.forEach((o) => {
        o.eliminated = false;
        o.isWinner = false;
      });
    });

    // Flatten all selectable options that belong to unfinished categories
    // Rule of M.A.S.H.: Loop continuously around non-eliminated items until only 1 remains in every category
    let flatIndex = 0;
    let countInCycle = 0;

    if (eliminationTimerRef.current) clearInterval(eliminationTimerRef.current);

    const stepSpeed = 380; // ms per count tick

    eliminationTimerRef.current = setInterval(() => {
      // Find all items currently eligible for counting
      // Only include items from categories that haven't yet been decided (have > 1 un-eliminated option)
      // and items that are not yet eliminated
      const eligiblePool: { catIndex: number; optIndex: number; opt: MashOption }[] = [];

      currentCats.forEach((cat, cIdx) => {
        const remainingInCat = cat.options.filter((o) => !o.eliminated);
        if (remainingInCat.length > 1) {
          cat.options.forEach((opt, oIdx) => {
            if (!opt.eliminated) {
              eligiblePool.push({ catIndex: cIdx, optIndex: oIdx, opt });
            }
          });
        }
      });

      // If no categories have > 1 item left, we are done!
      if (eligiblePool.length === 0) {
        clearInterval(eliminationTimerRef.current);
        finishGame(currentCats, magicNum);
        return;
      }

      // Advance counting pointer
      flatIndex = flatIndex % eligiblePool.length;
      const target = eligiblePool[flatIndex];
      setCurrentIndex(flatIndex);
      countInCycle++;
      setCurrentStepCount(countInCycle);

      // Play hop tick sound
      soundFx.playPop(520 + (countInCycle % magicNum) * 45, 0.05);

      // Check if we hit the magic number!
      if (countInCycle === magicNum) {
        // Eliminate target option!
        currentCats[target.catIndex].options[target.optIndex].eliminated = true;
        soundFx.playPop(300, 0.12); // lower thump sound

        // Check if this category now only has 1 option left!
        const remainingNow = currentCats[target.catIndex].options.filter((o) => !o.eliminated);
        if (remainingNow.length === 1) {
          remainingNow[0].isWinner = true;
          currentCats[target.catIndex].result = remainingNow[0];
          // Chime for locking destiny in this category!
          soundFx.playKiss();
        }

        // Reset step counter
        countInCycle = 0;
        setCurrentStepCount(0);
      } else {
        flatIndex++;
      }

      setCategories([...currentCats]);
    }, stepSpeed);
  };

  // Compile final results & romantic narrative
  const finishGame = (finalCats: MashCategory[], magicNum: number) => {
    // Ensure every category has its remaining winner marked
    finalCats.forEach((c) => {
      if (!c.result) {
        const winner = c.options.find((o) => !o.eliminated) || c.options[0];
        winner.isWinner = true;
        c.result = winner;
      }
    });

    const living = finalCats.find((c) => c.id === 'living')?.result || finalCats[0].options[0];
    const honeymoon = finalCats.find((c) => c.id === 'honeymoon')?.result || finalCats[1].options[0];
    const family = finalCats.find((c) => c.id === 'family')?.result || finalCats[2].options[0];
    const ride = finalCats.find((c) => c.id === 'ride')?.result || finalCats[3].options[0];
    const pet = finalCats.find((c) => c.id === 'pet')?.result || finalCats[4].options[0];
    const vibe = finalCats.find((c) => c.id === 'vibe')?.result || finalCats[5].options[0];
    const fiftyYears = finalCats.find((c) => c.id === 'fiftyYears')?.result || finalCats[6].options[0];

    const bfName = profile.boyfriendName || 'Vishvesh';
    const gfName = profile.girlfriendName || 'Laura';

    // Compose custom, heartwarming couple narrative
    const story = `The stars have aligned for ${bfName} and ${gfName}! Destiny reveals you two will begin your grand journey with an unforgettable escape to ${honeymoon.text} ${honeymoon.emoji}. Together, you will build your dream sanctuary in a ${living.text} ${living.emoji}. Your family will bloom with ${family.text} ${family.emoji}, accompanied by the loyalty of your ${pet.text} ${pet.emoji}. Cruising through life in your ${ride.text} ${ride.emoji}, your days will be defined as ${vibe.text} ${vibe.emoji}. And when 50 golden years have passed, you will still be ${fiftyYears.text} ${fiftyYears.emoji}, proving true love only grows stronger with every passing second.`;

    const resultObj: MashResult = {
      id: `mash-${Date.now()}`,
      timestamp: Date.now(),
      magicNumber: magicNum,
      living,
      honeymoon,
      family,
      ride,
      pet,
      vibe,
      fiftyYears,
      story,
    };

    setFinalResult(resultObj);
    setPhase('revealed');
    setIsSavedCurrent(false);

    // Auto-save to Destiny Vault
    const updatedVault = [resultObj, ...savedFortunes.filter((f) => f.id !== resultObj.id)];
    setSavedFortunes(updatedVault);
    saveMashFortunes(updatedVault);
    setIsSavedCurrent(true);

    // Celebratory fireworks
    soundFx.playCelebration();
    confetti({
      particleCount: 90,
      spread: 85,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#fbbf24', '#38bdf8'],
    });
  };

  const handleSaveToVaultManual = () => {
    if (!finalResult) return;
    const exists = savedFortunes.some((f) => f.id === finalResult.id);
    if (!exists) {
      const updated = [finalResult, ...savedFortunes];
      setSavedFortunes(updated);
      saveMashFortunes(updated);
    }
    setIsSavedCurrent(true);
    soundFx.playCelebration();
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedFortunes.filter((f) => f.id !== id);
    setSavedFortunes(updated);
    saveMashFortunes(updated);
    soundFx.playPop(400, 0.08);
  };

  const handleCopyStory = () => {
    if (!finalResult) return;
    const text = `📜 *Vishvesh & Laura's M.A.S.H. Destiny Certificate* 📜\nMagic Number: ${finalResult.magicNumber}\n\n🏡 Living: ${finalResult.living.emoji} ${finalResult.living.text}\n✈️ Honeymoon: ${finalResult.honeymoon.emoji} ${finalResult.honeymoon.text}\n👶 Family: ${finalResult.family.emoji} ${finalResult.family.text}\n🚗 Ride: ${finalResult.ride.emoji} ${finalResult.ride.text}\n🐾 Pet: ${finalResult.pet.emoji} ${finalResult.pet.text}\n✨ Vibe: ${finalResult.vibe.emoji} ${finalResult.vibe.text}\n👵👴 In 50 Years: ${finalResult.fiftyYears.emoji} ${finalResult.fiftyYears.text}\n\n💖 Story:\n"${finalResult.story}"`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    soundFx.playPop(650, 0.08);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const resetGame = (fromRemote = false) => {
    if (eliminationTimerRef.current) clearInterval(eliminationTimerRef.current);
    if (spiralTimerRef.current) clearInterval(spiralTimerRef.current);
    setPhase('setup');
    setFinalResult(null);
    setCurrentIndex(-1);
    setCurrentStepCount(0);
    // Reset category elimination marks
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        result: undefined,
        options: c.options.map((o) => ({ ...o, eliminated: false, isWinner: false })),
      }))
    );
    if (!fromRemote) {
      broadcast('RESET_GAME', {});
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-white/95 via-rose-50/40 to-pink-50/40 backdrop-blur-md rounded-3xl border border-rose-100 shadow-xl p-4 sm:p-7 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-rose-100/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Castle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                M.A.S.H. Future Destiny
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-violet-100 text-violet-700 tracking-wider">
                Classic Couple Edition
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Unravel Vishvesh & Laura's predicted future home, journeys, family & eternal bond!
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowVault(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition cursor-pointer"
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>Destiny Vault ({savedFortunes.length})</span>
          </button>

          {phase !== 'setup' && (
            <button
              type="button"
              onClick={() => resetGame()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          )}
        </div>
      </div>

      {/* PHASE 1: SETUP & CUSTOMIZATION */}
      {phase === 'setup' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-rose-500/10 border border-violet-200/60 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔮</span>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-800">
                  Step 1: Customize Your Destiny Options
                </h4>
                <p className="text-xs text-slate-500">
                  Review Vishvesh & Laura's romantic categories below. Add your personal dreams or jokes, then spin the Magic Spiral!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/80 border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleStartSpiral}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-violet-600 via-pink-600 to-rose-500 hover:opacity-95 shadow-md shadow-pink-500/25 hover:scale-102 active:scale-98 transition cursor-pointer"
              >
                <Compass className="w-4 h-4 animate-spin" />
                <span>Spin Magic Spiral ✨</span>
              </button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white/90 rounded-2xl border border-rose-100/80 p-4 shadow-xs hover:border-violet-200 transition space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.title}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {category.options.length} options
                  </span>
                </div>

                {/* Option list */}
                <div className="space-y-1.5">
                  {category.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="group flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50/80 hover:bg-rose-50/60 border border-slate-100 hover:border-rose-200/80 text-xs text-slate-700 transition"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0">{opt.emoji}</span>
                        <span className="font-medium truncate">{opt.text}</span>
                      </div>
                      {category.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(category.id, opt.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 rounded-md transition cursor-pointer"
                          title="Remove option"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add new option form */}
                {addingToCategoryId === category.id ? (
                  <div className="p-2.5 rounded-xl bg-pink-50/70 border border-pink-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newOptionEmoji}
                        onChange={(e) => setNewOptionEmoji(e.target.value)}
                        placeholder="Emoji"
                        className="w-12 text-center text-sm px-2 py-1.5 rounded-lg border border-pink-300 bg-white focus:outline-rose-500"
                        maxLength={4}
                      />
                      <input
                        type="text"
                        value={newOptionText}
                        onChange={(e) => setNewOptionText(e.target.value)}
                        placeholder="Write romantic or funny destiny..."
                        className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-pink-300 bg-white focus:outline-rose-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddOption(category.id)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAddingToCategoryId(null)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddOption(category.id)}
                        className="px-3 py-1 rounded-lg text-[11px] font-bold text-white bg-pink-600 hover:bg-pink-700 cursor-pointer"
                      >
                        Add Option
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAddingToCategoryId(category.id);
                      setNewOptionText('');
                    }}
                    className="w-full py-1.5 flex items-center justify-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50/80 rounded-xl border border-dashed border-purple-200 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Choice</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHASE 2: MAGIC SPIRAL GENERATOR */}
      {phase === 'spiral' && (
        <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center max-w-lg mx-auto">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500 animate-spin" />
              <span>Step 2: The Magic Destiny Spiral</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              In classic M.A.S.H., the magic number determines which dreams get sealed into destiny!
            </p>
          </div>

          {/* Animated Magic Spiral Canvas Visual */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-violet-100 via-pink-100 to-rose-100 border-4 border-dashed border-violet-300 flex items-center justify-center shadow-inner overflow-hidden">
            <div
              className={`absolute inset-4 rounded-full border-4 border-dotted border-pink-400 transition-transform duration-75 ${
                isSpinningSpiral ? 'animate-spin' : ''
              }`}
              style={{ transform: `rotate(${spiralAngle}deg)` }}
            />
            <div
              className={`absolute inset-10 rounded-full border-4 border-violet-400/80 transition-transform duration-100 ${
                isSpinningSpiral ? 'animate-reverse-spin' : ''
              }`}
              style={{ transform: `rotate(-${spiralAngle * 1.5}deg)` }}
            />
            <div
              className={`absolute inset-16 rounded-full border-2 border-rose-400 transition-transform duration-150 ${
                isSpinningSpiral ? 'animate-spin' : ''
              }`}
              style={{ transform: `rotate(${spiralAngle * 2}deg)` }}
            />

            <div className="relative z-10 flex flex-col items-center justify-center bg-white/95 rounded-full w-24 h-24 shadow-md border border-rose-200">
              {isSpinningSpiral ? (
                <>
                  <Compass className="w-8 h-8 text-violet-600 animate-spin" />
                  <span className="text-[10px] font-extrabold text-violet-600 mt-1 uppercase tracking-wider">
                    Spinning...
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-black text-rose-600">{magicNumber}</span>
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
                    Destiny Number
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Trigger Buttons */}
          <div className="space-y-3 w-full">
            {isSpinningSpiral ? (
              <button
                type="button"
                onClick={handleStopSpiral}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-rose-500 via-pink-600 to-violet-600 hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/30 transition cursor-pointer"
              >
                ✋ Stop Spiral & Lock Number!
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleStartSpiral}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  Spin Again
                </button>
                <button
                  type="button"
                  onClick={() => startEliminationLoop(categories, magicNumber)}
                  className="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-violet-600 via-pink-600 to-rose-500 hover:scale-102 active:scale-98 shadow-md shadow-pink-500/25 transition cursor-pointer flex items-center gap-2"
                >
                  <span>Begin Destiny Elimination!</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE 3: ELIMINATION ANIMATION */}
      {phase === 'eliminating' && (
        <div className="space-y-6">
          {/* Header indicator */}
          <div className="bg-gradient-to-r from-violet-600 via-pink-600 to-rose-500 text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg font-black shrink-0">
                {currentStepCount || magicNumber}
              </div>
              <div>
                <h4 className="font-black text-sm sm:text-base">
                  Counting to Destiny Number: {magicNumber}
                </h4>
                <p className="text-xs text-pink-100">
                  Crossing out options step-by-step until only 1 destiny remains in every category!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Active Elimination</span>
            </div>
          </div>

          {/* Real-time Category Display with Strikethroughs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => {
              const isLocked = !!category.result;
              return (
                <div
                  key={category.id}
                  className={`rounded-2xl border p-4 transition-all duration-300 ${
                    isLocked
                      ? 'bg-gradient-to-br from-amber-50/90 to-yellow-50/80 border-amber-300 shadow-md ring-2 ring-amber-300/40'
                      : 'bg-white/90 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                      <span className="text-lg">{category.icon}</span>
                      <span>{category.title}</span>
                    </div>
                    {isLocked && (
                      <span className="flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full">
                        <Award className="w-3 h-3" />
                        <span>Destiny Locked!</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {category.options.map((opt) => {
                      const isEliminated = opt.eliminated;
                      const isWinner = opt.isWinner;

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition-all duration-200 ${
                            isWinner
                              ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-400 font-black text-amber-950 shadow-xs scale-101'
                              : isEliminated
                              ? 'bg-slate-100/60 text-slate-400 line-through opacity-50'
                              : 'bg-slate-50/80 border border-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-sm shrink-0">{opt.emoji}</span>
                            <span className="truncate">{opt.text}</span>
                          </div>

                          {isWinner && (
                            <span className="text-xs font-black text-amber-600 shrink-0">
                              👑 Winner
                            </span>
                          )}
                          {isEliminated && (
                            <span className="text-[10px] font-bold text-rose-400 shrink-0">
                              ✕ Out
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PHASE 4: GRAND DESTINY CERTIFICATE REVEAL */}
      {phase === 'revealed' && finalResult && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="text-center space-y-2">
            <span className="text-4xl animate-bounce">📜</span>
            <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
              Vishvesh & Laura's Destiny Scroll
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Sealed under Magic Number {finalResult.magicNumber} • Forever bound by affection & fate
            </p>
          </div>

          {/* Grand Certificate Card */}
          <div className="relative bg-gradient-to-b from-amber-50/90 via-orange-50/40 to-yellow-50/60 rounded-3xl border-2 border-amber-300/80 shadow-2xl p-6 sm:p-9 space-y-6 overflow-hidden">
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-3 text-amber-400 font-serif text-2xl select-none">❧</div>
            <div className="absolute top-2 right-3 text-amber-400 font-serif text-2xl select-none">☙</div>
            <div className="absolute bottom-2 left-3 text-amber-400 font-serif text-2xl select-none">❧</div>
            <div className="absolute bottom-2 right-3 text-amber-400 font-serif text-2xl select-none">☙</div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="bg-white/85 rounded-2xl p-3.5 border border-amber-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">
                  🏡 Future Living Space
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                  <span className="text-lg">{finalResult.living.emoji}</span>
                  <span>{finalResult.living.text}</span>
                </p>
              </div>

              <div className="bg-white/85 rounded-2xl p-3.5 border border-amber-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">
                  ✈️ Honeymoon & Escape
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                  <span className="text-lg">{finalResult.honeymoon.emoji}</span>
                  <span>{finalResult.honeymoon.text}</span>
                </p>
              </div>

              <div className="bg-white/85 rounded-2xl p-3.5 border border-amber-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">
                  👶 Family & Angels
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                  <span className="text-lg">{finalResult.family.emoji}</span>
                  <span>{finalResult.family.text}</span>
                </p>
              </div>

              <div className="bg-white/85 rounded-2xl p-3.5 border border-amber-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">
                  🚗 Couple Ride
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                  <span className="text-lg">{finalResult.ride.emoji}</span>
                  <span>{finalResult.ride.text}</span>
                </p>
              </div>

              <div className="bg-white/85 rounded-2xl p-3.5 border border-amber-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">
                  🐾 Furry Companion
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                  <span className="text-lg">{finalResult.pet.emoji}</span>
                  <span>{finalResult.pet.text}</span>
                </p>
              </div>

              <div className="bg-white/85 rounded-2xl p-3.5 border border-amber-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">
                  ✨ Daily Couple Vibe
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                  <span className="text-lg">{finalResult.vibe.emoji}</span>
                  <span>{finalResult.vibe.text}</span>
                </p>
              </div>

              <div className="bg-white/85 rounded-2xl p-3.5 border border-amber-200/80 shadow-xs space-y-1 sm:col-span-2 lg:col-span-3">
                <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">
                  👵👴 In 50 Years Together
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                  <span className="text-lg">{finalResult.fiftyYears.emoji}</span>
                  <span>{finalResult.fiftyYears.text}</span>
                </p>
              </div>
            </div>

            {/* Heartwarming Narrative Story */}
            <div className="bg-gradient-to-r from-amber-100/90 via-orange-100/70 to-rose-100/80 rounded-2xl p-5 border border-amber-300/80 text-amber-950 font-serif italic text-xs sm:text-sm leading-relaxed shadow-inner">
              "{finalResult.story}"
            </div>

            {/* Bottom Seal & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-amber-200">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  ★
                </span>
                <span>Officially Sealed for {profile.boyfriendName} & {profile.girlfriendName}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleCopyStory}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Share Scroll'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveToVaultManual}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSavedCurrent
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20'
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>{isSavedCurrent ? 'Saved in Vault ✓' : 'Save to Vault'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => resetGame()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:opacity-95 shadow-md shadow-pink-500/20 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Play Again</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESTINY VAULT MODAL (Permanent Saved Fortunes) */}
      {showVault && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl border border-purple-100 shadow-2xl p-5 sm:p-7 flex flex-col space-y-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Scroll className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800">
                    Destiny Vault
                  </h3>
                  <p className="text-xs text-slate-500">
                    All sealed M.A.S.H. fortunes are permanently saved here and survive app resets.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowVault(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Saved Fortunes List */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {savedFortunes.length === 0 ? (
                <div className="text-center py-12 space-y-2 text-slate-400">
                  <Castle className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold">No fortunes saved in your vault yet.</p>
                  <p className="text-xs text-slate-400">
                    Spin the Magic Spiral and complete a M.A.S.H. game to lock your first destiny!
                  </p>
                </div>
              ) : (
                savedFortunes.map((fortune, idx) => (
                  <div
                    key={fortune.id}
                    className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 to-pink-50/60 border border-amber-200/80 space-y-2.5 hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 border-b border-amber-200/50 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-900">
                          Fortunate Scroll #{savedFortunes.length - idx}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold">
                          Magic #{fortune.magicNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px]">
                          {new Date(fortune.timestamp).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSaved(fortune.id)}
                          className="text-slate-400 hover:text-rose-500 transition p-1 cursor-pointer"
                          title="Delete fortune"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Home</span>
                        <span className="truncate block">{fortune.living?.emoji} {fortune.living?.text}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Honeymoon</span>
                        <span className="truncate block">{fortune.honeymoon?.emoji} {fortune.honeymoon?.text}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Family</span>
                        <span className="truncate block">{fortune.family?.emoji} {fortune.family?.text}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Ride</span>
                        <span className="truncate block">{fortune.ride?.emoji} {fortune.ride?.text}</span>
                      </div>
                    </div>

                    <p className="text-xs font-serif italic text-amber-950 bg-white/70 p-2.5 rounded-xl border border-amber-100">
                      "{fortune.story}"
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowVault(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
