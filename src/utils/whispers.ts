// A collection of deeply heartfelt, sweet, and poetic romantic whispers

export const SWEET_WHISPER_TEMPLATES: string[] = [
  "Every single beat of my heart whispers your name.",
  "You are my favorite thought from the moment I wake up until I fall asleep.",
  "If I had to choose between breathing and loving you, I would use my last breath to say I love you.",
  "You make the whole world feel softer, warmer, and full of magic.",
  "Being in your arms is the only place in the entire universe where I feel completely at home.",
  "I fell in love with your smile first, but I stayed for your beautiful soul.",
  "You are my today, my tomorrow, and all of my future dreams come true.",
  "No matter how crazy life gets, one look into your eyes and everything is okay.",
  "You are the most precious gift the universe has ever given me.",
  "I love you more than all the stars in the night sky and all the grains of sand on every beach.",
  "Thank you for being the sweetest, most caring person in my life.",
  "My heart did a little happy dance the day you walked into my life, and it hasn't stopped since.",
  "You are not just my partner; you are my best friend, my rock, and my whole world.",
  "Holding your hand feels like holding my entire future.",
  "Even on my gloomiest days, your laugh brings the warmest sunshine.",
  "I don't need a thousand reasons to smile; just you is more than enough.",
  "If love had a face, it would look exactly like you smiling back at me.",
  "You are my once-in-a-lifetime kind of love.",
  "Every love song on the radio suddenly made complete sense the day I met you.",
  "I promise to always hold you tight, listen to your dreams, and love you endlessly.",
  "Forever wouldn't be long enough if I get to spend it with you.",
  "You stole my heart, but I think I'll let you keep it forever.",
  "Just a reminder: You are loved, you are cherished, and you are my angel.",
  "My favorite place in all the world is right beside you.",
  "You turn ordinary moments into unforgettable memories."
];

export function getRandomWhisper(senderName: string, partnerName: string): string {
  const randomIndex = Math.floor(Math.random() * SWEET_WHISPER_TEMPLATES.length);
  const sentence = SWEET_WHISPER_TEMPLATES[randomIndex];
  return `💌 ${senderName} whispers to ${partnerName}: "${sentence}"`;
}
