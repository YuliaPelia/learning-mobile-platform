import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Confetti, PressableScale, Reveal, Skeleton } from '@/components/motion';
import { Robot } from '@/components/Robot';
import { Screen } from '@/components/Screen';
import { useReducedMotion } from '@/components/useReducedMotion';
import { completeLesson, getLesson, submitLessonQuiz } from '@/lib/api';
import { ApiError } from '@/lib/http';
import { select, success, warning } from '@/lib/haptics';
import { parseMarkdown, type Span } from '@/lib/markdown';
import type { LessonContent, QuizResult } from '@/lib/types';
import { colors, light } from '@/theme';
import { makeStyles, useSkin } from '@/theme/skin';

const LOCKED: Record<string, string> = {
  locked_sequence: 'Спочатку пройди попередній урок.',
  needs_subscription: 'Цей урок відкриється з підпискою, яку оформлюють батьки.',
  coming_soon: 'Цей урок скоро зʼявиться.',
  student_only: 'Уроки проходить дитина зі свого акаунта.',
  locked: 'Цей урок поки закритий.',
};

type State = { status: 'loading' } | { status: 'error'; message: string; retry: boolean } | { status: 'ready'; lesson: LessonContent };

// Екран живе у стеку вкладок і не демонтується, тому стан скидаємо ключем при зміні уроку
export default function LessonRoute() {
  useSkin(); // перерендер при зміні вигляду
  const { slug, order } = useLocalSearchParams<{ slug: string; order: string }>();
  return <LessonScreen key={`${slug}:${order}`} slug={slug} order={Number(order)} />;
}

function LessonScreen({ slug, order }: { slug: string; order: number }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [tries, setTries] = useState(0);

  useEffect(() => {
    let alive = true;
    getLesson(slug, order)
      .then((lesson) => alive && setState({ status: 'ready', lesson }))
      .catch((e: unknown) => {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 403) setState({ status: 'error', message: LOCKED[e.code] ?? LOCKED.locked, retry: false });
        else if (e instanceof ApiError && e.status === 401) setState({ status: 'error', message: 'Увійдіть у акаунт дитини, щоб проходити уроки.', retry: false });
        else setState({ status: 'error', message: e instanceof ApiError ? e.message : 'Не вдалося завантажити урок.', retry: true });
      });
    return () => {
      alive = false;
    };
  }, [slug, order, tries]);

  if (state.status === 'loading') {
    return (
      <Screen>
        <StatusBar style="light" />
        <Header onBack={goBack} caption="Завантаження" title="" />
        <Skeleton style={styles.skelVideo} />
        <Skeleton style={styles.skelLine} />
        <Skeleton style={styles.skelLine} />
      </Screen>
    );
  }

  if (state.status === 'error') {
    return (
      <Screen>
        <StatusBar style="light" />
        <Header onBack={goBack} caption={`Урок ${order}`} title="" />
        <View style={styles.card}>
          <Robot size={96} mood="think" />
          <Text style={styles.body}>{state.message}</Text>
          {state.retry && <Button label="Спробувати ще" onPress={() => { setState({ status: 'loading' }); setTries((n) => n + 1); }} />}
        </View>
      </Screen>
    );
  }

  return <Lesson slug={slug} lesson={state.lesson} />;
}

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

function Lesson({ slug, lesson }: { slug: string; lesson: LessonContent }) {
  const [done, setDone] = useState(lesson.done);
  const [earned, setEarned] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'notes' | 'homework'>('notes');
  const [answers, setAnswers] = useState<(number | null)[]>(() => lesson.questions.map(() => null));
  const [result, setResult] = useState<QuizResult | null>(null);
  const reduced = useReducedMotion();
  const isQuiz = lesson.type === 'quiz';
  const allAnswered = answers.every((a) => a !== null);
  const blocks = parseMarkdown(lesson.markdown);

  // Після виходу з екрана скидаємо проміжний стан (екран лишається в стеку)
  useFocusEffect(useCallback(() => () => { setError(null); }, []));

  const finish = (xp: number) => {
    setDone(true);
    setEarned(xp);
    success();
  };

  const onComplete = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await completeLesson(slug, lesson.order);
      finish(r.xp);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не вдалося зберегти. Спробуйте ще раз.');
      warning();
    } finally {
      setBusy(false);
    }
  };

  const onCheck = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await submitLessonQuiz(slug, lesson.order, answers.map((a) => a ?? -1));
      setResult(r);
      if (r.passed) finish(r.xp);
      else warning();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не вдалося надіслати відповіді. Спробуйте ще раз.');
      warning();
    } finally {
      setBusy(false);
    }
  };

  const goNext = () => (lesson.next ? router.replace({ pathname: '/lesson/[slug]/[order]', params: { slug, order: String(lesson.next) } }) : goToCourse());
  const goToCourse = () => router.dismissTo({ pathname: '/course/[id]', params: { id: slug } });

  return (
    <Screen>
      <StatusBar style="light" />
      {earned !== null && !reduced && <Confetti />}
      <Header onBack={goBack} caption={`Урок ${lesson.order} з ${lesson.total}`} title={lesson.title} xp={lesson.xp} />

      {lesson.video && <Video video={lesson.video} title={lesson.title} />}

      {lesson.homework && (
        <View style={styles.tabs} accessibilityRole="tablist">
          {(['notes', 'homework'] as const).map((k) => (
            <Pressable
              key={k}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === k }}
              onPress={() => { select(); setTab(k); }}
              style={[styles.tab, tab === k && styles.tabOn]}>
              <Text style={[styles.tabT, tab === k && styles.tabTOn]}>{k === 'notes' ? 'Конспект' : 'Завдання'}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {tab === 'notes' ? (
        <>
          {blocks.length > 0 && (
            <Reveal style={styles.notes}>
              {blocks.map((b, i) => {
                if (b.kind === 'code') {
                  return (
                    <View key={i} style={styles.code}>
                      <Text style={styles.codeT} selectable>{b.text}</Text>
                    </View>
                  );
                }
                if (b.kind === 'heading') return <Text key={i} style={styles.h} accessibilityRole="header">{renderSpans(b.spans)}</Text>;
                if (b.kind === 'list') {
                  return (
                    <View key={i} style={styles.list}>
                      {b.items.map((it, j) => (
                        <View key={j} style={styles.li}>
                          <Text style={styles.liMark}>{b.ordered ? `${j + 1}.` : '•'}</Text>
                          <Text style={[styles.p, styles.liText]}>{renderSpans(it)}</Text>
                        </View>
                      ))}
                    </View>
                  );
                }
                return <Text key={i} style={styles.p}>{renderSpans(b.spans)}</Text>;
              })}
            </Reveal>
          )}
          {!blocks.length && !lesson.video && !isQuiz && <Text style={styles.body}>У цього уроку ще немає тексту.</Text>}
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.h}>Домашнє завдання</Text>
          <Text style={styles.p}>{lesson.homework?.task}</Text>
          <Text style={styles.hint}>Здати домашку поки можна на сайті у кабінеті учня.</Text>
        </View>
      )}

      {isQuiz && lesson.questions.map((q, qi) => (
        <View key={qi} style={styles.card} accessibilityRole="radiogroup">
          <Text style={styles.q}>{qi + 1}. {q.q}</Text>
          {q.options.map((opt, oi) => {
            const on = answers[qi] === oi;
            return (
              <PressableScale
                key={oi}
                haptic={false}
                accessibilityRole="radio"
                accessibilityState={{ checked: on, disabled: done }}
                accessibilityLabel={opt}
                disabled={done}
                onPress={() => {
                  select();
                  setResult(null);
                  setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)));
                }}
                style={[styles.opt, on && styles.optOn]}>
                <View style={[styles.letter, on && styles.letterOn]}>
                  <Text style={[styles.letterT, on && styles.letterTOn]}>{String.fromCharCode(65 + oi)}</Text>
                </View>
                <Text style={styles.optT}>{opt}</Text>
              </PressableScale>
            );
          })}
        </View>
      ))}

      {result && !result.passed && (
        <View style={styles.card} accessibilityLiveRegion="polite">
          <Robot size={84} mood="sad" />
          <Text style={styles.h}>Правильно {result.correct} з {result.total}</Text>
          <Text style={styles.p}>Потрібно хоча б 60%. Переглянь конспект і спробуй ще раз.</Text>
        </View>
      )}

      {done && (
        <View style={styles.card} accessibilityLiveRegion="polite">
          <Robot size={84} mood="happy" />
          <Text style={styles.h}>Урок пройдено</Text>
          <Text style={styles.p}>
            {earned ? `+${earned} XP. ` : ''}
            {result ? `Правильно ${result.correct} з ${result.total}. ` : ''}
            {lesson.next ? 'Наступний урок уже відкритий.' : 'Це останній відкритий урок курсу.'}
          </Text>
        </View>
      )}

      {error && <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>}

      <View style={styles.footer}>
        <View style={styles.footBtn}>
          <Button variant="outline" label="Назад" onPress={goBack} />
        </View>
        <View style={styles.footMain}>
          {done ? (
            <Button label={lesson.next ? 'Наступний урок' : 'До курсу'} onPress={goNext} />
          ) : isQuiz ? (
            <Button label={result && !result.passed ? 'Перевірити ще раз' : 'Перевірити себе'} onPress={onCheck} loading={busy} disabled={!allAnswered} />
          ) : (
            <Button label="Урок пройдено" onPress={onComplete} loading={busy} />
          )}
        </View>
      </View>
    </Screen>
  );
}

function Header({ onBack, caption, title, xp }: { onBack: () => void; caption: string; title: string; xp?: number }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Назад" onPress={onBack} hitSlop={4} style={styles.back}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>
      <View style={styles.headText}>
        <Text style={styles.caption} numberOfLines={1}>{caption}</Text>
        {!!title && <Text style={styles.title} accessibilityRole="header" numberOfLines={2}>{title}</Text>}
      </View>
      {xp ? <Text style={styles.xp}>+{xp} XP</Text> : null}
    </View>
  );
}

function Video({ video, title }: { video: NonNullable<LessonContent['video']>; title: string }) {
  if (video.kind === 'file') return <FilePlayer url={video.url} />;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Дивитися відео уроку ${title}`}
      onPress={() => WebBrowser.openBrowserAsync(video.url)}
      style={[styles.video, styles.embed]}>
      <View style={styles.playDot}>
        <Ionicons name="play" size={30} color={colors.onPrimary} />
      </View>
      <Text style={styles.embedT}>Дивитися відео</Text>
    </PressableScale>
  );
}

function FilePlayer({ url }: { url: string }) {
  const player = useVideoPlayer(url);
  return (
    <View style={styles.video}>
      <VideoView player={player} style={StyleSheet.absoluteFill} nativeControls contentFit="contain" allowsPictureInPicture />
    </View>
  );
}

function renderSpans(spans: Span[]) {
  return spans.map((s, i) => (
    <Text key={i} style={s.code ? styles.inlineCode : s.bold ? styles.bold : undefined}>{s.text}</Text>
  ));
}

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

const styles = makeStyles((t) => {
  const card = { backgroundColor: light.card, borderRadius: t.radius.md, borderWidth: 1, borderColor: light.border, padding: 16, gap: 12 } as const;
  return StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    back: { width: 44, height: 44, borderRadius: t.radius.md, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', ...t.glassBorder },
    headText: { flex: 1, gap: 2 },
    caption: { fontSize: 12, fontFamily: t.fonts.semibold, color: light.muted },
    title: { fontSize: 20, lineHeight: 26, fontFamily: t.fonts.bold, color: light.text },
    xp: { fontSize: 12, fontFamily: t.fonts.bold, color: colors.onAction, backgroundColor: colors.action, borderRadius: 10, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5 },
    video: { aspectRatio: 16 / 9, borderRadius: t.radius.md, overflow: 'hidden', backgroundColor: colors.codeBg, ...t.glassBorder },
    embed: { alignItems: 'center', justifyContent: 'center', gap: 10 },
    playDot: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
    embedT: { fontSize: 15, fontFamily: t.fonts.bold, color: colors.codeText },
    skelVideo: { aspectRatio: 16 / 9, borderRadius: t.radius.md },
    skelLine: { height: 18, borderRadius: 9 },
    tabs: { flexDirection: 'row', padding: 4, borderRadius: t.radius.md, backgroundColor: colors.card, ...t.glassBorder },
    tab: { flex: 1, minHeight: 44, borderRadius: t.radius.sm + 4, alignItems: 'center', justifyContent: 'center' },
    tabOn: { backgroundColor: colors.action },
    tabT: { fontSize: 15, fontFamily: t.fonts.semibold, color: light.text },
    tabTOn: { fontFamily: t.fonts.bold, color: colors.onAction },
    notes: { gap: 14 },
    h: { fontSize: 20, lineHeight: 26, fontFamily: t.fonts.bold, color: light.text },
    p: { fontSize: 16, lineHeight: 25, fontFamily: t.fonts.regular, color: light.text },
    bold: { fontFamily: t.fonts.bold },
    inlineCode: { fontFamily: mono, backgroundColor: colors.codeBg, color: colors.codeText },
    code: { backgroundColor: colors.codeBg, borderRadius: t.radius.md, padding: 16 },
    codeT: { fontFamily: mono, fontSize: 13, lineHeight: 20, color: colors.codeText },
    list: { gap: 8 },
    li: { flexDirection: 'row', gap: 8 },
    liMark: { fontSize: 16, lineHeight: 25, fontFamily: t.fonts.bold, color: light.text, minWidth: 18 },
    liText: { flex: 1 },
    card: { ...card },
    body: { fontSize: 16, lineHeight: 24, fontFamily: t.fonts.regular, color: light.text },
    hint: { fontSize: 13, lineHeight: 19, fontFamily: t.fonts.regular, color: light.muted },
    q: { fontSize: 16, lineHeight: 23, fontFamily: t.fonts.bold, color: light.text },
    opt: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: t.radius.md, backgroundColor: colors.card, ...t.glassBorder },
    optOn: { backgroundColor: colors.action, borderColor: colors.paper },
    letter: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
    letterOn: { backgroundColor: colors.paper },
    letterT: { fontSize: 13, fontFamily: t.fonts.bold, color: light.text },
    letterTOn: { color: colors.onPrimary },
    optT: { flex: 1, fontSize: 15, lineHeight: 21, fontFamily: t.fonts.semibold, color: light.text },
    error: { fontSize: 13, lineHeight: 19, fontFamily: t.fonts.semibold, color: colors.danger },
    footer: { flexDirection: 'row', gap: 12, marginTop: 4 },
    footBtn: { flex: 1 },
    footMain: { flex: 2 },
  });
});
