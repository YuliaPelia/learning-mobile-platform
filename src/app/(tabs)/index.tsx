import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions, ScrollView } from 'react-native';
import { CourseCard } from '@/components/CourseCard';
import { Pill } from '@/components/Pill';
import { Screen, sectionTitle } from '@/components/Screen';
import { useAsync } from '@/components/useAsync';
import { getCourses, getTeachers } from '@/lib/api';
import { mockCourses, mockTeachers } from '@/data/mock';
import { colors, gradients, radius, shadow } from '@/theme';

export default function Home() {
  const courses = useAsync(getCourses, mockCourses);
  const teachers = useAsync(getTeachers, mockTeachers);
  const { width } = useWindowDimensions();
  const cardW = Math.min(220, width * 0.58);

  return (
    <Screen>
      <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <Text style={styles.heroKicker}>ITCodeCraft</Text>
        <Text style={styles.heroTitle}>Вчись програмувати{'\n'}крок за кроком</Text>
        <Text style={styles.heroText}>2 безкоштовні уроки в кожному курсі</Text>
        <Pill light label="Обрати курс" onPress={() => router.push('/courses')} />
        <View style={styles.orbit}>
          <Ionicons name="code-slash" size={34} color="#fff" />
        </View>
      </LinearGradient>

      <Text style={sectionTitle}>Популярні курси</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={styles.bleed}>
        {courses.map((c) => <CourseCard key={c.id} course={c} width={cardW} />)}
      </ScrollView>

      <Text style={sectionTitle}>Викладачі</Text>
      <View style={styles.teachers}>
        {teachers.map((t) => (
          <View key={t.id} style={styles.teacher}>
            <LinearGradient colors={gradients[t.gradient]} style={styles.avatar}>
              <Text style={styles.avatarText}>{t.name[0]}</Text>
            </LinearGradient>
            <Text style={styles.tName} numberOfLines={1}>{t.name}</Text>
            <Text style={styles.tRole} numberOfLines={2}>{t.role}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: 22, gap: 10, overflow: 'hidden', minHeight: 230, ...shadow },
  heroKicker: { color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', lineHeight: 32 },
  heroText: { color: 'rgba(255,255,255,0.9)', marginBottom: 6 },
  blob1: { position: 'absolute', right: -40, top: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.15)' },
  blob2: { position: 'absolute', right: 30, bottom: -50, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.12)' },
  orbit: { position: 'absolute', right: 22, bottom: 24, width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  bleed: { marginHorizontal: -20 },
  row: { paddingHorizontal: 20, gap: 14, paddingBottom: 8 },
  teachers: { flexDirection: 'row', gap: 12 },
  teacher: { flex: 1, backgroundColor: '#fff', borderRadius: radius.md, padding: 12, alignItems: 'center', gap: 4, ...shadow },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  tName: { fontWeight: '700', color: colors.text },
  tRole: { fontSize: 11, color: colors.muted, textAlign: 'center' },
});
