import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen, sectionTitle } from '@/components/Screen';
import { useAsync } from '@/components/useAsync';
import { chooseSubscriptionCourse, getCourses } from '@/lib/api';
import type { Course } from '@/lib/types';
import { colors } from '@/theme';
import { useSkin, makeStyles } from '@/theme/skin';

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Щось пішло не так. Спробуйте ще раз.');

/** Вибір курсу для підписки «1 курс на вибір». Обирається один раз після покупки, тому перед збереженням просимо підтвердити. */
export default function ChooseCourse() {
  useSkin(); // перерендер при зміні вигляду
  const { subscriptionId, child } = useLocalSearchParams<{ subscriptionId: string; child?: string }>();
  const courses = useAsync<Course[]>(getCourses, []);
  const [busy, setBusy] = useState(false);
  const open = courses.filter((c) => !c.soon);

  const pick = (c: Course) =>
    Alert.alert(`Обрати «${c.title}»?`, 'Курс обирається один раз. Щоб змінити його пізніше, доведеться написати в підтримку.', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Обрати',
        onPress: async () => {
          setBusy(true);
          try {
            await chooseSubscriptionCourse(subscriptionId, c.id);
            Alert.alert('Готово', `Курс «${c.title}» відкрито${child ? ` для ${child}` : ''}.`);
            router.replace('/plans');
          } catch (e) {
            Alert.alert('Не вдалося обрати курс', errorText(e));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);

  return (
    <Screen back title="Оберіть курс">
      <Text style={styles.muted}>{child ? `Який курс відкрити для ${child}?` : 'Який курс відкрити?'} Тариф дає доступ до одного курсу.</Text>
      <Text style={sectionTitle()}>Доступні курси</Text>
      {open.length === 0 && <Text style={styles.muted}>Завантажуємо курси…</Text>}
      {open.map((c) => (
        <Pressable
          key={c.id}
          accessibilityRole="button"
          accessibilityLabel={`${c.title}. ${c.lessons} уроків`}
          disabled={busy}
          onPress={() => pick(c)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <View style={styles.icon}>
            <Ionicons name={c.icon} size={24} color={colors.text} />
          </View>
          <View style={styles.body}>
            <Text style={styles.title}>{c.title}</Text>
            <Text style={styles.muted}>{c.age} років · {c.lessons} уроків</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = makeStyles((t) => {
  return StyleSheet.create({
    muted: { fontFamily: t.fonts.regular, fontSize: 13, color: colors.muted, lineHeight: 19 },
    card: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 72, backgroundColor: colors.glass, ...t.glassBorder, borderRadius: t.radius.lg, padding: 14 },
    pressed: { opacity: 0.7 },
    icon: { width: 46, height: 46, borderRadius: t.radius.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
    body: { flex: 1, gap: 2 },
    title: { fontFamily: t.fonts.bold, fontSize: 16, color: colors.text },
  });
});
