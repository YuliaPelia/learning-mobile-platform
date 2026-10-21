import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { colors, shadow } from '@/theme';

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
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { backgroundColor: colors.card, borderTopWidth: 0, ...shadow, shadowOpacity: 0.1 },
      }}>
      <Tabs.Screen name="index" options={tab('Головна', 'home-outline', 'home')} />
      <Tabs.Screen name="courses" options={tab('Курси', 'book-outline', 'book')} />
      <Tabs.Screen name="profile" options={tab('Профіль', 'person-outline', 'person')} />
    </Tabs>
  );
}
