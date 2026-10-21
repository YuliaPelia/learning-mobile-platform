import Constants from 'expo-constants';
import { mockCourses, mockTeachers } from '@/data/mock';
import type { Course, Teacher } from './types';

// EXPO_PUBLIC_API_URL перекриває значення з app.json (extra.apiUrl).
const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? (Constants.expoConfig?.extra?.apiUrl as string);

// Мобільне API в itcodecraft-platform ще не реалізоване (там сесії на cookie),
// тому при помилці мережі повертаємо демо-дані.
async function get<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}/api/mobile${path}`);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export const getCourses = () => get<Course[]>('/courses', mockCourses);
export const getTeachers = () => get<Teacher[]>('/teachers', mockTeachers);
