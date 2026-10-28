import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCourseDetail, getCourses, getStats } from '../api';
import { setCacheOwner } from '../cache';
import { ApiError, apiRequest } from '../http';

jest.mock('@/lib/auth/session', () => ({ getAccessToken: jest.fn() }));
jest.mock('@/lib/config', () => ({ API_URL: 'http://x' }));
jest.mock('../http', () => {
  class ApiError extends Error {
    status: number;
    code: string;
    constructor(status: number, code: string, message: string) {
      super(message);
      this.status = status;
      this.code = code;
    }
  }
  return { ApiError, apiRequest: jest.fn() };
});

const req = apiRequest as jest.Mock;
const flush = () => new Promise((r) => setImmediate(r));
const apiCourse = (o = {}) => ({
  slug: 'web', title: 'Web', description: null, category: 'web', ageFrom: 10, ageTo: 14, freeLessons: 2, status: 'published', ...o,
});
const detail = { course: apiCourse({ slug: 'py', title: 'Py' }), lessons: [{ order: 1 }, { order: 2 }] };

beforeEach(async () => {
  await AsyncStorage.clear();
  req.mockReset();
  setCacheOwner(null);
});

describe('getCourses', () => {
  it('мапить ApiCourse у Course', async () => {
    req.mockResolvedValue({ courses: [apiCourse({ lessonsCount: 7 })] });
    const [c] = await getCourses();
    expect(c).toMatchObject({ id: 'web', title: 'Web', category: 'Web', age: '10–14', lessons: 7, freeLessons: 2, description: '', gradient: 'violet', soon: false });
  });
  it('lessonsCount відсутній -> 0; не published -> soon', async () => {
    req.mockResolvedValue({ courses: [apiCourse({ status: 'draft' })] });
    const [c] = await getCourses();
    expect(c.lessons).toBe(0);
    expect(c.soon).toBe(true);
  });
  it('курси "скоро" йдуть після відкритих', async () => {
    req.mockResolvedValue({ courses: [apiCourse({ slug: 'a', status: 'soon' }), apiCourse({ slug: 'b' })] });
    expect((await getCourses()).map((c) => c.id)).toEqual(['b', 'a']);
  });
  it('при помилці віддає кеш, а без кешу -- демо-курси', async () => {
    req.mockResolvedValueOnce({ courses: [apiCourse({ slug: 'cached' })] });
    await getCourses();
    await flush();
    req.mockRejectedValue(new Error('boom'));
    expect((await getCourses())[0].id).toBe('cached');
    await AsyncStorage.clear();
    expect((await getCourses())[0].id).toBe('web'); // mockCourses[0]
  });
});

describe('getCourseDetail', () => {
  it('мапить і рахує уроки з lessons', async () => {
    req.mockResolvedValue(detail);
    const d = await getCourseDetail('py');
    expect(d!.course.lessons).toBe(2);
    expect(d!.comingSoon).toBe(false);
  });
  it('кеш лише при ApiError network', async () => {
    req.mockResolvedValueOnce(detail);
    await getCourseDetail('py');
    await flush();
    req.mockRejectedValueOnce(new ApiError(0, 'network', 'n'));
    expect((await getCourseDetail('py'))!.course.id).toBe('py');
  });
  it.each([
    ['unauthorized', 401],
    ['unknown', 500],
  ])('код %s не береться з кешу', async (code, status) => {
    req.mockResolvedValueOnce(detail);
    await getCourseDetail('py');
    await flush();
    req.mockRejectedValueOnce(new ApiError(status, code, 'e'));
    expect(await getCourseDetail('py')).toBeNull();
  });
  it('звичайна Error (не ApiError) не береться з кешу', async () => {
    req.mockResolvedValueOnce(detail);
    await getCourseDetail('py');
    await flush();
    req.mockRejectedValueOnce(new Error('x'));
    expect(await getCourseDetail('py')).toBeNull();
  });
  it('network без кешу -> null', async () => {
    req.mockRejectedValue(new ApiError(0, 'network', 'n'));
    expect(await getCourseDetail('py')).toBeNull();
  });
  it('ключ кешу містить власника: інший акаунт не бачить кеш', async () => {
    setCacheOwner('u1');
    req.mockResolvedValueOnce(detail);
    await getCourseDetail('py');
    await flush();
    expect(await AsyncStorage.getItem('itc.cache.course.py.u1')).not.toBeNull();
    setCacheOwner('u2');
    req.mockRejectedValue(new ApiError(0, 'network', 'n'));
    expect(await getCourseDetail('py')).toBeNull();
    setCacheOwner('u1');
    expect(await getCourseDetail('py')).not.toBeNull();
  });
});

describe('getStats', () => {
  const students = [{ id: '1', name: 'Kid', stats: {} }];
  it('не кешує імена дітей', async () => {
    req.mockResolvedValue({ students });
    expect(await getStats()).toEqual(students);
    await flush();
    expect((await AsyncStorage.getAllKeys()).filter((k) => k.includes('stats'))).toEqual([]);
  });
  it('помилка доступу -> null; network без кешу -> null', async () => {
    req.mockRejectedValueOnce(new ApiError(401, 'unauthorized', 'e'));
    expect(await getStats()).toBeNull();
    req.mockRejectedValueOnce(new ApiError(0, 'network', 'n'));
    expect(await getStats()).toBeNull();
  });
});
