import { FlamesResult } from '../types';

export function calculateFlames(name1: string, name2: string): FlamesResult {
  const clean1 = name1.trim().toLowerCase().replace(/[^a-z]/g, '');
  const clean2 = name2.trim().toLowerCase().replace(/[^a-z]/g, '');

  const arr1 = clean1.split('');
  const arr2 = clean2.split('');

  const commonLetters: string[] = [];

  // Cross out matching letters
  for (let i = 0; i < arr1.length; i++) {
    const char = arr1[i];
    if (!char) continue;
    const matchIdx = arr2.findIndex((c) => c === char);
    if (matchIdx !== -1) {
      commonLetters.push(char);
      arr1[i] = '*';
      arr2[matchIdx] = '*';
    }
  }

  const remaining1 = arr1.filter((c) => c !== '*');
  const remaining2 = arr2.filter((c) => c !== '*');
  let totalRemaining = remaining1.length + remaining2.length;

  if (totalRemaining === 0) {
    totalRemaining = 1; // Perfect match fallback
  }

  const letters: ('F' | 'L' | 'A' | 'M' | 'E' | 'S')[] = ['F', 'L', 'A', 'M', 'E', 'S'];
  const wordsMap: Record<'F' | 'L' | 'A' | 'M' | 'E' | 'S', string> = {
    F: 'Friends',
    L: 'Lovers',
    A: 'Affection',
    M: 'Marriage',
    E: 'Enemies (Playful Rivals)',
    S: 'Soulmates (Sweethearts)',
  };

  const currentFlames = [...letters];
  const stepEliminations: { letter: string; word: string; remaining: string[] }[] = [];

  let startIdx = 0;
  while (currentFlames.length > 1) {
    const eliminateIdx = (startIdx + totalRemaining - 1) % currentFlames.length;
    const eliminated = currentFlames.splice(eliminateIdx, 1)[0];
    stepEliminations.push({
      letter: eliminated,
      word: wordsMap[eliminated],
      remaining: [...currentFlames],
    });
    startIdx = eliminateIdx % currentFlames.length;
  }

  const resultLetter = currentFlames[0];
  const resultWord = wordsMap[resultLetter];

  const descriptions: Record<'F' | 'L' | 'A' | 'M' | 'E' | 'S', { desc: string; percent: number; advice: string }> = {
    L: {
      desc: 'Deep, passionate, cinematic lovers who make everyday feel like a romantic comedy.',
      percent: 99,
      advice: 'Never let go of those spontaneous forehead kisses and late night laughter!',
    },
    M: {
      desc: 'Destined for eternity! You two are the couple everyone looks at and says "couple goals".',
      percent: 98,
      advice: 'Start planning your dream honeymoon and cozy home together!',
    },
    A: {
      desc: 'Gentle, tender, and caring affection that warms the soul like a cup of hot cocoa on a winter day.',
      percent: 95,
      advice: 'Give each other a big tight 30-second hug right now.',
    },
    S: {
      desc: 'True Soulmates! You read each other\'s thoughts before words are even spoken.',
      percent: 96,
      advice: 'Your bond is unbreakable. Treat each other to dessert tonight!',
    },
    F: {
      desc: 'Best friends turned lovers! The foundation of great romance is deep best-friend energy.',
      percent: 92,
      advice: 'Keep roasting each other playfully while secretly loving every second of it.',
    },
    E: {
      desc: 'Playful enemies & passionate rivals! You argue over who loves the other person more.',
      percent: 91,
      advice: 'Settle your next debate with a cute staring contest or tickle war!',
    },
  };

  const meta = descriptions[resultLetter];

  return {
    partner1: name1.trim(),
    partner2: name2.trim(),
    commonLetters,
    remainingCount: totalRemaining,
    stepEliminations,
    resultLetter,
    resultWord,
    description: meta.desc,
    percentage: meta.percent,
    advice: meta.advice,
  };
}
