// «Programming Explorer»: космічне синьо-фіолетове тло з кольоровими «планетами»-крапками,
// білі картки курсів і жовта кнопка дії. Сторінка курсу — світла (див. `light`).
export const colors = {
  bg: '#2C2A93',
  card: 'rgba(255,255,255,0.12)',
  glass: 'rgba(20,24,90,0.45)',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.74)',
  primary: '#FFC531',
  primaryDark: '#3B4FD8',
  primarySoft: 'rgba(255,197,49,0.2)',
  onPrimary: '#1B2559',
  success: '#2BD48A',
  warm: '#FF8A4C',
  danger: '#FFB4A6',
  border: 'rgba(255,255,255,0.18)',
  tabBar: '#241F7A',
  // Білі картки
  paper: '#FFFFFF',
  ink: '#1B2B6B',
  inkMuted: '#5F6C94',
  inkFaint: '#EEF1F9',
};

/** Світла сторінка (деталі курсу). */
export const light = {
  bg: '#F6F8FF',
  card: '#FFFFFF',
  text: colors.ink,
  muted: colors.inkMuted,
  border: '#E3E8F6',
  accent: '#16A56B',
};

/** Кольорові «планети» для декору. */
export const dots = ['#2BD48A', '#FFC531', '#38BDF8', '#FF6B4A', '#FFFFFF'] as const;

/** Тло екранів: від синього вгорі до фіолетового внизу. */
export const screenGradient = ['#2F6CE5', '#3450D0', '#3A35A8', '#2C2A93'] as const;

export const fonts = {
  regular: 'Montserrat_500Medium',
  semibold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  black: 'Montserrat_800ExtraBold',
};

export const gradients = {
  hero: ['#3F7BF0', '#5B4BE0'] as const,
  violet: ['#7A6CF2', '#9A8DF8'] as const,
  pink: ['#F2689F', '#F993BC'] as const,
  ocean: ['#38BDF8', '#3B4FD8'] as const,
};

// Плитки іконок на темному тлі, ключі як у `gradients`.
export const tints = {
  hero: { bg: 'rgba(255,197,49,0.2)', fg: '#FFD66B' },
  violet: { bg: 'rgba(43,212,138,0.2)', fg: '#7CEBB8' },
  pink: { bg: 'rgba(255,107,74,0.2)', fg: '#FFAA94' },
  ocean: { bg: 'rgba(56,189,248,0.2)', fg: '#9BDDFB' },
} as const;

export const radius = { sm: 14, md: 20, lg: 28 };

export const shadow = {
  shadowColor: '#10124A',
  shadowOpacity: 0.3,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 6,
};
