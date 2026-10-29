/** Відмінювання за числом: 1 урок, 2 уроки, 5 уроків (11–14 — завжди «багато»). */
export function plural(n: number, one: string, few: string, many: string) {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return one;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
  return many;
}

export const lessonsText = (n: number) => `${n} ${plural(n, 'урок', 'уроки', 'уроків')}`;
