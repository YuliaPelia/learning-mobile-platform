// «Скляний» стиль: лавандово-блакитний градієнт, напівпрозорі матові картки з світлою рамкою,
// білі кнопки з фіолетовим текстом і плаваюча скляна нижня панель.
export const colors = {
  bg: '#625BD2',
  card: 'rgba(40,32,140,0.26)',
  glass: 'rgba(40,32,140,0.34)',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.97)',
  primary: '#FFFFFF',
  primaryDark: '#6E5BEA',
  primarySoft: 'rgba(255,255,255,0.24)',
  onPrimary: '#4B3FC4',
  success: '#2BD48A',
  warm: '#FF8A4C',
  danger: '#FFE3DC',
  border: 'rgba(255,255,255,0.4)',
  tabBar: 'rgba(40,32,130,0.82)',
  // Білі картки
  paper: '#FFFFFF',
  ink: '#1B2B6B',
  inkMuted: '#5F6C94',
  inkFaint: '#EEF1F9',
};

/** Сторінка курсу: той самий скляний стиль (текст світлий, картки матові). */
export const light = {
  bg: '#625BD2',
  card: 'rgba(40,32,140,0.26)',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.97)',
  border: 'rgba(255,255,255,0.42)',
  accent: '#CCFFE8',
};

/** Кольорові «планети» для декору. */
export const dots = ['#2BD48A', '#FFC531', '#38BDF8', '#FF6B4A', '#FFFFFF'] as const;

/** Тло екранів: лавандово-фіолетовий градієнт. Білий текст на будь-якій зупинці (з урахуванням світлих плям) ≥ 4.5:1. */
export const screenGradient = ['#665FD6', '#5F58CE', '#5A54C8', '#6552CA'] as const;

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
