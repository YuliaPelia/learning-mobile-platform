import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Легка вібрація підтверджує дію. Без підтримки (веб, старі пристрої) мовчки нічого не робить.
const run = (fn: () => Promise<void>) => {
  if (Platform.OS === 'web') return;
  fn().catch(() => {});
};

/** Звичайне натискання. */
export const tap = () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
/** Вибір варіанта, перемикач. */
export const select = () => run(() => Haptics.selectionAsync());
/** Правильна відповідь, виконана задача. */
export const success = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
/** Помилка. */
export const warning = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
