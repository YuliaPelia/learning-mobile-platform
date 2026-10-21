import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { gradients } from '@/theme';

export type GradientName = keyof typeof gradients;
export type IconName = ComponentProps<typeof Ionicons>['name'];

export type Course = {
  id: string;
  title: string;
  category: string;
  age: string;
  lessons: number;
  freeLessons: number;
  description: string;
  gradient: GradientName;
  icon: IconName;
};

export type Teacher = {
  id: string;
  name: string;
  role: string;
  gradient: GradientName;
};
