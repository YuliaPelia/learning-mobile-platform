import { Ionicons } from '@expo/vector-icons';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { study, useStudy } from '@/lib/study/store';
import type { StudentProgress } from '@/lib/types';
import { colors, fonts, radius } from '@/theme';

/** Тижневий звіт для батьків: активність, уроки й ціль, яку батьки ставлять дитині. */
export function ChildReport({ child }: { child: StudentProgress }) {
  const { childGoals } = useStudy();
  const st = child.stats;
  const goal = childGoals[child.id] ?? 3;
  const activeDays = st.week.filter((d) => d.active).length;
  const reached = st.lessonsThisWeek >= goal;
  const pct = Math.min(1, st.lessonsThisWeek / goal);

  const summary =
    `Звіт за тиждень: ${child.name}\n` +
    `• Днів із навчанням: ${activeDays} з 7\n• Уроків пройдено: ${st.lessonsThisWeek} (ціль ${goal})\n` +
    `• Серія: ${st.streak} дн. · Рівень ${st.level.level} · ${st.xp} XP\n• Домашки: ${st.homework.done}/${st.homework.total}`;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Тижневий звіт</Text>
      <Text style={styles.muted}>
        {activeDays} з 7 днів із навчанням · {st.lessonsThisWeek} уроків{reached ? ' — ціль виконано 🎉' : ''}
      </Text>

      <View style={styles.goalRow}>
        <Text style={styles.goalT}>Ціль: {goal} ур./тиж.</Text>
        <Step icon="remove" label="Менше" onPress={() => study.setChildGoal(child.id, Math.max(1, goal - 1))} />
        <Step icon="add" label="Більше" onPress={() => study.setChildGoal(child.id, Math.min(14, goal + 1))} />
      </View>
      <View style={styles.bar} accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}>
        <View style={[styles.fill, { width: `${pct * 100}%` }, reached && { backgroundColor: colors.success }]} />
      </View>

      <Pressable accessibilityRole="button" onPress={() => Share.share({ message: summary })} style={styles.share}>
        <Ionicons name="share-outline" size={18} color={colors.text} />
        <Text style={styles.shareT}>Поділитись звітом</Text>
      </Pressable>
    </View>
  );
}

function Step({ icon, label, onPress }: { icon: 'add' | 'remove'; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8} style={styles.step}>
      <Ionicons name={icon} size={18} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16, gap: 10 },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalT: { flex: 1, fontFamily: fonts.semibold, color: colors.text },
  step: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  bar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  share: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44 },
  shareT: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
});
