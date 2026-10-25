import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { colors, fonts } from '@/theme';

type Name = React.ComponentProps<typeof Ionicons>['name'];

const tab = (title: string, icon: Name, iconActive: Name) => ({
  title,
  tabBarIcon: ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? iconActive : icon} size={size} color={color as string} />
  ),
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.semibold },
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.border },
      }}>
      <Tabs.Screen name="index" options={tab('Головна', 'home-outline', 'home')} />
      <Tabs.Screen name="courses" options={tab('Курси', 'book-outline', 'book')} />
      <Tabs.Screen name="profile" options={tab('Профіль', 'person-outline', 'person')} />
    </Tabs>
  );
}
