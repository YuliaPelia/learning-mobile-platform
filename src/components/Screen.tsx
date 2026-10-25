import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SpaceDecor } from '@/components/SpaceDecor';
import { colors, fonts, light, screenGradient } from '@/theme';

type Props = { children: ReactNode; title?: string; variant?: 'space' | 'light' };

export function Screen({ children, title, variant = 'space' }: Props) {
  const insets = useSafeAreaInsets();
  const content = (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
      {title ? <Text style={styles.title} accessibilityRole="header">{title}</Text> : null}
      {children}
    </ScrollView>
  );
  if (variant === 'light') {
    return (
      <View style={[styles.bg, { backgroundColor: light.bg }]}>
        <SpaceDecor stars={false} />
        {content}
      </View>
    );
  }
  return (
    <LinearGradient colors={screenGradient} locations={[0, 0.35, 0.7, 1]} style={styles.bg}>
      <SpaceDecor />
      {content}
    </LinearGradient>
  );
}

export const sectionTitle = StyleSheet.create({
  t: { fontSize: 20, fontFamily: fonts.bold, color: colors.text },
}).t;

const styles = StyleSheet.create({
  bg: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 32, gap: 18 },
  title: { fontSize: 32, fontFamily: fonts.black, color: colors.text },
});
