import { StyleSheet, Text, View } from 'react-native';
import { Ring } from '@/components/Ring';
import { Screen, sectionTitle } from '@/components/Screen';
import { forecastCompletion, minutesByDay, quizAccuracy } from '@/lib/study/metrics';
import { achievements, bonusXp, goalStreak } from '@/lib/study/rewards';
import { useStudy } from '@/lib/study/store';
import { Ionicons } from '@expo/vector-icons';
import { useCourseProgress } from '@/lib/study/useCourseProgress';
import { colors, fonts, radius } from '@/theme';

const WD = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export default function Analytics() {
  const s = useStudy();
  const course = useCourseProgress();
  const days = minutesByDay(s);
  const max = Math.max(s.settings.dailyGoalMin, ...days.map((d) => d.minutes));
  const week = days.reduce((sum, d) => sum + d.minutes, 0);
  const acc = quizAccuracy(s);
  const forecast = course.courseSlug
    ? forecastCompletion(course.lessonsLeft, course.stats?.lessonsThisWeek ?? 0, acc)
    : { date: null, lessonsLeft: 0, pace: 0, note: 'Почніть курс — і зʼявиться прогноз' };
  const weak = Object.entries(s.topics)
    .filter(([, t]) => t.total > 0)
    .sort(([, a], [, b]) => a.correct / a.total - b.correct / b.total)
    .slice(0, 4);
  const donePct = course.lessonsTotal ? (course.lessonsTotal - course.lessonsLeft) / course.lessonsTotal : 0;

  return (
    <Screen back title="Статистика">
      <View style={styles.card}>
        <Ring size={96} stroke={9} progress={donePct}>
          <Text style={styles.ringV}>{Math.round(donePct * 100)}%</Text>
        </Ring>
        <View style={styles.body}>
          <Text style={styles.cardT}>{course.courseTitle ?? 'Курс не обрано'}</Text>
          <Text style={styles.muted}>
            {course.lessonsTotal ? `Залишилось уроків: ${course.lessonsLeft}` : 'Увійдіть як учень і почніть курс'}
          </Text>
          <Text style={styles.forecast}>
            {forecast.date ? `≈ ${forecast.date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}` : forecast.note}
          </Text>
        </View>
      </View>
      {forecast.date && <Text style={styles.muted}>{forecast.note}. Прогноз орієнтовний і змінюється разом з вашим темпом.</Text>}

      <Text style={sectionTitle}>Час навчання · {week} хв за тиждень</Text>
      <View style={[styles.card, styles.chart]}>
        {days.map((d) => (
          <View key={d.day} style={styles.col}>
            <View style={styles.track}>
              <View style={[styles.fill, { height: `${(d.minutes / max) * 100}%` }]} />
            </View>
            <Text style={styles.muted}>{WD[new Date(d.day).getDay()]}</Text>
          </View>
        ))}
      </View>

      <Text style={sectionTitle}>Слабкі теми</Text>
      {weak.length === 0 ? (
        <Text style={styles.muted}>Пройдіть квіз — тут зʼявляться теми, які варто повторити.</Text>
      ) : (
        weak.map(([topic, t]) => (
          <View key={topic} style={styles.topic}>
            <Text style={styles.topicT}>{topic}</Text>
            <View style={styles.topicBar}>
              <View style={[styles.fill2, { width: `${(t.correct / t.total) * 100}%` }, t.correct / t.total < 0.6 && { backgroundColor: colors.danger }]} />
            </View>
            <Text style={styles.muted}>{Math.round((t.correct / t.total) * 100)}%</Text>
          </View>
        ))
      )}

      <Text style={sectionTitle}>Нагороди · +{bonusXp(s)} XP · ціль {goalStreak(s)} дн. поспіль</Text>
      <View style={styles.badges}>
        {achievements(s).map((a) => (
          <View key={a.id} style={[styles.badge, !a.earned && styles.locked]} accessible accessibilityLabel={`${a.title}. ${a.earned ? 'Отримано' : a.hint}`}>
            <Ionicons name={a.earned ? 'trophy' : 'lock-closed'} size={18} color={a.earned ? colors.primary : colors.muted} />
            <Text style={styles.badgeT}>{a.title}</Text>
            {!a.earned && <Text style={styles.muted}>{a.hint}</Text>}
          </View>
        ))}
      </View>

      <Text style={sectionTitle}>Квізи</Text>
      <View style={styles.tiles}>
        <Tile value={acc === null ? '—' : `${Math.round(acc * 100)}%`} label="успішність" />
        <Tile value={String(s.quizResults.length)} label="спроб" />
        <Tile value={String(s.sessions.length)} label="сесій фокусу" />
      </View>
    </Screen>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileV}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

const glass = { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border } as const;

const styles = StyleSheet.create({
  card: { ...glass, flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: radius.lg, padding: 16 },
  body: { flex: 1, gap: 4 },
  cardT: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  forecast: { fontFamily: fonts.black, fontSize: 18, color: colors.primary },
  muted: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  ringV: { fontFamily: fonts.black, fontSize: 22, color: colors.text },
  chart: { alignItems: 'flex-end', justifyContent: 'space-between', height: 160 },
  col: { flex: 1, alignItems: 'center', gap: 6, height: '100%' },
  track: { flex: 1, width: 18, justifyContent: 'flex-end', borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  fill: { width: '100%', backgroundColor: colors.primary, borderRadius: 9 },
  topic: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topicT: { width: 100, fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  topicBar: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  fill2: { height: 8, backgroundColor: colors.success },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { ...glass, width: '48%', borderRadius: radius.md, padding: 12, gap: 4 },
  locked: { borderStyle: 'dashed' },
  badgeT: { fontFamily: fonts.bold, fontSize: 13, color: colors.text },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: { ...glass, flex: 1, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', gap: 2 },
  tileV: { fontFamily: fonts.black, fontSize: 20, color: colors.text },
});
