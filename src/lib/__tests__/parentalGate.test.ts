import { isCorrect, lockoutMs, makeChallenge, makeWordChallenge } from '../parentalGate';

describe('батьківська перевірка', () => {
  it('приклад у межах 6–9 × 12–19', () => {
    expect(makeChallenge(() => 0)).toEqual({ text: 'Скільки буде 6 × 12?', answer: 72 });
    expect(makeChallenge(() => 0.999)).toEqual({ text: 'Скільки буде 9 × 19?', answer: 171 });
  });
  it('приймає правильну відповідь з пробілами й відхиляє решту', () => {
    const c = { text: '', answer: 72 };
    expect(isCorrect(c, ' 72 ')).toBe(true);
    expect(isCorrect(c, '71')).toBe(false);
    expect(isCorrect(c, '')).toBe(false);
    expect(isCorrect(c, 'сімдесят два')).toBe(false);
  });
  it('число прописом: відповідь збігається з текстом', () => {
    expect(makeWordChallenge(() => 0)).toEqual({ text: 'Введи цифрами: двадцять один', answer: 21 });
    expect(makeWordChallenge(() => 0.999)).toEqual({ text: "Введи цифрами: дев'яносто дев'ять", answer: 99 });
  });
  it('пауза після 3 помилок росте до 5 хв', () => {
    expect([0, 2].map(lockoutMs)).toEqual([0, 0]);
    expect(lockoutMs(3)).toBe(30_000);
    expect(lockoutMs(4)).toBe(60_000);
    expect(lockoutMs(20)).toBe(300_000);
  });
});
