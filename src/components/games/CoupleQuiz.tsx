import React, { useState } from 'react';
import { useCouple } from '../../context/CoupleContext';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { HelpCircle, CheckCircle2, RotateCcw, Heart, Award } from 'lucide-react';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Who is more likely to fall asleep 10 minutes into a movie?',
    roast: 'Usually snores within the opening credits!',
  },
  {
    id: 2,
    question: 'Who takes longer to get ready before going out?',
    roast: '"Just 5 more minutes" actually means 45 minutes.',
  },
  {
    id: 3,
    question: 'Who is more likely to order food and then eat from the other’s plate?',
    roast: '"Your fries just taste better than mine!"',
  },
  {
    id: 4,
    question: 'Who is the bigger drama queen when they have a minor cold?',
    roast: 'Needs 24/7 soup service and emergency blankets.',
  },
  {
    id: 5,
    question: 'Who loves the other person more?',
    roast: 'Trick question: It is an infinite competition!',
  },
];

export const CoupleQuiz: React.FC = () => {
  const { profile } = useCouple();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: number]: string }>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleSelect = (choice: string) => {
    soundFx.playPop(550, 0.05);
    const newAnswers = { ...answers, [QUIZ_QUESTIONS[currentIdx].id]: choice };
    setAnswers(newAnswers);

    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
      soundFx.playCelebration();
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setAnswers({});
    setIsFinished(false);
    soundFx.playPop(500, 0.05);
  };

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  return (
    <div className="p-6 md:p-8 rounded-3xl glass-card border border-rose-200 shadow-xl relative">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-2">
          <HelpCircle className="w-3.5 h-3.5" /> Couple Chemistry Quiz
        </span>
        <h3 className="text-2xl font-extrabold text-slate-800">
          Who Is More Likely To...? 🤭
        </h3>
        <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Answer 5 fun couple questions to see your dynamic compatibility!
        </p>
      </div>

      {!isFinished ? (
        <div className="max-w-md mx-auto">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</span>
            <span>{Math.round(((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-rose-500 to-pink-500 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="p-6 rounded-2xl bg-white border border-rose-100 shadow-md text-center mb-6">
            <h4 className="text-lg md:text-xl font-bold text-slate-800">
              "{currentQ.question}"
            </h4>
            <p className="text-xs text-rose-500 mt-2 font-medium italic">
              {currentQ.roast}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSelect(profile.boyfriendName)}
              className="w-full p-4 rounded-xl border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition text-left flex items-center justify-between font-bold text-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤴</span>
                <span>Definitely {profile.boyfriendName}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelect(profile.girlfriendName)}
              className="w-full p-4 rounded-xl border-2 border-rose-200 hover:border-rose-500 hover:bg-rose-50 transition text-left flex items-center justify-between font-bold text-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👸</span>
                <span>100% {profile.girlfriendName}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelect('Both Equally')}
              className="w-full p-4 rounded-xl border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 transition text-left flex items-center justify-between font-bold text-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤝</span>
                <span>Guilty as charged: Both of us!</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* Finished Results */
        <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-b from-rose-50 to-pink-50 border border-rose-200 text-center animate-fade-in">
          <Award className="w-12 h-12 text-rose-500 mx-auto mb-2 animate-bounce" />
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Quiz Completed!
          </span>
          <h4 className="text-2xl font-black text-slate-800 mt-1">
            Dynamic Duo Score: 100% 💖
          </h4>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            You two know each other inside out! Every quirk, every habit, and every smile just makes you love each other even more.
          </p>

          <div className="mt-4 p-3 rounded-2xl bg-white text-left space-y-2 border border-rose-100 text-xs">
            {QUIZ_QUESTIONS.map((q) => (
              <div key={q.id} className="flex justify-between items-center gap-2 border-b border-slate-100 pb-1.5 last:border-0">
                <span className="text-slate-600 truncate">{q.question}</span>
                <span className="font-bold text-rose-600 shrink-0">
                  {answers[q.id]}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-white border border-rose-200 text-slate-700 hover:text-rose-600 shadow-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Play Quiz Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
