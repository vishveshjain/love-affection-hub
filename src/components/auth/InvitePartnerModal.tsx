import React, { useState } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { getActivePasscode, generateInviteLink, getRoomMeta } from '../../utils/security';
import { soundFx } from '../../utils/audio';
import {
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Heart,
  KeyRound,
  X,
  MessageCircle,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';

export const InvitePartnerModal: React.FC = () => {
  const {
    showInviteModal,
    closeInviteModal,
    activeRoomId,
    currentUserName,
    partnerName,
  } = useCouple();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [showPass, setShowPass] = useState(false);

  if (!showInviteModal) return null;

  const passcode = getActivePasscode();
  const inviteUrl = generateInviteLink(activeRoomId);
  const roomMeta = getRoomMeta(activeRoomId);

  const inviteMessage = `Hey my love ${partnerName}! 💖 I opened our private Love Sanctuary portal where we can video call with romantic atmospheres, chat privately, leave forever love notes, and play couple games!

Link: ${inviteUrl}
Room Code: ${activeRoomId}
Secret Passcode: ${passcode || '(Set in Sanctuary)'}

Open the link on your phone and enter our secret passcode to enter our private nest! 🌹✨`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(inviteUrl);
    setCopiedLink(true);
    soundFx.playPop(600, 0.08);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyRoom = () => {
    navigator.clipboard?.writeText(activeRoomId);
    setCopiedRoom(true);
    soundFx.playPop(600, 0.08);
    setTimeout(() => setCopiedRoom(false), 2200);
  };

  const handleCopyPass = () => {
    navigator.clipboard?.writeText(passcode);
    setCopiedPass(true);
    soundFx.playPop(600, 0.08);
    setTimeout(() => setCopiedPass(false), 2200);
  };

  const handleCopyFullMessage = () => {
    navigator.clipboard?.writeText(inviteMessage);
    setCopiedMsg(true);
    soundFx.playCelebration();
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-rose-100 shadow-2xl p-5 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                <span>Invite Your Partner</span>
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              </h3>
              <p className="text-xs text-slate-500">
                Connect {currentUserName} & {partnerName} across any devices
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeInviteModal}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Room Credentials Card */}
        <div className="space-y-3 bg-gradient-to-br from-rose-50/80 to-purple-50/80 p-4 rounded-2xl border border-rose-200/80 text-xs">
          {/* Room Code */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-700 block">
                Sanctuary Room Code
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {activeRoomId}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyRoom}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 font-bold text-slate-700 flex items-center gap-1 transition cursor-pointer"
            >
              {copiedRoom ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRoom ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Passcode */}
          <div className="flex items-center justify-between pt-2 border-t border-rose-200/60">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-purple-700 block">
                Secret Passcode
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {showPass ? passcode : '••••••••'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 cursor-pointer"
              >
                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleCopyPass}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 font-bold text-slate-700 flex items-center gap-1 transition cursor-pointer"
              >
                {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPass ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Share Link Direct */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Direct Share Link (Auto-fills Room Code)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 select-all font-mono"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Action Button: Copy Ready WhatsApp / SMS Invite Message */}
        <button
          type="button"
          onClick={handleCopyFullMessage}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{copiedMsg ? 'Copied Ready Invite Message! 🎉' : 'Copy Full WhatsApp / SMS Invitation'}</span>
        </button>

        {/* Zero-Snoop Guarantee Badge */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Zero-Knowledge Security:</strong> Your chat messages, dreams, photo albums, and video calls are strictly bound to this Room Code and secret passcode. No other couples can ever see or intersect your memories.
          </span>
        </div>
      </div>
    </div>
  );
};
