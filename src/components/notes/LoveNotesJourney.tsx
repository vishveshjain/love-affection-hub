import React, { useState, useEffect } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { LoveNote, JourneyMilestone } from '../../types';
import {
  loadLoveNotes,
  saveLoveNotes,
  loadMilestones,
  saveMilestones,
} from '../../utils/storage';
import { soundFx } from '../../utils/audio';
import { realtimeHub, getClientId } from '../../utils/realtime';
import { saveCloudData, onCloudDataLoaded } from '../../utils/cloudStore';
import confetti from 'canvas-confetti';
import { Heart, Plus, CheckCircle2, Circle, Sparkles, MapPin, StickyNote } from 'lucide-react';

const NOTE_COLORS = [
  { name: 'Rose Pink', class: 'bg-rose-100 border-rose-300 text-rose-900' },
  { name: 'Warm Blush', class: 'bg-pink-100 border-pink-300 text-pink-900' },
  { name: 'Lavender Dream', class: 'bg-purple-100 border-purple-300 text-purple-900' },
  { name: 'Sunny Peach', class: 'bg-amber-100 border-amber-300 text-amber-900' },
  { name: 'Mint Breeze', class: 'bg-teal-100 border-teal-300 text-teal-900' },
];

export const LoveNotesJourney: React.FC = () => {
  const { profile, currentUserName, partnerName } = useCouple();
  const [activeSection, setActiveSection] = useState<'notes' | 'journey'>('notes');

  const [notes, setNotes] = useState<LoveNote[]>(loadLoveNotes);
  const [milestones, setMilestones] = useState<JourneyMilestone[]>(loadMilestones);

  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  // New note fields
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0].class);

  // New milestone fields
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneEmoji, setMilestoneEmoji] = useState('✨');

  useEffect(() => {
    saveLoveNotes(notes);
    saveCloudData({ notes });
  }, [notes]);

  useEffect(() => {
    saveMilestones(milestones);
    saveCloudData({ milestones });
  }, [milestones]);

  useEffect(() => {
    // Refresh on mount
    const localNotes = loadLoveNotes();
    if (localNotes && localNotes.length > 0) setNotes(localNotes);
    const localMilestones = loadMilestones();
    if (localMilestones && localMilestones.length > 0) setMilestones(localMilestones);

    const unsubCloud = onCloudDataLoaded((cloudData) => {
      if (Array.isArray(cloudData.notes) && cloudData.notes.length > 0) {
        setNotes(cloudData.notes);
      }
      if (Array.isArray(cloudData.milestones) && cloudData.milestones.length > 0) {
        setMilestones(cloudData.milestones);
      }
    });

    const unsubRealtime = realtimeHub.subscribe((payload) => {
      if (payload.type === 'NOTE_UPDATE' && Array.isArray(payload.data?.notes)) {
        setNotes(payload.data.notes);
        saveLoveNotes(payload.data.notes);
      } else if (payload.type === 'JOURNEY_UPDATE' && Array.isArray(payload.data?.milestones)) {
        setMilestones(payload.data.milestones);
        saveMilestones(payload.data.milestones);
      }
    });

    const handleNotesSync = (e: any) => {
      if (Array.isArray(e.detail)) setNotes(e.detail);
    };
    const handleMilesSync = (e: any) => {
      if (Array.isArray(e.detail)) setMilestones(e.detail);
    };

    window.addEventListener('love_app_notes_sync', handleNotesSync);
    window.addEventListener('love_app_milestones_sync', handleMilesSync);

    return () => {
      unsubCloud();
      unsubRealtime();
      window.removeEventListener('love_app_notes_sync', handleNotesSync);
      window.removeEventListener('love_app_milestones_sync', handleMilesSync);
    };
  }, []);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteBody.trim()) return;

    const newNote: LoveNote = {
      id: `note-${Date.now()}`,
      authorRole: profile.currentUserRole,
      authorName: currentUserName,
      title: noteTitle.trim(),
      note: noteBody.trim(),
      color: selectedColor,
      date: 'Today',
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    setNoteTitle('');
    setNoteBody('');
    setShowAddNote(false);

    realtimeHub.publish({
      type: 'NOTE_UPDATE',
      clientId: getClientId(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      data: { notes: updated },
      timestamp: Date.now(),
    });

    soundFx.playCelebration();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;

    const newMilestone: JourneyMilestone = {
      id: `mile-${Date.now()}`,
      title: milestoneTitle.trim(),
      description: milestoneDesc.trim() || 'A magical milestone on our journey.',
      completed: false,
      emoji: milestoneEmoji,
    };

    const updated = [...milestones, newMilestone];
    setMilestones(updated);
    setMilestoneTitle('');
    setMilestoneDesc('');
    setShowAddMilestone(false);
    soundFx.playPop(650, 0.08);

    realtimeHub.publish({
      type: 'JOURNEY_UPDATE',
      clientId: getClientId(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      data: { milestones: updated },
      timestamp: Date.now(),
    });
  };

  const toggleMilestone = (id: string) => {
    const updated = milestones.map((m) => {
      if (m.id === id) {
        const nextCompleted = !m.completed;
        if (nextCompleted) {
          soundFx.playCelebration();
          confetti({
            particleCount: 60,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#f43f5e', '#ec4899', '#fbbf24', '#10b981'],
          });
        } else {
          soundFx.playPop(480, 0.05);
        }
        return {
          ...m,
          completed: nextCompleted,
          completedDate: nextCompleted ? 'Achieved!' : undefined,
        };
      }
      return m;
    });

    setMilestones(updated);

    realtimeHub.publish({
      type: 'JOURNEY_UPDATE',
      clientId: getClientId(),
      senderRole: profile.currentUserRole,
      senderName: currentUserName,
      data: { milestones: updated },
      timestamp: Date.now(),
    });
  };

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent = Math.round((completedCount / (milestones.length || 1)) * 100);

  return (
    <div className="p-6 md:p-8 rounded-3xl glass-card border border-rose-200 shadow-xl relative">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-1">
            <StickyNote className="w-3.5 h-3.5" /> Love Chronicles
          </span>
          <h3 className="text-2xl font-extrabold text-slate-800">
            Love Notes & Journey Planner
          </h3>
          <p className="text-xs md:text-sm text-slate-500">
            Write daily love notes to {partnerName} and map out your beautiful journey milestones together!
          </p>
        </div>

        <div className="flex items-center bg-rose-50/80 p-1 rounded-2xl border border-rose-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveSection('notes')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeSection === 'notes'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Daily Notes ({notes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('journey')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeSection === 'journey'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Journey Planner ({progressPercent}%)
          </button>
        </div>
      </div>

      {/* SECTION 1: DAILY LOVE NOTES */}
      {activeSection === 'notes' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setShowAddNote(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-rose-400/25 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write Love Note</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-5 rounded-2xl border shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between ${note.color}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[11px] font-semibold opacity-75 mb-1.5">
                    <span>From {note.authorName} {note.authorRole === 'boyfriend' ? '🤴' : '👸'}</span>
                    <span>{note.date}</span>
                  </div>
                  <h4 className="font-extrabold text-sm mb-2">{note.title}</h4>
                  <p className="text-xs leading-relaxed font-sans whitespace-pre-wrap">
                    "{note.note}"
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-black/10 flex items-center justify-between text-[11px] font-medium opacity-80">
                  <span className="font-romantic text-base">To my one and only</span>
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: JOURNEY PLANNER */}
      {activeSection === 'journey' && (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Our Love Journey Milestones</span>
              </span>
              <span className="text-rose-600">
                {completedCount} of {milestones.length} Completed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAddMilestone(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-400/25 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Journey Milestone</span>
            </button>
          </div>

          {/* Milestones List */}
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                onClick={() => toggleMilestone(milestone.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  milestone.completed
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{milestone.emoji}</span>
                  <div>
                    <h4
                      className={`font-bold text-sm ${
                        milestone.completed ? 'line-through text-slate-500' : 'text-slate-800'
                      }`}
                    >
                      {milestone.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{milestone.description}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  {milestone.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300 hover:text-rose-400 transition" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Love Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-white shadow-2xl border border-rose-200">
            <h4 className="text-lg font-bold text-slate-800 mb-1">Write a Love Note for {partnerName}</h4>
            <p className="text-xs text-slate-500 mb-4">
              Leave a sweet message to brighten their day!
            </p>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. You are my favorite human"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Color Theme</label>
                <div className="flex gap-2">
                  {NOTE_COLORS.map((col) => (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => setSelectedColor(col.class)}
                      className={`w-7 h-7 rounded-full border-2 transition ${col.class} ${
                        selectedColor === col.class ? 'scale-110 ring-2 ring-rose-400' : 'opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Love Note Message</label>
                <textarea
                  rows={4}
                  required
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="What is on your heart today?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNote(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-rose-400/30"
                >
                  Stick Note 💕
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-white shadow-2xl border border-purple-200">
            <h4 className="text-lg font-bold text-slate-800 mb-1">Add Journey Milestone</h4>
            <p className="text-xs text-slate-500 mb-4">
              Plan your next exciting adventure or milestone with {partnerName}!
            </p>

            <form onSubmit={handleAddMilestone} className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Emoji</label>
                  <input
                    type="text"
                    value={milestoneEmoji}
                    onChange={(e) => setMilestoneEmoji(e.target.value)}
                    className="w-full text-center px-2 py-2 rounded-xl border border-slate-300 text-base focus:outline-none"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Milestone Title</label>
                  <input
                    type="text"
                    required
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                    placeholder="e.g. Trip to Switzerland"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  placeholder="What will make this milestone unforgettable?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMilestone(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-400/30"
                >
                  Save Milestone 🌟
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
