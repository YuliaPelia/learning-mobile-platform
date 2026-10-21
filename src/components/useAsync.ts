import { useEffect, useState, type DependencyList } from 'react';

/** Завантажує дані й оновлює їх, коли змінюється `deps` (за замовчуванням — один раз). */
export function useAsync<T>(load: () => Promise<T>, initial: T, deps: DependencyList = []): T {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    let alive = true;
    load().then((v) => alive && setValue(v));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}
