import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme';

type Props = { label: string; onPress?: () => void; light?: boolean };

export function Pill({ label, onPress, light }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.pill, light && styles.light]}>
      <Text style={[styles.text, light && styles.lightText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  light: { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.2)' },
  text: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  lightText: { color: '#fff' },
});
