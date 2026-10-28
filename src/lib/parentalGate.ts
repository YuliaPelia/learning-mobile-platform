/**
 * Батьківська перевірка (Apple 1.3 / Google Families): перед покупками й зовнішніми посиланнями
 * просимо розвʼязати приклад, який дитина 9–11 років зазвичай не розвʼяже швидко.
 */
export type Challenge = { text: string; answer: number };

export function makeChallenge(rand: () => number = Math.random): Challenge {
  const a = 6 + Math.floor(rand() * 4); // 6..9
  const b = 12 + Math.floor(rand() * 8); // 12..19
  return { text: `Скільки буде ${a} × ${b}?`, answer: a * b };
}

export const isCorrect = (c: Challenge, input: string) => Number(input.trim()) === c.answer;
