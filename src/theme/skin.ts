import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { fonts, glassBorder, radius, screenGradient, type } from '@/theme';

// «Шкіра» інтерфейсу: play — яскрава, для молодших; pro — спокійна, для підлітків і батьків.
// Це налаштування пристрою, а не акаунта, тому живе окремо від стору навчання.
export type Skin = 'play' | 'pro';
const KEY = 'itc.skin.v1';

let skin: Skin = 'play';
const listeners = new Set<() => void>();
const set = (next: Skin) => {
  skin = next;
  listeners.forEach((l) => l());
};

AsyncStorage.getItem(KEY)
  .then((v) => {
    if (v === 'pro' || v === 'play') set(v);
  })
  .catch(() => {});

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const useSkin = () => useSyncExternalStore(subscribe, () => skin);
export const setSkin = (next: Skin) => {
  set(next);
  AsyncStorage.setItem(KEY, next).catch(() => {});
};

/** Спокійна палітра: графітово-індигове тло, один акцент. Білий текст на ній ≥ 12:1. */
const proGradient = ['#1F2244', '#1C1F3F', '#1A1D3A', '#1D1C3B'] as const;

export const skinTokens = {
  play: { gradient: screenGradient, title: type.display, decor: true, tabBar: 'rgba(50,40,165,0.66)', tabRadius: 30 },
  pro: { gradient: proGradient, title: { ...type.title, fontFamily: fonts.bold }, decor: false, tabBar: 'rgba(24,26,52,0.8)', tabRadius: 22 },
} as const;

/** Токени, що відрізняються між шкірами: шрифти, радіуси, кромка скла й типографіка. Кольори спільні. */
const proType = { ...type, display: { ...type.title, fontFamily: fonts.bold }, title: { ...type.title, fontFamily: fonts.bold } };
export const tokens = {
  play: { fonts, radius, glassBorder, type },
  pro: {
    fonts: { ...fonts, black: fonts.bold },
    radius: { sm: 8, md: 12, lg: 16 },
    glassBorder: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' } as unknown as typeof glassBorder,
    type: proType as unknown as typeof type,
  },
};
export type Tokens = (typeof tokens)['play'];

/** Поточна шкіра без підписки (для стилів, що рахуються в момент звернення). */
export const currentSkin = () => skin;

/**
 * Стилі, що залежать від шкіри: фабрика викликається один раз на шкіру, результат кешується.
 * Доступ `styles.x` бере поточну шкіру, тож після перемикання (кореневий ремаунт) екрани підхоплюють нові значення.
 */
export function makeStyles<T extends object>(factory: (t: Tokens) => T): T {
  const cache: Partial<Record<Skin, T>> = {};
  const cur = () => (cache[skin] ??= factory(tokens[skin]));
  return new Proxy({} as T, {
    get: (_, k) => (cur() as Record<PropertyKey, unknown>)[k],
    has: (_, k) => k in cur(),
    ownKeys: () => Reflect.ownKeys(cur()),
    getOwnPropertyDescriptor: (_, k) => ({ value: (cur() as Record<PropertyKey, unknown>)[k], enumerable: true, configurable: true }),
  });
}

/** Спокійний тон: у «pro» знімаємо окличні знаки. Викликається під час рендеру (шкіра змінюється лише з ремонтом дерева). */
export const calm = (text: string) => (skin === 'pro' ? text.replace(/!$/, '').replace(/!/g, '.') : text);
