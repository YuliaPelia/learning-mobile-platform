import type { Mistake, Quiz } from '@/lib/study/types';

// Тестовий квіз для перевірки роботи екрана. Справжні квізи додаватимуть викладач і менеджер у БД.
// У релізній збірці його немає, щоб користувачі не бачили чернетку.
const testQuizzes: Quiz[] = [
  {
    id: 'test-basics',
    courseId: 'test',
    title: 'Основи програмування (тест)',
    questions: [
      {
        id: 'q1',
        topic: 'Змінні',
        text: 'Що таке змінна?',
        options: ['Імʼя для збереження значення', 'Тип монітора', 'Кнопка на клавіатурі'],
        answer: 0,
        explanation: 'Змінна — це іменована «комірка» памʼяті, у якій лежить значення.',
      },
      {
        id: 'q2',
        topic: 'Цикли',
        text: 'Скільки разів виконається цикл for (i = 0; i < 3; i++)?',
        options: ['2', '3', '4'],
        answer: 1,
        explanation: 'i приймає значення 0, 1, 2 — тобто тричі.',
      },
      {
        id: 'q3',
        topic: 'Оператори',
        text: 'Який результат виразу 2 + 2 * 2?',
        options: ['8', '6', '4'],
        answer: 1,
        explanation: 'Множення виконується першим: 2 * 2 = 4, потім 2 + 4 = 6.',
      },
      {
        id: 'q4',
        topic: 'Умови',
        text: 'Для чого потрібна умова if?',
        options: ['Повторювати код', 'Виконувати код лише коли умова істинна', 'Зберігати дані'],
        answer: 1,
      },
    ],
  },
];

/** Квізи, доступні користувачу: у релізі — лише ті, що прийдуть з бекенду (поки порожньо). */
export const mockQuizzes: Quiz[] = __DEV__ ? testQuizzes : [];

export const getQuiz = (id: string) => mockQuizzes.find((q) => q.id === id);

/** Квіз із питань, на яких раніше помилились і яким уже настав час повторення. */
export function reviewQuiz(mistakes: Mistake[], now = Date.now()): Quiz | undefined {
  const questions = mistakes
    .filter((m) => m.due <= now)
    .flatMap((m) => {
      const q = getQuiz(m.quizId)?.questions.find((x) => x.id === m.questionId);
      return q ? [{ ...q, quizId: m.quizId }] : [];
    });
  return questions.length ? { id: 'review', courseId: '', title: 'Повторення помилок', questions } : undefined;
}
