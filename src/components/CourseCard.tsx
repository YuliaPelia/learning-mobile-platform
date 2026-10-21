import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Course } from '@/lib/types';
import { GradientCard } from './GradientCard';

export function CourseCard({ course, width }: { course: Course; width?: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={course.title}
      onPress={() => router.push({ pathname: '/course/[id]', params: { id: course.id } })}
      style={{ width }}>
      <GradientCard name={course.gradient} style={styles.card}>
        <View style={styles.icon}>
          <Ionicons name={course.icon} size={26} color="#fff" />
        </View>
        <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.meta}>{course.age} років · {course.lessons} уроків</Text>
      </GradientCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 150, justifyContent: 'flex-end', gap: 6 },
  icon: {
    position: 'absolute',
    top: 14,
    left: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 17, fontWeight: '800' },
  meta: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
});
