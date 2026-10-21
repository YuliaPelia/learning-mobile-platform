import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { colors } from '@/theme';

type Name = React.ComponentProps<typeof Ionicons>['name'];

const tab = (title: string, icon: Name) => ({
  title,
  tabBarIcon: ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={icon} size={size} color={color as string} />
  ),
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: colors.border },
      }}>
      <Tabs.Screen name="index" options={tab('Головна', 'home')} />
      <Tabs.Screen name="courses" options={tab('Курси', 'book')} />
      <Tabs.Screen name="profile" options={tab('Профіль', 'person')} />
    </Tabs>
  );
}
