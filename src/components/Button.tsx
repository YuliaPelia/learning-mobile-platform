import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '@/theme';

type Props = { label: string; onPress: () => void; loading?: boolean; disabled?: boolean; variant?: 'primary' | 'outline' };

export function Button({ label, onPress, loading, disabled, variant = 'primary' }: Props) {
  const outline = variant === 'outline';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.btn, outline && styles.outline, (disabled || pressed) && styles.dim]}>
      {loading ? (
        <ActivityIndicator color={outline ? colors.text : colors.onPrimary} />
      ) : (
        <Text style={[styles.text, outline && styles.outlineText]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  dim: { opacity: 0.7 },
  text: { color: colors.onPrimary, fontSize: 16, fontFamily: fonts.bold },
  outlineText: { color: colors.text },
});
