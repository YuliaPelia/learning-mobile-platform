import { Stack } from 'expo-router';
import { colors } from '@/theme';

// Екрани всередині вкладок (курс, таймер, статистика, квіз): це окремий стек під нижньою навігацією,
// тому панель вкладок завжди на місці, а кнопка «назад» повертає по стеку.
export default function LearnLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
