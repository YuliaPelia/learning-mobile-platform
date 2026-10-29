import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet } from 'react-native';
import type { Course } from '@/lib/types';
import { gradients, shadow } from '@/theme';
import { useSkin } from '@/theme/skin';

/** Курс як «планета»: кругла обкладинка, а без неї — градієнтна куля з іконкою. */
export function Planet({ course, size }: { course: Course; size: number }) {
  const pro = useSkin() === 'pro';
  // Спокійна шкіра: скруглений квадрат без тіні замість «планети»
  const round = { width: size, height: size, borderRadius: pro ? size * 0.22 : size / 2 };
  const styles = pro ? flat : planet;
  return course.image ? (
    <Image source={course.image} style={[round, styles.shadow]} accessibilityIgnoresInvertColors />
  ) : (
    <LinearGradient colors={gradients[course.gradient]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={[round, styles.shadow, styles.icon]}>
      <Ionicons name={course.icon} size={size * 0.42} color="#fff" />
    </LinearGradient>
  );
}

const planet = StyleSheet.create({
  shadow: { ...shadow },
  icon: { alignItems: 'center', justifyContent: 'center' },
});
const flat = StyleSheet.create({
  shadow: {},
  icon: { alignItems: 'center', justifyContent: 'center' },
});
