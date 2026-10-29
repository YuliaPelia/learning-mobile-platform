import * as fs from 'fs';
import * as path from 'path';
import { FONT_SIZES } from '../theme';

// Сторож типографіки: розмір тексту береться зі шкали (src/theme `type`), а не «на око».
function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' || e.name === 'generated' ? [] : files(p);
    return /\.(tsx?|ts)$/.test(e.name) ? [p] : [];
  });
}

describe('типографічна шкала', () => {
  it('розміри fontSize < 36 належать шкалі', () => {
    const bad: string[] = [];
    for (const f of files(path.join(__dirname, '..'))) {
      if (f.endsWith(path.join('theme', 'index.ts'))) continue;
      const src = fs.readFileSync(f, 'utf-8');
      for (const m of src.matchAll(/fontSize: (\d+)/g)) {
        const n = Number(m[1]);
        if (n < 36 && !FONT_SIZES.includes(n)) bad.push(`${path.relative(process.cwd(), f)}: ${n}`);
      }
    }
    expect(bad).toEqual([]);
  });
  it('шкала зростає й має щонайменше 6 щаблів', () => {
    expect([...FONT_SIZES].sort((a, b) => a - b)).toEqual([...FONT_SIZES]);
    expect(FONT_SIZES.length).toBeGreaterThanOrEqual(6);
  });
});
