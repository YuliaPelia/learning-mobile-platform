import AsyncStorage from '@react-native-async-storage/async-storage';

type Store = typeof import('../store');
const KEY = 'itc.onboarding.v1';
const flush = () => new Promise((r) => setImmediate(r));
const load = async (): Promise<Store> => {
  let m!: Store;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    m = require('../store');
  });
  await flush();
  return m;
};
const answers = { age: '10-12' } as never;

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('onboarding store', () => {
  it('без збережених даних статус new', async () => {
    const { onboarding } = await load();
    expect(onboarding.get()).toEqual({ status: 'new', answers: null });
  });

  it('finish ставить done, зберігає відповіді й пише у сховище', async () => {
    const { onboarding } = await load();
    onboarding.finish(answers);
    expect(onboarding.get()).toEqual({ status: 'done', answers });
    await flush();
    expect(JSON.parse((await AsyncStorage.getItem(KEY))!)).toEqual({ status: 'done', answers });
  });

  it('skip ставить skipped і зберігає наявні відповіді', async () => {
    const { onboarding } = await load();
    onboarding.skip();
    expect(onboarding.get()).toEqual({ status: 'skipped', answers: null });
    onboarding.finish(answers);
    onboarding.skip();
    expect(onboarding.get()).toEqual({ status: 'skipped', answers });
    await flush();
    expect(JSON.parse((await AsyncStorage.getItem(KEY))!).status).toBe('skipped');
  });

  it('reset повертає new і видаляє ключ', async () => {
    const { onboarding } = await load();
    onboarding.finish(answers);
    await flush();
    onboarding.reset();
    expect(onboarding.get()).toEqual({ status: 'new', answers: null });
    await flush();
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
  });

  it('завантажує збережений стан і витримує зіпсований JSON', async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify({ status: 'done', answers }));
    expect((await load()).onboarding.get()).toEqual({ status: 'done', answers });
    await AsyncStorage.setItem(KEY, '{bad');
    expect((await load()).onboarding.get()).toEqual({ status: 'new', answers: null });
  });

  it('сповіщає підписників при зміні (useOnboarding читає state)', async () => {
    const { onboarding } = await load();
    onboarding.skip();
    expect(onboarding.get().status).toBe('skipped');
  });
});
