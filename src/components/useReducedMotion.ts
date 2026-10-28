import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** true, якщо в системі ввімкнено «зменшити рух»: безкінечні анімації тоді вимикаємо. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setReduced(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduced;
}
