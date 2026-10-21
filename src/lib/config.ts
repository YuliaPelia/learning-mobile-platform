import Constants from 'expo-constants';

// EXPO_PUBLIC_API_URL перекриває значення з app.json (extra.apiUrl).
export const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? (Constants.expoConfig?.extra?.apiUrl as string);
