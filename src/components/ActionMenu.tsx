import React, { useState } from 'react';
import { useCouple } from '../context/CoupleContext';
import { AffectionActionType } from '../types';
import { SWEET_WHISPER_TEMPLATES } from '../utils/whispers';
import { soundFx } from '../utils/audio';
import { Heart, Send, Sparkles, Volume2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

export const ActionMenu: React.FC = () => {
  const { profile, partnerName, triggerAction } = useCouple();
  const [customWhisper, setCustomWhisper] = useState('');
  const [showWhisperList, setShowWhisperList] = useState(false);

  const isBf = profile.currentUserRole === 'boyfriend';

  const actions: {
    type: AffectionActionType;
    label: string;
    sublabel: string;
    icon: string;
    gradient: string;
    hoverBorder: string;
  }[] = [
    {
      type: 'kiss',
      label: `Give a kiss to ${partnerName}`,
      sublabel: 'Ballistic heart & lipstick kiss 💋',
      icon: '💋',
      gradient: 'from-rose-500 to-pink-500',
      hoverBorder: 'hover:border-rose-400',
    },
    {
      type: 'hug',
      label: isBf ? `Hug your angel Laura` : `Hug your boyfriend Vishvesh`,
      sublabel: 'Arms reach out in tight embrace 🫂',
      icon: '🫂',
      gradient: 'from-pink-500 to-rose-400',
      hoverBorder: 'hover:border-pink-400',
    },
    {
      type: 'carry',
      label: isBf ? `Put my angel on your arms` : `Jump into ${partnerName}'s arms`,
      sublabel: 'Princess carry in strong arms 👑',
      icon: '👑',
      gradient: 'from-amber-500 to-rose-500',
      hoverBorder: 'hover:border-amber-400',
    },
    {
      type: 'handhold',
      label: isBf ? `Hold my angel` : `Hold ${partnerName}'s hand`,
      sublabel: 'Intertwined fingers & destiny thread 🤝',
      icon: '🤝',
      gradient: 'from-purple-500 to-pink-500',
      hoverBorder: 'hover:border-purple-400',
    },
    {
      type: 'feed',
      label: isBf ? `Feed sweet treats to my angels` : `Feed sweet treats to ${partnerName}`,
      sublabel: 'Strawberries, chocolate & sweets 🍓',
      icon: '🍓',
      gradient: 'from-rose-400 to-orange-400',
      hoverBorder: 'hover:border-rose-400',
    },
    {
      type: 'whisper',
      label: `Whisper sweet words`,
      sublabel: 'Sends a random romantic whisper 💌',
      icon: '💌',
      gradient: 'from-fuchsia-500 to-rose-500',
      hoverBorder: 'hover:border-fuchsia-400',
    },
    {
      type: 'tickle',
      label: `Tickle attack ${partnerName}!`,
      sublabel: 'Jiggles & giggle bursts 🪶',
      icon: '🪶',
      gradient: 'from-emerald-400 to-teal-500',
      hoverBorder: 'hover:border-teal-400',
    },
    {
      type: 'headpat',
      label: isBf ? `Head pat my angel` : `Head pat your boy`,
      sublabel: 'Soft pampering & hair ruffle 💆',
      icon: '💆',
      gradient: 'from-blue-400 to-indigo-500',
      hoverBorder: 'hover:border-blue-400',
    },
  ];

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWhisper.trim()) return;
    const sender = isBf ? profile.boyfriendName : profile.girlfriendName;
    const fullMsg = `💌 ${sender} sends a special message to ${partnerName}: "${customWhisper.trim()}"`;
    triggerAction('whisper', fullMsg);
    setCustomWhisper('');
  };

  const handleSelectPredefinedWhisper = (sentence: string) => {
    const sender = isBf ? profile.boyfriendName : profile.girlfriendName;
    const fullMsg = `💌 ${sender} whispers to ${partnerName}: "${sentence}"`;
    triggerAction('whisper', fullMsg);
    soundFx.playRomanticSigh();
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-4">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-rose-600 bg-rose-100 rounded-full mb-2 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" /> Interactive Affection Playground
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">
          What would you like to do with {partnerName}?
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Click any action below to trigger live interactive animations, embracing arms, sounds, and affection boosts!
        </p>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {actions.map((act) => (
          <button
            key={act.type}
            type="button"
            onClick={() => triggerAction(act.type)}
            className={`group relative flex flex-col p-4 rounded-2xl glass-card border border-rose-100/90 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-98 ${act.hoverBorder}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl group-hover:scale-125 transition-transform duration-200">
                {act.icon}
              </span>
              <span className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
              </span>
            </div>
            <span className="font-bold text-sm text-slate-800 group-hover:text-rose-600 transition-colors leading-snug">
              {act.label}
            </span>
            <span className="text-xs text-slate-400 mt-1 line-clamp-1">
              {act.sublabel}
            </span>
          </button>
        ))}
      </div>

      {/* Sweet Sigh & Sweet Sentences Expandable Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-rose-50/70 border border-rose-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundFx.playRomanticSigh();
              triggerAction('whisper', `🥰 A sweet contented sigh of love from ${isBf ? profile.boyfriendName : profile.girlfriendName} to ${partnerName}...`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold shadow-xs transition"
          >
            <Volume2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Romantic Sigh & Purr 🥰</span>
          </button>

          <button
            type="button"
            onClick={() => setShowWhisperList(!showWhisperList)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-slate-700 hover:text-rose-600 text-xs font-semibold shadow-xs transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-pink-500" />
            <span>Browse Sweet Sentences ({SWEET_WHISPER_TEMPLATES.length})</span>
            {showWhisperList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <span className="text-[11px] text-rose-600 font-medium italic">
          Tip: "Whisper sweet words" sends a new random surprise each time!
        </span>
      </div>

      {/* Sweet Sentences Drawer */}
      {showWhisperList && (
        <div className="mt-3 p-4 rounded-2xl bg-white border border-rose-200 shadow-md animate-fade-in">
          <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Click Any Sweet Sentence to Whisper It to {partnerName}:</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {SWEET_WHISPER_TEMPLATES.map((sentence, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPredefinedWhisper(sentence)}
                className="text-left text-xs p-2.5 rounded-xl border border-rose-100 hover:border-rose-400 hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition flex items-start gap-2 group"
              >
                <span className="text-rose-400 group-hover:scale-125 transition-transform">💌</span>
                <span className="flex-1 leading-snug">"{sentence}"</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Romantic Whisper Input */}
      <form
        onSubmit={handleCustomSend}
        className="mt-4 flex items-center gap-2 p-2 rounded-2xl glass-panel-romantic border border-rose-200 shadow-sm"
      >
        <div className="pl-3 text-rose-400">
          <Heart className="w-5 h-5 fill-rose-400" />
        </div>
        <input
          type="text"
          value={customWhisper}
          onChange={(e) => setCustomWhisper(e.target.value)}
          placeholder={`Type a custom love whisper to ${partnerName}... (e.g. "I love the way you laugh at my silly jokes!")`}
          className="flex-1 bg-transparent px-2 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-rose-400/30 transition-all active:scale-95"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </section>
  );
};
