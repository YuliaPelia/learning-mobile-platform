import type { ComponentProps } from 'react';
import type { ImageSourcePropType } from 'react-native';
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
  image?: ImageSourcePropType;
  /** Курс ще не відкрито (на сайті позначений «Скоро»). */
  soon?: boolean;
};

export type Role = 'parent' | 'student';

export type User = {
  id: string;
  name: string;
  role: Role;
  email: string | null;
  login: string;
  birthYear: number | null;
  /** Профіль учня створили батьки — видаляти його можуть лише вони. */
  hasParent?: boolean;
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

/** Статистика навчання дитини — однакова для кабінету дитини й батьків. */
export type StudentStats = {
  xp: number;
  level: { level: number; title: string; progress: number; toNext: number };
  streak: number;
  /** Останні 7 днів, від найстаршого до сьогодні. */
  week: { day: string; active: boolean }[];
  lessonsCompleted: number;
  lessonsThisWeek: number;
  homework: { total: number; done: number };
  /** null — бейджі не входять у тариф. */
  badges: { id: string; title: string; earned: boolean }[] | null;
  currentCourse: { slug: string; title: string } | null;
};

export type StudentProgress = { id: string; name: string; stats: StudentStats };
