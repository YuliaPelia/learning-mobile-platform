export type Task = {
  id: string;
  title: string;
  /** slug курсу, до якого належить задача */
  courseId?: string;
  done: boolean;
  createdAt: number;
  doneAt?: number;
};

/** Завершена сесія таймера. */
export type FocusSession = {
  id: string;
  startedAt: number;
  /** фактичні хвилини фокусу */
  minutes: number;
  taskId?: string;
};

export type QuizResult = {
  id: string;
  quizId: string;
  at: number;
  correct: number;
  total: number;
};

export type StudySettings = {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  /** денна ціль, хвилин */
  dailyGoalMin: number;
  /** щоденне нагадування «час вчитись» */
  reminderOn: boolean;
  reminderHour: number;
};

/** Питання, на якому помилились: повторюється за інтервалами (1, 3, 7, 14 днів). */
export type Mistake = { quizId: string; questionId: string; box: number; due: number };

export type TopicStat = { correct: number; total: number };

export type StudyState = {
  tasks: Task[];
  sessions: FocusSession[];
  quizResults: QuizResult[];
  mistakes: Mistake[];
  topics: Record<string, TopicStat>;
  /** ціль «уроків на тиждень», яку батьки поставили дитині (id профілю → число) */
  childGoals: Record<string, number>;
  settings: StudySettings;
};

export type QuizQuestion = {
  id: string;
  text: string;
  /** з якого квізу питання (лише в режимі повторення) */
  quizId?: string;
  /** тема для статистики слабких місць */
  topic?: string;
  options: string[];
  /** індекс правильної відповіді */
  answer: number;
  explanation?: string;
};

/** Квіз створює викладач; пізніше приходитиме з бекенду. */
export type Quiz = {
  id: string;
  courseId: string;
  title: string;
  questions: QuizQuestion[];
};
