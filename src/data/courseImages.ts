import type { ImageSourcePropType } from 'react-native';

// Обкладинки курсів за slug курсу (як на сайті). Нова картинка: файл у assets/courses і рядок тут.
// Курси без картинки показують градієнт з іконкою.
export const courseImages: Record<string, ImageSourcePropType | undefined> = {};
