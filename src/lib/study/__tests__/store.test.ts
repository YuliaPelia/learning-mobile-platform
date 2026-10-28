import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultSettings, setStudyOwner, study } from '../store';

const DAY = 86_400_000;
const NOW = 1_800_000_000_000;
const key = (o: string) => `itc.study.v2.${o}`;
const flush = () => new Promise((r) => setImmediate(r));
const mistake = () => study.get().mistakes.find((x) => x.questionId === 'q1');

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.spyOn(Date, 'now').mockReturnValue(NOW);
  await setStudyOwner(null);
});
afterEach(() => jest.restoreAllMocks());

describe('study.answer (коробки повторення)', () => {
  it('неправильна відповідь додає питання в коробку 0 на завтра', () => {
    study.answer('quiz', 'q1', 'T', false);
    expect(mistake()).toEqual({ quizId: 'quiz', questionId: 'q1', box: 0, due: NOW + DAY });
  });
  it('правильні відповіді рухають коробками 3 -> 7 -> 14 днів', () => {
    study.answer('quiz', 'q1', 'T', false);
    study.answer('quiz', 'q1', 'T', true);
    expect(mistake()).toMatchObject({ box: 1, due: NOW + 3 * DAY });
    study.answer('quiz', 'q1', 'T', true);
    expect(mistake()).toMatchObject({ box: 2, due: NOW + 7 * DAY });
    study.answer('quiz', 'q1', 'T', true);
    expect(mistake()).toMatchObject({ box: 3, due: NOW + 14 * DAY });
  });
  it('правильна відповідь після останньої коробки прибирає питання', () => {
    study.answer('quiz', 'q1', 'T', false);
    for (let i = 0; i < 3; i++) study.answer('quiz', 'q1', 'T', true);
    study.answer('quiz', 'q1', 'T', true);
    expect(mistake()).toBeUndefined();
  });
  it('помилка скидає коробку на 0', () => {
    study.answer('quiz', 'q1', 'T', false);
    study.answer('quiz', 'q1', 'T', true);
    study.answer('quiz', 'q1', 'T', false);
    expect(mistake()).toMatchObject({ box: 0, due: NOW + DAY });
    expect(study.get().mistakes).toHaveLength(1);
  });
  it('правильна відповідь на питання без помилки нічого не додає', () => {
    study.answer('quiz', 'q1', 'T', true);
    expect(study.get().mistakes).toEqual([]);
  });
  it('однакові questionId з різних квізів не змішуються', () => {
    study.answer('a', 'q1', undefined, false);
    study.answer('b', 'q1', undefined, false);
    study.answer('a', 'q1', undefined, true);
    expect(study.get().mistakes.find((x) => x.quizId === 'b')!.box).toBe(0);
    expect(study.get().mistakes.find((x) => x.quizId === 'a')!.box).toBe(1);
  });
  it('веде статистику тем', () => {
    study.answer('quiz', 'q1', 'T', false);
    study.answer('quiz', 'q2', 'T', true);
    expect(study.get().topics.T).toEqual({ correct: 1, total: 2 });
  });
});

describe('власники стору', () => {
  it('зберігає під ключем власника', async () => {
    await setStudyOwner('u1');
    study.addTask('A');
    await flush();
    expect(JSON.parse((await AsyncStorage.getItem(key('u1')))!).tasks[0].title).toBe('A');
    expect(await AsyncStorage.getItem(key('guest'))).toBeNull();
  });
  it('дані двох власників не змішуються', async () => {
    await setStudyOwner('u1');
    study.addTask('one');
    await flush();
    await setStudyOwner('u2');
    expect(study.get().tasks).toEqual([]);
    study.addTask('two');
    await flush();
    await setStudyOwner('u1');
    await flush();
    expect(study.get().tasks.map((t) => t.title)).toEqual(['one']);
    await setStudyOwner('u2');
    expect(study.get().tasks.map((t) => t.title)).toEqual(['two']);
  });
  it('перемикання власника не перетирає збережене', async () => {
    await setStudyOwner('u1');
    study.addTask('keep');
    await flush();
    const before = await AsyncStorage.getItem(key('u1'));
    await setStudyOwner('u2');
    await setStudyOwner(null);
    await flush();
    expect(await AsyncStorage.getItem(key('u1'))).toBe(before);
  });
  it('швидке перемикання: збереження після зміни йде до поточного власника', async () => {
    await setStudyOwner('u1');
    study.addTask('x');
    await flush();
    const p = setStudyOwner('u2'); // читання ще триває
    study.addTask('y');
    await p;
    await flush();
    expect(JSON.parse((await AsyncStorage.getItem(key('u2')))!).tasks.map((t: { title: string }) => t.title)).toEqual(['y']);
    expect(JSON.parse((await AsyncStorage.getItem(key('u1')))!).tasks.map((t: { title: string }) => t.title)).toEqual(['x']);
  });
  it('wipe видаляє лише вказаного власника', async () => {
    await setStudyOwner('u1');
    study.addTask('a');
    await flush();
    await setStudyOwner('u2');
    study.addTask('b');
    await flush();
    study.wipe('u1');
    await flush();
    expect(await AsyncStorage.getItem(key('u1'))).toBeNull();
    expect(await AsyncStorage.getItem(key('u2'))).not.toBeNull();
    expect(study.get().tasks).toHaveLength(1);
  });
  it('wipe поточного власника скидає стан', async () => {
    await setStudyOwner('u1');
    study.addTask('a');
    await flush();
    study.wipe('u1');
    await flush();
    expect(study.get().tasks).toEqual([]);
    expect(await AsyncStorage.getItem(key('u1'))).toBeNull();
  });
  it('старий формат без нових полів доповнюється значеннями за замовчуванням', async () => {
    await AsyncStorage.setItem(key('old'), JSON.stringify({ tasks: [{ id: '1', title: 't', done: false, createdAt: 1 }], settings: { focusMin: 30 } }));
    await setStudyOwner('old');
    const s = study.get();
    expect(s.tasks).toHaveLength(1);
    expect(s.mistakes).toEqual([]);
    expect(s.topics).toEqual({});
    expect(s.childGoals).toEqual({});
    expect(s.settings).toEqual({ ...defaultSettings, focusMin: 30 });
  });
  it('пошкоджений JSON -> чистий стан', async () => {
    await AsyncStorage.setItem(key('bad'), '{oops');
    await setStudyOwner('bad');
    expect(study.get().tasks).toEqual([]);
  });
  it('прибирає застарілий ключ v1', async () => {
    await AsyncStorage.setItem('itc.study.v1', '{}');
    await setStudyOwner('u1');
    await flush();
    expect(await AsyncStorage.getItem('itc.study.v1')).toBeNull();
  });
});

describe('known bugs', () => {
  // store.ts:38-60 -- якщо користувач змінив стан, поки читався диск, commit() записує empty()+зміну
  // поверх збережених даних власника (dirty лише блокує завантаження, але не злиття).
  it('зміна під час завантаження не стирає раніше збережене', async () => {
    await AsyncStorage.setItem(key('u9'), JSON.stringify({ tasks: [{ id: '1', title: 'old', done: false, createdAt: 1 }] }));
    const p = setStudyOwner('u9');
    study.addTask('new');
    await p;
    await flush();
    expect(JSON.parse((await AsyncStorage.getItem(key('u9')))!).tasks).toHaveLength(2);
  });
});

describe('інше', () => {
  it('addSession ігнорує < 1 хв', () => {
    study.addSession(0);
    expect(study.get().sessions).toEqual([]);
    study.addSession(5);
    expect(study.get().sessions).toHaveLength(1);
  });
  it('toggleTask ставить і знімає doneAt', () => {
    study.addTask('t');
    const id = study.get().tasks[0].id;
    study.toggleTask(id);
    expect(study.get().tasks[0].doneAt).toBe(NOW);
    study.toggleTask(id);
    expect(study.get().tasks[0].doneAt).toBeUndefined();
  });
});
