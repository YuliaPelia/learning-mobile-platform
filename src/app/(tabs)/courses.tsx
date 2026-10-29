import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { CourseCard } from '@/components/CourseCard';
import { PressableScale, Reveal } from '@/components/motion';
import { Screen } from '@/components/Screen';
import { useAsync } from '@/components/useAsync';
import { getCourses } from '@/lib/api';
import type { Course } from '@/lib/types';
import { colors } from '@/theme';
import { useSkin, makeStyles } from '@/theme/skin';

export default function Courses() {
  useSkin(); // перерендер при зміні вигляду
  const courses = useAsync<Course[]>(getCourses, []);
  return (
    <Screen title="Курси">
      <Reveal index={0}>
        <PressableScale accessibilityRole="button" accessibilityLabel="Підібрати курс за хвилину" onPress={() => router.push('/onboarding')} style={styles.quiz}>
          <View style={styles.quizIcon}>
            <Ionicons name="sparkles-outline" size={24} color={colors.text} />
          </View>
          <View style={styles.quizBody}>
            <Text style={styles.quizT}>Не знаєте, що обрати?</Text>
            <Text style={styles.quizH}>Відповісти на 5 запитань і отримати добірку</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </PressableScale>
      </Reveal>
      <View style={styles.list}>
        {courses.map((c, i) => (
          <Reveal key={c.id} index={i + 1}>
            <CourseCard course={c} />
          </Reveal>
        ))}
      </View>
    </Screen>
  );
}

const styles = makeStyles((t) => {
  return StyleSheet.create({
    list: { gap: 12 },
    quiz: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 68, padding: 12, borderRadius: t.radius.lg, backgroundColor: colors.glass, ...t.glassBorder },
    quizIcon: { width: 44, height: 44, borderRadius: t.radius.sm, backgroundColor: colors.action, alignItems: 'center', justifyContent: 'center' },
    quizBody: { flex: 1, gap: 2 },
    quizT: { ...t.type.subhead, color: colors.text },
    quizH: { ...t.type.caption, color: colors.muted },
  });
});
