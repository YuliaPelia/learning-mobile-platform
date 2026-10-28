import {
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/lib/auth/AuthProvider';
import { getRefreshToken } from '@/lib/auth/session';
import { clearCache, setCacheOwner } from '@/lib/cache';
import { syncReminder } from '@/lib/study/notifications';
import { setStudyOwner, study, useStudySelect } from '@/lib/study/store';
import { colors, fonts } from '@/theme';

const LAST_OWNER = 'itc.lastOwner';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_800ExtraBold });
  // Шрифти вбудовані в бандл і вантажаться миттєво; якщо не вдалося — показуємо системний шрифт
  if (!fontsLoaded && !fontError) return null;

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <StudyBridge />
      <Stack
        screenOptions={{
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text, fontFamily: fonts.bold },
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Вхід не обовʼязковий на старті: його відкриває дія, що потребує акаунта */}
        <Stack.Screen name="sign-in" options={{ title: 'Вхід', presentation: 'modal' }} />
      </Stack>
    </AuthProvider>
  );
}

/**
 * Звʼязує дані навчання й кеш із поточним акаунтом і планує нагадування. Нічого не малює.
 * Підписка на окремі поля, щоб корінь застосунку не перерисовувався від кожної задачі.
 */
function StudyBridge() {
  const { status, user } = useAuth();
  const ownerId = user?.id ?? null;
  const reminderKey = useStudySelect((s) => `${s.settings.reminderOn}|${s.settings.reminderHour}|${s.sessions.length}`);

  useEffect(() => {
    // Поки сесія перевіряється, власника не міняємо — інакше дані на мить «зникнуть»
    if (status === 'loading') return;
    let alive = true;
    (async () => {
      let id = ownerId;
      if (id) {
        AsyncStorage.setItem(LAST_OWNER, id).catch(() => {});
      } else if (getRefreshToken()) {
        // Старт без мережі з чинною сесією: профіль не завантажився, але це все ще той самий користувач
        id = await AsyncStorage.getItem(LAST_OWNER).catch(() => null);
      } else {
        // Вийшли або сесію скасовано: даних попереднього користувача на пристрої не лишаємо
        const previous = await AsyncStorage.getItem(LAST_OWNER).catch(() => null);
        if (previous) study.wipe(previous);
        AsyncStorage.removeItem(LAST_OWNER).catch(() => {});
        await clearCache();
      }
      if (!alive) return;
      setCacheOwner(id);
      setStudyOwner(id);
    })();
    return () => {
      alive = false;
    };
  }, [status, ownerId]);

  useEffect(() => {
    syncReminder(study.get());
  }, [reminderKey]);

  return null;
}
