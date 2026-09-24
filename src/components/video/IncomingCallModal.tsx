import React, { useEffect, useState } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { videoCallService } from '../../utils/webrtc';
import { Video, PhoneOff, Heart, Sparkles } from 'lucide-react';

interface IncomingCallModalProps {
  onAccept: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ onAccept }) => {
  const { profile, partnerName, partnerPhoto, partnerRole } = useCouple();
  const [incoming, setIncoming] = useState(false);
  const [callerName, setCallerName] = useState<string>('');

  useEffect(() => {
    const unsub = videoCallService.onStateChange((state) => {
      setIncoming(state.status === 'incoming');
      if (state.callerName) {
        setCallerName(state.callerName);
      }
    });
    return unsub;
  }, []);

  if (!incoming) return null;

  const handleAccept = async () => {
    await videoCallService.acceptCall(profile.currentUserRole, profile.currentUserRole === 'boyfriend' ? profile.boyfriendName : profile.girlfriendName);
    onAccept();
  };

  const handleDecline = async () => {
    await videoCallService.declineCall(profile.currentUserRole);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      {/* Radiant romantic aura */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-96 h-96 rounded-full bg-rose-500/25 blur-3xl animate-ping" />
      </div>

      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-rose-950/90 via-slate-900/95 to-slate-950 p-6 md:p-8 text-center text-white shadow-2xl border-2 border-rose-400/50 overflow-hidden">
        {/* Shimmering Top Bar */}
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-pink-500/30 blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-purple-500/30 blur-2xl" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Ringing Partner Avatar with animated waves */}
          <div className="relative mb-5">
            <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 opacity-75 blur-md animate-pulse" />
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white">
              <img
                src={partnerPhoto}
                alt={partnerName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-rose-500 text-white shadow-lg border-2 border-white animate-bounce">
              <Video className="w-5 h-5" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" /> Incoming Romantic Video Call
          </div>

          <h3 className="text-xl md:text-2xl font-extrabold text-white mb-1">
            {callerName || partnerName}
          </h3>
          <p className="text-xs text-rose-200/80 mb-6 flex items-center justify-center gap-1">
            <span>is inviting you to a private romantic sanctuary</span>
            <Heart className="w-3 h-3 fill-rose-400 text-rose-400 animate-ping" />
          </p>

          {/* Action Buttons */}
          <div className="w-full flex items-center justify-center gap-4">
            {/* Decline */}
            <button
              type="button"
              onClick={handleDecline}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition active:scale-95 border border-slate-700 shadow-md"
            >
              <PhoneOff className="w-4 h-4 text-rose-400" />
              <span>Decline</span>
            </button>

            {/* Answer */}
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-sm transition active:scale-95 shadow-lg shadow-rose-500/40 ring-4 ring-rose-400/30 animate-pulse"
            >
              <Video className="w-5 h-5 fill-white" />
              <span>Answer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
