import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Robot } from '@/components/Robot';
import type { Lesson } from '@/lib/types';
import { colors, fonts, light, radius } from '@/theme';

const NODE = 68;
const ROW = 112;
const CAT = 104;
// Зсув кружечка від центру: хвиля, як на доріжці з уроками
const OFFSETS = [0, 46, 70, 46, 0, -46, -70, -46];

const TYPE_ICON = { video: 'play', text: 'book', quiz: 'help' } as const;

const LOCK_HINT: Record<Lesson['access'], string | null> = {
  ok: null,
  coming_soon: 'Скоро',
  locked_sequence: 'Відкриється після попереднього уроку',
  needs_subscription: 'Потрібна підписка (оформлюють батьки на сайті)',
  login_required: 'Увійдіть, щоб почати',
  student_only: 'Уроки проходить дитина зі свого акаунта',
};

const GREEN_EDGE = '#0E7A4D';

/** Доріжка уроків: кружечки хвилею з'єднані стежкою, робот летить біля поточного уроку й радіє пройденому. */
export function LessonPath({ lessons }: { lessons: Lesson[] }) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [pulse] = useState(() => new Animated.Value(0));

  const current = lessons.findIndex((l) => !l.done && l.access === 'ok');
  const doneCount = lessons.filter((l) => l.done).length;
  const finished = lessons.length > 0 && doneCount === lessons.length;
  const robotAt = current >= 0 ? current : finished ? lessons.length - 1 : 0;
  const happy = doneCount > 0;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const cx = (i: number) => width / 2 + OFFSETS[i % OFFSETS.length];
  const cy = (i: number) => i * ROW + ROW / 2 + NODE / 2 - 4;
  const height = lessons.length * ROW + 24;

  // Стежка між сусідніми уроками: пройдена частина суцільна зелена, решта — пунктир
  const seg = (i: number) => {
    const midY = (cy(i) + cy(i + 1)) / 2;
    return `M${cx(i)} ${cy(i)} C${cx(i)} ${midY} ${cx(i + 1)} ${midY} ${cx(i + 1)} ${cy(i + 1)}`;
  };

  const halo = { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] }) }] };

  return (
    <View>
      <View style={styles.banner}>
        <View style={styles.bannerBar} accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: lessons.length, now: doneCount }}>
          <View style={[styles.bannerFill, { width: `${lessons.length ? (doneCount / lessons.length) * 100 : 0}%` }]} />
        </View>
        <Text style={styles.bannerT}>
          {finished ? 'Курс пройдено! Робот у захваті 🎉' : doneCount > 0 ? `Пройдено ${doneCount} з ${lessons.length}. Так тримати!` : 'Робот готовий вирушати в дорогу'}
        </Text>
      </View>

      <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <>
            <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
              {lessons.slice(0, -1).map((l, i) => (
                <Path
                  key={l.order}
                  d={seg(i)}
                  stroke={l.done ? light.accent : 'rgba(255,255,255,0.65)'}
                  strokeWidth={l.done ? 8 : 6}
                  strokeLinecap="round"
                  strokeDasharray={l.done ? undefined : '2 14'}
                  fill="none"
                />
              ))}
            </Svg>

            {lessons.map((l, i) => {
              const open = l.access === 'ok';
              const state = l.done ? 'done' : i === current ? 'current' : open ? 'open' : 'locked';
              const left = cx(i) - NODE / 2;
              const top = cy(i) - NODE / 2;
              const robotLeft = OFFSETS[i % OFFSETS.length] >= 0;
              return (
                <View key={l.order}>
                  {robotAt === i && (
                    <View style={[styles.robot, { top: top - 40, left: robotLeft ? 0 : width - CAT }]} pointerEvents="none">
                      <Robot size={CAT} mood={happy ? 'happy' : 'idle'} />
                    </View>
                  )}
                  {state === 'current' && (
                    <>
                      <Animated.View pointerEvents="none" style={[styles.halo, { left, top }, halo]} />
                      <View style={[styles.start, { left: cx(i) - 34, top: top - 34 }]} pointerEvents="none">
                        <Text style={styles.startT}>СТАРТ</Text>
                        <View style={styles.startTail} />
                      </View>
                    </>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Урок ${l.order}. ${l.title}. ${l.done ? 'Пройдено' : open ? 'Доступний' : 'Закритий'}`}
                    onPress={() => setSelected(selected === i ? null : i)}
                    style={[styles.nodeWrap, { left, top }]}>
                    <View style={[styles.shadow, shadowOf[state]]} />
                    <View style={[styles.node, nodeOf[state]]}>
                      <View style={styles.gloss} />
                      <Ionicons
                        name={l.done ? 'checkmark' : open ? TYPE_ICON[l.type] : 'lock-closed'}
                        size={l.done ? 34 : 28}
                        color={state === 'locked' ? 'rgba(255,255,255,0.9)' : state === 'current' ? colors.onPrimary : '#fff'}
                      />
                    </View>
                  </Pressable>
                  <Text style={[styles.num, { left: cx(i) - 40, top: top + NODE + 10 }]} numberOfLines={1}>
                    {l.order}. {l.title}
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </View>

      {selected !== null && lessons[selected] && <LessonCard lesson={lessons[selected]} />}
    </View>
  );
}

function LessonCard({ lesson: l }: { lesson: Lesson }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardT}>Урок {l.order}: {l.title}</Text>
      {!!l.summary && <Text style={styles.cardP}>{l.summary}</Text>}
      <Text style={styles.cardMeta}>
        +{l.xp} XP{l.free ? ' · безкоштовно' : ''}
        {LOCK_HINT[l.access] ? ` · ${LOCK_HINT[l.access]}` : l.done ? ' · пройдено' : ''}
      </Text>
    </View>
  );
}

const nodeOf = StyleSheet.create({
  done: { backgroundColor: light.accent },
  current: { backgroundColor: colors.primary, borderWidth: 4, borderColor: 'rgba(255,255,255,0.55)' },
  open: { backgroundColor: '#7C6CF2' },
  locked: { backgroundColor: 'rgba(255,255,255,0.4)' },
});
const shadowOf = StyleSheet.create({
  done: { backgroundColor: GREEN_EDGE },
  current: { backgroundColor: '#CFCBFF' },
  open: { backgroundColor: '#27369E' },
  locked: { backgroundColor: 'rgba(120,110,200,0.35)' },
});

const styles = StyleSheet.create({
  banner: { backgroundColor: light.card, borderWidth: 1, borderColor: light.border, borderRadius: radius.md, padding: 14, gap: 10, marginBottom: 8 },
  bannerBar: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  bannerFill: { height: 10, borderRadius: 5, backgroundColor: light.accent },
  bannerT: { fontFamily: fonts.bold, fontSize: 14, color: light.text, textAlign: 'center' },
  robot: { position: 'absolute', width: CAT },
  nodeWrap: { position: 'absolute', width: NODE, height: NODE + 8 },
  node: { width: NODE, height: NODE, borderRadius: NODE / 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  shadow: { position: 'absolute', top: 8, width: NODE, height: NODE, borderRadius: NODE / 2 },
  gloss: { position: 'absolute', top: 6, left: 12, width: 26, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.28)', transform: [{ rotate: '-20deg' }] },
  halo: { position: 'absolute', width: NODE, height: NODE, borderRadius: NODE / 2, backgroundColor: colors.primary },
  start: { position: 'absolute', width: 68, alignItems: 'center' },
  startT: { overflow: 'hidden', borderRadius: 10, backgroundColor: colors.onPrimary, color: '#fff', fontFamily: fonts.black, fontSize: 12, paddingHorizontal: 12, paddingVertical: 4 },
  startTail: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.onPrimary },
  num: { position: 'absolute', width: 80, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 10, color: light.muted },
  card: { backgroundColor: light.card, borderWidth: 1, borderColor: light.border, borderRadius: radius.md, padding: 14, gap: 4, marginTop: 4 },
  cardT: { fontFamily: fonts.bold, fontSize: 15, color: light.text },
  cardP: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: light.muted },
  cardMeta: { fontFamily: fonts.semibold, fontSize: 12, color: light.accent },
});
