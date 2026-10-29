export type Who = 'self' | 'child';
export type AgeBand = '9-10' | '11-12' | '13-14' | '15-17';
export type Interest = 'games' | 'sites' | 'design' | 'apps' | 'bots' | 'animation';
export type Experience = 'new' | 'some' | 'pro';
/** Чим займається у вільний час. */
export type Hobby = 'drawing' | 'music' | 'sports' | 'reading' | 'building' | 'videogames' | 'science' | 'video';
/** Що найбільше подобається робити. */
export type Activity = 'story' | 'draw' | 'build' | 'puzzle' | 'compete' | 'help';

/**
 * Відповіді вхідного квізу.
 * УВАГА: вікова група — лише налаштування складності підбору. Вона НЕ є перевіркою віку й не має підміняти нейтральний
 * віковий екран входу (sign-in.tsx, Google/Apple); не використовувати її як доказ віку.
 */
/** Відповіді вхідного квізу. Лишаються лише на пристрої; без імені, дати народження й інших ідентифікаторів. */
export type Answers = { who: Who; age: AgeBand; hobbies: Hobby[]; activities: Activity[]; interests: Interest[]; experience: Experience; minutes: 10 | 20 | 40 };

export const AGE_RANGE: Record<AgeBand, [number, number]> = { '9-10': [9, 10], '11-12': [11, 12], '13-14': [13, 14], '15-17': [15, 17] };

/** Інтерес → підписи категорій курсів (як у `CATEGORY` в api.ts). */
export const INTEREST_CATEGORIES: Record<Interest, string[]> = {
  games: ['Ігри'],
  sites: ['Web'],
  design: ['Дизайн'],
  apps: ['Mobile'],
  bots: ['Код'],
  animation: ['Старт', 'Ігри'],
};

type Affinity = Partial<Record<Interest, number>>;

/**
 * Як захоплення «тягнуться» до напрямів програмування (0–3). Це евристика для підказки, а не висновок про дитину:
 * вага лише трохи підсуває курс і ніколи не перебиває явний інтерес чи вікові межі.
 */
export const HOBBY_AFFINITY: Record<Hobby, Affinity> = {
  drawing: { design: 2, animation: 2, games: 1 },
  music: { apps: 1, games: 1, animation: 1 },
  sports: { apps: 1, games: 1 },
  reading: { sites: 2, animation: 1 },
  building: { games: 2, bots: 2 },
  videogames: { games: 3, animation: 1 },
  science: { bots: 3, apps: 1 },
  video: { animation: 2, sites: 1 },
};

export const ACTIVITY_AFFINITY: Record<Activity, Affinity> = {
  story: { animation: 2, games: 1, sites: 1 },
  draw: { design: 3, animation: 1 },
  build: { games: 2, apps: 1, bots: 1 },
  puzzle: { bots: 3, games: 1 },
  compete: { games: 3 },
  help: { apps: 2, sites: 1 },
};
