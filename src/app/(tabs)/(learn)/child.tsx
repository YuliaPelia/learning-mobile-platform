import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { ChildReport } from '@/components/ChildReport';
import { Screen } from '@/components/Screen';
import { StatsCard } from '@/components/StatsCard';
import { useAsync } from '@/components/useAsync';
import { getStats } from '@/lib/api';
import { colors } from '@/theme';
import { makeStyles, useSkin } from '@/theme/skin';

/** Докладна статистика однієї дитини для батьків: рівень, серія, тиждень, ціль і звіт. */
export default function ChildStats() {
  useSkin(); // перерендер при зміні вигляду
  const { id } = useLocalSearchParams<{ id: string }>();
  const kids = useAsync(getStats, null, []);
  const child = kids?.find((k) => k.id === id);

  return (
    <Screen back title={child?.name ?? 'Статистика'}>
      {kids === null && <Text style={styles.p}>Завантажуємо…</Text>}
      {kids !== null && !child && <Text style={styles.p}>Профіль дитини не знайдено. Поверніться назад і оновіть головну.</Text>}
      {child && (
        <>
          <StatsCard stats={child.stats} />
          <ChildReport child={child} />
        </>
      )}
    </Screen>
  );
}

const styles = makeStyles((t) => StyleSheet.create({ p: { fontFamily: t.fonts.regular, fontSize: 15, color: colors.muted } }));
