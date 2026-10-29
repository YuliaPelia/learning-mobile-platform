// «Скляний» стиль: лавандово-блакитний градієнт, напівпрозорі матові картки з світлою рамкою,
// білі кнопки з фіолетовим текстом і плаваюча скляна нижня панель.
export const colors = {
  bg: '#5A54C8',
  card: 'rgba(255,255,255,0.10)',
  glass: 'rgba(255,255,255,0.12)',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.97)',
  primary: '#FFFFFF',
  primaryDark: '#6E5BEA',
  primarySoft: 'rgba(255,255,255,0.22)',
  onPrimary: '#4B3FC4',
  /** Фіолетова дія: кнопки, активні чипи й бейджі (білий текст 5.3:1). */
  action: '#6C4FEA',
  onAction: '#FFFFFF',
  success: '#2BD48A',
  warm: '#FF8A4C',
  danger: '#FFF7F4',
  border: 'rgba(255,255,255,0.38)',
  tabBar: 'rgba(50,40,165,0.66)',
  // Білі картки
  paper: '#FFFFFF',
  ink: '#1B2B6B',
  inkMuted: '#5F6C94',
  inkFaint: '#EEF1F9',
};

/** Сторінка курсу: той самий скляний стиль (текст світлий, картки матові). */
export const light = {
  bg: '#5A54C8',
  card: 'rgba(255,255,255,0.10)',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.97)',
  border: 'rgba(255,255,255,0.42)',
  accent: '#E3FFF3',
};

/** Кольорові «планети» для декору. */
export const dots = ['#2BD48A', '#FFC531', '#38BDF8', '#FF6B4A', '#FFFFFF'] as const;

/** Тло екранів: лавандово-фіолетовий градієнт. Білий текст на зупинці ≥ 5.9:1, а на матовій картці (білий 10–12%) ≥ 4.5:1. */
export const screenGradient = ['#5A54C8', '#5650C4', '#524CBE', '#5C49C0'] as const;

export const fonts = {
  regular: 'Montserrat_500Medium',
  semibold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  black: 'Montserrat_800ExtraBold',
};

/**
 * Типографічна шкала: усі розміри тексту беруться звідси (тест `typography.test.ts` слідкує, щоб не з'являлись «випадкові» 14, 17, 22).
 * Великі числа (≥ 36 — таймер, відсотки, серія) — декоративні й у шкалу не входять.
 */
export const type = {
  display: { fontSize: 34, lineHeight: 40, fontFamily: fonts.black },
  title: { fontSize: 28, lineHeight: 34, fontFamily: fonts.black },
  headline: { fontSize: 24, lineHeight: 30, fontFamily: fonts.bold },
  heading: { fontSize: 20, lineHeight: 26, fontFamily: fonts.bold },
  subhead: { fontSize: 16, lineHeight: 22, fontFamily: fonts.bold },
  body: { fontSize: 15, lineHeight: 22, fontFamily: fonts.regular },
  caption: { fontSize: 13, lineHeight: 18, fontFamily: fonts.regular },
  micro: { fontSize: 12, lineHeight: 16, fontFamily: fonts.semibold },
} as const;

export const FONT_SIZES: readonly number[] = [12, 13, 15, 16, 20, 24, 28, 34];

export const gradients = {
  hero: ['#3F7BF0', '#5B4BE0'] as const,
  violet: ['#7A6CF2', '#9A8DF8'] as const,
  pink: ['#F2689F', '#F993BC'] as const,
  ocean: ['#38BDF8', '#3B4FD8'] as const,
};

// Матові кольорові плитки іконок, ключі як у `gradients`.
export const tints = {
  hero: { bg: 'rgba(214,150,30,0.7)', fg: '#FFFFFF' },
  violet: { bg: 'rgba(22,150,100,0.65)', fg: '#FFFFFF' },
  pink: { bg: 'rgba(214,60,120,0.65)', fg: '#FFFFFF' },
  ocean: { bg: 'rgba(30,120,200,0.65)', fg: '#FFFFFF' },
} as const;

export const radius = { sm: 14, md: 20, lg: 28 };

export const shadow = {
  shadowColor: '#3A2F9E',
  shadowOpacity: 0.28,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 6,
};

/** Кромка матового скла: світло падає зверху-ліворуч — верх і лівий край яскравіші, низ і правий майже зникають. */
export const glassBorder = {
  borderWidth: 1,
  borderTopColor: 'rgba(255,255,255,0.7)',
  borderLeftColor: 'rgba(255,255,255,0.5)',
  borderRightColor: 'rgba(255,255,255,0.18)',
  borderBottomColor: 'rgba(255,255,255,0.14)',
} as const;
