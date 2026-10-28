import { courseImages } from '@/data/courseImages';
import { mockCourses } from '@/data/mock';
import { ownedKey, readCache, writeCache } from '@/lib/cache';
import { ApiError, apiRequest } from '@/lib/http';
import type { Course, CourseDetail, IconName, Lesson, GradientName, StudentProgress } from './types';

type ApiCourse = {
  slug: string;
  title: string;
  description: string | null;
  category: 'start' | 'web' | 'design' | 'code' | 'mobile' | 'games';
  ageFrom: number;
  ageTo: number;
  lessonsCount?: number;
  freeLessons: number;
  status: string;
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
    image: courseImages[c.slug],
    soon: c.status !== 'published',
  };
}

const sortCourses = (courses: ApiCourse[]) => courses.map(toCourse).sort((a, b) => Number(!!a.soon) - Number(!!b.soon));

// Якщо сервер недоступний, показуємо демо-курси, щоб додаток не був порожнім.
export async function getCourses(): Promise<Course[]> {
  try {
    const { courses } = await apiRequest<{ courses: ApiCourse[] }>('/courses');
    // Відкриті курси першими, «скоро» — після них (порядок усередині як на сайті)
    writeCache('courses', courses);
    return sortCourses(courses);
  } catch {
    const cached = await readCache<ApiCourse[]>('courses');
    return cached ? sortCourses(cached) : mockCourses;
  }
}

const toDetail = (res: { course: ApiCourse; lessons: Lesson[] }): CourseDetail => ({
  course: { ...toCourse(res.course), lessons: res.lessons.length },
  lessons: res.lessons,
  comingSoon: res.course.status !== 'published',
});

/** Курс і його теми. Якщо користувач увійшов, уроки приходять із його станом доступу. */
export async function getCourseDetail(slug: string): Promise<CourseDetail | null> {
  // Ключ береться до запиту: якщо під час очікування користувач увійде чи вийде, відповідь не потрапить у чужий кеш
  const cacheKey = ownedKey(`course.${slug}`);
  try {
    const res = await apiRequest<{ course: ApiCourse; lessons: Lesson[] }>(`/courses/${encodeURIComponent(slug)}`, {
      auth: 'optional',
    });
    writeCache(cacheKey, res);
    return toDetail(res);
  } catch (e) {
    if (!(e instanceof ApiError && e.code === 'network')) return null;
    const cached = await readCache<{ course: ApiCourse; lessons: Lesson[] }>(cacheKey);
    return cached ? toDetail(cached) : null;
  }
}

/** Статистика (без кешу: у ній імена дітей): дитина отримує себе, батьки — кожну свою дитину. null — гість або немає звʼязку. */
export async function getStats(): Promise<StudentProgress[] | null> {
  try {
    const { students } = await apiRequest<{ students: StudentProgress[] }>('/stats', { auth: 'required' });
    return students;
  } catch {
    // Статистика містить імена дітей — на пристрої її не кешуємо
    return null;
  }
}

/** Батьки видаляють профіль своєї дитини (прогрес і домашки — назавжди). */
export async function deleteChild(id: string): Promise<void> {
  await apiRequest(`/children/${encodeURIComponent(id)}/delete`, { method: 'POST', body: { confirm: true }, auth: 'required' });
}

export type IapVerifyInput = { childId: string; productId: string; platform: 'apple' | 'google'; token: string; transactionId: string };

export type IapGranted = { id: string; plan: 'basic' | 'standard' | 'premium'; slot: number | null; status: string; endsAt: string | null; needsCourse: boolean };

/** Передає квитанцію покупки серверу: він перевіряє її в Apple/Google і створює підписку дитини. */
export async function verifyIapPurchase(input: IapVerifyInput): Promise<IapGranted> {
  const { subscription } = await apiRequest<{ subscription: IapGranted }>('/billing/iap/verify', { method: 'POST', body: input, auth: 'required' });
  return subscription;
}

export type MobileSubscription = {
  id: string;
  childId: string | null;
  plan: 'basic' | 'standard' | 'premium';
  provider: 'wayforpay' | 'apple' | 'google';
  slot: number | null;
  status: 'active' | 'past_due' | 'canceled';
  endsAt: string | null;
  courseSlug: string | null;
  /** Тариф «1 курс на вибір», курс ще не обрано. */
  needsCourse: boolean;
};

/** Підписки батьків (з сайту й зі магазинів). Порожньо, якщо немає звʼязку. */
export async function getSubscriptions(): Promise<MobileSubscription[]> {
  try {
    const { subscriptions } = await apiRequest<{ subscriptions: MobileSubscription[] }>('/subscriptions', { auth: 'required' });
    return subscriptions;
  } catch {
    return [];
  }
}

/** Обирає курс для підписки «1 курс на вибір». Робиться один раз; помилку сервера (напр. курс лише для Преміуму) кидає далі. */
export async function chooseSubscriptionCourse(subscriptionId: string, courseSlug: string): Promise<void> {
  await apiRequest(`/subscriptions/${encodeURIComponent(subscriptionId)}/course`, { method: 'POST', body: { courseSlug }, auth: 'required' });
}
