import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { FocusSession, QuizResult, StudySettings, StudyState, Task } from './types';

const DAY = 86_400_000;
// Через скільки днів повторювати питання після 0, 1, 2, 3 правильних відповідей підряд
const INTERVALS = [1, 3, 7, 14];

const empty = (): StudyState => ({ tasks: [], sessions: [], quizResults: [], mistakes: [], topics: {}, childGoals: {}, settings: defaultSettings });

// Поки бекенд не віддає задачі й сесії, зберігаємо їх на пристрої.
const KEY = 'itc.study.v1';

export const defaultSettings: StudySettings = { focusMin: 25, shortBreakMin: 5, longBreakMin: 15, dailyGoalMin: 45, reminderOn: false, reminderHour: 18 };

let state: StudyState = empty();
const listeners = new Set<() => void>();

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function commit(next: StudyState) {
  state = next;
  listeners.forEach((l) => l());
  AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {
    // без збереження дані житимуть до перезапуску
  });
}

AsyncStorage.getItem(KEY)
  .then((raw) => {
    if (!raw) return;
    const saved = JSON.parse(raw) as Partial<StudyState>;
    state = { ...empty(), ...saved, settings: { ...defaultSettings, ...saved.settings } };
    listeners.forEach((l) => l());
  })
  .catch(() => {});

export function useStudy(): StudyState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

export const study = {
  addTask(title: string, courseId?: string) {
    const task: Task = { id: uid(), title: title.trim(), courseId, done: false, createdAt: Date.now() };
    commit({ ...state, tasks: [task, ...state.tasks] });
  },
  toggleTask(id: string) {
    commit({
      ...state,
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: !t.done, doneAt: t.done ? undefined : Date.now() } : t)),
    });
  },
  removeTask(id: string) {
    commit({ ...state, tasks: state.tasks.filter((t) => t.id !== id) });
  },
  addSession(minutes: number, taskId?: string) {
    if (minutes < 1) return;
    const s: FocusSession = { id: uid(), startedAt: Date.now() - minutes * 60_000, minutes, taskId };
    commit({ ...state, sessions: [...state.sessions, s] });
  },
  addQuizResult(quizId: string, correct: number, total: number) {
    const r: QuizResult = { id: uid(), quizId, at: Date.now(), correct, total };
    commit({ ...state, quizResults: [...state.quizResults, r] });
  },
  /** Відповідь у квізі: оновлює слабкі теми й чергу повторення помилок. */
  answer(quizId: string, questionId: string, topic: string | undefined, correct: boolean) {
    const topics = { ...state.topics };
    if (topic) {
      const t = topics[topic] ?? { correct: 0, total: 0 };
      topics[topic] = { correct: t.correct + (correct ? 1 : 0), total: t.total + 1 };
    }
    const rest = state.mistakes.filter((m) => !(m.quizId === quizId && m.questionId === questionId));
    const prev = state.mistakes.find((m) => m.quizId === quizId && m.questionId === questionId);
    let mistakes = rest;
    if (!correct) mistakes = [...rest, { quizId, questionId, box: 0, due: Date.now() + DAY }];
    else if (prev && prev.box + 1 < INTERVALS.length) {
      mistakes = [...rest, { ...prev, box: prev.box + 1, due: Date.now() + INTERVALS[prev.box + 1] * DAY }];
    }
    commit({ ...state, topics, mistakes });
  },
  setChildGoal(childId: string, lessonsPerWeek: number) {
    commit({ ...state, childGoals: { ...state.childGoals, [childId]: lessonsPerWeek } });
  },
  setSettings(patch: Partial<StudySettings>) {
    commit({ ...state, settings: { ...state.settings, ...patch } });
  },
  /** Скидає локальні дані (вихід з акаунта / видалення). */
  reset() {
    commit(empty());
  },
};
