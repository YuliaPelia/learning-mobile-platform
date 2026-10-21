import type { Course, Teacher } from '@/lib/types';

export const mockCourses: Course[] = [
  { id: 'web', title: 'Веб-розробка з нуля', category: 'Web', age: '11–14', lessons: 24, freeLessons: 2, description: 'HTML, CSS і JavaScript: від першої сторінки до власного сайту-портфоліо.', gradient: 'violet', icon: 'globe-outline' },
  { id: 'python', title: 'Python для дітей', category: 'Python', age: '10–13', lessons: 20, freeLessons: 2, description: 'Пишемо ігри та боти, вчимося мислити як програмісти.', gradient: 'pink', icon: 'logo-python' },
  { id: 'design', title: 'Основи UI/UX дизайну', category: 'Дизайн', age: '12–17', lessons: 16, freeLessons: 2, description: 'Малюємо інтерфейси, добираємо кольори та шрифти, збираємо прототип.', gradient: 'ocean', icon: 'color-palette-outline' },
  { id: 'scratch', title: 'Scratch: перші проєкти', category: 'Scratch', age: '9–11', lessons: 14, freeLessons: 2, description: 'Анімації та ігри блоками без складного коду.', gradient: 'pink', icon: 'extension-puzzle-outline' },
];

export const mockTeachers: Teacher[] = [
  { id: 't1', name: 'Олена К.', role: 'Python, алгоритми', gradient: 'violet' },
  { id: 't2', name: 'Максим Д.', role: 'Веб-розробка', gradient: 'ocean' },
  { id: 't3', name: 'Ірина П.', role: 'UI/UX дизайн', gradient: 'pink' },
];
