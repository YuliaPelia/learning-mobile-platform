import * as SecureStore from 'expo-secure-store';

// Сховище може бути недоступним (веб, збій Keychain) — тоді працюємо без збереження сесії.
const KEY = 'itc.session';

export type StoredSession = { accessToken: string; accessExpiresAt: number; refreshToken: string };

export async function readSession(): Promise<StoredSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export async function writeSession(session: StoredSession | null): Promise<void> {
  try {
    if (session) await SecureStore.setItemAsync(KEY, JSON.stringify(session));
    else await SecureStore.deleteItemAsync(KEY);
  } catch {
    // без збереження користувач просто увійде знову після перезапуску
  }
}
