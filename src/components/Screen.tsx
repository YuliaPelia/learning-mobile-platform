import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';

export function Screen({ children, title }: { children: ReactNode; title?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
      {title ? <Text style={styles.title} accessibilityRole="header">{title}</Text> : null}
      {children}
    </ScrollView>
  );
}

export const sectionTitle = StyleSheet.create({
  t: { fontSize: 18, fontWeight: '800', color: colors.text },
}).t;

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32, gap: 18 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
});
