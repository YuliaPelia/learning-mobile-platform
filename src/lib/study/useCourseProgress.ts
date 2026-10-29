import { useAsync } from '@/components/useAsync';
import { getCourseDetail, getStats } from '@/lib/api';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Lesson, StudentStats } from '@/lib/types';

export type CourseProgress = {
  stats: StudentStats | null;
  courseSlug: string | null;
  courseTitle: string | null;
  lessonsLeft: number;
  lessonsTotal: number;
  /** найближчі уроки, які можна пройти зараз */
  next: Lesson[];
};

/** Поточний курс учня: скільки уроків залишилось і що проходити далі. Для гостя й батьків — порожньо. */
export function useCourseProgress(reload = 0): CourseProgress {
  const { user } = useAuth();
  const stats = useAsync(() => (user?.role === 'student' ? getStats() : Promise.resolve(null)), null, [user?.id, reload]);
  const s = stats?.[0]?.stats ?? null;
  const slug = s?.currentCourse?.slug ?? null;
  const detail = useAsync(() => (slug ? getCourseDetail(slug) : Promise.resolve(null)), null, [slug, reload]);
  const left = detail?.lessons.filter((l) => !l.done) ?? [];
  return {
    stats: s,
    courseSlug: slug,
    courseTitle: s?.currentCourse?.title ?? null,
    lessonsLeft: left.length,
    lessonsTotal: detail?.lessons.length ?? 0,
    next: left.filter((l) => l.access === 'ok').slice(0, 3),
  };
}
