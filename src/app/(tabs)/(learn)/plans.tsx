import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { useParentalGate } from '@/components/ParentalGate';
import { Screen, sectionTitle } from '@/components/Screen';
import { useAsync } from '@/components/useAsync';
import { getStats, getSubscriptions } from '@/lib/api';
import { useAuth } from '@/lib/auth/AuthProvider';
import { openDoc } from '@/lib/docs';
import { activeProductIds, buyPlan, IAP_ENABLED, loadStorePrices, restore, type StoreProduct } from '@/lib/iap/service';
import { freeSlot, PLAN_IDS, PLAN_INFO, productId, type PlanId } from '@/lib/iap/products';
import { colors, fonts, radius } from '@/theme';

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Щось пішло не так. Спробуйте ще раз.');
const store = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

/** Тарифи для батьків: вибір дитини й тарифу, покупка через магазин, відновлення покупок. Дитина купувати не може. */
export default function Plans() {
  const { user } = useAuth();
  const parental = useParentalGate();
  const children = useAsync(() => (user?.role === 'parent' ? getStats() : Promise.resolve(null)), null, [user?.id]);
  const [prices, setPrices] = useState<Record<string, StoreProduct>>({});
  const [childId, setChildId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const subs = useAsync(getSubscriptions, [], [user?.id, reload]);

  useEffect(() => {
    loadStorePrices().then(setPrices);
  }, []);
  const selected = childId ?? children?.[0]?.id ?? null;

  const pickCourse = (subscriptionId: string, child?: string) => router.push({ pathname: '/choose-course', params: { subscriptionId, child: child ?? '' } });

  const buy = (plan: PlanId) =>
    parental.ask(async () => {
      if (!selected) return;
      setBusy(true);
      try {
        const slot = freeSlot(await activeProductIds());
        if (!slot) {
          Alert.alert('Усі місця зайняті', 'До одного акаунта можна підключити до трьох дітей. Скасуйте одну з підписок у налаштуваннях магазину.');
          return;
        }
        const granted = await buyPlan(slot, plan, selected);
        setReload((n) => n + 1);
        // Тариф «1 курс на вибір»: одразу пропонуємо обрати курс
        if (granted.needsCourse) pickCourse(granted.id, children?.find((c) => c.id === selected)?.name);
        else Alert.alert('Готово', 'Підписку оформлено. Доступ зʼявиться за кілька секунд.');
      } catch (e) {
        Alert.alert('Не вдалося оформити', errorText(e));
      } finally {
        setBusy(false);
      }
    });

  const restorePurchases = () =>
    parental.ask(async () => {
      if (!selected) return;
      setBusy(true);
      try {
        const n = await restore(selected);
        Alert.alert(n ? 'Покупки відновлено' : 'Покупок не знайдено', n ? `Відновлено підписок: ${n}.` : `У вашому акаунті ${store} немає активних підписок.`);
      } catch (e) {
        Alert.alert('Не вдалося відновити', errorText(e));
      } finally {
        setBusy(false);
      }
    });

  if (!IAP_ENABLED || user?.role !== 'parent') {
    return (
      <Screen back title="Тарифи">
        <Text style={styles.muted}>{user?.role === 'student' ? 'Підписку оформлюють батьки зі свого акаунта.' : 'Тарифи скоро зʼявляться.'}</Text>
      </Screen>
    );
  }

  return (
    <Screen back title="Тарифи">
      {parental.element}
      {children && children.length === 0 && <Text style={styles.muted}>Спершу додайте профіль дитини на сайті.</Text>}
      {children && children.length > 0 && (
        <>
          <Text style={sectionTitle}>Для кого</Text>
          <View style={styles.chips}>
            {children.map((c) => (
              <Pressable key={c.id} accessibilityRole="radio" accessibilityState={{ selected: selected === c.id }} onPress={() => setChildId(c.id)} style={[styles.chip, selected === c.id && styles.chipOn]}>
                <Text style={[styles.chipT, selected === c.id && styles.chipTOn]}>{c.name}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {subs.length > 0 && (
        <>
          <Text style={sectionTitle}>Ваші підписки</Text>
          {subs.map((sub) => {
            const childName = children?.find((c) => c.id === sub.childId)?.name;
            return (
              <View key={sub.id} style={styles.sub}>
                <View style={styles.subBody}>
                  <Text style={styles.subT}>{PLAN_INFO[sub.plan].name}{childName ? ` · ${childName}` : ''}</Text>
                  <Text style={styles.muted}>
                    {sub.status === 'past_due' ? 'Проблема з оплатою' : sub.status === 'canceled' ? 'Скасовано' : 'Активна'}
                    {sub.endsAt ? ` · до ${new Date(sub.endsAt).toLocaleDateString('uk-UA')}` : ''}
                  </Text>
                </View>
                {sub.needsCourse && (
                  <Pressable accessibilityRole="button" onPress={() => pickCourse(sub.id, childName)} style={styles.subBtn}>
                    <Text style={styles.subBtnT}>Обрати курс</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </>
      )}

      {PLAN_IDS.map((plan) => {
        const info = PLAN_INFO[plan];
        const price = prices[productId(1, plan)]?.displayPrice ?? `${info.priceUah} грн`;
        return (
          <View key={plan} style={[styles.card, plan === 'standard' && styles.cardPopular]}>
            {plan === 'standard' && <Text style={styles.badge}>Найпопулярніший</Text>}
            <Text style={styles.name}>{info.name}</Text>
            <Text style={styles.muted}>{info.description}</Text>
            <Text style={styles.price}>{price} <Text style={styles.per}>/ місяць</Text></Text>
            {info.perks.map((p) => (
              <View key={p} style={styles.perk}>
                <Ionicons name="checkmark" size={18} color={colors.text} />
                <Text style={styles.perkT}>{p}</Text>
              </View>
            ))}
            <Button label={`Обрати ${info.name}`} onPress={() => buy(plan)} loading={busy} disabled={!selected} variant={plan === 'standard' ? 'primary' : 'outline'} />
          </View>
        );
      })}

      <Button variant="outline" label="Відновити покупки" onPress={restorePurchases} disabled={busy || !selected} />
      <Text style={styles.legal}>
        Підписка поновлюється щомісяця автоматично, доки її не скасовано щонайменше за 24 години до кінця періоду. Оплата списується з вашого акаунта {store}. Керувати підпискою й скасувати її можна в налаштуваннях акаунта {store}.{' '}
        <Text style={styles.link} accessibilityRole="link" onPress={() => parental.ask(() => openDoc('terms'))}>Правила користування</Text> і{' '}
        <Text style={styles.link} accessibilityRole="link" onPress={() => parental.ask(() => openDoc('privacy'))}>Політика конфіденційності</Text>.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: { fontFamily: fonts.regular, color: colors.muted, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.primary },
  chipT: { fontFamily: fonts.semibold, color: colors.text },
  chipTOn: { color: colors.onPrimary },
  card: { gap: 8, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 18 },
  cardPopular: { borderColor: colors.primary, borderWidth: 2 },
  badge: { alignSelf: 'flex-start', overflow: 'hidden', borderRadius: 999, backgroundColor: colors.primary, color: colors.onPrimary, fontFamily: fonts.bold, fontSize: 12, paddingHorizontal: 10, paddingVertical: 3 },
  name: { fontFamily: fonts.black, fontSize: 24, color: colors.text },
  price: { fontFamily: fonts.black, fontSize: 32, color: colors.text, marginTop: 4 },
  per: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  perkT: { flex: 1, fontFamily: fonts.regular, color: colors.text },
  sub: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, minHeight: 64 },
  subBody: { flex: 1, gap: 2 },
  subT: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  subBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.primary },
  subBtnT: { fontFamily: fonts.bold, fontSize: 13, color: colors.onPrimary },
  legal: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.muted },
  link: { fontFamily: fonts.semibold, color: colors.text, textDecorationLine: 'underline' },
});
