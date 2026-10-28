import { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { fonts } from '@/theme';

type Props = { size?: number; mood?: 'idle' | 'happy'; bounce?: boolean };

// Робот-помічник без фону: assets/robot/robot.png (437×560)
const RATIO = 560 / 437;

/** Робот-помічник: супутник учня на доріжці уроків. «happy» — радіє прогресу (літає жвавіше, іскорки, «Ура!»). */
export function Robot({ size = 120, mood = 'idle', bounce = true }: Props) {
  const [y] = useState(() => new Animated.Value(0));
  const [tilt] = useState(() => new Animated.Value(0));
  const happy = mood === 'happy';

  useEffect(() => {
    if (!bounce) return;
    const t = happy ? 380 : 1200;
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(y, { toValue: happy ? -10 : -3, duration: t, easing: Easing.out(Easing.quad), useNativeDriver: true }),
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
  }, [bounce, happy, y, tilt]);

  const rotate = tilt.interpolate({ inputRange: [0, 1], outputRange: happy ? ['-3deg', '3deg'] : ['-1deg', '1deg'] });
  const h = size * RATIO;

  return (
    <Animated.View
      style={{ width: size, height: h, transform: [{ translateY: y }, { rotate }] }}
      accessible
      accessibilityLabel={happy ? 'Робот радіє' : 'Робот-помічник'}>
      <Image source={require('../../assets/robot/robot.png')} style={{ width: size, height: h }} resizeMode="contain" />
      {happy && (
        <>
          <Text style={[styles.spark, { top: -4, left: -4, fontSize: size * 0.2 }]}>✨</Text>
          <Text style={[styles.spark, { top: h * 0.25, right: -4, fontSize: size * 0.16 }]}>⭐</Text>
          <View style={styles.bubble}>
            <Text style={styles.bubbleT}>Ура!</Text>
          </View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  spark: { position: 'absolute' },
  bubble: { position: 'absolute', top: -10, right: 8, backgroundColor: '#FFC531', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  bubbleT: { fontFamily: fonts.black, fontSize: 12, color: '#1B2559' },
});
