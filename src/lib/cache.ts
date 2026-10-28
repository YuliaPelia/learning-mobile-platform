import AsyncStorage from '@react-native-async-storage/async-storage';

// Останні успішні відповіді сервера — щоб курси, уроки й прогрес відкривались без інтернету.
const PREFIX = 'itc.cache.';

// Кеш, що залежить від користувача (стан уроків), зберігається окремо для кожного акаунта.
let owner = 'guest';
export const setCacheOwner = (id: string | null) => {
  owner = id ?? 'guest';
};
/** Ключ для даних конкретного користувача. */
export const ownedKey = (key: string) => `${key}.${owner}`;

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function writeCache(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // кеш — лише бонус
  }
}

/** Повне очищення — при виході з акаунта й видаленні. */
export async function clearCache(): Promise<void> {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
    await AsyncStorage.multiRemove(keys);
  } catch {
    // нічого страшного
  }
}
