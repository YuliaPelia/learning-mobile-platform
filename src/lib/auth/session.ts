import type { User } from '@/lib/types';
import { API_URL } from '@/lib/config';
import { readSession, writeSession, type StoredSession } from './storage';

/** Відповідь бекенду на вхід/реєстрацію/оновлення. */
export type TokenResponse = { user: User; accessToken: string; refreshToken: string; expiresIn: number };

let session: StoredSession | null = null;
let loaded: Promise<void> | null = null;
let refreshing: Promise<boolean> | null = null;
const listeners = new Set<(signedIn: boolean) => void>();

/** Запас часу, щоб не надіслати токен, який спливе дорогою. */
const SKEW_MS = 30_000;

function notify() {
  listeners.forEach((l) => l(session !== null));
}

export function onSessionChange(fn: (signedIn: boolean) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function loadSession() {
  loaded ??= readSession().then((s) => {
    session = s;
  });
  return loaded;
}

export async function setSession(t: Pick<TokenResponse, 'accessToken' | 'refreshToken' | 'expiresIn'> | null) {
  session = t && {
    accessToken: t.accessToken,
    refreshToken: t.refreshToken,
    accessExpiresAt: Date.now() + t.expiresIn * 1000,
  };
  await writeSession(session);
  notify();
}

/** Оновлює пару токенів. Паралельні виклики ділять один запит: refresh-токен одноразовий. */
function refresh(): Promise<boolean> {
  refreshing ??= (async () => {
    const current = session;
    if (!current) return false;
    try {
      const res = await fetch(`${API_URL}/api/mobile/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });
      if (res.ok) {
        await setSession((await res.json()) as TokenResponse);
        return true;
      }
      // 401: сесію відкликано або вона завершилась. Помилка мережі сесію не скидає.
      if (res.status === 401) await setSession(null);
      return false;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

/** Дійсний access-токен або null, якщо користувач не увійшов. */
export async function getAccessToken(forceRefresh = false): Promise<string | null> {
  await loadSession();
  if (!session) return null;
  if (forceRefresh || session.accessExpiresAt - SKEW_MS <= Date.now()) {
    if (!(await refresh()) && (forceRefresh || (session?.accessExpiresAt ?? 0) <= Date.now())) return null;
  }
  return session?.accessToken ?? null;
}

export function getRefreshToken() {
  return session?.refreshToken ?? null;
}
