import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, screenGradient } from '@/theme';

export function Screen({ children, title }: { children: ReactNode; title?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={screenGradient} locations={[0, 0.3, 0.65, 1]} style={styles.bg}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
        {title ? <Text style={styles.title} accessibilityRole="header">{title}</Text> : null}
        {children}
      </ScrollView>
    </LinearGradient>
  );
}

export const sectionTitle = StyleSheet.create({
  t: { fontSize: 20, fontWeight: '700', color: colors.text },
}).t;

const styles = StyleSheet.create({
  bg: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 32, gap: 18 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text },
});
