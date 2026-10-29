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

const TENS = ['', '', 'двадцять', 'тридцять', 'сорок', "п'ятдесят", 'шістдесят', 'сімдесят', 'вісімдесят', "дев'яносто"];
const ONES = ['', 'один', 'два', 'три', 'чотири', "п'ять", 'шість', 'сім', 'вісім', "дев'ять"];

/** Другий тип перевірки: число прописом («Введи цифрами: сімдесят три»). Це лише різноманіття: підліток його теж розвʼяже, тож головний захист — пауза після помилок. */
export function makeWordChallenge(rand: () => number = Math.random): Challenge {
  const tens = 2 + Math.floor(rand() * 8); // 2..9
  const ones = 1 + Math.floor(rand() * 9); // 1..9
  return { text: `Введи цифрами: ${TENS[tens]} ${ONES[ones]}`, answer: tens * 10 + ones };
}

/** Випадковий із двох типів. */
export const nextChallenge = (rand: () => number = Math.random): Challenge => (rand() < 0.5 ? makeChallenge(rand) : makeWordChallenge(rand));

/** Пауза після кількох помилок поспіль: 3 помилки — 30 с, далі вдвічі довше, до 5 хв. */
export function lockoutMs(failures: number): number {
  if (failures < 3) return 0;
  return Math.min(30_000 * 2 ** (failures - 3), 300_000);
}
