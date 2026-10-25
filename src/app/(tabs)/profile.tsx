import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/lib/auth/AuthProvider';
import { colors, radius } from '@/theme';

export default function Profile() {
  const { status, user, signOut } = useAuth();
  const roleLabel = user?.role === 'parent' ? 'Батьки' : 'Учень';

  return (
    <Screen title="Профіль">
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={colors.primary} />
        </View>
        {user ? (
          <>
            <Text style={styles.h}>{user.name}</Text>
            <Text style={styles.p}>{roleLabel}{user.email ? ` · ${user.email}` : ''}</Text>
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

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
        <Text style={styles.noteT}>Керування підпискою та оплатою доступне лише на сайті itcodecraft.tech.</Text>
      </View>
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
  h: { color: colors.text, fontSize: 20, fontWeight: '700' },
  p: { color: colors.muted, textAlign: 'center' },
  note: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: colors.card, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border },
  noteT: { flex: 1, color: colors.muted, lineHeight: 20 },
});
