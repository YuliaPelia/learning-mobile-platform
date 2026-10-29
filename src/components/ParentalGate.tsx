import { useCallback, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { isCorrect, lockoutMs, nextChallenge, type Challenge } from '@/lib/parentalGate';
import { colors } from '@/theme';
import { makeStyles } from '@/theme/skin';

/** `ask(action)` показує перевірку й виконує `action` лише після правильної відповіді; `element` — модальне вікно, його треба вивести на екрані. */
export function useParentalGate(): { ask: (action: () => void) => void; element: ReactNode } {
  const [pending, setPending] = useState<{ action: () => void; challenge: Challenge } | null>(null);
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  const [fails, setFails] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [waitSec, setWaitSec] = useState(0);

  const close = () => {
    setPending(null);
    setValue('');
    setWrong(false);
  };
  const ask = useCallback((action: () => void) => setPending({ action, challenge: nextChallenge() }), []);

  const submit = () => {
    if (!pending) return;
    if (Date.now() < lockedUntil) return;
    if (isCorrect(pending.challenge, value)) {
      const { action } = pending;
      setFails(0);
      setWaitSec(0);
      close();
      action();
    } else {
      const n = fails + 1;
      setFails(n);
      const wait = lockoutMs(n);
      if (wait) setLockedUntil(Date.now() + wait);
      setWaitSec(Math.ceil(wait / 1000));
      setWrong(true);
      setValue('');
      setPending({ ...pending, challenge: nextChallenge() });
    }
  };

  const element = (
    <Modal visible={!!pending} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <Text style={styles.title} accessibilityRole="header">Тільки для дорослих</Text>
          <Text style={styles.text}>Щоб продовжити, розвʼяжи приклад.</Text>
          <Text style={styles.q}>{pending?.challenge.text}</Text>
          <TextInput
            value={value}
            onChangeText={(t) => {
              setValue(t.replace(/[^0-9]/g, ''));
              setWrong(false);
            }}
            keyboardType="number-pad"
            accessibilityLabel="Відповідь"
            maxLength={4}
            onSubmitEditing={submit}
            style={styles.input}
          />
          {wrong && <Text style={styles.err}>{waitSec > 0 ? `Забагато спроб. Зачекайте ${waitSec} с і спробуйте знову.` : 'Неправильно. Спробуй новий приклад.'}</Text>}
          <Button label="Продовжити" onPress={submit} disabled={!value} />
          <Pressable accessibilityRole="button" onPress={close} style={styles.cancel}>
            <Text style={styles.cancelT}>Скасувати</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return { ask, element };
}

const styles = makeStyles((t) => {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(20,12,80,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
    card: { width: '100%', maxWidth: 360, gap: 12, backgroundColor: '#2D2692', borderRadius: t.radius.lg, padding: 20, ...t.glassBorder, },
    title: { fontFamily: t.fonts.black, fontSize: 24, color: colors.text },
    text: { fontFamily: t.fonts.regular, color: colors.muted },
    q: { fontFamily: t.fonts.bold, fontSize: 20, color: colors.text, textAlign: 'center', paddingVertical: 4 },
    input: { height: 52, borderRadius: t.radius.md, backgroundColor: colors.card, ...t.glassBorder, color: colors.text, fontFamily: t.fonts.bold, fontSize: 24, textAlign: 'center' },
    err: { fontFamily: t.fonts.semibold, color: colors.danger, textAlign: 'center' },
    cancel: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    cancelT: { fontFamily: t.fonts.semibold, color: colors.text },
  });
});
