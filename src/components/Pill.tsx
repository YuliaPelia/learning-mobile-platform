import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '@/theme';

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
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: colors.primarySoft,
  },
  light: { backgroundColor: colors.paper },
  text: { color: colors.primary, fontFamily: fonts.bold, fontSize: 13 },
  lightText: { color: colors.primaryDark },
});
