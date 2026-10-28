import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { StyleSheet, useWindowDimensions, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/theme';

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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.92)',
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.semibold },
        // Плаваюча матова панель над контентом (Screen залишає під неї відступ)
        tabBarStyle: {
          position: 'absolute',
          marginLeft: 16,
          width: width - 32,
          bottom: Math.max(insets.bottom, 12),
          height: 68,
          borderRadius: 30,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
          backgroundColor: 'transparent',
          elevation: 0,
        },
        tabBarItemStyle: { paddingTop: 6 },
        tabBarBackground: () => (
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBar }]} />
          </BlurView>
        ),
      }}>
      <Tabs.Screen name="index" options={tab('Головна', 'home-outline', 'home')} />
      <Tabs.Screen name="courses" options={tab('Курси', 'book-outline', 'book')} />
      <Tabs.Screen name="today" options={tab('Сьогодні', 'checkbox-outline', 'checkbox')} />
      <Tabs.Screen name="profile" options={tab('Профіль', 'person-outline', 'person')} />
      {/* Курс, таймер, статистика й квіз — стек у прихованій вкладці: нижня навігація завжди на місці */}
      <Tabs.Screen name="(learn)" options={{ tabBarItemStyle: { display: 'none' } }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconPill: { width: 48, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconPillOn: { backgroundColor: 'rgba(255,255,255,0.3)' },
});
