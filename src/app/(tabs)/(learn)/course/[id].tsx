import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { LessonPath } from '@/components/LessonPath';
import { Planet } from '@/components/Planet';
import { Screen } from '@/components/Screen';
import { useAsync } from '@/components/useAsync';
import { useAuth } from '@/lib/auth/AuthProvider';
import { getCourseDetail, getCourses } from '@/lib/api';
import type { Course } from '@/lib/types';
import { mockCourses } from '@/data/mock';
import { colors, fonts, light, radius } from '@/theme';

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const list = useAsync(getCourses, mockCourses);
  // Після входу стан уроків (відкрито/закрито) приходить уже для цього користувача
  const detail = useAsync(() => getCourseDetail(id), null, [id, user?.id]);
  const course = detail?.course ?? list.find((c) => c.id === id);
  const number = list.findIndex((c) => c.id === id) + 1;

  if (!course) {
    return (
      <Screen>
        <StatusBar style="light" />
        <BackButton />
        <Text style={styles.section}>Курс не знайдено</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar style="light" />
      <Hero course={course} number={number} />
      <View style={styles.stats}>
        <Stat value={String(course.lessons)} label="уроків" />
        <Stat value={String(course.freeLessons)} label="безкоштовні" />
        <Stat value={course.age} label="вік" />
      </View>

      {detail && !detail.comingSoon && (
        <StartBlock role={user?.role ?? null} freeLessons={course.freeLessons} />
      )}
      {detail?.comingSoon && <Note icon="time-outline" text="Курс скоро зʼявиться." />}

      {detail && detail.lessons.length > 0 && (
        <>
          <Text style={styles.section}>Твій шлях</Text>
          <LessonPath lessons={detail.lessons} />
        </>
      )}
    </Screen>
  );
}

function BackButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Назад"
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={styles.back}>
      <Ionicons name="arrow-back" size={26} color={light.text} />
    </Pressable>
  );
}

/** Шапка: велика «планета» праворуч, бліда цифра курсу, назва й опис. */
function Hero({ course, number }: { course: Course; number: number }) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroPlanet} pointerEvents="none">
        <Planet course={course} size={230} />
      </View>
      <BackButton />
      {number > 0 && <Text style={styles.number} accessible={false}>{number}</Text>}
      <View style={styles.heroText}>
        <Text style={styles.title} accessibilityRole="header">{course.title}</Text>
        <Text style={styles.desc}>
          <Text style={styles.highlight}>{course.category}</Text> · {course.age} років. {course.description}
        </Text>
      </View>
    </View>
  );
}

/** Гість бачить усі теми, а вхід просимо, коли він вирішив почати навчання. */
function StartBlock({ role, freeLessons }: { role: 'parent' | 'student' | null; freeLessons: number }) {
  if (!role) {
    return (
      <View style={styles.cta}>
        <Button label="Почати курс" onPress={() => router.push('/sign-in')} />
        <Text style={styles.ctaHint}>Перші {freeLessons} уроки безкоштовні. Для початку потрібно увійти.</Text>
      </View>
    );
  }
  if (role === 'parent') {
    return <Note icon="people-outline" text="Уроки проходить дитина зі свого акаунта. Підписку оформлюють батьки." />;
  }
  return <Note icon="checkmark-circle-outline" text={`Перші ${freeLessons} уроки безкоштовні. Закриті теми відкриються з підпискою, яку оформлюють батьки.`} />;
}

function Note({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={styles.note}>
      <Ionicons name={icon} size={22} color={colors.text} />
      <Text style={styles.noteText}>{text}</Text>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statV}>{value}</Text>
      <Text style={styles.statL} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
    </View>
  );
}

const card = { backgroundColor: light.card, borderRadius: radius.md, borderWidth: 1, borderColor: light.border } as const;

const styles = StyleSheet.create({
  back: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  hero: { minHeight: 330, justifyContent: 'space-between' },
  heroPlanet: { position: 'absolute', top: -20, right: -70 },
  number: {
    position: 'absolute',
    left: -4,
    top: 90,
    fontSize: 170,
    lineHeight: 190,
    fontFamily: fonts.black,
    color: 'rgba(255,255,255,0.14)',
  },
  heroText: { gap: 10, marginTop: 150 },
  title: { fontSize: 34, lineHeight: 40, fontFamily: fonts.black, color: light.text },
  desc: { fontSize: 15, lineHeight: 24, fontFamily: fonts.regular, color: light.muted },
  highlight: { fontFamily: fonts.bold, color: light.accent },
  section: { fontSize: 20, fontFamily: fonts.bold, color: light.text },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { ...card, flex: 1, padding: 14, alignItems: 'center' },
  statV: { fontSize: 20, fontFamily: fonts.black, color: colors.text },
  statL: { fontSize: 12, fontFamily: fonts.regular, color: light.muted, marginTop: 2 },
  cta: { gap: 8 },
  ctaHint: { fontSize: 12, fontFamily: fonts.regular, color: light.muted, textAlign: 'center' },
  note: { ...card, flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 16 },
  noteText: { flex: 1, fontFamily: fonts.regular, color: light.muted, lineHeight: 21 },
});
