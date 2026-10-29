import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale, Skeleton } from '@/components/motion';
import { Planet } from '@/components/Planet';
import { lessonsText } from '@/lib/plural';
import type { Course } from '@/lib/types';
import { colors } from '@/theme';
import { makeStyles } from '@/theme/skin';

const W = 208;

/** Стрічка курсів: компактні картки з підписаною дією. Поки курси вантажаться — каркаси замість порожнечі. */
export function CourseStrip({ courses }: { courses: Course[] }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.h} accessibilityRole="header">Курси</Text>
        <Pressable accessibilityRole="link" onPress={() => router.push('/courses')} hitSlop={12} style={styles.all}>
          <Text style={styles.allT}>Усі</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list} style={styles.scroll}>
        {courses.length === 0
          ? [0, 1].map((i) => <Skeleton key={i} style={styles.tile} />)
          : courses.map((c) => <Tile key={c.id} course={c} />)}
      </ScrollView>
    </View>
  );
}

function Tile({ course }: { course: Course }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${course.title}. ${course.soon ? 'Скоро' : lessonsText(course.lessons)}`}
      onPress={() => router.push({ pathname: '/course/[id]', params: { id: course.id } })}
      style={styles.tile}>
      <Ionicons name={course.icon} size={110} color="rgba(255,255,255,0.07)" style={styles.mark} />
      <Planet course={course} size={56} />
      <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
      <Text style={styles.meta}>{course.age} років · {course.soon ? 'скоро' : lessonsText(course.lessons)}</Text>
      <View style={[styles.cta, course.soon && styles.ctaSoon]}>
        <Text style={[styles.ctaT, course.soon && styles.ctaTSoon]}>{course.soon ? 'Скоро' : 'Відкрити'}</Text>
      </View>
    </PressableScale>
  );
}

const styles = makeStyles((t) => {
  return StyleSheet.create({
    wrap: { gap: 12 },
    head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    h: { fontSize: 20, fontFamily: t.fonts.bold, color: colors.text },
    all: { minHeight: 44, justifyContent: 'center' },
    allT: { fontFamily: t.fonts.semibold, fontSize: 15, color: colors.text, textDecorationLine: 'underline' },
    scroll: { marginHorizontal: -20 },
    list: { paddingHorizontal: 20, gap: 12 },
    tile: { width: W, minHeight: 190, gap: 6, overflow: 'hidden', backgroundColor: colors.glass, ...t.glassBorder, borderRadius: t.radius.lg, padding: 14 },
    mark: { position: 'absolute', right: -14, bottom: -14 },
    title: { fontFamily: t.fonts.bold, fontSize: 16, lineHeight: 21, color: colors.text, marginTop: 6 },
    meta: { fontFamily: t.fonts.regular, fontSize: 13, color: colors.muted },
    cta: { alignSelf: 'flex-start', marginTop: 'auto', minHeight: 36, justifyContent: 'center', borderRadius: 999, paddingHorizontal: 16, backgroundColor: colors.action },
    ctaSoon: { backgroundColor: colors.primarySoft },
    ctaT: { fontFamily: t.fonts.bold, fontSize: 13, color: colors.onAction },
    ctaTSoon: { color: colors.text },
  });
});
