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

/**
 * Результат вікового екрана перед входом через Google/Apple. Зберігається, щоб після відмови
 * не можна було просто ввести інший рік (нейтральний віковий екран, Google Play Families).
 */
export type AgeGate = 'ok' | 'young';
const AGE_KEY = 'itc.ageGate';

export async function readAgeGate(): Promise<AgeGate | null> {
  try {
    const v = await SecureStore.getItemAsync(AGE_KEY);
    return v === 'ok' || v === 'young' ? v : null;
  } catch {
    return null;
  }
}

export async function writeAgeGate(v: AgeGate): Promise<void> {
  try {
    await SecureStore.setItemAsync(AGE_KEY, v);
  } catch {
    // не зберіглося — екран просто покажеться ще раз
  }
}
