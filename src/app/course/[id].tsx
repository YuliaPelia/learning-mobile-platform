import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { GradientCard } from '@/components/GradientCard';
import { Screen, sectionTitle } from '@/components/Screen';
import { useAsync } from '@/components/useAsync';
import { useAuth } from '@/lib/auth/AuthProvider';
import { getCourseDetail, getCourses } from '@/lib/api';
import type { Course, Lesson } from '@/lib/types';
import { mockCourses } from '@/data/mock';
import { colors, radius } from '@/theme';

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const list = useAsync(getCourses, mockCourses);
  // Після входу стан уроків (відкрито/закрито) приходить уже для цього користувача
  const detail = useAsync(() => getCourseDetail(id), null, [id, user?.id]);
  const course = detail?.course ?? list.find((c) => c.id === id);

  if (!course) {
    return (
      <Screen>
        <BackButton />
        <Text style={sectionTitle}>Курс не знайдено</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackButton />
      <Hero course={course} />
      <View style={styles.stats}>
        <Stat value={String(course.lessons)} label="уроків" />
        <Stat value={String(course.freeLessons)} label="безкоштовні" />
        <Stat value={course.age} label="вік" />
      </View>
      <Text style={sectionTitle}>Про курс</Text>
      <Text style={styles.desc}>{course.description}</Text>

      {detail && !detail.comingSoon && (
        <StartBlock role={user?.role ?? null} freeLessons={course.freeLessons} />
      )}
      {detail?.comingSoon && <Note icon="time-outline" text="Курс скоро зʼявиться." />}

      {detail && detail.lessons.length > 0 && (
        <>
          <Text style={sectionTitle}>Теми курсу</Text>
          <View style={styles.lessons}>
            {detail.lessons.map((l) => <LessonRow key={l.order} lesson={l} />)}
          </View>
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
      <Ionicons name="chevron-back" size={22} color={colors.text} />
    </Pressable>
  );
}

/** Обкладинка курсу: картинка, якщо вона є, інакше градієнт з іконкою. */
function Hero({ course }: { course: Course }) {
  // Підпис під картинкою, а не поверх неї: на обкладинках буває свій текст чи логотип
  if (course.image) {
    return (
      <View style={styles.cover}>
        <Image source={course.image} style={styles.coverImage} resizeMode="cover" />
        <View style={styles.coverCaption}>
          <Text style={[styles.title, styles.coverTitle]}>{course.title}</Text>
          <Text style={[styles.meta, styles.coverMeta]}>{course.category} · {course.age} років</Text>
        </View>
      </View>
    );
  }
  return (
    <GradientCard name="hero" style={styles.hero}>
      <View style={styles.icon}>
        <Ionicons name={course.icon} size={28} color="#fff" />
      </View>
      <Text style={styles.title}>{course.title}</Text>
      <Text style={styles.meta}>{course.category} · {course.age} років</Text>
    </GradientCard>
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
    return <Note icon="people-outline" text="Уроки проходить дитина зі свого акаунта. Підписка й оплата доступні на сайті itcodecraft.tech." />;
  }
  return <Note icon="checkmark-circle-outline" text={`Перші ${freeLessons} уроки безкоштовні. Закриті теми відкриються з підпискою, яку оформлюють батьки на сайті.`} />;
}

const LESSON_STATE: Record<Lesson['access'], { icon: 'lock-closed' | 'lock-open-outline'; hint: string | null }> = {
  ok: { icon: 'lock-open-outline', hint: null },
  coming_soon: { icon: 'lock-closed', hint: 'Скоро' },
  locked_sequence: { icon: 'lock-closed', hint: 'Після попереднього уроку' },
  needs_subscription: { icon: 'lock-closed', hint: 'Потрібна підписка' },
  login_required: { icon: 'lock-closed', hint: null },
  student_only: { icon: 'lock-closed', hint: null },
};

function LessonRow({ lesson }: { lesson: Lesson }) {
  const state = LESSON_STATE[lesson.access];
  const open = lesson.access === 'ok';
  return (
    <View style={styles.lesson}>
      <View style={[styles.num, lesson.done && styles.numDone]}>
        {lesson.done ? <Ionicons name="checkmark" size={16} color={colors.onPrimary} /> : <Text style={styles.numText}>{lesson.order}</Text>}
      </View>
      <View style={styles.lessonBody}>
        <Text style={styles.lessonTitle} numberOfLines={2}>{lesson.title}</Text>
        {(state.hint || lesson.summary) && <Text style={styles.lessonMeta} numberOfLines={1}>{state.hint ?? lesson.summary}</Text>}
      </View>
      {lesson.free && <Text style={styles.free}>Безкоштовно</Text>}
      {!open && <Ionicons name={state.icon} size={16} color={colors.muted} accessibilityLabel="Урок закритий" />}
    </View>
  );
}

function Note({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={styles.note}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.noteText}>{text}</Text>
    </View>
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
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { minHeight: 170, gap: 6, justifyContent: 'flex-end' },
  cover: { backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  coverImage: { width: '100%', height: 190 },
  coverCaption: { padding: 16, gap: 4 },
  coverTitle: { color: colors.text },
  coverMeta: { color: colors.muted },
  icon: {
    position: 'absolute',
    top: 18,
    left: 18,
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  meta: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  desc: { fontSize: 15, lineHeight: 23, color: colors.muted },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statV: { fontSize: 20, fontWeight: '700', color: colors.primary },
  statL: { fontSize: 12, color: colors.muted, marginTop: 2 },
  cta: { gap: 8 },
  ctaHint: { fontSize: 12, color: colors.muted, textAlign: 'center' },
  note: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: colors.card, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border },
  noteText: { flex: 1, color: colors.muted, lineHeight: 20 },
  lessons: { gap: 10 },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: colors.border },
  num: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  numDone: { backgroundColor: colors.success },
  numText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  lessonBody: { flex: 1, gap: 2 },
  lessonTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  lessonMeta: { color: colors.muted, fontSize: 12 },
  free: { color: colors.success, fontSize: 11, fontWeight: '700' },
});
