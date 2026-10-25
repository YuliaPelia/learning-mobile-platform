import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen, sectionTitle } from '@/components/Screen';
import { useAsync } from '@/components/useAsync';
import { deleteChild, getStats } from '@/lib/api';
import { useAuth } from '@/lib/auth/AuthProvider';
import { API_URL } from '@/lib/config';
import { colors, fonts, radius } from '@/theme';

const openDoc = (path: string) => WebBrowser.openBrowserAsync(`${API_URL}${path}`);

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Щось пішло не так. Спробуйте ще раз.');

export default function Profile() {
  const { status, user, signOut, deleteAccount } = useAuth();
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const isParent = user?.role === 'parent';
  const children = useAsync(() => (isParent ? getStats() : Promise.resolve(null)), null, [user?.id, reload]);

  const confirmDeleteAccount = () =>
    Alert.alert(
      'Видалити акаунт назавжди?',
      isParent
        ? 'Буде скасовано всі підписки, видалено профілі дітей з їхнім прогресом, а ваші дані — стерто. Відновити не вийде.'
        : 'Буде видалено твій профіль, прогрес і домашки. Відновити не вийде.',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await deleteAccount();
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

  const confirmDeleteChild = (id: string, name: string) =>
    Alert.alert(`Видалити профіль «${name}»?`, 'Прогрес і домашки буде видалено назавжди, підписки дитини — скасовано.', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Видалити',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteChild(id);
            setReload((n) => n + 1);
          } catch (e) {
            Alert.alert('Не вдалося видалити', errorText(e));
          }
        },
      },
    ]);

  return (
    <Screen title="Профіль">
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={colors.primary} />
        </View>
        {user ? (
          <>
            <Text style={styles.h}>{user.name}</Text>
            <Text style={styles.p}>{isParent ? 'Батьки' : 'Учень'}{user.email ? ` · ${user.email}` : ''}</Text>
          </>
        ) : (
          <>
            <Text style={styles.h}>Привіт!</Text>
            <Text style={styles.p}>Увійдіть, щоб зберігати прогрес, рівні та бейджі.</Text>
          </>
        )}
      </View>

      {status === 'guest' && <Button label="Увійти або зареєструватися" onPress={() => router.push('/sign-in')} />}
      {user && <Button variant="outline" label="Вийти" onPress={signOut} />}

      {isParent && children && children.length > 0 && (
        <>
          <Text style={sectionTitle}>Діти</Text>
          {children.map((c) => (
            <View key={c.id} style={styles.row}>
              <Text style={styles.rowText}>{c.name}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Видалити профіль ${c.name}`}
                onPress={() => confirmDeleteChild(c.id, c.name)}
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
        <Text style={styles.noteT}>Керування підпискою та оплатою доступне лише на сайті itcodecraft.tech.</Text>
      </View>

      <View style={styles.links}>
        <Pressable accessibilityRole="link" onPress={() => openDoc('/legal/privacy')} hitSlop={8}>
          <Text style={styles.link}>Політика конфіденційності</Text>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={() => openDoc('/legal/terms')} hitSlop={8}>
          <Text style={styles.link}>Правила користування</Text>
        </Pressable>
      </View>

      {user &&
        (user.hasParent ? (
          <Text style={styles.small}>Твій профіль створили батьки — видалити його можуть вони у своєму кабінеті.</Text>
        ) : (
          <Pressable accessibilityRole="button" onPress={confirmDeleteAccount} disabled={busy} style={styles.deleteBtn}>
            <Text style={styles.danger}>{busy ? 'Видаляємо…' : 'Видалити акаунт'}</Text>
          </Pressable>
        ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  h: { color: colors.text, fontSize: 20, fontFamily: fonts.bold },
  p: { color: colors.muted, fontFamily: fonts.regular, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 16,
  },
  rowText: { flex: 1, fontSize: 15, fontFamily: fonts.semibold, color: colors.text },
  rowAction: { minHeight: 48, paddingHorizontal: 16, justifyContent: 'center' },
  note: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: colors.card, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border },
  noteT: { flex: 1, fontFamily: fonts.regular, color: colors.muted, lineHeight: 20 },
  links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 20, rowGap: 8 },
  link: { fontSize: 13, fontFamily: fonts.semibold, color: colors.text, textDecorationLine: 'underline' },
  small: { fontSize: 12, fontFamily: fonts.regular, color: colors.muted, textAlign: 'center' },
  deleteBtn: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  danger: { fontSize: 14, fontFamily: fonts.semibold, color: colors.danger },
});
