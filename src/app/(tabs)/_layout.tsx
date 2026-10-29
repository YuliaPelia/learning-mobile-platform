import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs, useGlobalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStudySelect } from '@/lib/study/store';
import { colors, fonts } from '@/theme';
import { setSkin, skinTokens, tokens, useSkin } from '@/theme/skin';

type Name = React.ComponentProps<typeof Ionicons>['name'];

const tab = (title: string, icon: Name, iconActive: Name) => ({
  title,
  tabBarIcon: ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <View style={[styles.iconPill, focused && styles.iconPillOn]}>
      <Ionicons name={focused ? iconActive : icon} size={size - 2} color={color as string} />
    </View>
  ),
});

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const skinName = useSkin();
  const skin = skinTokens[skinName];
  const skinBorder = tokens[skinName].glassBorder;
  // Лише для розробки: ?skin=pro|play у посиланні швидко перемикає вигляд (для перевірки на симуляторі)
  const { skin: forced } = useGlobalSearchParams<{ skin?: string }>();
  useEffect(() => {
    if (__DEV__ && (forced === 'pro' || forced === 'play')) setSkin(forced);
  }, [forced]);
  // Кількість невиконаних задач — на вкладці «Сьогодні»
  const openTasks = useStudySelect((s) => s.tasks.filter((t) => !t.done).length);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Плавне перемикання вкладок замість різкого
        animation: 'fade',
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.78)',
        tabBarLabelStyle: { fontSize: 12, fontFamily: fonts.semibold },
        // Плаваюча матова панель над контентом (Screen залишає під неї відступ)
        tabBarStyle: {
          position: 'absolute',
          marginLeft: 16,
          width: width - 32,
          bottom: Math.max(insets.bottom, 12),
          height: 68,
          borderRadius: skin.tabRadius,
          borderTopWidth: 0,
          ...skinBorder,
          overflow: 'hidden',
          backgroundColor: 'transparent',
          elevation: 0,
        },
        tabBarItemStyle: { paddingTop: 6 },
        tabBarBackground: () => (
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: skin.tabBar }]} />
          </BlurView>
        ),
      }}>
      <Tabs.Screen name="index" options={tab('Головна', 'home-outline', 'home')} />
      <Tabs.Screen name="courses" options={tab('Курси', 'book-outline', 'book')} />
      <Tabs.Screen name="today" options={{ ...tab('Сьогодні', 'checkbox-outline', 'checkbox'), tabBarBadge: openTasks > 0 ? openTasks : undefined, tabBarBadgeStyle: { backgroundColor: colors.action, color: colors.onAction, fontFamily: fonts.bold } }} />
      <Tabs.Screen name="profile" options={tab('Профіль', 'person-outline', 'person')} />
      {/* Курс, таймер, статистика й квіз — стек у прихованій вкладці: нижня навігація завжди на місці */}
      <Tabs.Screen name="(learn)" options={{ tabBarItemStyle: { display: 'none' } }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconPill: { width: 48, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconPillOn: { backgroundColor: colors.action },
});
