import type { Course } from '@/lib/types';
import { parseAge, recommend } from '../recommend';

const c = (id: string, category: string, age: string, extra: Partial<Course> = {}): Course =>
  ({ id, title: id, category, age, lessons: 5, freeLessons: 2, description: '', gradient: 'violet', icon: 'globe-outline', ...extra }) as Course;

const catalog = [
  c('web', 'Web', '11–17'),
  c('python', 'Код', '12–17'),
  c('scratch', 'Старт', '9–11'),
  c('minecraft', 'Ігри', '9–12'),
  c('design', 'Дизайн', '14–17'),
  c('ts', 'Код', '14–17', { soon: true }),
];

describe('parseAge', () => {
  it('розбирає діапазон з тире й дефісом', () => {
    expect(parseAge('11–17')).toEqual([11, 17]);
    expect(parseAge('9-12')).toEqual([9, 12]);
    expect(parseAge('дорослі')).toBeNull();
  });
});

describe('recommend', () => {
  it('інтерес «сайти» + вік 13–14 → Web першим', () => {
    expect(recommend({ age: '13-14', interests: ['sites'], experience: 'some' }, catalog)[0].course.id).toBe('web');
  });
  it('молодшим не пропонує курси, що не підходять за віком, навіть якщо тема збігається', () => {
    const ids = recommend({ age: '9-10', interests: ['design'], experience: 'new' }, catalog, 5).map((r) => r.course.id);
    expect(ids).not.toContain('design');
    expect(ids).not.toContain('web');
  });
  it('новачок отримує «Старт» вище за інші, досвідчений — нижче', () => {
    // 9–10: Scratch (9–11) підходить за віком повністю, тож «Старт» для новачка виходить першим
    expect(recommend({ age: '9-10', interests: [], experience: 'new' }, catalog)[0].course.id).toBe('scratch');
    // 11–12: Scratch покриває лише частину віку; досвідченому він іде нижче за Web
    const pro = recommend({ age: '11-12', interests: [], experience: 'pro' }, catalog, 5).map((r) => r.course.id);
    expect(pro.indexOf('scratch')).toBeGreaterThan(pro.indexOf('web'));
  });
  it('перший обраний інтерес важить більше за третій', () => {
    const a = recommend({ age: '13-14', interests: ['bots', 'sites'], experience: 'some' }, catalog)[0];
    expect(a.course.id).toBe('python');
    const b = recommend({ age: '13-14', interests: ['sites', 'bots'], experience: 'some' }, catalog)[0];
    expect(b.course.id).toBe('web');
  });
  it('курси «скоро» не пропонуються', () => {
    expect(recommend({ age: '15-17', interests: ['bots'], experience: 'pro' }, catalog, 10).map((r) => r.course.id)).not.toContain('ts');
  });
  it('без відповідей усе одно щось повертає (перші за вільними уроками), не падає', () => {
    expect(recommend({}, catalog)).toHaveLength(2);
    expect(recommend({}, [])).toEqual([]);
  });
  it('повертає причини для пояснення', () => {
    const r = recommend({ age: '13-14', interests: ['sites'], experience: 'some' }, catalog)[0];
    expect(r.reasons).toEqual(expect.arrayContaining(['age', 'interest']));
    expect(r.interest).toBe('sites');
  });
});

describe('захоплення', () => {
  it('без явних інтересів захоплення «малювання» підсуває Дизайн', () => {
    const r = recommend({ age: '15-17', hobbies: ['drawing'], experience: 'some' }, catalog);
    expect(r[0].course.id).toBe('design');
    expect(r[0].reasons).toContain('hobby');
    expect(r[0].hobby).toBe('drawing');
  });
  it('наука й головоломки ведуть до курсу з кодом (Python)', () => {
    const r = recommend({ age: '13-14', hobbies: ['science'], activities: ['puzzle'], experience: 'some' }, catalog);
    expect(r[0].course.id).toBe('python');
  });
  it('явний інтерес важить більше за захоплення', () => {
    const r = recommend({ age: '13-14', interests: ['sites'], hobbies: ['science', 'building'], activities: ['puzzle'], experience: 'some' }, catalog);
    expect(r[0].course.id).toBe('web');
  });
  it('захоплення не пробивають вікові межі', () => {
    const ids = recommend({ age: '9-10', hobbies: ['drawing'], activities: ['draw'], experience: 'new' }, catalog, 5).map((x) => x.course.id);
    expect(ids).not.toContain('design');
  });
  it('внесок захоплень обмежений: не більше +3 балів', () => {
    const all = recommend({ age: '15-17', hobbies: ['science', 'building', 'videogames'], activities: ['puzzle', 'compete', 'build'], experience: 'some' }, catalog, 10);
    const noHobby = recommend({ age: '15-17', experience: 'some' }, catalog, 10);
    for (const r of all) {
      const base = noHobby.find((x) => x.course.id === r.course.id)!;
      expect(r.score - base.score).toBeLessThanOrEqual(3);
    }
  });
});
