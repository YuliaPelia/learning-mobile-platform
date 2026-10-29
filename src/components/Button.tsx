import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { PressableScale } from '@/components/motion';
import { colors } from '@/theme';
import { makeStyles } from '@/theme/skin';

type Props = { label: string; onPress: () => void; loading?: boolean; disabled?: boolean; variant?: 'primary' | 'outline' };

/** Основна дія — фіолетовий «скляний» градієнт із світлою кромкою; другорядна — матове скло. */
export function Button({ label, onPress, loading, disabled, variant = 'primary' }: Props) {
  const outline = variant === 'outline';
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.btn, outline ? styles.outline : styles.primary, disabled && styles.dim]}>
      {!outline && <LinearGradient colors={['#6C4FEA', '#8458F0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
      {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.text}>{label}</Text>}
    </PressableScale>
  );
}

const styles = makeStyles((t) => {
  return StyleSheet.create({
    btn: { height: 50, borderRadius: t.radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...t.glassBorder },
    primary: { shadowColor: '#2A1B8F', shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
    outline: { backgroundColor: colors.glass },
    dim: { opacity: 0.7 },
    text: { color: colors.onAction, fontSize: 16, fontFamily: t.fonts.bold },
  });
});
