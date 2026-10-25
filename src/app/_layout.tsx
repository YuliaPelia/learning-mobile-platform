import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Своя кнопка «назад» поверх градієнта — див. course/[id].tsx */}
        <Stack.Screen name="course/[id]" options={{ headerShown: false }} />
        {/* Вхід не обовʼязковий на старті: його відкриває дія, що потребує акаунта */}
        <Stack.Screen name="sign-in" options={{ title: 'Вхід', presentation: 'modal' }} />
      </Stack>
    </AuthProvider>
  );
}
