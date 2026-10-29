import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Confetti, PressableScale } from '@/components/motion';
import { Robot } from '@/components/Robot';
import { success, warning } from '@/lib/haptics';
import { Screen, sectionTitle } from '@/components/Screen';
import { getQuiz, reviewQuiz } from '@/data/quizzes';
import { study, useStudy } from '@/lib/study/store';
import { colors } from '@/theme';
import { calm, makeStyles, useSkin } from '@/theme/skin';

// Екран живе всередині вкладок і не демонтується, тому після виходу скидаємо квіз новим ключем
export default function QuizRoute() {
  useSkin(); // перерендер при зміні вигляду
  const { id } = useLocalSearchParams<{ id: string }>();
  const [run, setRun] = useState(0);
  useFocusEffect(useCallback(() => () => setRun((n) => n + 1), []));
  return <QuizScreen key={`${id}:${run}`} id={id} />;
}

function QuizScreen({ id }: { id: string }) {
  const { mistakes } = useStudy();
  const review = id === 'review';
  // Черга повторення фіксується на старті, щоб питання не зникали посеред проходження
  const [queue] = useState(() => mistakes);
  const quiz = review ? reviewQuiz(queue) : getQuiz(id);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const pro = useSkin() === 'pro';

  if (!quiz) {
    return (
      <Screen back>
        <Text style={sectionTitle()}>{review ? 'Помилок для повторення немає' : 'Квіз не знайдено'}</Text>
      </Screen>
    );
  }

  const q = quiz.questions[index];
  const last = index === quiz.questions.length - 1;

  const next = () => {
    if (!last) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    if (!review) study.addQuizResult(quiz.id, correct, quiz.questions.length);
    setDone(true);
  };

  if (done) {
    const pct = Math.round((correct / quiz.questions.length) * 100);
    return (
      <Screen back title="Результат">
        {!pro && pct >= 80 && <Confetti />}
        <View style={styles.result}>
          {!pro && <Robot size={120} mood={pct >= 80 ? 'happy' : pct >= 50 ? 'idle' : 'sad'} />}
          <Text style={styles.big}>{pct}%</Text>
          <Text style={styles.sub}>
            {correct} з {quiz.questions.length} правильно · {pct >= 80 ? calm('Відмінно!') : pct >= 50 ? 'Непогано, повторіть складні теми' : 'Варто повторити матеріал'}
          </Text>
        </View>
        <Button label="Пройти ще раз" onPress={() => { setIndex(0); setPicked(null); setCorrect(0); setDone(false); }} />
        <Button variant="outline" label="Готово" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen back title={quiz.title}>
      <Text style={styles.count}>Питання {index + 1} з {quiz.questions.length}</Text>
      <Text style={styles.q}>{q.text}</Text>
      {q.options.map((o, i) => {
        const answered = picked !== null;
        const right = answered && i === q.answer;
        const wrong = answered && i === picked && i !== q.answer;
        return (
          <PressableScale
            key={o}
            accessibilityRole="button"
            accessibilityLabel={right ? `${o}. Правильно` : wrong ? `${o}. Неправильно` : o}
            accessibilityState={{ disabled: answered }}
            disabled={answered}
            onPress={() => {
              setPicked(i);
              if (i === q.answer) {
                setCorrect((c) => c + 1);
                success();
              } else warning();
              study.answer(q.quizId ?? quiz.id, q.id, q.topic, i === q.answer);
            }}
            haptic={false}
            style={[styles.opt, right && styles.right, wrong && styles.wrong]}>
            <Text style={styles.optT}>{o}</Text>
            {right && <Ionicons name="checkmark-circle" size={22} color={colors.success} />}
            {wrong && <Ionicons name="close-circle" size={22} color={colors.danger} />}
          </PressableScale>
        );
      })}
      {picked !== null && (
        <>
          {q.explanation && <Text style={styles.expl}>{q.explanation}</Text>}
          <Button label={last ? 'Завершити' : 'Далі'} onPress={next} />
        </>
      )}
    </Screen>
  );
}

const styles = makeStyles((t) => {
  return StyleSheet.create({
    count: { fontFamily: t.fonts.semibold, color: colors.muted },
    q: { fontFamily: t.fonts.bold, fontSize: 20, color: colors.text },
    opt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderRadius: t.radius.md, ...t.glassBorder, padding: 16, minHeight: 56 },
    optT: { flex: 1, fontFamily: t.fonts.semibold, fontSize: 15, color: colors.text },
    right: { borderColor: colors.success },
    wrong: { borderColor: colors.danger },
    expl: { fontFamily: t.fonts.regular, color: colors.muted, lineHeight: 20 },
    result: { alignItems: 'center', gap: 8, paddingVertical: 24 },
    big: { fontFamily: t.fonts.black, fontSize: 64, color: colors.primary },
    sub: { fontFamily: t.fonts.regular, color: colors.muted, textAlign: 'center' },
  });
});
