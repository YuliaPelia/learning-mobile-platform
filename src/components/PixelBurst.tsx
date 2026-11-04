import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { makeStyles } from '@/theme/skin';

/** Піксельна сітка: усі зсуви й розміри кратні цьому числу, щоб рух виглядав «піксельним». */
const PX = 4;
const snap = (n: number) => Math.round(n / PX) * PX;
/** Ступінчастий час: 14 «кадрів» на всю анімацію, як у піксельній графіці. */
const stepped = (t: number) => Math.min(1, Math.ceil(t * 14) / 14);

export type BurstKind = 'pickup' | 'sparkle' | 'finale';

const PALETTE: Record<BurstKind, string[]> = {
  pickup: ['#4ADE80', '#FFFFFF', '#FDE047', '#A7F3D0'],
  sparkle: ['#FFFFFF', '#E9E5FF', '#C4B5FD'],
  finale: ['#4ADE80', '#FDE047', '#FFFFFF', '#F9A8D4', '#93C5FD', '#C4B5FD'],
};
const COUNT: Record<BurstKind, number> = { pickup: 22, sparkle: 10, finale: 44 };
const SPREAD: Record<BurstKind, number> = { pickup: 64, sparkle: 36, finale: 104 };
const DURATION: Record<BurstKind, number> = { pickup: 900, sparkle: 700, finale: 1500 };

type Particle = { dx: number; dy: number; fall: number; size: number; color: string };

function makeParticles(kind: BurstKind): Particle[] {
  const n = COUNT[kind];
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    const dist = SPREAD[kind] * (0.45 + Math.random() * 0.55);
    return {
      dx: snap(Math.cos(angle) * dist),
      dy: snap(Math.sin(angle) * dist - (kind === 'sparkle' ? 0 : 12)),
      // «Гравітація»: іскри за мить падають вниз, у sparkle — майже ні
      fall: snap(kind === 'sparkle' ? 4 : 28 + Math.random() * 20),
      size: Math.random() < 0.35 ? PX * 2 : PX,
      color: PALETTE[kind][i % PALETTE[kind].length],
    };
  });
}

type Props = {
  /** Центр ефекту в координатах батьківського контейнера. */
  x: number;
  y: number;
  kind: BurstKind;
  /** Підпис, що піднімається вгору, наприклад «+20 XP». */
  label?: string;
  delay?: number;
  onDone?: () => void;
};

/**
 * Одноразовий піксельний вибух із квадратиків (без картинок): частинки розлітаються, падають і гаснуть.
 * Рух ступінчастий (14 кадрів), щоб відчувалась піксельна анімація. Працює на нативному потоці.
 */
export function PixelBurst({ x, y, kind, label, delay = 0, onDone }: Props) {
  const [particles] = useState(() => makeParticles(kind));
  const [p] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const anim = Animated.timing(p, {
      toValue: 1,
      delay,
      duration: DURATION[kind],
      easing: stepped,
      useNativeDriver: true,
    });
    anim.start(({ finished }) => {
      if (finished) onDone?.();
    });
    return () => anim.stop();
    // Ефект одноразовий: параметри фіксуються при появі компонента
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opacity = p.interpolate({ inputRange: [0, 0.05, 0.65, 1], outputRange: [0, 1, 1, 0] });

  return (
    <View pointerEvents="none" style={[styles.root, { left: x, top: y }]}>
      {particles.map((q, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              width: q.size,
              height: q.size,
              backgroundColor: q.color,
              opacity,
              transform: [
                { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, q.dx] }) },
                // Парабола: спершу вгору/в бік, потім падіння
                { translateY: p.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, q.dy * 0.9, q.dy + q.fall] }) },
              ],
            },
          ]}
        />
      ))}
      {!!label && (
        <Animated.Text
          maxFontSizeMultiplier={1.2}
          style={[
            styles.label,
            {
              opacity,
              transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [-28, -64] }) }],
            },
          ]}>
          {label}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = makeStyles((t) =>
  StyleSheet.create({
    root: { position: 'absolute', width: 0, height: 0, overflow: 'visible' },
    dot: { position: 'absolute' },
    label: {
      position: 'absolute',
      width: 120,
      left: -60,
      textAlign: 'center',
      fontFamily: t.fonts.black,
      fontSize: 20,
      color: '#FDE047',
      textShadowColor: 'rgba(20,12,80,0.9)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 0,
    },
  }),
);
