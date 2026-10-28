import { minutesByDay } from './metrics';
import type { StudyState } from './types';

export type Achievement = { id: string; title: string; hint: string; earned: boolean };

/** Скільки днів поспіль виконувалась денна ціль (сьогодні не рахується, якщо ще не виконана). */
export function goalStreak(s: StudyState) {
  const days = minutesByDay(s, 30);
  let i = days.length - 1;
  if (days[i].minutes < s.settings.dailyGoalMin) i--;
  let n = 0;
  for (; i >= 0 && days[i].minutes >= s.settings.dailyGoalMin; i--) n++;
  return n;
}

export function achievements(s: StudyState): Achievement[] {
  const total = s.sessions.reduce((sum, x) => sum + x.minutes, 0);
  const answered = s.quizResults.reduce((sum, r) => sum + r.total, 0);
  return [
    { id: 'first-focus', title: 'Перший фокус', hint: 'Завершіть сесію таймера', earned: s.sessions.length > 0 },
    { id: 'goal-day', title: 'Ціль дня', hint: 'Виконайте денну ціль', earned: minutesByDay(s, 30).some((d) => d.minutes >= s.settings.dailyGoalMin) },
    { id: 'goal-3', title: '3 дні поспіль', hint: 'Виконуйте ціль 3 дні підряд', earned: goalStreak(s) >= 3 },
    { id: 'hour-5', title: '5 годин навчання', hint: 'Накопичте 300 хв у таймері', earned: total >= 300 },
    { id: 'perfect', title: 'Без помилок', hint: 'Пройдіть квіз на 100%', earned: s.quizResults.some((r) => r.correct === r.total) },
    { id: 'quiz-20', title: 'Тренування', hint: 'Дайте 20 відповідей у квізах', earned: answered >= 20 },
  ];
}

/** Бонусні XP за самостійне навчання: хвилини фокусу + правильні відповіді. */
export function bonusXp(s: StudyState) {
  return s.sessions.reduce((sum, x) => sum + x.minutes, 0) + s.quizResults.reduce((sum, r) => sum + r.correct * 5, 0);
}
