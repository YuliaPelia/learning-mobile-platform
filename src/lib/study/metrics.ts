import type { StudyState } from './types';

const DAY = 86_400_000;

export const startOfDay = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export function minutesToday(s: StudyState, now = Date.now()) {
  const from = startOfDay(now);
  return s.sessions.filter((x) => x.startedAt >= from).reduce((sum, x) => sum + x.minutes, 0);
}

/** Хвилини за останні 7 днів, від найстаршого до сьогодні. */
export function minutesByDay(s: StudyState, days = 7, now = Date.now()) {
  const today = startOfDay(now);
  return Array.from({ length: days }, (_, i) => {
    const from = today - (days - 1 - i) * DAY;
    const minutes = s.sessions.filter((x) => x.startedAt >= from && x.startedAt < from + DAY).reduce((sum, x) => sum + x.minutes, 0);
    return { day: from, minutes };
  });
}

/** Середня успішність квізів, 0..1; null — квізів ще не було. */
export function quizAccuracy(s: StudyState) {
  const total = s.quizResults.reduce((sum, r) => sum + r.total, 0);
  if (!total) return null;
  return s.quizResults.reduce((sum, r) => sum + r.correct, 0) / total;
}

export type Forecast = {
  /** орієнтовна дата завершення; null — замало даних */
  date: Date | null;
  lessonsLeft: number;
  /** уроків на тиждень, на яких побудовано прогноз */
  pace: number;
  /** щоб зрозуміти, чому дата зсунулась */
  note: string;
};

/**
 * Прогноз завершення курсу: уроків залишилось / темп. Темп беремо з уроків за тиждень,
 * а слабка успішність квізів (<60%) уповільнює його — потрібні повторення.
 */
export function forecastCompletion(
  lessonsLeft: number,
  lessonsThisWeek: number,
  accuracy: number | null,
  now = Date.now(),
): Forecast {
  if (lessonsLeft <= 0) return { date: null, lessonsLeft: 0, pace: lessonsThisWeek, note: 'Курс пройдено' };
  if (lessonsThisWeek <= 0) return { date: null, lessonsLeft, pace: 0, note: 'Пройдіть кілька уроків — і зʼявиться прогноз' };
  let pace = lessonsThisWeek;
  let note = `Темп: ${lessonsThisWeek} ур./тиж.`;
  if (accuracy !== null && accuracy < 0.6) {
    pace *= 0.8;
    note += ' · квізи просять повторення (+20% часу)';
  } else if (accuracy !== null && accuracy >= 0.85) {
    note += ' · квізи на відмінно';
  }
  const weeks = lessonsLeft / pace;
  return { date: new Date(now + weeks * 7 * DAY), lessonsLeft, pace, note };
}
