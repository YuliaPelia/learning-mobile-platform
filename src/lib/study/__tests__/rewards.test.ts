import { achievements, bonusXp, goalStreak } from '../rewards';
import { at, makeState, result, session } from './helpers';

// goalStreak/achievements використовують Date.now() всередині (minutesByDay без now)
const NOW = at(2026, 3, 10, 15);
beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(NOW));
afterEach(() => jest.restoreAllMocks());

const day = (offset: number, minutes: number) => session(at(2026, 3, 10 - offset, 10), minutes); // 45 = ціль за замовч.

describe('goalStreak', () => {
  it('0 без сесій', () => expect(goalStreak(makeState())).toBe(0));
  it('сьогодні ще не виконано не рве серію', () => {
    expect(goalStreak(makeState({ sessions: [day(1, 45), day(2, 60)] }))).toBe(2);
  });
  it('сьогодні виконано додається до серії', () => {
    expect(goalStreak(makeState({ sessions: [day(0, 45), day(1, 45)] }))).toBe(2);
  });
  it('пропущений день рве серію', () => {
    expect(goalStreak(makeState({ sessions: [day(0, 45), day(2, 45), day(3, 45)] }))).toBe(1);
  });
  it('недостатньо хвилин не рахується', () => {
    expect(goalStreak(makeState({ sessions: [day(1, 44)] }))).toBe(0);
  });
});

describe('achievements', () => {
  const get = (s = makeState()) => Object.fromEntries(achievements(s).map((a) => [a.id, a.earned]));
  it('нічого не отримано на порожньому стані', () => {
    expect(Object.values(get()).every((v) => !v)).toBe(true);
  });
  it('first-focus, goal-day', () => {
    const g = get(makeState({ sessions: [day(5, 45)] }));
    expect(g['first-focus']).toBe(true);
    expect(g['goal-day']).toBe(true);
    expect(g['goal-3']).toBe(false);
  });
  it('goal-3 після 3 днів поспіль', () => {
    expect(get(makeState({ sessions: [day(0, 45), day(1, 45), day(2, 45)] }))['goal-3']).toBe(true);
  });
  it('hour-5 від 300 хв', () => {
    expect(get(makeState({ sessions: [day(0, 299)] }))['hour-5']).toBe(false);
    expect(get(makeState({ sessions: [day(0, 300)] }))['hour-5']).toBe(true);
  });
  it('perfect і quiz-20', () => {
    const g = get(makeState({ quizResults: [result(10, 10), result(5, 10)] }));
    expect(g.perfect).toBe(true);
    expect(g['quiz-20']).toBe(true);
    expect(get(makeState({ quizResults: [result(9, 10)] })).perfect).toBe(false);
  });
});

describe('bonusXp', () => {
  it('0 на порожньому', () => expect(bonusXp(makeState())).toBe(0));
  it('хвилини + 5 за правильну відповідь', () => {
    expect(bonusXp(makeState({ sessions: [day(0, 10), day(1, 20)], quizResults: [result(3, 4)] }))).toBe(30 + 15);
  });
});
