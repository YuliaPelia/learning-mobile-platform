import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { GradientCard } from '@/components/GradientCard';
import { Screen, sectionTitle } from '@/components/Screen';
import { useAsync } from '@/components/useAsync';
import { getCourses } from '@/lib/api';
import { mockCourses } from '@/data/mock';
import { colors, radius, shadow } from '@/theme';

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courses = useAsync(getCourses, mockCourses);
  const course = courses.find((c) => c.id === id);

  if (!course) {
    return <Screen><Text style={sectionTitle}>Курс не знайдено</Text></Screen>;
  }

  return (
    <Screen>
      <GradientCard name={course.gradient} style={styles.hero}>
        <Ionicons name={course.icon} size={40} color="#fff" />
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.meta}>{course.category} · {course.age} років</Text>
      </GradientCard>
      <Text style={styles.desc}>{course.description}</Text>
      <View style={styles.stats}>
        <Stat value={String(course.lessons)} label="уроків" />
        <Stat value={String(course.freeLessons)} label="безкоштовні" />
        <Stat value={course.age} label="вік" />
      </View>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statV}>{value}</Text>
      <Text style={styles.statL}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 180, gap: 8, justifyContent: 'flex-end', borderRadius: radius.lg },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  meta: { color: 'rgba(255,255,255,0.9)' },
  desc: { fontSize: 16, lineHeight: 24, color: colors.text },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: radius.md, padding: 14, alignItems: 'center', ...shadow },
  statV: { fontSize: 20, fontWeight: '800', color: colors.primary },
  statL: { fontSize: 12, color: colors.muted },
});
