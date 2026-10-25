import { StyleSheet, View } from 'react-native';
import { dots } from '@/theme';

// Фіксовані позиції (у % від екрана), щоб декор не «стрибав» між рендерами
const PLANETS = [
  { top: 6, left: 82, size: 14, color: 0 },
  { top: 10, left: 64, size: 10, color: 1 },
  { top: 22, left: 6, size: 12, color: 2 },
  { top: 34, left: 90, size: 9, color: 3 },
  { top: 58, left: 4, size: 10, color: 1 },
  { top: 72, left: 88, size: 16, color: 2 },
  { top: 88, left: 10, size: 9, color: 0 },
];
const STARS = [
  [4, 30], [8, 12], [14, 48], [18, 92], [26, 40], [30, 70], [40, 16], [46, 58],
  [52, 94], [62, 30], [66, 76], [78, 22], [82, 60], [92, 84], [96, 38],
];

/** Космічний декор: кольорові «планети», зірки й пунктирна орбіта. Лише оформлення, недоступне скрінрідеру. */
export function SpaceDecor({ stars = true }: { stars?: boolean }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.orbit} />
      {stars &&
        STARS.map(([top, left]) => <View key={`${top}-${left}`} style={[styles.star, { top: `${top}%`, left: `${left}%` }]} />)}
      {PLANETS.map((p) => (
        <View
          key={`${p.top}-${p.left}`}
          style={{
            position: 'absolute',
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: dots[p.color],
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  orbit: {
    position: 'absolute',
    top: 140,
    left: -120,
    width: 640,
    height: 640,
    borderRadius: 320,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderStyle: 'dashed',
  },
  star: { position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.7)' },
});
