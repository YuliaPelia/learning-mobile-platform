import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pill } from '@/components/Pill';
import { Screen, sectionTitle } from '@/components/Screen';
import { StatsCard } from '@/components/StatsCard';
import { useAsync } from '@/components/useAsync';
import { getCourses, getStats } from '@/lib/api';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Course, StudentProgress, User } from '@/lib/types';
import { mockCourses } from '@/data/mock';
import { colors, radius, tints } from '@/theme';

const openCourse = (id: string) => router.push({ pathname: '/course/[id]', params: { id } });

function greeting(hour: number) {
  if (hour < 5) return 'Доброї ночі';
  if (hour < 12) return 'Доброго ранку';
  if (hour < 18) return 'Добрий день';
  return 'Добрий вечір';
}

export default function Home() {
  const { user } = useAuth();
  const courses = useAsync(getCourses, mockCourses);
  const students = useAsync(() => (user ? getStats() : Promise.resolve(null)), null, [user?.id]);

  const now = new Date();
  const date = now.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' });
  const firstName = user?.name.split(' ')[0];

  // Учень продовжує свій поточний курс, решта бачить перший курс каталогу
  const currentSlug = user?.role === 'student' ? students?.[0]?.stats.currentCourse?.slug : undefined;
  const featured = courses.find((c) => c.id === currentSlug) ?? courses[0];
  const others = courses.filter((c) => c !== featured).slice(0, 2);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.brand}>ITCodeCraft</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Профіль" onPress={() => router.push('/profile')} style={styles.avatar}>
          {firstName ? (
            <Text style={styles.avatarText}>{firstName[0]}</Text>
          ) : (
            <Ionicons name="person" size={18} color={colors.onPrimary} />
          )}
        </Pressable>
      </View>
      <View style={styles.greet}>
        <Text style={styles.hi}>
          {greeting(now.getHours())}
          {firstName ? `, ${firstName}` : ''}
        </Text>
        <Text style={styles.date}>{date.charAt(0).toUpperCase() + date.slice(1)}</Text>
      </View>

      {featured && (
        <>
          <Text style={sectionTitle}>Сьогодні</Text>
          <View style={styles.focus}>
            <FocusCard course={featured} continuing={featured.id === currentSlug} />
            <View style={styles.focusSide}>
              {others.map((c) => <SmallCard key={c.id} course={c} />)}
            </View>
          </View>
        </>
      )}

      <Progress user={user} students={students} />

      <View style={styles.sectionRow}>
        <Text style={sectionTitle}>Курси</Text>
        <Pressable accessibilityRole="link" onPress={() => router.push('/courses')} hitSlop={12}>
          <Text style={styles.viewAll}>Усі</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats} style={styles.catsScroll}>
        {courses.map((c) => (
          <Pressable key={c.id} accessibilityRole="button" accessibilityLabel={c.title} onPress={() => openCourse(c.id)} style={styles.cat}>
            <Ionicons name={c.icon} size={26} color={tints[c.gradient].fg} />
            <Text style={styles.catText} numberOfLines={1}>{c.category}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

/** Статистика: учень бачить себе, батьки — кожну дитину. */
function Progress({ user, students }: { user: User | null; students: StudentProgress[] | null }) {
  if (!user) {
    return (
      <>
        <Text style={sectionTitle}>Твій прогрес</Text>
        <View style={styles.guest}>
          <Ionicons name="stats-chart" size={26} color={colors.primary} />
          <Text style={styles.guestText}>Увійдіть, щоб бачити серію днів, рівень, XP і бейджі.</Text>
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
        <View style={styles.guest}>
          <Ionicons name="people" size={26} color={colors.primary} />
          <Text style={styles.guestText}>Додайте профіль дитини на сайті itcodecraft.tech — тут зʼявиться її прогрес.</Text>
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

function Thumb({ course, size }: { course: Course; size: number }) {
  const box = { width: size, height: size, borderRadius: radius.sm };
  return course.image ? (
    <Image source={course.image} style={box} />
  ) : (
    <View style={[box, styles.thumb]}>
      <Ionicons name={course.icon} size={size * 0.5} color={colors.primaryDark} />
    </View>
  );
}

function FocusCard({ course, continuing }: { course: Course; continuing: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={course.title} onPress={() => openCourse(course.id)} style={[styles.paper, styles.focusMain]}>
      <View style={styles.focusTop}>
        <Thumb course={course} size={56} />
        <Text style={styles.paperMeta}>{course.lessons} уроків</Text>
      </View>
      <View style={styles.focusBody}>
        <Text style={styles.paperTitle} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.paperSub} numberOfLines={1}>{course.category} · {course.age} років</Text>
      </View>
      <View style={styles.play}>
        <View style={styles.playBtn}>
          <Ionicons name="play" size={18} color={colors.onPrimary} />
        </View>
        <Text style={styles.playText}>{continuing ? 'ПРОДОВЖИТИ' : `${course.freeLessons} УРОКИ БЕЗКОШТОВНО`}</Text>
      </View>
    </Pressable>
  );
}

function SmallCard({ course }: { course: Course }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={course.title} onPress={() => openCourse(course.id)} style={[styles.paper, styles.small]}>
      <Text style={styles.smallTitle} numberOfLines={2}>{course.title}</Text>
      <View style={styles.smallBottom}>
        <Text style={styles.paperMeta}>{course.lessons} уроків</Text>
        <Ionicons name={course.icon} size={26} color={colors.primaryDark} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: colors.onPrimary },
  greet: { gap: 4, marginTop: -6 },
  hi: { fontSize: 22, fontWeight: '700', color: colors.text },
  date: { fontSize: 14, color: colors.muted },
  focus: { flexDirection: 'row', gap: 12 },
  focusSide: { flex: 1, gap: 12 },
  paper: { backgroundColor: colors.paper, borderRadius: radius.md, padding: 14 },
  focusMain: { flex: 1.35, gap: 12, minHeight: 220 },
  focusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  focusBody: { flex: 1, gap: 4 },
  thumb: { backgroundColor: '#E6E1FF', alignItems: 'center', justifyContent: 'center' },
  paperTitle: { fontSize: 19, fontWeight: '800', color: colors.ink },
  paperSub: { fontSize: 13, color: colors.inkMuted },
  paperMeta: { fontSize: 13, fontWeight: '600', color: colors.inkMuted },
  play: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  playBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  playText: { flex: 1, fontSize: 12, fontWeight: '700', color: colors.ink },
  small: { flex: 1, justifyContent: 'space-between', gap: 8 },
  smallTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  smallBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  guest: {
    backgroundColor: 'rgba(22,19,58,0.55)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 18,
    gap: 12,
  },
  guestText: { fontSize: 15, lineHeight: 21, color: colors.text },
  child: { gap: 10 },
  childName: { fontSize: 16, fontWeight: '700', color: colors.primary },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  viewAll: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  catsScroll: { marginHorizontal: -20 },
  cats: { gap: 10, paddingHorizontal: 20 },
  cat: {
    width: 104,
    height: 96,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 8,
  },
  catText: { fontSize: 13, fontWeight: '600', color: colors.text },
});
