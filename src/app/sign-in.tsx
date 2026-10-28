import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { ApiError, useAuth, type SignupRequired } from '@/lib/auth/AuthProvider';
import { appleToken, appleAvailable, googleToken, type SocialToken } from '@/lib/auth/social';
import { readAgeGate, writeAgeGate, type AgeGate } from '@/lib/auth/storage';
import { openDoc } from '@/lib/docs';
import { colors, fonts, radius } from '@/theme';

type Mode = 'login' | 'register';
type PendingRegister = { name: string; email: string; password: string; ageConfirm: boolean };

// Вхід — модальний екран: гість спокійно переглядає каталог і потрапляє сюди, лише коли хоче вчитися.
export default function SignIn() {
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [pending, setPending] = useState<PendingRegister | null>(null);
  const [signup, setSignup] = useState<SignupRequired | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Віковий екран перед Google/Apple: SDK не запускаємо, доки не відомо, що користувачу є 14
  const [gate, setGate] = useState<AgeGate | null | 'loading'>('loading');
  const [gateYear, setGateYear] = useState<number | null>(null);
  useEffect(() => {
    readAgeGate().then(setGate);
  }, []);

  const done = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // Єдине місце, де запити обробляють помилки: показуємо текст сервера, а «користувач скасував» ігноруємо
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof ApiError || e instanceof Error ? e.message : 'Щось пішло не так. Спробуйте ще раз.');
    } finally {
      setBusy(false);
    }
  }

  const social = (getToken: () => Promise<SocialToken>) =>
    run(async () => {
      const token = await getToken();
      if (!token) return;
      const res = await auth.signInWithSocial(token);
      if (res.status === 'signup_required') setSignup(res);
      else done();
    });

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
    >
        <View style={styles.head}>
          <View style={styles.logo}>
            <Ionicons name="school" size={30} color={colors.primary} />
          </View>
          <Text style={styles.title}>{pending ? 'Підтвердіть пошту' : signup ? 'Майже готово' : mode === 'login' ? 'Увійдіть, щоб вчитися' : 'Створіть акаунт'}</Text>
          <Text style={styles.sub}>
            {pending
              ? `Надіслали код на ${pending.email}. Введіть його, щоб створити акаунт.`
              : signup
                ? 'Розкажіть, хто ви, щоб ми підготували кабінет.'
                : 'Прогрес, домашки та доступ до уроків зберігаються в акаунті.'}
          </Text>
        </View>

        {error && (
          <View style={styles.error} accessibilityRole="alert">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {pending ? (
          <CodeForm
            busy={busy}
            onSubmit={(code) => run(async () => { await auth.register({ ...pending, code }); done(); })}
            onResend={() => run(async () => { await auth.requestRegisterCode(pending); })}
            onEdit={() => { setPending(null); setError(null); }}
          />
        ) : signup ? (
          <SignupForm signup={signup} initialYear={gateYear} busy={busy} onSubmit={(input) => run(async () => { await auth.completeSignup({ signupToken: signup.signupToken, ...input }); done(); })} />
        ) : (
          <>
            <View style={styles.tabs}>
              {(['login', 'register'] as const).map((m) => (
                <Pressable key={m} accessibilityRole="tab" accessibilityState={{ selected: mode === m }} onPress={() => { setMode(m); setError(null); }} style={[styles.tab, mode === m && styles.tabOn]}>
                  <Text style={[styles.tabText, mode === m && styles.tabTextOn]}>{m === 'login' ? 'Вхід' : 'Реєстрація'}</Text>
                </Pressable>
              ))}
            </View>

            {mode === 'login' ? (
              <LoginForm busy={busy} onSubmit={(login, password) => run(async () => { await auth.signIn(login, password); done(); })} />
            ) : (
              <RegisterForm busy={busy} onSubmit={(input) => run(async () => { await auth.requestRegisterCode(input); setPending(input); })} />
            )}

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.or}>або</Text>
              <View style={styles.line} />
            </View>

            {gate === 'ok' && (
              <View style={styles.socials}>
                {appleAvailable && (
                  <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                    cornerRadius={radius.md}
                    style={styles.apple}
                    onPress={() => social(appleToken)}
                  />
                )}
                <Button variant="outline" label="Продовжити з Google" disabled={busy} onPress={() => social(googleToken)} />
              </View>
            )}
            {gate === null && (
              <AgeGateForm
                onDone={(result, year) => {
                  setGate(result);
                  setGateYear(year);
                  writeAgeGate(result);
                }}
              />
            )}
            {gate === 'young' && (
              <Text style={styles.note}>Вхід через Google чи Apple недоступний. Увійди за логіном і паролем, які створили для тебе батьки.</Text>
            )}
            {mode === 'login' && <Text style={styles.hint}>Дитина входить за логіном, який створили батьки в кабінеті.</Text>}
          </>
        )}
        <Text style={styles.hint}>
          Продовжуючи, ви погоджуєтеся з{' '}
          <Text accessibilityRole="link" style={styles.docLink} onPress={() => openDoc('terms')}>Правилами користування</Text> і{' '}
          <Text accessibilityRole="link" style={styles.docLink} onPress={() => openDoc('privacy')}>Політикою конфіденційності</Text>.
        </Text>
    </ScrollView>
  );
}

function LoginForm({ busy, onSubmit }: { busy: boolean; onSubmit: (login: string, password: string) => void }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={styles.form}>
      <Field label="Email або логін" value={login} onChangeText={setLogin} keyboardType="email-address" textContentType="username" autoComplete="username" />
      <Field label="Пароль" value={password} onChangeText={setPassword} secureTextEntry textContentType="password" autoComplete="current-password" />
      <Button label="Увійти" loading={busy} disabled={!login.trim() || !password} onPress={() => onSubmit(login, password)} />
    </View>
  );
}

function CodeForm({ busy, onSubmit, onResend, onEdit }: { busy: boolean; onSubmit: (code: string) => void; onResend: () => void; onEdit: () => void }) {
  const [code, setCode] = useState('');
  return (
    <View style={styles.form}>
      <Field
        label="Код із листа"
        value={code}
        onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={6}
      />
      <Button label="Підтвердити" loading={busy} disabled={code.length !== 6} onPress={() => onSubmit(code)} />
      <Button variant="outline" label="Надіслати код ще раз" disabled={busy} onPress={onResend} />
      <Pressable accessibilityRole="button" onPress={onEdit} style={styles.backLink}>
        <Text style={styles.docLink}>Змінити дані</Text>
      </Pressable>
    </View>
  );
}

function RegisterForm({ busy, onSubmit }: { busy: boolean; onSubmit: (i: PendingRegister) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageConfirm, setAgeConfirm] = useState(false);
  return (
    <View style={styles.form}>
      <Text style={styles.note}>Реєстрація для батьків. Дитину ви додасте в кабінеті, і вона входитиме за власним логіном.</Text>
      <Field label="Ваше імʼя" value={name} onChangeText={setName} autoCapitalize="words" textContentType="name" />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" textContentType="emailAddress" autoComplete="email" />
      <Field label="Пароль (від 8 символів, літера й цифра)" value={password} onChangeText={setPassword} secureTextEntry textContentType="newPassword" />
      <AgeSwitch value={ageConfirm} onChange={setAgeConfirm} />
      <Button label="Створити акаунт" loading={busy} disabled={!name.trim() || !email.trim() || !password || !ageConfirm} onPress={() => onSubmit({ name, email, password, ageConfirm })} />
    </View>
  );
}

/** Нейтральний віковий екран: поріг не підказуємо, результат запам'ятовуємо. */
function AgeGateForm({ onDone }: { onDone: (result: AgeGate, year: number) => void }) {
  const [birthYear, setBirthYear] = useState('');
  const [invalid, setInvalid] = useState(false);
  const submit = () => {
    const year = Number(birthYear);
    const now = new Date().getFullYear();
    if (!Number.isInteger(year) || year < now - 100 || year > now) return setInvalid(true);
    // Відомий лише рік — тож «точно виповнилося 14», як і на сервері
    onDone(year <= now - 15 ? 'ok' : 'young', year);
  };
  return (
    <View style={styles.form}>
      <Text style={styles.note}>Щоб продовжити з Google або Apple, вкажи рік народження.</Text>
      <Field label="Рік народження" value={birthYear} onChangeText={(v) => { setBirthYear(v); setInvalid(false); }} keyboardType="number-pad" maxLength={4} />
      {invalid && <Text style={[styles.note, styles.warn]}>Вкажи рік народження чотирма цифрами.</Text>}
      <Button variant="outline" label="Далі" disabled={birthYear.length !== 4} onPress={submit} />
    </View>
  );
}

function SignupForm({ signup, initialYear, busy, onSubmit }: { signup: SignupRequired; initialYear: number | null; busy: boolean; onSubmit: (i: { role: 'parent' | 'student'; name: string; ageConfirm?: boolean; birthYear?: number }) => void }) {
  const [role, setRole] = useState<'parent' | 'student'>('parent');
  const [name, setName] = useState(signup.name);
  const [birthYear, setBirthYear] = useState(initialYear ? String(initialYear) : '');
  const [ageConfirm, setAgeConfirm] = useState(false);
  const year = Number(birthYear);
  // Самостійно — лише з 14 років (сервер перевіряє так само); молодшим профіль створюють батьки
  const tooYoung = role === 'student' && birthYear.length === 4 && year > new Date().getFullYear() - 15;
  const ready = name.trim().length > 1 && (role === 'parent' ? ageConfirm : year > 1900 && !tooYoung);
  return (
    <View style={styles.form}>
      <View style={styles.tabs}>
        {(['parent', 'student'] as const).map((r) => (
          <Pressable key={r} accessibilityRole="tab" accessibilityState={{ selected: role === r }} onPress={() => setRole(r)} style={[styles.tab, role === r && styles.tabOn]}>
            <Text style={[styles.tabText, role === r && styles.tabTextOn]}>{r === 'parent' ? 'Я батько/мати' : 'Я учень'}</Text>
          </Pressable>
        ))}
      </View>
      {signup.email && <Text style={styles.note}>{signup.email}</Text>}
      <Field label={role === 'parent' ? 'Ваше імʼя' : 'Імʼя або нікнейм'} value={name} onChangeText={setName} autoCapitalize="words" />
      {role === 'parent' ? (
        <AgeSwitch value={ageConfirm} onChange={setAgeConfirm} />
      ) : (
        <>
          <Field label="Рік народження" value={birthYear} onChangeText={setBirthYear} keyboardType="number-pad" maxLength={4} />
          {tooYoung && (
            <Text style={[styles.note, styles.warn]}>
              Самостійно зареєструватися можна з 14 років. Попроси батьків створити тобі профіль на сайті — і входь за логіном від них.
            </Text>
          )}
        </>
      )}
      <Button
        label="Продовжити"
        loading={busy}
        disabled={!ready}
        onPress={() => onSubmit(role === 'parent' ? { role, name, ageConfirm } : { role, name, birthYear: year })}
      />
    </View>
  );
}

function AgeSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.switchRow}>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} accessibilityLabel="Підтверджую, що мені є 18 років" />
      <Text style={styles.switchText}>Мені є 18 років, я батько/мати/опікун</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 18 },
  head: { alignItems: 'center', gap: 8, paddingTop: 12 },
  logo: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontFamily: fonts.bold, color: colors.text, textAlign: 'center' },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  error: { backgroundColor: '#FFEDEF', borderRadius: radius.sm, padding: 12 },
  errorText: { color: '#C73A4B', fontFamily: fonts.regular, fontSize: 14 },
  tabs: { flexDirection: 'row', backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 4 },
  tab: { flex: 1, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.card },
  tabText: { fontSize: 14, fontFamily: fonts.semibold, color: colors.muted },
  tabTextOn: { color: colors.primary },
  form: { gap: 14 },
  warn: { color: colors.warm },
  docLink: { color: colors.text, textDecorationLine: 'underline' },
  backLink: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  note: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, lineHeight: 19 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  socials: { gap: 12 },
  apple: { height: 50 },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, textAlign: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.text, lineHeight: 18 },
});
