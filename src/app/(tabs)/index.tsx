import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CourseCard } from '@/components/CourseCard';
import { GradientCard } from '@/components/GradientCard';
import { Pill } from '@/components/Pill';
import { Screen, sectionTitle } from '@/components/Screen';
import { useAsync } from '@/components/useAsync';
import { getCourses, getTeachers } from '@/lib/api';
import { mockCourses, mockTeachers } from '@/data/mock';
import { colors, radius, shadow, tints } from '@/theme';

export default function Home() {
  const courses = useAsync(getCourses, mockCourses);
  const teachers = useAsync(getTeachers, mockTeachers);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.hi}>Привіт! 👋</Text>
          <Text style={styles.sub}>Вчись програмувати крок за кроком</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color={colors.primary} />
        </View>
      </View>

      <GradientCard name="hero" style={styles.hero}>
        <Text style={styles.heroKicker}>ITCodeCraft</Text>
        <Text style={styles.heroTitle}>2 безкоштовні уроки{'\n'}в кожному курсі</Text>
        <Pill light label="Обрати курс" onPress={() => router.push('/courses')} />
        <View style={styles.play}>
          <Ionicons name="code-slash" size={28} color="#fff" />
        </View>
      </GradientCard>

      <View style={styles.sectionRow}>
        <Text style={sectionTitle}>Популярні курси</Text>
        <Pressable accessibilityRole="link" onPress={() => router.push('/courses')}>
          <Text style={styles.viewAll}>Усі</Text>
        </Pressable>
      </View>
      <View style={styles.list}>
        {courses.map((c) => <CourseCard key={c.id} course={c} />)}
      </View>

      <Text style={sectionTitle}>Викладачі</Text>
      <View style={styles.teachers}>
        {teachers.map((t) => (
          <View key={t.id} style={styles.teacher}>
            <View style={[styles.tAvatar, { backgroundColor: tints[t.gradient].bg }]}>
              <Text style={[styles.tAvatarText, { color: tints[t.gradient].fg }]}>{t.name[0]}</Text>
            </View>
            <Text style={styles.tName} numberOfLines={1}>{t.name}</Text>
            <Text style={styles.tRole} numberOfLines={2}>{t.role}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hi: { fontSize: 22, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { gap: 10, overflow: 'hidden', minHeight: 150 },
  heroKicker: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 26, marginBottom: 4 },
  play: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  viewAll: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  list: { gap: 12 },
  teachers: { flexDirection: 'row', gap: 12 },
  teacher: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: 12, alignItems: 'center', gap: 4, ...shadow },
  tAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  tAvatarText: { fontSize: 20, fontWeight: '700' },
  tName: { fontWeight: '700', fontSize: 13, color: colors.text },
  tRole: { fontSize: 11, color: colors.muted, textAlign: 'center' },
});
