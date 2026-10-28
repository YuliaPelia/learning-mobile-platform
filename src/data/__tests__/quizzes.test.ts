import { getQuiz, reviewQuiz } from '../quizzes';

const NOW = 1_000_000_000_000;
const m = (questionId: string, due: number, quizId = 'test-basics') => ({ quizId, questionId, box: 0, due });

describe('reviewQuiz', () => {
  it('__DEV__ у jest дає тестовий квіз', () => expect(getQuiz('test-basics')).toBeDefined());
  it('undefined без помилок', () => expect(reviewQuiz([], NOW)).toBeUndefined());
  it('бере лише питання, строк яких настав (включно з рівним now)', () => {
    const quiz = reviewQuiz([m('q1', NOW - 1), m('q2', NOW), m('q3', NOW + 1)], NOW)!;
    expect(quiz.questions.map((q) => q.id)).toEqual(['q1', 'q2']);
    expect(quiz.id).toBe('review');
  });
  it('undefined якщо жодне ще не настало', () => {
    expect(reviewQuiz([m('q1', NOW + 1)], NOW)).toBeUndefined();
  });
  it('ігнорує питання з невідомих квізів/id', () => {
    expect(reviewQuiz([m('q1', 0, 'nope'), m('zzz', 0)], NOW)).toBeUndefined();
  });
  it('проставляє quizId у питання', () => {
    expect(reviewQuiz([m('q1', 0)], NOW)!.questions[0].quizId).toBe('test-basics');
  });
});
