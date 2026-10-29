import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { recommend } from '@/lib/onboarding/recommend';
import { useOnboarding } from '@/lib/onboarding/store';
import { AnimatedBar, PressableScale, Reveal, Skeleton } from '@/components/motion';
import { Button } from '@/components/Button';
import { CourseStrip } from '@/components/home/CourseStrip';
import { MascotBubble } from '@/components/home/MascotBubble';
import { Ring } from '@/components/Ring';
import { Screen } from '@/components/Screen';
import { useAsync } from '@/components/useAsync';
import { getCourses, getStats, getSubscriptions } from '@/lib/api';
import { useAuth } from '@/lib/auth/AuthProvider';
import { IAP_ENABLED } from '@/lib/iap/service';
import { lessonsText, plural } from '@/lib/plural';
import { minutesToday } from '@/lib/study/metrics';
import { useStudy } from '@/lib/study/store';
import { useCourseProgress } from '@/lib/study/useCourseProgress';
import type { Course } from '@/lib/types';
import { colors } from '@/theme';
import { useSkin, calm, makeStyles } from '@/theme/skin';

/** Головна: перший екран відповідає на питання «що робити зараз?» — для учня, батьків і гостя по-різному. */
export default function Home() {
  useSkin(); // перерендер при зміні вигляду
  const { status, user } = useAuth();
  const [reload, setReload] = useState(0);
  const courses = useAsync<Course[]>(getCourses, [], [reload]);
  const firstName = user?.name.split(' ')[0];
  // Потягнути вниз: перезавантажуємо дані (useAsync не віддає проміс, тож коротка пауза для індикатора)
  const refresh = () => {
    setReload((n) => n + 1);
    return new Promise((r) => setTimeout(r, 700));
  };

  return (
    <Screen onRefresh={refresh}>
      {user?.role === 'student' ? (
        <StudentHome name={firstName} reload={reload} />
      ) : user?.role === 'parent' ? (
        <ParentHome name={firstName} reload={reload} />
      ) : status === 'loading' ? null : (
        <GuestHome courses={courses} />
      )}
      <CourseStrip courses={courses} />
    </Screen>
  );
}

function Hello({ name, right }: { name?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.hello}>
      <Text style={styles.hi} accessibilityRole="header">{calm(name ? `Привіт, ${name}!` : 'Привіт!')}</Text>
      {right}
    </View>
  );
}

/** Учень: продовжити урок, ціль на день, швидкі дії. */
function StudentHome({ name, reload }: { name?: string; reload: number }) {
  const course = useCourseProgress(reload);
  const study = useStudy();
  const mins = minutesToday(study);
  const goal = study.settings.dailyGoalMin;
  const openTasks = study.tasks.filter((t) => !t.done).length;
  const streak = course.stats?.streak ?? 0;
  const done = course.lessonsTotal - course.lessonsLeft;
  const percent = course.lessonsTotal ? Math.round((done / course.lessonsTotal) * 100) : 0;
  const next = course.next[0];

  return (
    <>
      <Reveal index={0}>
      <Hello
        name={name}
        right={
          <View style={styles.chip} accessible accessibilityLabel={`Серія: ${streak} ${plural(streak, 'день', 'дні', 'днів')} поспіль`}>
            <Ionicons name="flame" size={18} color={streak > 0 ? colors.warm : colors.muted} />
            <Text style={styles.chipT}>{streak}</Text>
          </View>
        }
      />
      <MascotBubble
        happy={streak > 0}
        text={streak > 0 ? `Ти вже ${streak} ${plural(streak, 'день', 'дні', 'днів')} поспіль. Так тримати!` : 'Готовий до нового уроку? Почнемо!'}
      />
      </Reveal>

      <Reveal index={1}>
      {course.courseSlug ? (
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Продовжити</Text>
          <Text style={styles.heroTitle}>{course.courseTitle}</Text>
          <Text style={styles.muted}>{next ? `Урок ${next.order}: ${next.title}` : 'Усі доступні уроки пройдено'}</Text>
          <View accessible accessibilityRole="progressbar" accessibilityLabel="Прогрес курсу" accessibilityValue={{ min: 0, max: 100, now: percent }} style={styles.bar}>
            <AnimatedBar progress={percent / 100} />
          </View>
          <Text style={styles.small}>{done} з {course.lessonsTotal} уроків · {percent}%</Text>
          <Button label={next ? 'Продовжити урок' : 'Відкрити курс'} onPress={() => router.push({ pathname: '/course/[id]', params: { id: course.courseSlug! } })} />
        </View>
      ) : (
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Обери перший курс</Text>
          <Text style={styles.muted}>Перші уроки безкоштовні — можна спробувати просто зараз.</Text>
          <Button label="Обрати курс" onPress={() => router.push('/courses')} />
          <Button variant="outline" label="Підібрати курс за хвилину" onPress={() => router.push('/onboarding')} />
        </View>
      )}
      </Reveal>

      <Reveal index={2}>
      <View style={styles.today}>
        <Ring size={64} stroke={7} progress={mins / goal}>
          <Text style={styles.ringV}>{mins}</Text>
        </Ring>
        <View style={styles.todayBody}>
          <Text style={styles.todayT}>{calm(mins >= goal ? 'Ціль на день виконано!' : `Сьогодні: ${mins} з ${goal} хв`)}</Text>
          <Text style={styles.small}>{openTasks > 0 ? `${openTasks} ${plural(openTasks, 'задача', 'задачі', 'задач')} чекає` : 'Задач немає'}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Відкрити таймер" onPress={() => router.push('/timer')} style={styles.timerBtn}>
          <Ionicons name="timer-outline" size={22} color={colors.onAction} />
        </Pressable>
      </View>
      </Reveal>

      <Reveal index={3}>
      <View style={styles.tiles}>
        <Tile icon="checkbox-outline" label="Мої задачі" onPress={() => router.push('/today')} />
        <Tile icon="stats-chart-outline" label="Статистика" onPress={() => router.push('/analytics')} />
        <Tile icon="book-outline" label="Усі курси" onPress={() => router.push('/courses')} />
      </View>
      </Reveal>
    </>
  );
}

/** Батьки: картка кожної дитини з тим, що потребує уваги. */
function ParentHome({ name, reload }: { name?: string; reload: number }) {
  const kids = useAsync(getStats, null, [reload]);
  const subs = useAsync(getSubscriptions, [], [reload]);
  const list = kids ?? [];

  return (
    <>
      <Reveal index={0}>
      <Hello name={name} />
      <MascotBubble happy={list.some((k) => k.stats.streak > 0)} text={list.length ? 'Ось як вчаться ваші діти цього тижня.' : 'Привіт! Я стежитиму за навчанням ваших дітей і покажу головне.'} />
      </Reveal>

      {kids === null && <Skeleton style={styles.skeleton} />}
      {kids && list.length === 0 && (
        <View style={styles.hero}>
          <Ionicons name="people" size={28} color={colors.text} />
          <Text style={styles.heroTitle}>Ще немає профілів дітей</Text>
          <Text style={styles.muted}>Профіль дитини створюється в кабінеті батьків на сайті ITCodeCraft. Після цього дитина входить у застосунок за логіном, який ви їй створили.</Text>
        </View>
      )}
      {list.map((k, i) => {
        const days = k.stats.week.filter((d) => d.active).length;
        const sub = subs.find((s) => s.childId === k.id && s.needsCourse);
        const trouble = subs.find((s) => s.childId === k.id && s.status === 'past_due');
        return (
          <Reveal key={k.id} index={i + 1}>
          <View style={styles.hero}>
            <View style={styles.kidHead}>
              <Text style={styles.heroTitle}>{k.name}</Text>
              <View style={styles.chip}>
                <Ionicons name="flame" size={16} color={k.stats.streak > 0 ? colors.warm : colors.muted} />
                <Text style={styles.chipT}>{k.stats.streak}</Text>
              </View>
            </View>
            <Text style={styles.muted}>
              {days} з 7 днів із навчанням · {lessonsText(k.stats.lessonsThisWeek)} за тиждень · рівень {k.stats.level.level}
            </Text>
            {k.stats.currentCourse && <Text style={styles.small}>Зараз проходить: {k.stats.currentCourse.title}</Text>}
            {sub && <Alert text="Оберіть курс, який відкриє тариф" action="Обрати" onPress={() => router.push({ pathname: '/choose-course', params: { subscriptionId: sub.id, child: k.name } })} />}
            {trouble && <Alert text="Проблема з оплатою підписки" action={IAP_ENABLED ? 'Тарифи' : undefined} onPress={() => router.push('/plans')} />}
            <Pressable accessibilityRole="button" onPress={() => router.push('/profile')} style={styles.more}>
              <Text style={styles.moreT}>Докладна статистика</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text} />
            </Pressable>
          </View>
          </Reveal>
        );
      })}
      {IAP_ENABLED && list.length > 0 && <Button variant="outline" label="Тарифи й підписка" onPress={() => router.push('/plans')} />}
    </>
  );
}

/** Гість: чому варто спробувати й що робити першим. */
function GuestHome({ courses }: { courses: Course[] }) {
  const ob = useOnboarding();
  const pick = ob.status === 'done' ? recommend(ob.answers ?? {}, courses, 1)[0] : undefined;
  const kid = ob.answers?.who === 'child';
  return (
    <>
      <Reveal index={0}>
        <Hello />
        <MascotBubble happy text="Я допоможу вчитись програмувати граючись!" />
      </Reveal>
      <Reveal index={1}>
        {pick ? (
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>{kid ? 'Підібрано для дитини' : 'Підібрано для тебе'}</Text>
            <Text style={styles.heroTitle}>{pick.course.title}</Text>
            <Text style={styles.muted}>{pick.course.age} років · {lessonsText(pick.course.lessons)}. Перші 2 уроки безкоштовно.</Text>
            <Button label="Відкрити курс" onPress={() => router.push({ pathname: '/course/[id]', params: { id: pick.course.id } })} />
            <Button variant="outline" label="Підібрати інший" onPress={() => router.push('/onboarding')} />
          </View>
        ) : (
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Вчимося програмувати граючись</Text>
            <Text style={styles.muted}>Короткі уроки, тести й домашки. Перші 2 уроки кожного курсу — безкоштовно.</Text>
            <Button label="Підібрати курс за хвилину" onPress={() => router.push('/onboarding')} />
            <Button variant="outline" label="Увійти" onPress={() => router.push('/sign-in')} />
          </View>
        )}
      </Reveal>
      <Reveal index={2}>
      <View style={styles.steps}>
        {[
          ['search-outline', 'Оберіть курс'],
          ['play-circle-outline', 'Проходьте уроки'],
          ['trophy-outline', 'Отримуйте XP й бейджі'],
        ].map(([icon, label], i) => (
          <View key={label} style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name={icon as 'search-outline'} size={22} color={colors.text} />
            </View>
            <Text style={styles.stepT}>{i + 1}. {label}</Text>
          </View>
        ))}
      </View>
      </Reveal>
    </>
  );
}

function Tile({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <PressableScale accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.tile}>
      <Ionicons name={icon} size={24} color={colors.text} />
      <Text style={styles.tileT}>{label}</Text>
    </PressableScale>
  );
}

function Alert({ text, action, onPress }: { text: string; action?: string; onPress: () => void }) {
  return (
    <View style={styles.alert}>
      <Ionicons name="alert-circle" size={20} color={colors.text} />
      <Text style={styles.alertT}>{text}</Text>
      {action && (
        <Pressable accessibilityRole="button" onPress={onPress} style={styles.alertBtn}>
          <Text style={styles.alertBtnT}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}


const styles = makeStyles((t) => {
  const glass = { backgroundColor: colors.glass, ...t.glassBorder, } as const;
  return StyleSheet.create({
    hello: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    hi: { fontSize: 28, fontFamily: t.fonts.black, color: colors.text },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.card, ...t.glassBorder, },
    chipT: { fontFamily: t.fonts.black, fontSize: 15, color: colors.text },
    hero: { ...glass, gap: 8, borderRadius: t.radius.lg, padding: 18 },
    skeleton: { minHeight: 130, borderRadius: t.radius.lg },
    heroLabel: { fontFamily: t.fonts.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted },
    heroTitle: { fontFamily: t.fonts.black, fontSize: 24, lineHeight: 28, color: colors.text },
    muted: { fontFamily: t.fonts.regular, fontSize: 15, lineHeight: 20, color: colors.muted },
    small: { fontFamily: t.fonts.regular, fontSize: 13, color: colors.muted },
    bar: { marginTop: 4 },
    today: { ...glass, flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: t.radius.lg, padding: 14 },
    ringV: { fontFamily: t.fonts.black, fontSize: 16, color: colors.text },
    todayBody: { flex: 1, gap: 2 },
    todayT: { fontFamily: t.fonts.bold, fontSize: 15, color: colors.text },
    timerBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.action, alignItems: 'center', justifyContent: 'center' },
    tiles: { flexDirection: 'row', gap: 10 },
    tile: { ...glass, flex: 1, minHeight: 84, alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: t.radius.md, padding: 8 },
    tileT: { fontFamily: t.fonts.semibold, fontSize: 13, color: colors.text, textAlign: 'center' },
    kidHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    more: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
    moreT: { fontFamily: t.fonts.semibold, fontSize: 15, color: colors.text },
    alert: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,138,76,0.28)', borderRadius: t.radius.sm, padding: 10 },
    alertT: { flex: 1, fontFamily: t.fonts.semibold, fontSize: 13, color: colors.text },
    alertBtn: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.action },
    alertBtnT: { fontFamily: t.fonts.bold, fontSize: 13, color: colors.onAction },
    steps: { gap: 10 },
    step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    stepIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, ...t.glassBorder, alignItems: 'center', justifyContent: 'center' },
    stepT: { fontFamily: t.fonts.semibold, fontSize: 15, color: colors.text },
  });
});
