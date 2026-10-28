// «Скляний» стиль: лавандово-блакитний градієнт, напівпрозорі матові картки з світлою рамкою,
// білі кнопки з фіолетовим текстом і плаваюча скляна нижня панель.
export const colors = {
  bg: '#7F7CEA',
  card: 'rgba(255,255,255,0.16)',
  glass: 'rgba(255,255,255,0.18)',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.82)',
  primary: '#FFFFFF',
  primaryDark: '#6E5BEA',
  primarySoft: 'rgba(255,255,255,0.24)',
  onPrimary: '#4B3FC4',
  success: '#2BD48A',
  warm: '#FF8A4C',
  danger: '#FFB4A6',
  border: 'rgba(255,255,255,0.4)',
  tabBar: 'rgba(255,255,255,0.2)',
  // Білі картки
  paper: '#FFFFFF',
  ink: '#1B2B6B',
  inkMuted: '#5F6C94',
  inkFaint: '#EEF1F9',
};

/** Сторінка курсу: той самий скляний стиль (текст світлий, картки матові). */
export const light = {
  bg: '#8F92F2',
  card: 'rgba(255,255,255,0.2)',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.84)',
  border: 'rgba(255,255,255,0.42)',
  accent: '#8CF5C4',
};

/** Кольорові «планети» для декору. */
export const dots = ['#2BD48A', '#FFC531', '#38BDF8', '#FF6B4A', '#FFFFFF'] as const;

/** Тло екранів: від світлої лаванди вгорі до фіолетового внизу. */
export const screenGradient = ['#B9B6F8', '#9096F2', '#7D82EA', '#9A83F1'] as const;

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

// Матові кольорові плитки іконок, ключі як у `gradients`.
export const tints = {
  hero: { bg: 'rgba(255,205,110,0.5)', fg: '#FFFFFF' },
  violet: { bg: 'rgba(140,245,196,0.4)', fg: '#FFFFFF' },
  pink: { bg: 'rgba(255,140,190,0.5)', fg: '#FFFFFF' },
  ocean: { bg: 'rgba(120,200,255,0.5)', fg: '#FFFFFF' },
} as const;

export const radius = { sm: 14, md: 20, lg: 28 };

export const shadow = {
  shadowColor: '#3A2F9E',
  shadowOpacity: 0.28,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 6,
};
