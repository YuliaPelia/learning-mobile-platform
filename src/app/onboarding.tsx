import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { MascotBubble } from '@/components/home/MascotBubble';
import { AnimatedBar, PressableScale, Reveal } from '@/components/motion';
import { Planet } from '@/components/Planet';
import { Screen } from '@/components/Screen';
import { useAsync } from '@/components/useAsync';
import { getCourses } from '@/lib/api';
import { select } from '@/lib/haptics';
import { onboarding } from '@/lib/onboarding/store';
import { recommend } from '@/lib/onboarding/recommend';
import type { Activity, AgeBand, Answers, Experience, Hobby, Interest, Who } from '@/lib/onboarding/types';
import { lessonsText } from '@/lib/plural';
import { study } from '@/lib/study/store';
import type { Course } from '@/lib/types';
import { colors } from '@/theme';
import { useSkin, calm, makeStyles } from '@/theme/skin';

type Icon = React.ComponentProps<typeof Ionicons>['name'];
type Option<T extends string | number> = { value: T; icon: Icon; label: string; childLabel?: string; hint?: string };

const WHO: Option<Who>[] = [
  { value: 'self', icon: 'person-outline', label: 'Для мене' },
  { value: 'child', icon: 'people-outline', label: 'Для моєї дитини' },
];
const AGES: Option<AgeBand>[] = [
  { value: '9-10', icon: 'sparkles-outline', label: '9–10 років' },
  { value: '11-12', icon: 'rocket-outline', label: '11–12 років' },
  { value: '13-14', icon: 'planet-outline', label: '13–14 років' },
  { value: '15-17', icon: 'flash-outline', label: '15–17 років' },
];
const HOBBIES: Option<Hobby>[] = [
  { value: 'drawing', icon: 'brush-outline', label: 'Малювання' },
  { value: 'music', icon: 'musical-notes-outline', label: 'Музика' },
  { value: 'sports', icon: 'basketball-outline', label: 'Спорт' },
  { value: 'reading', icon: 'book-outline', label: 'Читання й історії' },
  { value: 'building', icon: 'construct-outline', label: 'Конструктори' },
  { value: 'videogames', icon: 'game-controller-outline', label: 'Відеоігри' },
  { value: 'science', icon: 'flask-outline', label: 'Досліди й наука' },
  { value: 'video', icon: 'videocam-outline', label: 'Кіно й відео' },
];
const ACTIVITIES: Option<Activity>[] = [
  { value: 'story', icon: 'chatbubbles-outline', label: 'Вигадувати історії' },
  { value: 'draw', icon: 'color-palette-outline', label: 'Малювати й оформлювати' },
  { value: 'build', icon: 'cube-outline', label: 'Будувати й збирати' },
  { value: 'puzzle', icon: 'extension-puzzle-outline', label: 'Розгадувати головоломки' },
  { value: 'compete', icon: 'medal-outline', label: 'Змагатися й грати' },
  { value: 'help', icon: 'heart-outline', label: 'Допомагати іншим' },
];
const INTERESTS: Option<Interest>[] = [
  { value: 'games', icon: 'game-controller-outline', label: 'Ігри' },
  { value: 'sites', icon: 'globe-outline', label: 'Сайти' },
  { value: 'design', icon: 'color-palette-outline', label: 'Малювання й дизайн' },
  { value: 'apps', icon: 'phone-portrait-outline', label: 'Додатки для телефона' },
  { value: 'bots', icon: 'hardware-chip-outline', label: 'Боти й розумні програми' },
  { value: 'animation', icon: 'film-outline', label: 'Анімація й мультики' },
];
const EXPERIENCE: Option<Experience>[] = [
  { value: 'new', icon: 'leaf-outline', label: 'Починаю з нуля', childLabel: 'Починає з нуля' },
  { value: 'some', icon: 'footsteps-outline', label: 'Є невеликий досвід', childLabel: 'Є невеликий досвід' },
  { value: 'pro', icon: 'trophy-outline', label: 'Уже непогано вмію', childLabel: 'Уже непогано вміє' },
];
const MINUTES: Option<10 | 20 | 40>[] = [
  { value: 10, icon: 'timer-outline', label: '10 хвилин', hint: 'Легкий старт' },
  { value: 20, icon: 'timer-outline', label: '20 хвилин', hint: 'Оптимально' },
  { value: 40, icon: 'timer-outline', label: '40 хвилин', hint: 'Серйозно' },
];
const INTEREST_NAME: Record<Interest, string> = { games: 'ігри', sites: 'сайти', design: 'малювання й дизайн', apps: 'додатки', bots: 'ботів і розумні програми', animation: 'анімацію' };

const NAME: Record<string, string> = {
  drawing: 'малювання', music: 'музика', sports: 'спорт', reading: 'читання', building: 'конструктори', videogames: 'відеоігри', science: 'досліди', video: 'кіно й відео',
  story: 'вигадувати історії', draw: 'малювати', build: 'будувати', puzzle: 'головоломки', compete: 'змагання', help: 'допомагати іншим',
};

const STEPS = ['who', 'age', 'hobbies', 'activities', 'interests', 'experience'] as const;

/** Вхідний квіз: 5 коротких запитань → 1–2 курси з поясненням. Принципи — в `.claude/skills/child-psychology-ux`. */
export default function Onboarding() {
  useSkin(); // перерендер при зміні вигляду
  // Лише в розробці: ?step=2 і ?demo=1 дозволяють оглянути потрібний крок із готовими відповідями
  const dev = useLocalSearchParams<{ step?: string; demo?: string }>();
  const [step, setStep] = useState(() => (__DEV__ && dev.step ? Number(dev.step) : 0));
  const [a, setA] = useState<Partial<Answers>>(() =>
    __DEV__ && dev.demo ? { who: 'self', age: '13-14', hobbies: ['drawing', 'music'], activities: ['story'], interests: [], experience: 'some' } : {},
  );
  const courses = useAsync<Course[]>(getCourses, []);
  const child = a.who === 'child';
  const t = (self: string, kid: string) => (child ? kid : self);
  const done = step >= STEPS.length;

  const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const skipAll = () => {
    onboarding.skip();
    leave();
  };
  const next = () => {
    if (step === STEPS.length - 1) {
      onboarding.finish(a);
    }
    setStep((s) => s + 1);
  };
  const restart = () => {
    setA({});
    setStep(0);
  };

  const left = STEPS.length - step - 1;
  const bubble = calm(done
    ? 'Ось що я підібрав. Це підказка, а не вирок: усі курси завжди поруч.'
    : step === 0
      ? 'Привіт! Дай відповідь на кілька запитань, і я підберу курс. Тут немає правильних чи неправильних відповідей.'
      : left === 0
        ? 'Останнє запитання!'
        : `Чудово! Лишилось ${left} ${left === 1 ? 'запитання' : left < 5 ? 'запитання' : 'запитань'}.`);

  return (
    <Screen>
      <View style={styles.top}>
        {step > 0 && !done ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Назад" onPress={() => setStep((s) => s - 1)} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
        <View style={styles.bar} accessible accessibilityRole="progressbar" accessibilityLabel="Прогрес квізу" accessibilityValue={{ min: 0, max: STEPS.length, now: Math.min(step, STEPS.length) }}>
          <AnimatedBar progress={Math.min(step, STEPS.length) / STEPS.length} height={8} />
        </View>
        <Pressable accessibilityRole="button" onPress={done ? leave : skipAll} hitSlop={8} style={styles.skip}>
          <Text style={styles.skipT}>{done ? 'Закрити' : 'Пропустити'}</Text>
        </Pressable>
      </View>

      <MascotBubble mood={done ? 'happy' : 'idle'} text={bubble} />

      {!done && (
        <Reveal key={step}>
          {STEPS[step] === 'who' && <Question title="Для кого підбираємо курс?" options={WHO} value={a.who} onPick={(v) => setA({ ...a, who: v })} />}
          {STEPS[step] === 'age' && (
            <Question title={t('Скільки тобі років?', 'Скільки років дитині?')} hint="Це потрібно, щоб підібрати складність. Відповідь лишається на цьому пристрої." options={AGES} value={a.age} onPick={(v) => setA({ ...a, age: v })} />
          )}
          {STEPS[step] === 'hobbies' && (
            <Question
              multi
              title={t('Чим ти любиш займатися у вільний час?', 'Чим дитина любить займатися у вільний час?')}
              hint="Можна обрати до трьох. Це допоможе підібрати курс до душі."
              options={HOBBIES}
              values={a.hobbies ?? []}
              onToggle={(v) => {
                const cur = a.hobbies ?? [];
                setA({ ...a, hobbies: cur.includes(v) ? cur.filter((x) => x !== v) : cur.length < 3 ? [...cur, v] : cur });
              }}
            />
          )}
          {STEPS[step] === 'activities' && (
            <Question
              multi
              title={t('Що тобі найбільше подобається робити?', 'Що дитині найбільше подобається робити?')}
              hint="Теж до трьох варіантів."
              options={ACTIVITIES}
              values={a.activities ?? []}
              onToggle={(v) => {
                const cur = a.activities ?? [];
                setA({ ...a, activities: cur.includes(v) ? cur.filter((x) => x !== v) : cur.length < 3 ? [...cur, v] : cur });
              }}
            />
          )}
          {STEPS[step] === 'interests' && (
            <Question
              multi
              title={t('Що тобі хочеться створити?', 'Що дитині хочеться створити?')}
              hint="Можна обрати до трьох варіантів."
              options={INTERESTS}
              values={a.interests ?? []}
              onToggle={(v) => {
                const cur = a.interests ?? [];
                setA({ ...a, interests: cur.includes(v) ? cur.filter((x) => x !== v) : cur.length < 3 ? [...cur, v] : cur });
              }}
            />
          )}
          {STEPS[step] === 'experience' && <Question title="Як із програмуванням?" options={EXPERIENCE.map((o) => ({ ...o, label: child ? (o.childLabel ?? o.label) : o.label }))} value={a.experience} onPick={(v) => setA({ ...a, experience: v })} />}
          <View style={styles.actions}>
            <Button label={step === STEPS.length - 1 ? 'Підібрати курс' : 'Далі'} onPress={next} disabled={STEPS[step] === 'who' && !a.who} />
            {STEPS[step] !== 'who' && (
              <Pressable accessibilityRole="button" onPress={next} style={styles.later}>
                <Text style={styles.laterT}>Не знаю, пропустити запитання</Text>
              </Pressable>
            )}
          </View>
        </Reveal>
      )}

      {done && <Result answers={a} courses={courses} onRestart={restart} onMinutes={(m) => {
        const next = { ...a, minutes: m };
        setA(next);
        onboarding.finish(next);
        study.setSettings({ dailyGoalMin: m });
      }} />}
    </Screen>
  );
}

function Question<T extends string | number>(props: { title: string; hint?: string; options: Option<T>[] } & ({ multi?: false; value?: T; onPick: (v: T) => void } | { multi: true; values: T[]; onToggle: (v: T) => void })) {
  return (
    <View style={styles.q}>
      <Text style={styles.title} accessibilityRole="header">{props.title}</Text>
      {props.hint ? <Text style={styles.hint}>{props.hint}</Text> : null}
      <View style={styles.options}>
        {props.options.map((o) => {
          const on = props.multi ? props.values.includes(o.value) : props.value === o.value;
          return (
            <PressableScale
              key={String(o.value)}
              accessibilityRole={props.multi ? 'checkbox' : 'radio'}
              accessibilityState={props.multi ? { checked: on } : { selected: on }}
              accessibilityLabel={o.hint ? `${o.label}. ${o.hint}` : o.label}
              haptic={false}
              onPress={() => {
                select();
                if (props.multi) props.onToggle(o.value);
                else props.onPick(o.value);
              }}
              style={[styles.option, on && styles.optionOn]}>
              <View style={[styles.optIcon, on && styles.optIconOn]}>
                <Ionicons name={o.icon} size={24} color={colors.text} />
              </View>
              <View style={styles.optBody}>
                <Text style={styles.optLabel}>{o.label}</Text>
                {o.hint ? <Text style={styles.optHint}>{o.hint}</Text> : null}
              </View>
              {on && <Ionicons name={props.multi ? 'checkbox' : 'checkmark-circle'} size={22} color={colors.text} />}
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

function Result({ answers, courses, onRestart, onMinutes }: { answers: Partial<Answers>; courses: Course[]; onRestart: () => void; onMinutes: (m: 10 | 20 | 40) => void }) {
  const picks = recommend(answers, courses);
  const kid = answers.who === 'child';
  return (
    <Reveal>
      <Text style={styles.title} accessibilityRole="header">{kid ? 'Підібрано для дитини' : 'Підібрано для тебе'}</Text>
      {picks.length === 0 && <Text style={styles.hint}>Поки що немає курсів, що точно підходять. Подивись усі курси — перші уроки безкоштовні.</Text>}
      {picks.map((r, i) => {
        const why = [
          r.reasons.includes('age') ? 'підходить за віком' : null,
          r.interest ? `збігається з інтересом: ${INTEREST_NAME[r.interest as Interest]}` : null,
          r.reasons.includes('hobby') && r.hobby ? `поєднується із захопленням: ${NAME[r.hobby]}` : null,
          r.reasons.includes('level') ? 'зручний старт з нуля' : null,
        ].filter(Boolean);
        return (
          <Reveal key={r.course.id} index={i + 1}>
            <View style={styles.pick}>
              <View style={styles.pickHead}>
                <Planet course={r.course} size={56} />
                <View style={styles.optBody}>
                  <Text style={styles.pickTitle}>{r.course.title}</Text>
                  <Text style={styles.optHint}>{r.course.age} років · {lessonsText(r.course.lessons)}</Text>
                </View>
              </View>
              {why.length > 0 && <Text style={styles.hint}>{why.join(' · ')}</Text>}
              <Button label="Відкрити курс" onPress={() => router.replace({ pathname: '/course/[id]', params: { id: r.course.id } })} />
            </View>
          </Reveal>
        );
      })}
      <View style={styles.q}>
        <Text style={styles.pickTitle}>{kid ? 'Скільки часу на день зручно дитині?' : 'Скільки часу на день тобі зручно?'}</Text>
        <Text style={styles.hint}>Мало, але щодня — працює краще, ніж довго й рідко. Це стане денною ціллю.</Text>
        <View style={styles.chips}>
          {MINUTES.map((m) => {
            const on = answers.minutes === m.value;
            return (
              <PressableScale key={m.value} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`${m.label}. ${m.hint}`} haptic={false} onPress={() => { select(); onMinutes(m.value); }} style={[styles.chip, on && styles.chipOn]}>
                <Text style={styles.chipT}>{m.value} хв</Text>
                <Text style={styles.chipH}>{m.hint}</Text>
              </PressableScale>
            );
          })}
        </View>
      </View>
      <Button variant="outline" label="Усі курси" onPress={() => router.replace('/courses')} />
      <Pressable accessibilityRole="button" onPress={onRestart} style={styles.later}>
        <Text style={styles.laterT}>Пройти ще раз</Text>
      </Pressable>
    </Reveal>
  );
}

const styles = makeStyles((t) => {
  return StyleSheet.create({
    top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    bar: { flex: 1 },
    skip: { minHeight: 44, justifyContent: 'center' },
    skipT: { ...t.type.caption, fontFamily: t.fonts.semibold, color: colors.text, textDecorationLine: 'underline' },
    q: { gap: 10 },
    title: { ...t.type.title, color: colors.text },
    hint: { ...t.type.body, color: colors.muted },
    options: { gap: 10, marginTop: 6 },
    option: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 64, padding: 12, borderRadius: t.radius.lg, backgroundColor: colors.card, ...t.glassBorder },
    optionOn: { backgroundColor: 'rgba(255,255,255,0.2)', borderTopColor: '#FFFFFF', borderLeftColor: '#FFFFFF', borderRightColor: '#FFFFFF', borderBottomColor: '#FFFFFF' },
    optIcon: { width: 44, height: 44, borderRadius: t.radius.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
    optIconOn: { backgroundColor: colors.action },
    optBody: { flex: 1, gap: 2 },
    optLabel: { ...t.type.subhead, color: colors.text },
    optHint: { ...t.type.caption, color: colors.muted },
    actions: { gap: 4, marginTop: 14 },
    later: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    laterT: { ...t.type.caption, fontFamily: t.fonts.semibold, color: colors.text, textDecorationLine: 'underline' },
    chips: { flexDirection: 'row', gap: 8, marginTop: 4 },
    chip: { flex: 1, minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: t.radius.md, backgroundColor: colors.card, ...t.glassBorder },
    chipOn: { backgroundColor: colors.action },
    chipT: { ...t.type.subhead, color: colors.text },
    chipH: { ...t.type.micro, color: colors.muted },
    pick: { gap: 10, padding: 16, borderRadius: t.radius.lg, backgroundColor: colors.glass, ...t.glassBorder },
    pickHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    pickTitle: { ...t.type.heading, color: colors.text },
  });
});
