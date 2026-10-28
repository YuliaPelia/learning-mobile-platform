import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';
import { minutesToday } from './metrics';
import type { StudyState } from './types';

// Лише локальні нагадування: без push-токенів і без передавання даних (важливо для дитячих застосунків).
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

const CHANNEL = 'study';
let channelReady = false;

async function ensureChannel() {
  if (Platform.OS !== 'android' || channelReady) return;
  await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Навчання', importance: AndroidImportance.DEFAULT });
  channelReady = true;
}

export async function requestPermission(): Promise<boolean> {
  try {
    await ensureChannel();
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    return (await Notifications.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

async function schedule(title: string, body: string, trigger: Notifications.NotificationTriggerInput) {
  try {
    await ensureChannel();
    return await Notifications.scheduleNotificationAsync({ content: { title, body }, trigger });
  } catch {
    return null;
  }
}

/** Повідомлення, коли таймер добіг кінця, а додаток у фоні. */
export async function scheduleTimerEnd(seconds: number, focus: boolean) {
  if (!(await requestPermission())) return null;
  return schedule(
    focus ? 'Фокус завершено 🎉' : 'Перерва скінчилась',
    focus ? 'Відпочиньте кілька хвилин.' : 'Повертаймось до навчання!',
    { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(1, Math.round(seconds)), channelId: CHANNEL },
  );
}

export async function cancel(id: string | null) {
  if (id) await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

const REMINDER_ID = 'study-reminder';

/**
 * Нагадування «ще не навчались сьогодні»: якщо сьогодні вже вчились або година минула — на завтра.
 * Перепланується при кожній зміні даних, тож після навчання сьогоднішнє не спрацює.
 */
export async function syncReminder(s: StudyState) {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
    if (!s.settings.reminderOn) return;
    const when = new Date();
    when.setHours(s.settings.reminderHour, 0, 0, 0);
    if (when.getTime() <= Date.now() || minutesToday(s) > 0) when.setDate(when.getDate() + 1);
    await ensureChannel();
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: { title: 'Час вчитись 🚀', body: 'Навіть 10 хвилин сьогодні тримають серію.' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: CHANNEL },
    });
  } catch {
    // нагадування — другорядна функція
  }
}
