import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { gradients, radius, shadow } from '@/theme';
import type { GradientName } from '@/lib/types';

type Props = { name?: GradientName; style?: StyleProp<ViewStyle>; children?: ReactNode };

export function GradientCard({ name = 'violet', style, children }: Props) {
  return (
    <LinearGradient
      colors={gradients[name]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, padding: 16, ...shadow },
});
