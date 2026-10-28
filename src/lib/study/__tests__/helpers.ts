import { defaultSettings } from '../store';
import type { StudyState } from '../types';

export const at = (y: number, m: number, d: number, h = 12, min = 0) => new Date(y, m - 1, d, h, min).getTime();

export const makeState = (patch: Partial<StudyState> = {}): StudyState => ({
  tasks: [],
  sessions: [],
  quizResults: [],
  mistakes: [],
  topics: {},
  childGoals: {},
  settings: { ...defaultSettings },
  ...patch,
});

let n = 0;
export const session = (startedAt: number, minutes: number) => ({ id: `s${n++}`, startedAt, minutes });
export const result = (correct: number, total: number) => ({ id: `r${n++}`, quizId: 'q', at: 0, correct, total });
