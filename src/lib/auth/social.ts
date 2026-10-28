import * as Apple from 'expo-apple-authentication';
import { Platform } from 'react-native';

/** Результат входу через соцмережу: токен для бекенду або скасування користувачем. */
export type SocialToken =
  | { provider: 'google'; idToken: string }
  | { provider: 'apple'; identityToken: string; fullName?: string }
  | null;

export class SocialUnavailableError extends Error {}

export const appleAvailable = Platform.OS === 'ios';

export async function appleToken(): Promise<SocialToken> {
  if (!(await Apple.isAvailableAsync())) throw new SocialUnavailableError('Вхід через Apple недоступний на цьому пристрої');
  try {
    const cred = await Apple.signInAsync({
      requestedScopes: [Apple.AppleAuthenticationScope.FULL_NAME, Apple.AppleAuthenticationScope.EMAIL],
    });
    if (!cred.identityToken) throw new SocialUnavailableError('Apple не повернув дані для входу');
    // Імʼя Apple віддає лише при першому вході — передаємо його бекенду для реєстрації
    const fullName = [cred.fullName?.givenName, cred.fullName?.familyName].filter(Boolean).join(' ');
    return { provider: 'apple', identityToken: cred.identityToken, fullName: fullName || undefined };
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return null;
    throw e;
  }
}

export async function googleToken(): Promise<SocialToken> {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) throw new SocialUnavailableError('Вхід через Google ще не налаштовано');

  // Нативний модуль відсутній в Expo Go — вантажимо його лише за потреби
  let Google: typeof import('@react-native-google-signin/google-signin');
  try {
    Google = await import('@react-native-google-signin/google-signin');
    Google.GoogleSignin.configure({ webClientId, iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID });
  } catch {
    throw new SocialUnavailableError('Вхід через Google працює лише в зібраному додатку (не в Expo Go)');
  }

  await Google.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await Google.GoogleSignin.signIn();
  if (Google.isCancelledResponse(response)) return null;
  if (!Google.isSuccessResponse(response) || !response.data.idToken) {
    throw new SocialUnavailableError('Google не повернув дані для входу');
  }
  return { provider: 'google', idToken: response.data.idToken };
}

/** Забирає Google-акаунт з пристрою, щоб наступна людина не бачила його у виборі. Без нативного модуля (Expo Go) нічого не робить. */
export async function googleSignOut(): Promise<void> {
  try {
    const Google = await import('@react-native-google-signin/google-signin');
    await Google.GoogleSignin.signOut();
  } catch {
    // не входили через Google або модуль недоступний
  }
}
