import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { PressableScale } from '@/components/motion';
import { ChildReport } from '@/components/ChildReport';
import { useParentalGate } from '@/components/ParentalGate';
import { Screen, sectionTitle } from '@/components/Screen';
import { StatsCard } from '@/components/StatsCard';
import { useAsync } from '@/components/useAsync';
import { deleteChild, getStats } from '@/lib/api';
import { useAuth } from '@/lib/auth/AuthProvider';
import { openDoc } from '@/lib/docs';
import { onboarding } from '@/lib/onboarding/store';
import { IAP_ENABLED } from '@/lib/iap/service';
import { requestPermission } from '@/lib/study/notifications';
import { minutesToday, quizAccuracy } from '@/lib/study/metrics';
import { study, useStudy } from '@/lib/study/store';
import { colors } from '@/theme';
import { calm, makeStyles, setSkin, useSkin } from '@/theme/skin';

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Щось пішло не так. Спробуйте ще раз.');

export default function Profile() {
  const skinNow = useSkin();
  const { status, user, signOut, deleteAccount } = useAuth();
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const isParent = user?.role === 'parent';
  const learn = useStudy();
  const gate = useParentalGate();
  const progress = useAsync(() => (user ? getStats() : Promise.resolve(null)), null, [user?.id, reload]);

  const confirmDeleteAccount = () =>
    Alert.alert(
      'Видалити акаунт назавжди?',
      isParent
        ? 'Профілі дітей з їхнім прогресом буде видалено, а ваші дані — стерто. Відновити не вийде. Підписки в App Store чи Google Play скасовуються окремо в налаштуваннях магазину: видалення акаунта їх не зупиняє.'
        : 'Буде видалено твій профіль, прогрес і домашки. Відновити не вийде.',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              const ownerId = user?.id;
              await deleteAccount();
              // Після видалення сесія зникає і власник стає гостем, тож стираємо за збереженим id
              if (ownerId) study.wipe(ownerId);
              onboarding.reset();
              Alert.alert('Акаунт видалено', 'Дякуємо, що були з нами.');
            } catch (e) {
              Alert.alert('Не вдалося видалити', errorText(e));
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );

  // Задачі, таймер і квізи поки що лише на пристрої: після виходу вони стираються (див. docs/ROADMAP.md)
  const hasLocalData = learn.tasks.length + learn.sessions.length + learn.quizResults.length > 0;
  const confirmSignOut = () => {
    if (!hasLocalData) return signOut();
    Alert.alert('Вийти з акаунта?', 'Задачі, сесії таймера й результати квізів на цьому пристрої буде видалено — вони ще не синхронізуються з сервером.', [
      { text: 'Скасувати', style: 'cancel' },
      { text: 'Вийти й видалити', style: 'destructive', onPress: signOut },
    ]);
  };

  const confirmDeleteChild = (id: string, name: string) =>
    Alert.alert(`Видалити профіль «${name}»?`, 'Прогрес і домашки буде видалено назавжди. Підписку в App Store чи Google Play скасовуйте окремо в налаштуваннях магазину.', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Видалити',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteChild(id);
            study.removeChildGoal(id);
            setReload((n) => n + 1);
          } catch (e) {
            Alert.alert('Не вдалося видалити', errorText(e));
          }
        },
      },
    ]);

  return (
    <Screen title="Профіль">
      {gate.element}
      <View style={styles.head}>
        <View style={styles.avatar}>
          {user ? <Text style={styles.initial}>{user.name[0]?.toUpperCase()}</Text> : <Ionicons name="person" size={40} color={colors.primary} />}
        </View>
        {user ? (
          <>
            <Text style={styles.h}>{user.name}</Text>
            <Text style={styles.p}>{isParent ? 'Батьки' : 'Учень'}{user.email ? ` · ${user.email}` : ''}</Text>
          </>
        ) : (
          <>
            <Text style={styles.h}>{calm('Привіт!')}</Text>
            <Text style={styles.p}>Увійдіть, щоб зберігати прогрес, рівні та бейджі.</Text>
          </>
        )}
      </View>

      {status === 'guest' && <Button label="Увійти або зареєструватися" onPress={() => router.push('/sign-in')} />}

      {user && (
        <>
          <View style={styles.tiles}>
            <Tile value={String(progress?.[0] && !isParent ? progress[0].stats.streak : learn.sessions.length)} label={!isParent && progress?.[0] ? 'днів поспіль' : 'сесій фокусу'} />
            <Tile value={`${minutesToday(learn)} хв`} label="сьогодні" />
            <Tile value={quizAccuracy(learn) === null ? '—' : `${Math.round(quizAccuracy(learn)! * 100)}%`} label="успішність квізів" />
          </View>
          <View style={styles.menu}>
            <MenuRow icon="checkbox-outline" label="Мої задачі" badge={learn.tasks.filter((t) => !t.done).length} onPress={() => router.push('/today')} />
            <MenuRow icon="timer-outline" label="Таймер навчання" onPress={() => router.push('/timer')} />
            <MenuRow icon="help-circle-outline" label="Квізи та самоперевірка" onPress={() => router.push('/today')} />
            <MenuRow icon="stats-chart-outline" label="Статистика й прогноз" onPress={() => router.push('/analytics')} last={!(IAP_ENABLED && isParent)} />
            {IAP_ENABLED && isParent && <MenuRow icon="card-outline" label="Тарифи й підписка" onPress={() => router.push('/plans')} last />}
          </View>
          <View style={styles.menu}>
            <View style={[styles.menuRow, styles.menuDivider]}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
              <Text style={styles.menuT}>Щоденне нагадування о {learn.settings.reminderHour}:00</Text>
              <Switch
                accessibilityLabel="Щоденне нагадування"
                value={learn.settings.reminderOn}
                trackColor={{ true: colors.action }}
                onValueChange={async (on) => {
                  if (on && !(await requestPermission())) {
                    Alert.alert('Сповіщення вимкнені', 'Дозвольте сповіщення в налаштуваннях телефону.');
                    return;
                  }
                  study.setSettings({ reminderOn: on });
                }}
              />
            </View>
            <View style={styles.menuRow}>
              <Ionicons name="contrast-outline" size={22} color={colors.primary} />
              <Text style={styles.menuT}>Спокійний вигляд</Text>
              <Switch accessibilityLabel="Спокійний вигляд" value={skinNow === 'pro'} trackColor={{ true: colors.action }} onValueChange={(on) => {
                setSkin(on ? 'pro' : 'play');
              }} />
            </View>
          </View>
        </>
      )}

      {user && progress && user.role === 'student' && progress[0] && (
        <>
          <Text style={sectionTitle()}>Твій прогрес</Text>
          <StatsCard stats={progress[0].stats} />
        </>
      )}

      {isParent && progress && (
        <>
          <Text style={sectionTitle()}>Прогрес дітей</Text>
          {progress.length === 0 && (
            <Text style={styles.p}>Додайте профіль дитини на сайті — тут зʼявиться її прогрес.</Text>
          )}
          {progress.map((c) => (
            <View key={c.id} style={styles.child}>
              <Text style={styles.childName}>{c.name}</Text>
              <StatsCard stats={c.stats} />
              <ChildReport child={c} />
            </View>
          ))}
        </>
      )}

      {user && <Button variant="outline" label="Вийти" onPress={confirmSignOut} />}

      {isParent && progress && progress.length > 0 && (
        <>
          <Text style={sectionTitle()}>Діти</Text>
          {progress.map((c) => (
            <View key={c.id} style={styles.row}>
              <Text style={styles.rowText}>{c.name}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Видалити профіль ${c.name}`}
                onPress={() => gate.ask(() => confirmDeleteChild(c.id, c.name))}
                hitSlop={8}
                style={styles.rowAction}>
                <Text style={styles.danger}>Видалити</Text>
              </Pressable>
            </View>
          ))}
        </>
      )}

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
        <Text style={styles.noteT}>Підпискою керують батьки зі свого акаунта.</Text>
      </View>

      <View style={styles.links}>
        <Pressable accessibilityRole="link" onPress={() => gate.ask(() => openDoc('privacy'))} hitSlop={8} style={styles.linkHit}>
          <Text style={styles.link}>Політика конфіденційності</Text>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={() => gate.ask(() => openDoc('terms'))} hitSlop={8} style={styles.linkHit}>
          <Text style={styles.link}>Правила користування</Text>
        </Pressable>
      </View>

      {user &&
        (user.hasParent ? (
          <Text style={styles.small}>Твій профіль створили батьки — видалити його можуть вони у своєму кабінеті.</Text>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => gate.ask(confirmDeleteAccount)} disabled={busy} style={styles.deleteBtn}>
            <Text style={styles.danger}>{busy ? 'Видаляємо…' : 'Видалити акаунт'}</Text>
          </Pressable>
        ))}
    </Screen>
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

function MenuRow({ icon, label, badge, onPress, last }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; badge?: number; onPress: () => void; last?: boolean }) {
  return (
    <PressableScale accessibilityRole="button" onPress={onPress} scaleTo={0.985} style={[styles.menuRow, !last && styles.menuDivider]}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.menuT}>{label}</Text>
      {!!badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeT}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </PressableScale>
  );
}

const styles = makeStyles((t) => {
  return StyleSheet.create({
    initial: { fontSize: 36, fontFamily: t.fonts.black, color: colors.primary },
    tiles: { flexDirection: 'row', gap: 10 },
    tile: { flex: 1, backgroundColor: colors.glass, ...t.glassBorder, borderRadius: t.radius.md, paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center', gap: 2 },
    tileV: { fontSize: 20, fontFamily: t.fonts.black, color: colors.text },
    tileL: { fontSize: 12, fontFamily: t.fonts.regular, color: colors.muted, textAlign: 'center' },
    menu: { backgroundColor: colors.glass, ...t.glassBorder, borderRadius: t.radius.lg, overflow: 'hidden' },
    menuRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, minHeight: 56 },
    menuDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
    menuT: { flex: 1, fontSize: 15, fontFamily: t.fonts.semibold, color: colors.text },
    badge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: colors.action, alignItems: 'center', justifyContent: 'center' },
    badgeT: { fontSize: 12, fontFamily: t.fonts.bold, color: colors.onAction },
    head: { alignItems: 'center', gap: 6, paddingVertical: 12 },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    h: { color: colors.text, fontSize: 20, fontFamily: t.fonts.bold },
    p: { color: colors.muted, fontFamily: t.fonts.regular, textAlign: 'center' },
    child: { gap: 10 },
    childName: { fontSize: 16, fontFamily: t.fonts.bold, color: colors.primary },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: t.radius.md,
      ...t.glassBorder,
      paddingLeft: 16,
    },
    rowText: { flex: 1, fontSize: 15, fontFamily: t.fonts.semibold, color: colors.text },
    rowAction: { minHeight: 48, paddingHorizontal: 16, justifyContent: 'center' },
    note: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: colors.card, borderRadius: t.radius.md, padding: 16, ...t.glassBorder, },
    noteT: { flex: 1, fontFamily: t.fonts.regular, color: colors.muted, lineHeight: 20 },
    links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 20, rowGap: 8 },
    linkHit: { minHeight: 44, justifyContent: 'center' },
    link: { fontSize: 13, fontFamily: t.fonts.semibold, color: colors.text, textDecorationLine: 'underline' },
    small: { fontSize: 12, fontFamily: t.fonts.regular, color: colors.muted, textAlign: 'center' },
    deleteBtn: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
    danger: { fontSize: 15, fontFamily: t.fonts.semibold, color: colors.danger },
  });
});
