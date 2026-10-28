import { isCorrect, makeChallenge } from '../parentalGate';

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
});
