import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ring } from '@/components/Ring';
import { Screen, sectionTitle } from '@/components/Screen';
import { mockQuizzes, reviewQuiz } from '@/data/quizzes';
import { forecastCompletion, minutesToday, quizAccuracy } from '@/lib/study/metrics';
import { study, useStudy } from '@/lib/study/store';
import { useCourseProgress } from '@/lib/study/useCourseProgress';
import { colors, fonts, radius } from '@/theme';

const dateFmt = new Intl.DateTimeFormat('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' });

export default function Today() {
  const s = useStudy();
  const course = useCourseProgress();
  const [draft, setDraft] = useState('');

  const dueReview = reviewQuiz(s.mistakes)?.questions.length ?? 0;
  const mins = minutesToday(s);
  const goal = s.settings.dailyGoalMin;
  const open = s.tasks.filter((t) => !t.done);
  const done = s.tasks.filter((t) => t.done);
  const total = open.length + done.length + course.next.length;
  const forecast = course.courseSlug
    ? forecastCompletion(course.lessonsLeft, course.stats?.lessonsThisWeek ?? 0, quizAccuracy(s))
    : { date: null, lessonsLeft: 0, pace: 0, note: 'Почніть курс — і зʼявиться прогноз' };

  const add = () => {
    if (!draft.trim()) return;
    study.addTask(draft, course.courseSlug ?? undefined);
    setDraft('');
  };

  return (
    <Screen title="Сьогодні">
      <Text style={styles.date}>{dateFmt.format(new Date())}</Text>

      <View style={styles.card}>
        <Ring size={96} stroke={9} progress={mins / goal}>
          <Text style={styles.ringV}>{mins}</Text>
          <Text style={styles.ringL}>хв</Text>
        </Ring>
        <View style={styles.cardBody}>
          <Text style={styles.cardT}>{mins >= goal ? 'Ціль на день виконано!' : `Ціль: ${goal} хв навчання`}</Text>
          <Text style={styles.muted}>
            {done.length} з {total} задач виконано
          </Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/timer')} style={styles.cta}>
            <Ionicons name="timer-outline" size={18} color={colors.onPrimary} />
            <Text style={styles.ctaT}>Таймер</Text>
          </Pressable>
        </View>
      </View>

      <Text style={sectionTitle}>Мої задачі</Text>
      <View style={styles.addRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={add}
          returnKeyType="done"
          placeholder="Нова задача…"
          placeholderTextColor={colors.muted}
          accessibilityLabel="Нова задача"
          style={styles.input}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Додати задачу" onPress={add} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={colors.onPrimary} />
        </Pressable>
      </View>

      {course.next.map((l) => (
        <Pressable
          key={l.order}
          accessibilityRole="button"
          onPress={() => course.courseSlug && router.push({ pathname: '/course/[id]', params: { id: course.courseSlug } })}
          style={styles.task}>
          <Ionicons name="book-outline" size={22} color={colors.primary} />
          <View style={styles.taskBody}>
            <Text style={styles.taskT}>Урок {l.order}: {l.title}</Text>
            <Text style={styles.muted}>{course.courseTitle} · +{l.xp} XP</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      ))}

      {[...open, ...done].map((t) => (
        <View key={t.id} style={styles.task}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: t.done }}
            accessibilityLabel={t.title}
            onPress={() => study.toggleTask(t.id)}
            hitSlop={8}>
            <Ionicons name={t.done ? 'checkbox' : 'square-outline'} size={24} color={t.done ? colors.success : colors.primary} />
          </Pressable>
          <Text style={[styles.taskT, styles.taskBody, t.done && styles.struck]}>{t.title}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={`Видалити ${t.title}`} onPress={() => study.removeTask(t.id)} hitSlop={8}>
            <Ionicons name="close" size={18} color={colors.muted} />
          </Pressable>
        </View>
      ))}
      {total === 0 && <Text style={styles.muted}>Задач ще немає — додайте першу або почніть урок.</Text>}

      <Text style={sectionTitle}>Самоперевірка</Text>
      {dueReview > 0 && (
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/quiz/[id]', params: { id: 'review' } })} style={[styles.task, styles.review]}>
          <Ionicons name="refresh-circle-outline" size={24} color={colors.primary} />
          <View style={styles.taskBody}>
            <Text style={styles.taskT}>Повторити помилки</Text>
            <Text style={styles.muted}>{dueReview} питань чекають повторення</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      )}
      {mockQuizzes.map((q) => {
        const last = [...s.quizResults].reverse().find((r) => r.quizId === q.id);
        return (
          <Pressable key={q.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/quiz/[id]', params: { id: q.id } })} style={styles.task}>
            <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
            <View style={styles.taskBody}>
              <Text style={styles.taskT}>{q.title}</Text>
              <Text style={styles.muted}>
                {q.questions.length} питань{last ? ` · останній результат ${Math.round((last.correct / last.total) * 100)}%` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        );
      })}

      <Pressable accessibilityRole="button" onPress={() => router.push('/analytics')} style={styles.card}>
        <Ionicons name="trending-up" size={28} color={colors.primary} />
        <View style={styles.cardBody}>
          <Text style={styles.cardT}>
            {forecast.date ? `Курс завершите ≈ ${forecast.date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}` : 'Прогноз завершення курсу'}
          </Text>
          <Text style={styles.muted}>{forecast.note}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
    </Screen>
  );
}

const glass = { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border } as const;

const styles = StyleSheet.create({
  date: { fontFamily: fonts.regular, color: colors.muted, textTransform: 'capitalize', marginTop: -10 },
  card: { ...glass, flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: radius.lg, padding: 16 },
  cardBody: { flex: 1, gap: 4 },
  cardT: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  ringV: { fontFamily: fonts.black, fontSize: 24, color: colors.text, lineHeight: 28 },
  ringL: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 6, backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  ctaT: { fontFamily: fonts.bold, fontSize: 13, color: colors.onPrimary },
  addRow: { flexDirection: 'row', gap: 10 },
  input: { ...glass, flex: 1, height: 48, borderRadius: radius.md, paddingHorizontal: 16, color: colors.text, fontFamily: fonts.regular },
  addBtn: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  task: { ...glass, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.md, padding: 14, minHeight: 56 },
  taskBody: { flex: 1 },
  taskT: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  review: { borderColor: colors.primary },
  struck: { textDecorationLine: 'line-through', color: colors.muted },
});
