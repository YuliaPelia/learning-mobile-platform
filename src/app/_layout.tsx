import {
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/lib/auth/AuthProvider';
import { getRefreshToken } from '@/lib/auth/session';
import { clearCache, setCacheOwner } from '@/lib/cache';
import { syncReminder } from '@/lib/study/notifications';
import { onboarding, useOnboarding } from '@/lib/onboarding/store';
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
      <OnboardingGate />
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
        {/* Вхідний квіз: при першому запуску гостя; без нижньої панелі */}
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade_from_bottom', gestureEnabled: false }} />
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
        if (previous) {
          study.wipe(previous);
          // Вийшов реальний користувач: відповіді квізу на спільному пристрої теж не лишаємо
          onboarding.reset();
        }
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

/**
 * Перший запуск гостя → вхідний квіз. Тих, хто вже має акаунт (або чинну сесію, але зараз без мережі),
 * не турбуємо: для них квіз позначається пропущеним, а запустити його можна з головної чи вкладки «Курси».
 */
function OnboardingGate() {
  const { status } = useAuth();
  const ob = useOnboarding();
  const nav = useRootNavigationState();
  useEffect(() => {
    if (!nav?.key || status === 'loading' || ob.status !== 'new') return;
    if (status === 'authed' || getRefreshToken()) onboarding.skip();
    else router.push('/onboarding');
  }, [nav?.key, status, ob.status]);
  return null;
}
