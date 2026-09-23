import React, { useState, useEffect } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { DreamItem } from '../../types';
import { loadDreams, saveDreams } from '../../utils/storage';
import { soundFx } from '../../utils/audio';
import { realtimeHub, getClientId } from '../../utils/realtime';
import { saveCloudData, onCloudDataLoaded } from '../../utils/cloudStore';
import confetti from 'canvas-confetti';
import { Moon, Sparkles, Plus, Heart, Cloud, Compass } from 'lucide-react';

export const DreamJournal: React.FC = () => {
  const { profile, currentUserName, partnerName } = useCouple();
  const [dreams, setDreams] = useState<DreamItem[]>(loadDreams);
  const [activeFilter, setActiveFilter] = useState<'all' | 'night_dream' | 'future_dream'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [dreamType, setDreamType] = useState<'night_dream' | 'future_dream'>('night_dream');
  const [dreamTitle, setDreamTitle] = useState('');
  const [dreamContent, setDreamContent] = useState('');

  useEffect(() => {
    saveDreams(dreams);
    saveCloudData({ dreams });
  }, [dreams]);

  useEffect(() => {
    // Refresh from storage on mount
    const local = loadDreams();
    if (local && local.length > 0) {
      setDreams(local);
    }

    const unsubCloud = onCloudDataLoaded((cloudData) => {
      if (Array.isArray(cloudData.dreams) && cloudData.dreams.length > 0) {
        setDreams(cloudData.dreams);
      }
    });

    const unsubRealtime = realtimeHub.subscribe((payload) => {
      if (payload.type === 'DREAM_UPDATE' && Array.isArray(payload.data?.dreams)) {
        setDreams(payload.data.dreams);
        saveDreams(payload.data.dreams);
      }
    });

    const handleSync = (e: any) => {
      if (Array.isArray(e.detail)) {
        setDreams(e.detail);
      }
    };
    window.addEventListener('love_app_dreams_sync', handleSync);

    return () => {
      unsubCloud();
      unsubRealtime();
      window.removeEventListener('love_app_dreams_sync', handleSync);
    };
  }, []);

  const handleAddDream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamTitle.trim() || !dreamContent.trim()) return;

    const newDream: DreamItem = {
      id: `dream-${Date.now()}`,
      authorRole: profile.currentUserRole,
      authorName: currentUserName,
      type: dreamType,
      title: dreamTitle.trim(),
      content: dreamContent.trim(),
      date: 'Just now',
      hearts: 1,
    };

    const updated = [newDream, ...dreams];
    setDreams(updated);
    setDreamTitle('');
    setDreamContent('');
    setShowAddModal(false);

    realtimeHub.publish({
      type: 'DREAM_UPDATE',
      clientId: getClientId(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      data: { dreams: updated },
      timestamp: Date.now(),
    });

    soundFx.playCelebration();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#f43f5e', '#38bdf8'],
    });
  };

  const handleLikeDream = (id: string) => {
    const updated = dreams.map((d) => (d.id === id ? { ...d, hearts: d.hearts + 1 } : d));
    setDreams(updated);
    soundFx.playPop(620, 0.08);

    realtimeHub.publish({
      type: 'DREAM_UPDATE',
      clientId: getClientId(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      data: { dreams: updated },
      timestamp: Date.now(),
    });
  };

  const filteredDreams = dreams.filter((d) =>
    activeFilter === 'all' ? true : d.type === activeFilter
  );

  return (
    <div className="p-6 md:p-8 rounded-3xl glass-card border border-rose-200 shadow-xl relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-1">
            <Moon className="w-3.5 h-3.5 fill-purple-400" /> Whispers of the Heart
          </span>
          <h3 className="text-2xl font-extrabold text-slate-800">
            Couple Dreams Journal 🌙✨
          </h3>
          <p className="text-xs md:text-sm text-slate-500">
            Share the dreams you had about each other last night, and build your golden dreams for tomorrow.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-400/25 transition whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tell a Dream</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeFilter === 'all'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white/80 text-slate-600 hover:bg-white'
          }`}
        >
          All Dreams ({dreams.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('night_dream')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeFilter === 'night_dream'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white/80 text-slate-600 hover:bg-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Night Dreams</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('future_dream')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeFilter === 'future_dream'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white/80 text-slate-600 hover:bg-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Future Dreams Together</span>
        </button>
      </div>

      {/* Dreams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDreams.map((item) => {
          const isNight = item.type === 'night_dream';
          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg flex flex-col justify-between ${
                isNight
                  ? 'bg-gradient-to-br from-purple-50/90 via-white to-pink-50/80 border-purple-200'
                  : 'bg-gradient-to-br from-rose-50/90 via-white to-amber-50/80 border-rose-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isNight
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isNight ? <Moon className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                    <span>{isNight ? 'Dreamt Last Night 🌙' : 'Our Future Dream 🌟'}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                </div>

                <h4 className="font-extrabold text-slate-800 text-base mb-1">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed font-sans mt-2 whitespace-pre-wrap">
                  "{item.content}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  By {item.authorName} {item.authorRole === 'boyfriend' ? '🤴' : '👸'}
                </span>

                <button
                  type="button"
                  onClick={() => handleLikeDream(item.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition active:scale-95 shadow-xs"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>{item.hearts}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Dream Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-white shadow-2xl border border-purple-200">
            <h4 className="text-lg font-bold text-slate-800 mb-1">Tell a Dream to {partnerName}</h4>
            <p className="text-xs text-slate-500 mb-4">
              Share a dream you had while sleeping, or a future wish for the two of you!
            </p>

            <form onSubmit={handleAddDream} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Type of Dream
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDreamType('night_dream')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      dreamType === 'night_dream'
                        ? 'bg-purple-500 text-white border-purple-500 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dream Last Night</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDreamType('future_dream')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      dreamType === 'future_dream'
                        ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Future Dream</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Dream Title
                </label>
                <input
                  type="text"
                  required
                  value={dreamTitle}
                  onChange={(e) => setDreamTitle(e.target.value)}
                  placeholder="e.g. Walking through a starry forest together"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Dream Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={dreamContent}
                  onChange={(e) => setDreamContent(e.target.value)}
                  placeholder="Describe the feelings, places, and sweet moments from your dream..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-purple-400/30"
                >
                  Post Dream ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
