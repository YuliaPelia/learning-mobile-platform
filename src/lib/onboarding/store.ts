import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { Answers } from './types';

// Вхідний квіз проходять до реєстрації, тож відповіді зберігаються на пристрої, а не за акаунтом. Нічого не надсилаємо на сервер.
const KEY = 'itc.onboarding.v1';

export type OnboardingState = { status: 'loading' | 'new' | 'done' | 'skipped'; answers: Partial<Answers> | null };

let state: OnboardingState = { status: 'loading', answers: null };
const listeners = new Set<() => void>();
const set = (next: OnboardingState) => {
  state = next;
  listeners.forEach((l) => l());
};

AsyncStorage.getItem(KEY)
  .then((raw) => {
    if (!raw) return set({ status: 'new', answers: null });
    const saved = JSON.parse(raw) as { status?: 'done' | 'skipped'; answers?: Partial<Answers> };
    set({ status: saved.status ?? 'new', answers: saved.answers ?? null });
  })
  .catch(() => set({ status: 'new', answers: null }));

const persist = () => AsyncStorage.setItem(KEY, JSON.stringify({ status: state.status, answers: state.answers })).catch(() => {});

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const useOnboarding = () => useSyncExternalStore(subscribe, () => state);

export const onboarding = {
  get: () => state,
  finish(answers: Partial<Answers>) {
    set({ status: 'done', answers });
    persist();
  },
  /** «Пропустити»: більше не нав'язуємо, але квіз лишається доступним з головної й «Курсів». */
  skip() {
    set({ status: 'skipped', answers: state.answers });
    persist();
  },
  reset() {
    set({ status: 'new', answers: null });
    AsyncStorage.removeItem(KEY).catch(() => {});
  },
};
