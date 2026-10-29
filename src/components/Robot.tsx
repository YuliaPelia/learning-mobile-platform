import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from '@/components/useReducedMotion';
import { colors, fonts } from '@/theme';

export type RobotMood = 'idle' | 'happy' | 'think' | 'sad';
type Props = { size?: number; mood?: RobotMood; bounce?: boolean };

// Робот-помічник без фону: assets/robot/robot.png (437×560). Одна картинка, різні «пози» — рухом і значком.
const RATIO = 560 / 437;

const LABEL: Record<RobotMood, string> = { idle: 'Робот-помічник', happy: 'Робот радіє', think: 'Робот думає', sad: 'Робот засмучений' };

/**
 * Супутник учня. idle — ледь погойдується; happy — стрибає, іскорки, «Ура!»;
 * think — повільно хитає «головою» зі знаком питання (порожні стани, підказки); sad — зсутулений, зі знаком «!» (помилка, слабкий результат).
 */
export function Robot({ size = 120, mood = 'idle', bounce = true }: Props) {
  const [y] = useState(() => new Animated.Value(0));
  const [tilt] = useState(() => new Animated.Value(0));
  const reduced = useReducedMotion();
  const still = !bounce || reduced || mood === 'sad';

  useEffect(() => {
    if (still) {
      y.setValue(0);
      tilt.setValue(0);
      return;
    }
    const happy = mood === 'happy';
    const think = mood === 'think';
    const t = happy ? 380 : think ? 1500 : 1200;
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(y, { toValue: happy ? -10 : think ? 0 : -3, duration: t, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(y, { toValue: 0, duration: t, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(tilt, { toValue: 1, duration: t * 2, useNativeDriver: true }),
          Animated.timing(tilt, { toValue: 0, duration: t * 2, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [still, mood, y, tilt]);

  const sway = mood === 'happy' ? 3 : mood === 'think' ? 6 : 1;
  const rotate = mood === 'sad' ? '-7deg' : tilt.interpolate({ inputRange: [0, 1], outputRange: [`-${sway}deg`, `${sway}deg`] });
  const h = size * RATIO;
  const badge = Math.max(24, size * 0.3);

  return (
    <Animated.View
      style={{ width: size, height: h, opacity: mood === 'sad' ? 0.92 : 1, transform: [{ translateY: mood === 'sad' ? size * 0.04 : y }, { rotate }] }}
      accessible
      accessibilityLabel={LABEL[mood]}>
      <Image source={require('../../assets/robot/robot.png')} style={{ width: size, height: h }} resizeMode="contain" />
      {mood === 'happy' && (
        <>
          <Text style={[styles.spark, { top: -4, left: -4, fontSize: Math.max(12, size * 0.2) }]}>✨</Text>
          <Text style={[styles.spark, { top: h * 0.25, right: -4, fontSize: Math.max(12, size * 0.16) }]}>⭐</Text>
          <View style={styles.bubble}>
            <Text style={styles.bubbleT}>Ура!</Text>
          </View>
        </>
      )}
      {(mood === 'think' || mood === 'sad') && (
        <View style={[styles.badge, { width: badge, height: badge, borderRadius: badge / 2, backgroundColor: mood === 'think' ? colors.action : '#D9622B' }]}>
          <Ionicons name={mood === 'think' ? 'help' : 'alert'} size={badge * 0.62} color="#FFFFFF" />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  spark: { position: 'absolute' },
  bubble: { position: 'absolute', top: -10, right: 8, backgroundColor: '#FFC531', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  bubbleT: { fontFamily: fonts.black, fontSize: 12, color: '#1B2559' },
  badge: { position: 'absolute', top: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)' },
});
