import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '@/components/motion';
import { lessonsText } from '@/lib/plural';
import type { Course } from '@/lib/types';
import { colors, tints } from '@/theme';
import { makeStyles } from '@/theme/skin';

export function CourseCard({ course }: { course: Course }) {
  const tint = tints[course.gradient];
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={course.title}
      onPress={() => router.push({ pathname: '/course/[id]', params: { id: course.id } })}
      style={styles.card}>
      {course.image ? (
        <Image source={course.image} style={styles.icon} />
      ) : (
        <View style={[styles.icon, { backgroundColor: tint.bg }]}>
          <Ionicons name={course.icon} size={22} color={tint.fg} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{course.title}</Text>
        <Text style={styles.meta}>{course.age} років · {lessonsText(course.lessons)}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: tint.bg }]}>
        <Text style={[styles.badgeText, { color: tint.fg }]}>{course.soon ? 'Скоро' : course.category}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </PressableScale>
  );
}

const styles = makeStyles((t) => {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      borderRadius: t.radius.md,
      padding: 14,
      ...t.glassBorder,
    },
    pressed: { opacity: 0.85 },
    icon: { width: 46, height: 46, borderRadius: t.radius.sm, alignItems: 'center', justifyContent: 'center' },
    body: { flex: 1, gap: 2 },
    title: { color: colors.text, fontSize: 15, fontFamily: t.fonts.bold },
    meta: { color: colors.muted, fontFamily: t.fonts.regular, fontSize: 12 },
    badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    badgeText: { fontSize: 12, fontFamily: t.fonts.bold },
  });
});
