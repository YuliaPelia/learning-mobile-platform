import {
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { colors, fonts } from '@/theme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_800ExtraBold });
  // Шрифти вбудовані в бандл і вантажаться миттєво; якщо не вдалося — показуємо системний шрифт
  if (!fontsLoaded && !fontError) return null;

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text, fontFamily: fonts.bold },
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Світла сторінка зі своєю кнопкою «назад» — див. course/[id].tsx */}
        <Stack.Screen name="course/[id]" options={{ headerShown: false }} />
        {/* Вхід не обовʼязковий на старті: його відкриває дія, що потребує акаунта */}
        <Stack.Screen name="sign-in" options={{ title: 'Вхід', presentation: 'modal' }} />
      </Stack>
    </AuthProvider>
  );
}
