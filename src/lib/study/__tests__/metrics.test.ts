import { forecastCompletion, minutesByDay, minutesToday, quizAccuracy } from '../metrics';
import { at, makeState, result, session } from './helpers';

const now = at(2026, 3, 10, 15);

describe('minutesToday', () => {
  it('0 без сесій', () => expect(minutesToday(makeState(), now)).toBe(0));
  it('рахує лише сесії від початку доби', () => {
    const s = makeState({
      sessions: [session(at(2026, 3, 10, 0, 0), 10), session(at(2026, 3, 10, 14), 20), session(at(2026, 3, 9, 23, 59), 99)],
    });
    expect(minutesToday(s, now)).toBe(30);
  });
});

describe('minutesByDay', () => {
  it('повертає 7 днів від старшого до сьогодні', () => {
    const r = minutesByDay(makeState(), 7, now);
    expect(r).toHaveLength(7);
    expect(r[6].day).toBe(at(2026, 3, 10, 0));
    expect(r[0].day).toBe(at(2026, 3, 4, 0));
  });
  it('сесія о 23:59 і 00:00 потрапляють у різні доби', () => {
    const s = makeState({ sessions: [session(at(2026, 3, 9, 23, 59), 5), session(at(2026, 3, 10, 0, 0), 7)] });
    const r = minutesByDay(s, 7, now);
    expect(r[5].minutes).toBe(5);
    expect(r[6].minutes).toBe(7);
  });
  it('сесії старші за вікно ігноруються', () => {
    const s = makeState({ sessions: [session(at(2026, 3, 3, 12), 50)] });
    expect(minutesByDay(s, 7, now).every((d) => d.minutes === 0)).toBe(true);
  });
  it('працює через межу місяця', () => {
    const r = minutesByDay(makeState({ sessions: [session(at(2026, 2, 28, 10), 4)] }), 7, at(2026, 3, 2, 10));
    expect(r.find((d) => d.day === at(2026, 2, 28, 0))?.minutes).toBe(4);
  });
});

describe('quizAccuracy', () => {
  it('null без квізів', () => expect(quizAccuracy(makeState())).toBeNull());
  it('null якщо total = 0', () => expect(quizAccuracy(makeState({ quizResults: [result(0, 0)] }))).toBeNull());
  it('зважує за кількістю питань', () => {
    expect(quizAccuracy(makeState({ quizResults: [result(1, 1), result(1, 3)] }))).toBeCloseTo(0.5);
  });
});

describe('forecastCompletion', () => {
  const WEEK = 7 * 86_400_000;
  it('курс пройдено', () => {
    const f = forecastCompletion(0, 3, 1, now);
    expect(f.date).toBeNull();
    expect(f.lessonsLeft).toBe(0);
    expect(f.note).toBe('Курс пройдено');
  });
  it('темп 0 -> немає дати', () => {
    const f = forecastCompletion(10, 0, 0.9, now);
    expect(f.date).toBeNull();
    expect(f.pace).toBe(0);
    expect(f.lessonsLeft).toBe(10);
  });
  it('базовий прогноз', () => {
    const f = forecastCompletion(10, 5, null, now);
    expect(f.date!.getTime()).toBe(now + 2 * WEEK);
    expect(f.pace).toBe(5);
  });
  it('точність < 0.6 уповільнює на 20%', () => {
    const f = forecastCompletion(8, 5, 0.59, now);
    expect(f.pace).toBeCloseTo(4);
    expect(f.date!.getTime()).toBeCloseTo(now + 2 * WEEK, -1);
    expect(f.note).toContain('+20%');
  });
  it('рівно 0.6 не уповільнює', () => {
    expect(forecastCompletion(10, 5, 0.6, now).pace).toBe(5);
  });
  it('точність >= 0.85 додає позначку, темп без змін', () => {
    const f = forecastCompletion(10, 5, 0.85, now);
    expect(f.pace).toBe(5);
    expect(f.note).toContain('відмінно');
  });
});
