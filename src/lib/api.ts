import { mockCourses, mockTeachers } from '@/data/mock';
import { apiRequest } from '@/lib/http';
import type { Course, CourseDetail, IconName, Lesson, Teacher, GradientName } from './types';

type ApiCourse = {
  slug: string;
  title: string;
  description: string | null;
  category: 'start' | 'web' | 'design' | 'code' | 'mobile' | 'games';
  ageFrom: number;
  ageTo: number;
  lessonsCount?: number;
  freeLessons: number;
};

const CATEGORY: Record<ApiCourse['category'], { label: string; gradient: GradientName; icon: IconName }> = {
  start: { label: 'Старт', gradient: 'violet', icon: 'rocket-outline' },
  web: { label: 'Web', gradient: 'violet', icon: 'globe-outline' },
  design: { label: 'Дизайн', gradient: 'ocean', icon: 'color-palette-outline' },
  code: { label: 'Код', gradient: 'pink', icon: 'code-slash-outline' },
  mobile: { label: 'Mobile', gradient: 'ocean', icon: 'phone-portrait-outline' },
  games: { label: 'Ігри', gradient: 'pink', icon: 'game-controller-outline' },
};

function toCourse(c: ApiCourse): Course {
  const cat = CATEGORY[c.category];
  return {
    id: c.slug,
    title: c.title,
    category: cat.label,
    age: `${c.ageFrom}–${c.ageTo}`,
    lessons: c.lessonsCount ?? 0,
    freeLessons: c.freeLessons,
    description: c.description ?? '',
    gradient: cat.gradient,
    icon: cat.icon,
  };
}

// Якщо сервер недоступний, показуємо демо-курси, щоб додаток не був порожнім.
export async function getCourses(): Promise<Course[]> {
  try {
    const { courses } = await apiRequest<{ courses: ApiCourse[] }>('/courses');
    return courses.map(toCourse);
  } catch {
    return mockCourses;
  }
}

/** Курс і його теми. Якщо користувач увійшов, уроки приходять із його станом доступу. */
export async function getCourseDetail(slug: string): Promise<CourseDetail | null> {
  try {
    const res = await apiRequest<{ course: ApiCourse & { status: string }; lessons: Lesson[] }>(`/courses/${encodeURIComponent(slug)}`, {
      auth: 'optional',
    });
    return {
      course: { ...toCourse(res.course), lessons: res.lessons.length },
      lessons: res.lessons,
      comingSoon: res.course.status !== 'published',
    };
  } catch {
    return null;
  }
}

// Публічного ендпоінта викладачів ще немає — лишаємо демо-дані.
export const getTeachers = async (): Promise<Teacher[]> => mockTeachers;
