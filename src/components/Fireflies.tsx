import { useEffect, useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useReducedMotion } from '@/components/useReducedMotion';
import { useSkin } from '@/theme/skin';

const PX = 4;
const snap = (n: number) => Math.round(n / PX) * PX;
/** Ступінчастий час, як у піксельній графіці: рух «стрибками» по сітці. */
const stepped = (t: number) => Math.min(1, Math.ceil(t * 12) / 12);

const COLORS = ['#FDE047', '#BEF264', '#FEF08A', '#A7F3D0'];
const COUNT = 14;

type Fly = { left: number; top: number; dx: number; dy: number; duration: number; delay: number; color: string; big: boolean };

function makeFlies(): Fly[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    left: Math.random(),
    top: 0.08 + Math.random() * 0.84,
    dx: snap((Math.random() - 0.5) * 80),
    dy: snap((Math.random() - 0.5) * 80),
    duration: 4500 + Math.random() * 4000,
    delay: Math.random() * 3000,
    color: COLORS[i % COLORS.length],
    big: Math.random() < 0.3,
  }));
}

function Firefly({ f, w, h, still }: { f: Fly; w: number; h: number; still: boolean }) {
  const [p] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (still) {
      p.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(f.delay),
        Animated.timing(p, { toValue: 1, duration: f.duration, easing: stepped, useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: f.duration, easing: stepped, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [p, f, still]);

  const size = f.big ? PX * 2 : PX;
  // Мерехтіння: гасне на краях руху й «дихає» посередині. Максимум 0,95, щоб не перебивати текст
  const opacity = still ? 0.45 : p.interpolate({ inputRange: [0, 0.15, 0.35, 0.5, 0.7, 0.85, 1], outputRange: [0, 0.95, 0.35, 0.95, 0.4, 0.95, 0] });
  const move = {
    transform: [
      { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, f.dx] }) },
      { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, f.dy] }) },
    ],
  };

  return (
    <Animated.View style={[styles.fly, { left: snap(f.left * w), top: snap(f.top * h), opacity }, move]}>
      {/* Піксельний хрестик: тьмяні промені навколо яскравого ядра */}
      <View style={[styles.arm, { width: size, height: size, backgroundColor: '#FEF9C3', top: -size }]} />
      <View style={[styles.arm, { width: size, height: size, backgroundColor: '#FEF9C3', top: size }]} />
      <View style={[styles.arm, { width: size, height: size, backgroundColor: '#FEF9C3', left: -size }]} />
      <View style={[styles.arm, { width: size, height: size, backgroundColor: '#FEF9C3', left: size }]} />
      <View style={{ width: size, height: size, backgroundColor: f.color }} />
    </Animated.View>
  );
}

/**
 * Піксельні світлячки на тлі: квадратики повільно дрейфують і мерехтять. Лише оформлення.
 * Не показується у «спокійній» шкірі; при «зменшити рух» точки стоять на місці.
 */
export function Fireflies() {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const pro = useSkin() === 'pro';
  const [flies] = useState(makeFlies);
  if (pro) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {flies.map((f, i) => (
        <Firefly key={i} f={f} w={width} h={height} still={reduced} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fly: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  arm: { position: 'absolute', opacity: 0.6 },
});
