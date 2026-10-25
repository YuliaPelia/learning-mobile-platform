import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { StudentStats } from '@/lib/types';
import { colors, fonts, radius } from '@/theme';

// getUTCDay(): 0 — неділя
const WEEKDAY = ['Н', 'П', 'В', 'С', 'Ч', 'П', 'С'];

function plural(n: number, one: string, few: string, many: string) {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return one;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
  return many;
}

/** Прогрес дитини: серія днів, рівень, тиждень активності, лічильники й бейджі. */
export function StatsCard({ stats }: { stats: StudentStats }) {
  const percent = Math.round(stats.level.progress * 100);
  const lastDay = stats.week.length - 1;
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.top}>
          <Text style={styles.streak}>{stats.streak}</Text>
          <View style={styles.levelBox}>
            <View style={styles.levelRow}>
              <Text style={styles.streakLabel}>{plural(stats.streak, 'день', 'дні', 'днів')} поспіль</Text>
              <Ionicons name="flame" size={20} color={stats.streak > 0 ? colors.warm : colors.muted} />
            </View>
            <View
              style={styles.bar}
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel={`Рівень ${stats.level.level}`}
              accessibilityValue={{ min: 0, max: 100, now: percent }}>
              <View style={[styles.barFill, { width: `${percent}%` }]} />
            </View>
            <Text style={styles.levelText}>
              Рівень {stats.level.level} · {stats.level.title}
              {stats.level.toNext > 0 ? ` · ще ${stats.level.toNext} XP` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.weekRow}>
          <Text style={styles.hint}>{stats.lessonsThisWeek > 0 ? 'Так тримати!' : 'Час для уроку'}</Text>
          <View style={styles.week}>
            {stats.week.map((d, i) => {
              const today = i === lastDay;
              return (
                <View
                  key={d.day}
                  style={[styles.day, d.active && styles.dayActive, today && styles.dayToday]}
                  accessibilityLabel={`${d.day}: ${d.active ? 'було навчання' : 'без навчання'}`}>
                  <Text style={[styles.dayText, d.active && styles.dayTextActive]}>
                    {WEEKDAY[new Date(`${d.day}T12:00:00Z`).getUTCDay()]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.tiles}>
        <Tile value={String(stats.lessonsThisWeek)} label="уроків за тиждень" />
        <Tile value={String(stats.xp)} label="XP" />
        <Tile value={`${stats.homework.done}/${stats.homework.total}`} label="домашок здано" />
      </View>

      {stats.badges && (
        <View style={styles.badges}>
          {stats.badges.map((b) => (
            <View key={b.id} style={[styles.badge, !b.earned && styles.badgeLocked]}>
              <Ionicons name={b.earned ? 'star' : 'lock-closed'} size={14} color={b.earned ? colors.warm : colors.muted} />
              <Text style={[styles.badgeText, !b.earned && styles.badgeTextLocked]}>{b.title}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileV}>{value}</Text>
      <Text style={styles.tileL}>{label}</Text>
    </View>
  );
}

const glass = { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border } as const;

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  card: { ...glass, borderRadius: radius.lg, padding: 18, gap: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  streak: { fontSize: 56, fontFamily: fonts.black, color: colors.text, lineHeight: 62 },
  levelBox: { flex: 1, gap: 8 },
  levelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakLabel: { fontSize: 20, fontFamily: fonts.bold, color: colors.text },
  bar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  levelText: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  divider: { height: 1, backgroundColor: colors.border },
  weekRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  hint: { flexShrink: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  week: { flexDirection: 'row', gap: 4 },
  day: { width: 26, height: 34, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  dayActive: { backgroundColor: colors.primarySoft },
  dayToday: { borderWidth: 1, borderColor: colors.primary },
  dayText: { fontSize: 13, fontFamily: fonts.semibold, color: colors.muted },
  dayTextActive: { color: colors.text },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: { ...glass, flex: 1, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', gap: 2 },
  tileV: { fontSize: 20, fontFamily: fonts.black, color: colors.text },
  tileL: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, textAlign: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: 'rgba(255,179,107,0.16)' },
  badgeLocked: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
  badgeText: { fontSize: 12, fontFamily: fonts.semibold, color: colors.text },
  badgeTextLocked: { color: colors.muted },
});
