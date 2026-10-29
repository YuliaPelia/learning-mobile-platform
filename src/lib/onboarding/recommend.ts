import type { Course } from '@/lib/types';
import { ACTIVITY_AFFINITY, AGE_RANGE, HOBBY_AFFINITY, INTEREST_CATEGORIES, type Activity, type Answers, type Hobby, type Interest } from './types';

export type Recommendation = { course: Course; score: number; reasons: ('age' | 'interest' | 'hobby' | 'level')[]; interest?: string; /** Захоплення, що найбільше підсунуло цей курс (для пояснення). */ hobby?: Hobby | Activity };

/** «11–17» → [11, 17]; невідомий формат → null. */
export function parseAge(age: string): [number, number] | null {
  const m = /(\d+)\D+(\d+)/.exec(age);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/**
 * Підбір курсів: вік (відповідність діапазону), інтереси (у порядку, у якому їх обрали — перший важить більше),
 * досвід (новачкам — «Старт», досвідченим — без «Старт»). Курси «скоро» не пропонуються. Вікові межі жорсткі:
 * курс, який зовсім не підходить за віком, не пропонуємо, навіть якщо тема збігається.
 * Захоплення й улюблені заняття лише ЛЕГКО підсувають курси (до +3 балів, вага ×0.5) і не перебивають явні інтереси.
 */
const HOBBY_CAP = 3;

/** Сума «тяжіння» захоплень до кожного напряму + яке захоплення дало найбільше. */
function hobbyPull(a: Partial<Answers>) {
  const total: Partial<Record<Interest, number>> = {};
  const best: Partial<Record<Interest, { who: Hobby | Activity; w: number }>> = {};
  const add = (who: Hobby | Activity, aff: Partial<Record<Interest, number>>) => {
    for (const [k, w] of Object.entries(aff) as [Interest, number][]) {
      total[k] = (total[k] ?? 0) + w;
      if (!best[k] || w > best[k]!.w) best[k] = { who, w };
    }
  };
  (a.hobbies ?? []).forEach((h) => add(h, HOBBY_AFFINITY[h]));
  (a.activities ?? []).forEach((x) => add(x, ACTIVITY_AFFINITY[x]));
  return { total, best };
}

export function recommend(a: Partial<Answers>, courses: Course[], limit = 2): Recommendation[] {
  const band = a.age ? AGE_RANGE[a.age] : null;
  const out: Recommendation[] = [];
  const pull = hobbyPull(a);
  for (const course of courses) {
    if (course.soon) continue;
    let score = 0;
    const reasons: Recommendation['reasons'] = [];
    let interest: string | undefined;

    const range = parseAge(course.age);
    if (band && range) {
      const overlap = Math.min(band[1], range[1]) - Math.max(band[0], range[0]) + 1;
      if (overlap <= 0) continue;
      const full = overlap === band[1] - band[0] + 1;
      score += full ? 3 : 1;
      reasons.push('age');
    }

    (a.interests ?? []).forEach((i, idx) => {
      if (INTEREST_CATEGORIES[i].includes(course.category)) {
        score += 4 - Math.min(idx, 2);
        interest ??= i;
      }
    });
    if (interest) reasons.push('interest');

    // Захоплення: курс належить до напрямів, які ці захоплення «тягнуть»
    let hobbyScore = 0;
    let hobby: Recommendation['hobby'];
    let bestW = 0;
    for (const [k, cats] of Object.entries(INTEREST_CATEGORIES) as [Interest, string[]][]) {
      if (!cats.includes(course.category) || !pull.total[k]) continue;
      hobbyScore += (pull.total[k] ?? 0) * 0.5;
      const b = pull.best[k];
      if (b && b.w > bestW) {
        bestW = b.w;
        hobby = b.who;
      }
    }
    if (hobbyScore > 0) {
      score += Math.min(hobbyScore, HOBBY_CAP);
      reasons.push('hobby');
    }

    if (a.experience === 'new' && course.category === 'Старт') {
      score += 2;
      reasons.push('level');
    } else if (a.experience === 'pro' && course.category === 'Старт') {
      score -= 2;
    }
    out.push({ course, score, reasons, interest, hobby });
  }
  return out.sort((x, y) => y.score - x.score || y.course.freeLessons - x.course.freeLessons).slice(0, limit);
}
