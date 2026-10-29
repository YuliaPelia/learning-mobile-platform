import AsyncStorage from '@react-native-async-storage/async-storage';

type SkinModule = typeof import('@/theme/skin');
const load = (): SkinModule => {
  let m!: SkinModule;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    m = require('@/theme/skin');
  });
  return m;
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('makeStyles', () => {
  it('викликає фабрику один раз на шкіру та кешує результат', () => {
    const { makeStyles, setSkin } = load();
    const factory = jest.fn((t) => ({ a: { borderRadius: t.radius.md } }));
    const s = makeStyles(factory);
    void s.a;
    void s.a;
    expect(factory).toHaveBeenCalledTimes(1);
    setSkin('pro');
    void s.a;
    void s.a;
    expect(factory).toHaveBeenCalledTimes(2);
    setSkin('play');
    void s.a;
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('підхоплює зміну шкіри через setSkin', () => {
    const { makeStyles, setSkin, tokens } = load();
    const s = makeStyles((t) => ({ box: { borderRadius: t.radius.md } }));
    expect(s.box.borderRadius).toBe(tokens.play.radius.md);
    setSkin('pro');
    expect(s.box.borderRadius).toBe(12);
    expect(Object.keys(s)).toEqual(['box']);
    expect('box' in s).toBe(true);
  });

  it('setSkin зберігає вибір і сповіщає підписників через currentSkin', async () => {
    const { setSkin, currentSkin } = load();
    expect(currentSkin()).toBe('play');
    setSkin('pro');
    expect(currentSkin()).toBe('pro');
    await Promise.resolve();
    expect(await AsyncStorage.getItem('itc.skin.v1')).toBe('pro');
  });

  it('відновлює збережену шкіру при завантаженні', async () => {
    await AsyncStorage.setItem('itc.skin.v1', 'pro');
    const { currentSkin } = load();
    await new Promise((r) => setImmediate(r));
    expect(currentSkin()).toBe('pro');
  });
});

describe('calm', () => {
  it('у play залишає текст як є', () => {
    const { calm } = load();
    expect(calm('Вітаю! Молодець!')).toBe('Вітаю! Молодець!');
  });

  it('у pro знімає кінцевий «!» і замінює решту на крапку', () => {
    const { calm, setSkin } = load();
    setSkin('pro');
    expect(calm('Молодець!')).toBe('Молодець');
    expect(calm('Вітаю! Молодець!')).toBe('Вітаю. Молодець');
    expect(calm('Без знаків')).toBe('Без знаків');
  });
});
