import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Animated, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { SpaceDecor } from '@/components/SpaceDecor';
import { colors, glassBorder, type } from '@/theme';
import { makeStyles, skinTokens, useSkin } from '@/theme/skin';

type Props = { children: ReactNode; title?: string; back?: boolean; /** Потягнути вниз, щоб оновити. */ onRefresh?: () => Promise<unknown> | void };

export function Screen({ children, title, back, onRefresh }: Props) {
  const insets = useSafeAreaInsets();
  const skin = skinTokens[useSkin()];
  const [refreshing, setRefreshing] = useState(false);
  // Скільки прокручено: за ним великий заголовок згасає, а зверху зʼявляється матова панель із малим заголовком
  const [scrollY] = useState(() => new Animated.Value(0));
  const [collapsed, setCollapsed] = useState(false);
  const barH = insets.top + 52;

  const fade = (from: number, to: number) => scrollY.interpolate({ inputRange: [from, to], outputRange: [0, 1], extrapolate: 'clamp' });

  const content = (
    <Animated.ScrollView
      scrollEventThrottle={16}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: (e: { nativeEvent: { contentOffset: { y: number } } }) => {
          const next = e.nativeEvent.contentOffset.y > 56;
          setCollapsed((prev) => (prev === next ? prev : next));
        },
      })}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            tintColor="#FFFFFF"
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await onRefresh();
              } finally {
                setRefreshing(false);
              }
            }}
          />
        ) : undefined
      }>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Назад" onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      ) : null}
      {title ? (
        <Animated.Text accessibilityElementsHidden={collapsed} importantForAccessibility={collapsed ? 'no-hide-descendants' : 'auto'} style={[styles.title, skin.title, { opacity: scrollY.interpolate({ inputRange: [10, 70], outputRange: [1, 0], extrapolate: 'clamp' }) }]} accessibilityRole="header">
          {title}
        </Animated.Text>
      ) : null}
      {children}
    </Animated.ScrollView>
  );

  return (
    <LinearGradient colors={skin.gradient} locations={[0, 0.35, 0.7, 1]} style={styles.bg}>
      {skin.decor && <Orbs />}
      {skin.decor && <SpaceDecor />}
      {content}
      {title ? (
        <View pointerEvents={collapsed ? 'auto' : 'none'} style={[styles.bar, { height: barH }]} importantForAccessibility={collapsed ? 'yes' : 'no-hide-descendants'} accessibilityElementsHidden={!collapsed}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade(20, 64) }]}>
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill}>
              <View style={[StyleSheet.absoluteFill, { backgroundColor: skin.tabBar }]} />
            </BlurView>
            <View style={styles.barLine} />
          </Animated.View>
          <Animated.View style={[styles.barRow, { paddingTop: insets.top, opacity: fade(40, 80) }]}>
            {back ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Назад" onPress={() => router.back()} hitSlop={8} style={styles.barBack}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </Pressable>
            ) : null}
            <Animated.Text style={styles.barTitle} numberOfLines={1}>{title}</Animated.Text>
          </Animated.View>
        </View>
      ) : null}
    </LinearGradient>
  );
}

/** М'які кольорові «світіння» позаду скла. Малі й далеко від тексту, щоб не знижувати контраст. */
function Orbs() {
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Defs>
        <RadialGradient id="pink" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#E08BFF" stopOpacity="0.38" />
          <Stop offset="1" stopColor="#E08BFF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="blue" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#5CB4FF" stopOpacity="0.32" />
          <Stop offset="1" stopColor="#5CB4FF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="92%" cy="6%" r={190} fill="url(#pink)" />
      <Circle cx="4%" cy="86%" r={210} fill="url(#blue)" />
    </Svg>
  );
}

const sectionStyles = makeStyles(() => StyleSheet.create({ t: { ...type.heading, color: colors.text } }));
/** Стиль заголовка секції: функція, бо залежить від шкіри (викликається під час рендеру). */
export const sectionTitle = () => sectionStyles.t;
const styles = StyleSheet.create({
  bg: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 120, gap: 18 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.display, color: colors.text },
  bar: { position: 'absolute', top: 0, left: 0, right: 0 },
  barLine: { position: 'absolute', left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth, backgroundColor: glassBorder.borderTopColor },
  barRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingBottom: 6 },
  barBack: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  barTitle: { flex: 1, ...type.subhead, color: colors.text },
});
