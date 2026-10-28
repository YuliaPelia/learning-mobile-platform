import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { FocusSession, QuizResult, StudySettings, StudyState, Task } from './types';

const DAY = 86_400_000;
// Через скільки днів повторювати питання після 0, 1, 2, 3 правильних відповідей підряд
const INTERVALS = [1, 3, 7, 14];

const empty = (): StudyState => ({ tasks: [], sessions: [], quizResults: [], mistakes: [], topics: {}, childGoals: {}, settings: defaultSettings });

// Поки бекенд не віддає задачі й сесії, зберігаємо їх на пристрої — окремо для кожного акаунта
// (і для гостя), щоб прогрес однієї дитини не потрапляв до іншої на спільному телефоні.
const keyFor = (owner: string) => `itc.study.v2.${owner}`;
const LEGACY_KEY = 'itc.study.v1'; // без власника — видаляється при першому запуску

export const defaultSettings: StudySettings = { focusMin: 25, shortBreakMin: 5, longBreakMin: 15, dailyGoalMin: 45, reminderOn: false, reminderHour: 18 };

let state: StudyState = empty();
let owner = 'guest';
let loadId = 0;
/** Триває читання з диска: зміни складаємо в чергу й застосуємо до завантажених даних. */
let loading = false;
let queue: ((s: StudyState) => StudyState)[] = [];
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function persist() {
  AsyncStorage.setItem(keyFor(owner), JSON.stringify(state)).catch(() => {
    // без збереження дані житимуть до перезапуску
  });
}

/** Усі зміни йдуть через неї. Під час завантаження вони лишаються в черзі, щоб не затерти збережене. */
function update(fn: (s: StudyState) => StudyState) {
  state = fn(state);
  notify();
  if (loading) queue.push(fn);
  else persist();
}

/** Перемикає сховище на іншого власника (`null` — гість) і завантажує його дані. */
export async function setStudyOwner(next: string | null) {
  const o = next ?? 'guest';
  const id = ++loadId;
  owner = o;
  state = empty();
  queue = [];
  loading = true;
  notify();
  let base = empty();
  try {
    await removeLegacy();
    const raw = await AsyncStorage.getItem(keyFor(o));
    if (id !== loadId) return;
    if (raw) {
      const saved = JSON.parse(raw) as Partial<StudyState>;
      base = { ...empty(), ...saved, settings: { ...defaultSettings, ...saved.settings } };
    }
  } catch {
    // пошкоджені дані — починаємо з чистого стану
  }
  if (id !== loadId) return;
  const pending = queue;
  queue = [];
  loading = false;
  // Зміни, зроблені під час читання, застосовуємо до завантажених даних (а не до порожнього стану)
  state = pending.reduce((acc, fn) => fn(acc), base);
  if (pending.length) persist();
  notify();
}

/** Старі ключі без власника: v1 (чий це прогрес — невідомо, тож не переносимо) і кеш статистики з іменами дітей. */
async function removeLegacy() {
  await AsyncStorage.multiRemove([LEGACY_KEY, 'itc.cache.stats']).catch(() => {});
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

/** Підписка на частину стану: компонент перерисовується лише коли змінилося вибране значення. Селектор має повертати стабільне значення (примітив або частину стану). */
export function useStudySelect<T>(select: (s: StudyState) => T): T {
  return useSyncExternalStore(subscribe, () => select(state));
}

export const useStudy = (): StudyState => useStudySelect((s) => s);

export const study = {
  get: () => state,
  addTask(title: string, courseId?: string) {
    const task: Task = { id: uid(), title: title.trim(), courseId, done: false, createdAt: Date.now() };
    update((s) => ({ ...s, tasks: [task, ...s.tasks] }));
  },
  toggleTask(id: string) {
    update((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done, doneAt: t.done ? undefined : Date.now() } : t)),
    }));
  },
  removeTask(id: string) {
    update((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  },
  addSession(minutes: number, taskId?: string) {
    if (minutes < 1) return;
    const s: FocusSession = { id: uid(), startedAt: Date.now() - minutes * 60_000, minutes, taskId };
    update((st) => ({ ...st, sessions: [...st.sessions, s] }));
  },
  addQuizResult(quizId: string, correct: number, total: number) {
    const r: QuizResult = { id: uid(), quizId, at: Date.now(), correct, total };
    update((s) => ({ ...s, quizResults: [...s.quizResults, r] }));
  },
  /** Відповідь у квізі: оновлює слабкі теми й чергу повторення помилок. */
  answer(quizId: string, questionId: string, topic: string | undefined, correct: boolean) {
    const now = Date.now();
    update((s) => {
      const topics = { ...s.topics };
      if (topic) {
        const t = topics[topic] ?? { correct: 0, total: 0 };
        topics[topic] = { correct: t.correct + (correct ? 1 : 0), total: t.total + 1 };
      }
      const same = (m: { quizId: string; questionId: string }) => m.quizId === quizId && m.questionId === questionId;
      const rest = s.mistakes.filter((m) => !same(m));
      const prev = s.mistakes.find(same);
      let mistakes = rest;
      if (!correct) mistakes = [...rest, { quizId, questionId, box: 0, due: now + DAY }];
      else if (prev && prev.box + 1 < INTERVALS.length) {
        mistakes = [...rest, { ...prev, box: prev.box + 1, due: now + INTERVALS[prev.box + 1] * DAY }];
      }
      return { ...s, topics, mistakes };
    });
  },
  setChildGoal(childId: string, lessonsPerWeek: number) {
    update((s) => ({ ...s, childGoals: { ...s.childGoals, [childId]: lessonsPerWeek } }));
  },
  /** Профіль дитини видалено — прибираємо її ціль. */
  removeChildGoal(childId: string) {
    update((s) => {
      const { [childId]: _removed, ...rest } = s.childGoals;
      return { ...s, childGoals: rest };
    });
  },
  setSettings(patch: Partial<StudySettings>) {
    update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },
  /** Стирає з пристрою дані власника (видалення акаунта); якщо він поточний — ще й скидає стан. */
  wipe(ownerId: string) {
    AsyncStorage.removeItem(keyFor(ownerId)).catch(() => {});
    if (ownerId === owner) {
      state = empty();
      queue = [];
      notify();
    }
  },
};
