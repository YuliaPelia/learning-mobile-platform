import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { gradients } from '@/theme';

export type GradientName = keyof typeof gradients;
export type IconName = ComponentProps<typeof Ionicons>['name'];

export type Course = {
  id: string;
  title: string;
  category: string;
  age: string;
  lessons: number;
  freeLessons: number;
  description: string;
  gradient: GradientName;
  icon: IconName;
};

export type Teacher = {
  id: string;
  name: string;
  role: string;
  gradient: GradientName;
};

export type Role = 'parent' | 'student';

export type User = {
  id: string;
  name: string;
  role: Role;
  email: string | null;
  login: string;
  birthYear: number | null;
};

/** Чому урок відкритий або закритий (access з бекенду). */
export type LessonAccess =
  | 'ok'
  | 'coming_soon'
  | 'locked_sequence'
  | 'needs_subscription'
  | 'login_required'
  | 'student_only';

export type Lesson = {
  order: number;
  title: string;
  summary: string;
  type: 'video' | 'text' | 'quiz';
  xp: number;
  free: boolean;
  done: boolean;
  access: LessonAccess;
};

export type CourseDetail = { course: Course; lessons: Lesson[]; comingSoon: boolean };
