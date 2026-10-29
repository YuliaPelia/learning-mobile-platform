import { lessonsText, plural } from '../plural';

describe('відмінювання', () => {
  it.each([
    [1, 'урок'], [2, 'уроки'], [4, 'уроки'], [5, 'уроків'], [11, 'уроків'], [12, 'уроків'], [14, 'уроків'],
    [21, 'урок'], [22, 'уроки'], [25, 'уроків'], [101, 'урок'], [111, 'уроків'], [0, 'уроків'],
  ])('%i → %s', (n, word) => {
    expect(plural(n, 'урок', 'уроки', 'уроків')).toBe(word);
  });
  it('lessonsText складає число й слово', () => {
    expect(lessonsText(3)).toBe('3 уроки');
    expect(lessonsText(1)).toBe('1 урок');
    expect(lessonsText(20)).toBe('20 уроків');
  });
});
