import React, { useState, useEffect } from 'react';
import { useCouple } from '../context/CoupleContext';
import { Calendar, Clock, Flame, Heart, Sparkles } from 'lucide-react';

export const LoveCounter: React.FC = () => {
  const { profile } = useCouple();
  const [elapsed, setElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(profile.relationshipStartDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setElapsed({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [profile.relationshipStartDate]);

  return (
    <section className="max-w-4xl mx-auto px-4 py-4">
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden">
        {/* Background ambient stars */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-48 h-48 rounded-full bg-pink-300/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Our Love Stopwatch</span>
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
              {profile.boyfriendName} & {profile.girlfriendName}
            </h3>
            <p className="text-xs md:text-sm text-pink-100 mt-0.5 flex items-center justify-center md:justify-start gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Loving each other since{' '}
                {(() => {
                  try {
                    const [y, m, d] = profile.relationshipStartDate.split('-');
                    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                    return dateObj.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  } catch {
                    return profile.relationshipStartDate;
                  }
                })()}
              </span>
            </p>
          </div>

          {/* Clock counter badges */}
          <div className="grid grid-cols-4 gap-2 md:gap-3 text-center">
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 min-w-[64px] md:min-w-[76px]">
              <span className="text-xl md:text-3xl font-black">{elapsed.days}</span>
              <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-pink-100">
                Days
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 min-w-[64px] md:min-w-[76px]">
              <span className="text-xl md:text-3xl font-black">{elapsed.hours}</span>
              <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-pink-100">
                Hours
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 min-w-[64px] md:min-w-[76px]">
              <span className="text-xl md:text-3xl font-black">{elapsed.minutes}</span>
              <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-pink-100">
                Mins
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 min-w-[64px] md:min-w-[76px]">
              <span className="text-xl md:text-3xl font-black text-amber-200">{elapsed.seconds}</span>
              <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-pink-100">
                Secs
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
