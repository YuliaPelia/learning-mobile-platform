import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from '@/components/useReducedMotion';
import { tap } from '@/lib/haptics';

/** Поява блока: м'яко виїжджає знизу з затримкою за порядком — сторінка «збирається», а не блимає. */
export function Reveal({ index = 0, children, style }: { index?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduced) {
      v.setValue(1);
      return;
    }
    Animated.timing(v, { toValue: 1, duration: 420, delay: Math.min(index, 8) * 70, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v, reduced, index]);
  return (
    <Animated.View style={[{ gap: 18 }, style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Картка/кнопка, що «втискається» при дотику й дає легку вібрацію. Розмітку задає `style`, як у Pressable. */
export function PressableScale({ style, onPressIn, onPressOut, onPress, haptic = true, scaleTo = 0.97, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; haptic?: boolean; scaleTo?: number }) {
  const [s] = useState(() => new Animated.Value(1));
  const to = (value: number) => Animated.spring(s, { toValue: value, speed: 40, bounciness: 6, useNativeDriver: true }).start();
  return (
    <AnimatedPressable
      {...rest}
      style={[style, { transform: [{ scale: s }] }]}
      onPressIn={(e) => {
        to(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        to(1);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) tap();
        onPress?.(e);
      }}
    />
  );
}

/** Смужка прогресу, що плавно «доїжджає» до значення (0..1). */
export function AnimatedBar({ progress, height = 10, trackColor = 'rgba(255,255,255,0.22)', fillColor = '#FFFFFF' }: { progress: number; height?: number; trackColor?: string; fillColor?: string }) {
  const reduced = useReducedMotion();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const to = Math.min(1, Math.max(0, progress));
    if (reduced) v.setValue(to);
    else Animated.timing(v, { toValue: to, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [progress, reduced, v]);
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: trackColor, overflow: 'hidden' }}>
      <Animated.View style={{ height, borderRadius: height / 2, backgroundColor: fillColor, width: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

/** Каркас завантаження зі «світловою хвилею». */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const [x] = useState(() => new Animated.Value(-1));
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(Animated.timing(x, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [x, reduced]);
  return (
    <View style={[styles.skel, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: x.interpolate({ inputRange: [-1, 1], outputRange: [-220, 220] }) }] }]}>
        <LinearGradient colors={['transparent', 'rgba(255,255,255,0.18)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sweep} />
      </Animated.View>
    </View>
  );
}

const COLORS = ['#FFFFFF', '#E08BFF', '#5CB4FF', '#FFD166', '#7CEBB8'];
const PIECES = Array.from({ length: 22 }, (_, i) => ({ left: (i * 37) % 100, delay: (i % 7) * 90, drift: ((i * 53) % 60) - 30, size: 6 + (i % 4) * 2, color: COLORS[i % COLORS.length] }));

/** Святкування: різнокольорове «конфеті» падає один раз (за reduce motion не показується). */
export function Confetti({ height = 360 }: { height?: number }) {
  const reduced = useReducedMotion();
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!reduced) Animated.timing(t, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [t, reduced]);
  if (reduced) return null;
  return (
    <View pointerEvents="none" style={[styles.confetti, { height }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {PIECES.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: -10,
            width: p.size,
            height: p.size * 1.6,
            borderRadius: 2,
            backgroundColor: p.color,
            opacity: t.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, height] }) },
              { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
              { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.delay * 4 + 360}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skel: { overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20 },
  sweep: { flex: 1, width: 160 },
  confetti: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
});
