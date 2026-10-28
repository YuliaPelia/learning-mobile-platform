import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Ring } from '@/components/Ring';
import { Screen } from '@/components/Screen';
import { cancel, scheduleTimerEnd } from '@/lib/study/notifications';
import { study, useStudy } from '@/lib/study/store';
import { colors, fonts, radius } from '@/theme';

type Mode = 'focus' | 'short' | 'long';
const MODES: { id: Mode; label: string }[] = [
  { id: 'focus', label: 'Фокус' },
  { id: 'short', label: 'Коротка перерва' },
  { id: 'long', label: 'Довга перерва' },
];

const fmt = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

export default function Timer() {
  const { settings, tasks } = useStudy();
  const [mode, setMode] = useState<Mode>('focus');
  const [taskId, setTaskId] = useState<string | undefined>();
  // endAt — момент завершення; так таймер не «плаває», якщо додаток був у фоні
  const [endAt, setEndAt] = useState<number | null>(null);
  const [leftOnPause, setLeftOnPause] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);

  const total = (mode === 'focus' ? settings.focusMin : mode === 'short' ? settings.shortBreakMin : settings.longBreakMin) * 60;
  const left = endAt ? Math.max(0, Math.round((endAt - now) / 1000)) : (leftOnPause ?? total);
  const running = endAt !== null;
  const started = running || leftOnPause !== null;

  const doneRef = useRef(false);
  const notifRef = useRef<string | null>(null);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running]);

  const dropNotif = () => {
    cancel(notifRef.current);
    notifRef.current = null;
  };

  useEffect(() => {
    if (running && left === 0 && !doneRef.current) {
      doneRef.current = true;
      dropNotif();
      if (mode === 'focus') study.addSession(total / 60, taskId);
      setEndAt(null);
      setLeftOnPause(null);
      setFinished(true);
    }
  }, [running, left, mode, total, taskId]);

  const reset = () => {
    dropNotif();
    doneRef.current = false;
    setEndAt(null);
    setLeftOnPause(null);
    setFinished(false);
  };

  const pick = (m: Mode) => {
    if (started) return;
    setMode(m);
    setFinished(false);
  };

  const start = () => {
    doneRef.current = false;
    setFinished(false);
    setNow(Date.now());
    setEndAt(Date.now() + left * 1000);
    scheduleTimerEnd(left, mode === 'focus').then((id) => (notifRef.current = id));
  };
  const pause = () => {
    dropNotif();
    setLeftOnPause(left);
    setEndAt(null);
  };
  // Зупинка фокусу зберігає вже відпрацьований час
  const stop = () => {
    if (mode === 'focus') study.addSession(Math.floor((total - left) / 60), taskId);
    reset();
  };

  const open = tasks.filter((t) => !t.done).slice(0, 6);
  const step = (key: 'focusMin' | 'shortBreakMin' | 'longBreakMin', d: number, min: number, max: number) =>
    study.setSettings({ [key]: Math.min(max, Math.max(min, settings[key] + d)) });

  return (
    <Screen back title="Таймер">
      <View style={styles.modes}>
        {MODES.map((m) => (
          <Pressable key={m.id} accessibilityRole="button" onPress={() => pick(m.id)} style={[styles.mode, mode === m.id && styles.modeOn]}>
            <Text style={[styles.modeT, mode === m.id && styles.modeTOn]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.ringBox}>
        <Ring size={264} stroke={14} progress={1 - left / total} color={mode === 'focus' ? colors.primary : colors.success}>
          <Text style={styles.time} accessibilityLabel={`Залишилось ${Math.floor(left / 60)} хвилин ${left % 60} секунд`}>
            {fmt(left)}
          </Text>
          <Text style={styles.sub}>{finished ? (mode === 'focus' ? 'Чудова робота!' : 'Перерва скінчилась') : mode === 'focus' ? 'Час вчитись' : 'Відпочиньте'}</Text>
        </Ring>
      </View>

      <View style={styles.actions}>
        {running ? <Button label="Пауза" variant="outline" onPress={pause} /> : <Button label={started ? 'Продовжити' : 'Старт'} onPress={start} />}
        {started && <Button label="Зупинити" variant="outline" onPress={stop} />}
      </View>

      {mode === 'focus' && (
        <View style={styles.card}>
          <Text style={styles.label}>Над чим працюємо</Text>
          {open.length === 0 && <Text style={styles.muted}>Додайте задачу на вкладці «Сьогодні»</Text>}
          {open.map((t) => (
            <Pressable key={t.id} accessibilityRole="radio" accessibilityState={{ selected: taskId === t.id }} disabled={started} onPress={() => setTaskId(taskId === t.id ? undefined : t.id)} style={styles.taskRow}>
              <Ionicons name={taskId === t.id ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} />
              <Text style={styles.taskT} numberOfLines={1}>{t.title}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Налаштування, хв</Text>
        <Stepper title="Фокус" value={settings.focusMin} disabled={started} onChange={(d) => step('focusMin', d, 5, 90)} />
        <Stepper title="Коротка перерва" value={settings.shortBreakMin} disabled={started} onChange={(d) => step('shortBreakMin', d, 1, 30)} />
        <Stepper title="Довга перерва" value={settings.longBreakMin} disabled={started} onChange={(d) => step('longBreakMin', d, 5, 60)} />
        <Stepper title="Ціль на день" value={settings.dailyGoalMin} disabled={false} onChange={(d) => study.setSettings({ dailyGoalMin: Math.min(240, Math.max(10, settings.dailyGoalMin + d * 5)) })} />
      </View>
    </Screen>
  );
}

function Stepper({ title, value, onChange, disabled }: { title: string; value: number; onChange: (d: number) => void; disabled: boolean }) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepT}>{title}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Менше: ${title}`} disabled={disabled} onPress={() => onChange(-1)} hitSlop={8} style={[styles.stepBtn, disabled && styles.off]}>
        <Ionicons name="remove" size={18} color={colors.text} />
      </Pressable>
      <Text style={styles.stepV}>{value}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Більше: ${title}`} disabled={disabled} onPress={() => onChange(1)} hitSlop={8} style={[styles.stepBtn, disabled && styles.off]}>
        <Ionicons name="add" size={18} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  modes: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  mode: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.card },
  modeOn: { backgroundColor: colors.primary },
  modeT: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  modeTOn: { color: colors.onPrimary },
  ringBox: { alignItems: 'center', paddingVertical: 8 },
  time: { fontFamily: fonts.black, fontSize: 56, color: colors.text },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  actions: { gap: 10 },
  card: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16, gap: 10 },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  muted: { fontFamily: fonts.regular, color: colors.muted },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 36 },
  taskT: { flex: 1, fontFamily: fonts.semibold, color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepT: { flex: 1, fontFamily: fonts.regular, color: colors.text },
  stepBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  stepV: { minWidth: 28, textAlign: 'center', fontFamily: fonts.bold, color: colors.text },
  off: { opacity: 0.4 },
});
