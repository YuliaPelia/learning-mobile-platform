import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Pill } from '@/components/Pill';
import { Planet } from '@/components/Planet';
import { Screen, sectionTitle } from '@/components/Screen';
import { StatsCard } from '@/components/StatsCard';
import { useAsync } from '@/components/useAsync';
import { getCourses, getStats } from '@/lib/api';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Course, StudentProgress, User } from '@/lib/types';
import { colors, fonts, radius, shadow } from '@/theme';

const openCourse = (id: string) => router.push({ pathname: '/course/[id]', params: { id } });

const GAP = 16;
const PLANET = 128;

export default function Home() {
  const { user } = useAuth();
  const courses = useAsync<Course[]>(getCourses, []);
  const students = useAsync(() => (user ? getStats() : Promise.resolve(null)), null, [user?.id]);
  const firstName = user?.name.split(' ')[0];

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.hi}>{firstName ? `Привіт, ${firstName}!` : 'Привіт!'}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Профіль" onPress={() => router.push('/profile')} style={styles.avatar}>
          {firstName ? (
            <Text style={styles.avatarText}>{firstName[0]}</Text>
          ) : (
            <Ionicons name="person" size={18} color={colors.onPrimary} />
          )}
        </Pressable>
      </View>

      <Text style={styles.title} accessibilityRole="header">
        Programming{'\n'}Explorer
      </Text>

      <Carousel courses={courses} />

      <Progress user={user} students={students} />
    </Screen>
  );
}

/** Карусель курсів: картка по центру біла й активна, сусідні — притушені. */
function Carousel({ courses }: { courses: Course[] }) {
  const { width } = useWindowDimensions();
  const [active, setActive] = useState(0);
  const cardW = Math.min(width * 0.64, 280);
  const side = (width - cardW) / 2;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardW + GAP}
      decelerationRate="fast"
      scrollEventThrottle={16}
      onScroll={(e) => setActive(Math.round(e.nativeEvent.contentOffset.x / (cardW + GAP)))}
      style={styles.carousel}
      contentContainerStyle={{ paddingHorizontal: side, gap: GAP }}>
      {courses.map((c, i) => (
        <CourseSlide key={c.id} course={c} number={i + 1} width={cardW} active={i === active} />
      ))}
    </ScrollView>
  );
}

function CourseSlide({ course, number, width, active }: { course: Course; number: number; width: number; active: boolean }) {
  return (
    <View style={[styles.slide, { width }, !active && styles.slideIdle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${course.title}. ${course.soon ? 'Скоро' : `${course.lessons} уроків`}`}
        onPress={() => openCourse(course.id)}
        style={[styles.card, !active && styles.cardIdle]}>
        <Text style={styles.number} accessible={false}>{number}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.cardMeta}>
          {course.soon ? 'Скоро' : `${course.lessons} уроків`} · {course.age} років
        </Text>
        <Text style={styles.cardDesc} numberOfLines={3}>{course.description}</Text>
      </Pressable>
      <View style={styles.planetWrap} pointerEvents="none">
        <Planet course={course} size={PLANET} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Відкрити курс ${course.title}`}
        onPress={() => openCourse(course.id)}
        style={styles.go}>
        <Ionicons name="arrow-forward" size={24} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
}

/** Статистика: учень бачить себе, батьки — кожну дитину. */
function Progress({ user, students }: { user: User | null; students: StudentProgress[] | null }) {
  if (!user) {
    return (
      <>
        <Text style={sectionTitle}>Твій прогрес</Text>
        <View style={styles.note}>
          <Ionicons name="rocket" size={26} color={colors.primary} />
          <Text style={styles.noteText}>Увійди, щоб бачити серію днів, рівень, XP і бейджі.</Text>
          <Pill light label="Увійти" onPress={() => router.push('/sign-in')} />
        </View>
      </>
    );
  }
  // Ще вантажиться або немає звʼязку — блок просто не показуємо
  if (!students) return null;

  if (user.role === 'student') {
    const me = students[0];
    return me ? (
      <>
        <Text style={sectionTitle}>Твій прогрес</Text>
        <StatsCard stats={me.stats} />
      </>
    ) : null;
  }

  return (
    <>
      <Text style={sectionTitle}>Прогрес дітей</Text>
      {students.length === 0 && (
        <View style={styles.note}>
          <Ionicons name="people" size={26} color={colors.primary} />
          <Text style={styles.noteText}>Додайте профіль дитини на сайті — тут зʼявиться її прогрес.</Text>
        </View>
      )}
      {students.map((s) => (
        <View key={s.id} style={styles.child}>
          <Text style={styles.childName}>{s.name}</Text>
          <StatsCard stats={s.stats} />
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hi: { fontSize: 15, fontFamily: fonts.semibold, color: colors.muted },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontFamily: fonts.black, color: colors.onPrimary },
  title: { fontSize: 40, lineHeight: 46, fontFamily: fonts.black, color: colors.text, marginTop: 4 },
  carousel: { marginHorizontal: -20, marginTop: 8 },
  slide: { paddingTop: PLANET * 0.6, paddingBottom: 32 },
  slideIdle: { opacity: 0.7, transform: [{ scale: 0.9 }] },
  planetWrap: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    paddingTop: PLANET * 0.45,
    paddingHorizontal: 20,
    paddingBottom: 44,
    minHeight: 250,
    gap: 6,
    overflow: 'hidden',
    ...shadow,
  },
  cardIdle: { backgroundColor: '#D9D5FF' },
  number: {
    position: 'absolute',
    right: 10,
    top: PLANET * 0.3,
    fontSize: 128,
    lineHeight: 140,
    fontFamily: fonts.black,
    color: colors.inkFaint,
  },
  cardTitle: { fontSize: 24, lineHeight: 30, fontFamily: fonts.bold, color: colors.ink },
  cardMeta: { fontSize: 12, fontFamily: fonts.semibold, color: '#0E7A4D' },
  cardDesc: { fontSize: 13, lineHeight: 20, fontFamily: fonts.regular, color: colors.inkMuted },
  go: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    borderWidth: 5,
    borderColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  note: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 18,
    gap: 12,
  },
  noteText: { fontSize: 15, lineHeight: 22, fontFamily: fonts.regular, color: colors.text },
  child: { gap: 10 },
  childName: { fontSize: 16, fontFamily: fonts.bold, color: colors.primary },
});
