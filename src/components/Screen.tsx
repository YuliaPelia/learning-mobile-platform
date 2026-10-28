import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SpaceDecor } from '@/components/SpaceDecor';
import { colors, fonts, screenGradient } from '@/theme';

type Props = { children: ReactNode; title?: string; back?: boolean };

export function Screen({ children, title, back }: Props) {
  const insets = useSafeAreaInsets();
  const content = (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Назад" onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      ) : null}
      {title ? <Text style={styles.title} accessibilityRole="header">{title}</Text> : null}
      {children}
    </ScrollView>
  );
  return (
    <LinearGradient colors={screenGradient} locations={[0, 0.35, 0.7, 1]} style={styles.bg}>
      <View pointerEvents="none" style={[styles.glow, styles.glowA]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowB]} />
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
  // м'які світлові плями, як на референсі
  glow: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)' },
  glowA: { width: 320, height: 320, top: -80, right: -120 },
  glowB: { width: 260, height: 260, bottom: 160, left: -140, backgroundColor: 'rgba(196,170,255,0.22)' },
  content: { paddingHorizontal: 20, paddingBottom: 120, gap: 18 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 32, fontFamily: fonts.black, color: colors.text },
});
