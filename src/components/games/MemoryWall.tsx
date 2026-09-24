import React, { useState, useRef, useEffect } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { MemoryItem } from '../../types';
import { fileToDataUrl } from '../../utils/storage';
import { soundFx } from '../../utils/audio';
import { realtimeHub, getClientId } from '../../utils/realtime';
import { saveCloudData, onCloudDataLoaded, loadMemoriesFromLocal, saveMemoriesToLocal, pushToCloudNow, fetchCloudData } from '../../utils/cloudStore';
import confetti from 'canvas-confetti';
import { Camera, Plus, Trash2, Heart, Calendar } from 'lucide-react';

const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 'm1',
    date: 'Our First Date',
    title: 'Butterflies & Shy Smiles',
    description: 'When we first met, couldn’t stop smiling and heart was beating 200 bpm!',
    emoji: '☕',
  },
  {
    id: 'm2',
    date: 'Late Night Talk',
    title: 'Talking Until 3 AM',
    description: 'Realized we could talk about everything and nothing forever.',
    emoji: '🌙',
  },
  {
    id: 'm3',
    date: 'Spontaneous Day Out',
    title: 'Ice Cream & Stolen Kisses',
    description: 'Walking hand in hand, eating dessert, and feeling like the happiest people in the world.',
    emoji: '🍦',
  },
];

export const MemoryWall: React.FC = () => {
  const { profile, currentUserName, partnerName } = useCouple();
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    const local = loadMemoriesFromLocal();
    return local && local.length > 0 ? local : DEFAULT_MEMORIES;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEmoji, setNewEmoji] = useState('💖');
  const [newPhoto, setNewPhoto] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    saveMemoriesToLocal(memories);
    saveCloudData({ memories });
  }, [memories]);

  useEffect(() => {
    const unsubCloud = onCloudDataLoaded((cloudData) => {
      if (Array.isArray(cloudData.memories) && cloudData.memories.length > 0) {
        setMemories(cloudData.memories);
      }
    });

    const unsubRealtime = realtimeHub.subscribe((payload) => {
      if (payload.type === 'MEMORY_UPDATE') {
        if (payload.data?.hasCloudUpdate) {
          fetchCloudData();
        } else if (Array.isArray(payload.data?.memories)) {
          setMemories(payload.data.memories);
          saveMemoriesToLocal(payload.data.memories);
        }
      }
    });

    return () => {
      unsubCloud();
      unsubRealtime();
    };
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const dataUrl = await fileToDataUrl(e.target.files[0]);
        setNewPhoto(dataUrl);
        soundFx.playPop(600, 0.08);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      title: newTitle.trim(),
      date: newDate.trim() || 'Special Day',
      description: newDesc.trim() || 'A golden chapter in our love story.',
      emoji: newEmoji,
      photoUrl: newPhoto,
    };

    const updated = [newMem, ...memories];
    setMemories(updated);
    saveMemoriesToLocal(updated);
    saveCloudData({ memories: updated });
    setNewTitle('');
    setNewDate('');
    setNewDesc('');
    setNewPhoto(undefined);
    setShowAddModal(false);

    pushToCloudNow().then(() => {
      realtimeHub.publish({
        type: 'MEMORY_UPDATE',
        clientId: getClientId(),
        senderRole: profile.currentUserRole,
        senderName: currentUserName,
        data: { hasCloudUpdate: true },
        timestamp: Date.now(),
      });
    });

    soundFx.playCelebration();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleDelete = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    saveMemoriesToLocal(updated);
    saveCloudData({ memories: updated });
    soundFx.playPop(420, 0.05);

    pushToCloudNow().then(() => {
      realtimeHub.publish({
        type: 'MEMORY_UPDATE',
        clientId: getClientId(),
        senderRole: profile.currentUserRole,
        senderName: currentUserName,
        data: { hasCloudUpdate: true },
        timestamp: Date.now(),
      });
    });
  };

  return (
    <div className="p-6 md:p-8 rounded-3xl glass-card border border-rose-200 shadow-xl relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold mb-1">
            <Camera className="w-3.5 h-3.5" /> Couple Scrapbook
          </span>
          <h3 className="text-2xl font-extrabold text-slate-800">
            Our Memory Wall & Love Capsules
          </h3>
          <p className="text-xs md:text-sm text-slate-500">
            Cherished milestones, funny dates, and sweetest memories with {partnerName}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-rose-400/25 transition whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Memory</span>
        </button>
      </div>

      {/* Memory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {memories.map((mem, idx) => {
          const rotation = idx % 2 === 0 ? '-rotate-1' : 'rotate-1';
          return (
            <div
              key={mem.id}
              className={`relative bg-white p-4 rounded-2xl border border-rose-200/80 shadow-md hover:shadow-xl transition-all duration-300 hover:rotate-0 transform ${rotation} flex flex-col justify-between`}
            >
              {/* Pin indicator */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">📌</div>

              <div>
                {/* Photo frame if present */}
                {mem.photoUrl && (
                  <div className="w-full h-40 rounded-xl overflow-hidden mb-3 border border-slate-100">
                    <img
                      src={mem.photoUrl}
                      alt={mem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-2xl">{mem.emoji}</span>
                  <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {mem.date}
                  </span>
                </div>

                <h4 className="font-bold text-slate-800 text-sm mt-1">{mem.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                  {mem.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-rose-500">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span className="font-romantic text-base">Always in my heart</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(mem.id)}
                  title="Remove memory"
                  className="hover:text-rose-600 transition p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-white shadow-2xl border border-rose-200">
            <h4 className="text-lg font-bold text-slate-800 mb-1">Add a Beautiful Memory</h4>
            <p className="text-xs text-slate-500 mb-4">
              Capture a milestone, funny moment, or photo with {partnerName}.
            </p>

            <form onSubmit={handleAddMemory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Memory Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. The Night We Danced Under the Rain"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Date / Occasion
                  </label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="e.g. Summer 2024"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Vibe Emoji
                  </label>
                  <select
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                  >
                    <option value="💖">💖 Romance</option>
                    <option value="☕">☕ Cozy Date</option>
                    <option value="🍦">🍦 Sweet Treat</option>
                    <option value="✈️">✈️ Travel & Trip</option>
                    <option value="🎬">🎬 Movie Night</option>
                    <option value="✨">✨ Magical Night</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Story / Sweet Note
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What made this moment unforgettable?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Optional Photo
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-rose-300 text-rose-600 text-xs font-semibold hover:bg-rose-50 flex items-center justify-center gap-1.5 transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{newPhoto ? 'Photo Uploaded! (Click to replace)' : 'Upload Memory Photo'}</span>
                </button>
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
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-rose-400/30"
                >
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
