import React, { useRef, useEffect, useState } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { ScratchCoupon } from '../../types';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Ticket, Sparkles, CheckCircle2, Plus, Gift } from 'lucide-react';

interface ScratchCardProps {
  coupon: ScratchCoupon;
  onReveal: (id: string) => void;
  onRedeem: (id: string) => void;
}

const ScratchCardItem: React.FC<ScratchCardProps> = ({ coupon, onReveal, onRedeem }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratched, setIsScratched] = useState(coupon.scratched);
  const isDrawing = useRef(false);

  useEffect(() => {
    setIsScratched(coupon.scratched);
  }, [coupon.scratched]);

  useEffect(() => {
    if (isScratched) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with rose-gold / silver shimmer pattern
    const w = (canvas.width = canvas.offsetWidth);
    const h = (canvas.height = canvas.offsetHeight);

    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#fda4af');
    gradient.addColorStop(0.5, '#f472b6');
    gradient.addColorStop(1, '#c084fc');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Text on scratch coating
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Scratch to Reveal Prize ✨', w / 2, h / 2);
  }, [isScratched]);

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let transparentCount = 0;

    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) {
        transparentCount++;
      }
    }

    const totalSamples = pixels.length / 16;
    if (transparentCount / totalSamples > 0.35) {
      setIsScratched(true);
      onReveal(coupon.id);
      soundFx.playCelebration();
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    soundFx.playPop(700, 0.03);
    checkScratchPercentage();
  };

  return (
    <div className="relative rounded-2xl overflow-hidden glass-card border border-rose-200/90 shadow-md flex flex-col justify-between p-4 min-h-[220px]">
      {/* Underneath content revealed by scratching */}
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-3xl">{coupon.icon}</span>
            {coupon.redeemed ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Redeemed
              </span>
            ) : isScratched ? (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                Ready to Claim!
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">Scratch Card</span>
            )}
          </div>
          <h4 className="font-extrabold text-slate-800 text-sm">{coupon.title}</h4>
          <p className="text-xs text-slate-500 mt-1">{coupon.description}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-rose-100">
          <p className="text-[11px] text-rose-700 font-semibold mb-2">
            🎁 Reward: {coupon.reward}
          </p>
          {isScratched && !coupon.redeemed && (
            <button
              type="button"
              onClick={() => onRedeem(coupon.id)}
              className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-xs transition"
            >
              Redeem With Partner Now 💕
            </button>
          )}
        </div>
      </div>

      {/* Scratch Canvas Overlay */}
      {!isScratched && (
        <canvas
          ref={canvasRef}
          onMouseDown={() => {
            isDrawing.current = true;
          }}
          onMouseUp={() => {
            isDrawing.current = false;
          }}
          onMouseLeave={() => {
            isDrawing.current = false;
          }}
          onMouseMove={(e) => {
            if (isDrawing.current) scratch(e.clientX, e.clientY);
          }}
          onTouchMove={(e) => {
            if (e.touches[0]) {
              scratch(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          className="absolute inset-0 w-full h-full cursor-pointer z-10 touch-none"
        />
      )}
    </div>
  );
};

export const ScratchCoupons: React.FC = () => {
  const { coupons, updateCoupons, partnerName } = useCouple();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newReward, setNewReward] = useState('');

  const handleReveal = (id: string) => {
    updateCoupons(
      coupons.map((c) => (c.id === id ? { ...c, scratched: true } : c))
    );
  };

  const handleRedeem = (id: string) => {
    soundFx.playCelebration();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
    updateCoupons(
      coupons.map((c) => (c.id === id ? { ...c, redeemed: true } : c))
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCoupon: ScratchCoupon = {
      id: `coupon-${Date.now()}`,
      title: newTitle.trim(),
      icon: '🎁',
      description: newDesc.trim() || 'Custom couple coupon made with love.',
      reward: newReward.trim() || 'Claimable anytime with your darling!',
      scratched: false,
      redeemed: false,
      isCustom: true,
    };

    updateCoupons([newCoupon, ...coupons]);
    setNewTitle('');
    setNewDesc('');
    setNewReward('');
    setShowAddModal(false);
    soundFx.playPop(620, 0.08);
  };

  return (
    <div className="p-6 md:p-8 rounded-3xl glass-card border border-rose-200 shadow-xl relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-1">
            <Ticket className="w-3.5 h-3.5" /> Scratch & Win
          </span>
          <h3 className="text-2xl font-extrabold text-slate-800">
            Love Coupons & Secret Vouchers
          </h3>
          <p className="text-xs md:text-sm text-slate-500">
            Scratch the cards with your mouse or finger to uncover special couple privileges with {partnerName}!
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-400/20 transition whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Coupon</span>
        </button>
      </div>

      {/* Coupon Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <ScratchCardItem
            key={coupon.id}
            coupon={coupon}
            onReveal={handleReveal}
            onRedeem={handleRedeem}
          />
        ))}
      </div>

      {/* Add Custom Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-white shadow-2xl border border-rose-200">
            <h4 className="text-lg font-bold text-slate-800 mb-2">Create Custom Love Coupon</h4>
            <p className="text-xs text-slate-500 mb-4">
              Write a personalized voucher for {partnerName} to scratch off and claim!
            </p>

            <form onSubmit={handleAddCustom} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Coupon Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Free Breakfast in Bed"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Pancakes, fresh juice, and cuddles"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Redemption Rule
                </label>
                <input
                  type="text"
                  value={newReward}
                  onChange={(e) => setNewReward(e.target.value)}
                  placeholder="e.g. Redeemable on any Sunday morning"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
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
                  className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-400/30"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
