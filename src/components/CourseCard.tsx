import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Course } from '@/lib/types';
import { colors, fonts, radius, tints } from '@/theme';

export function CourseCard({ course }: { course: Course }) {
  const tint = tints[course.gradient];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={course.title}
      onPress={() => router.push({ pathname: '/course/[id]', params: { id: course.id } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {course.image ? (
        <Image source={course.image} style={styles.icon} />
      ) : (
        <View style={[styles.icon, { backgroundColor: tint.bg }]}>
          <Ionicons name={course.icon} size={22} color={tint.fg} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{course.title}</Text>
        <Text style={styles.meta}>{course.age} років · {course.lessons} уроків</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: tint.bg }]}>
        <Text style={[styles.badgeText, { color: tint.fg }]}>{course.soon ? 'Скоро' : course.category}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  icon: { width: 46, height: 46, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
  title: { color: colors.text, fontSize: 15, fontFamily: fonts.bold },
  meta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontFamily: fonts.bold },
});
