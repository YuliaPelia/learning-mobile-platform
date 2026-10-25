// Нічна фіолетова тема: світлий текст на градієнтному тлі, напівпрозорі «скляні» картки
// і світлі картки (paper) для головних дій.
export const colors = {
  bg: '#1D1946',
  card: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.68)',
  primary: '#B3A6F7',
  primaryDark: '#6C5CE7',
  primarySoft: 'rgba(179,166,247,0.22)',
  onPrimary: '#1C1842',
  success: '#7FE0B0',
  warm: '#FFB36B',
  border: 'rgba(255,255,255,0.14)',
  tabBar: '#16133A',
  // Світлі картки
  paper: '#F7F5FF',
  ink: '#1F1D3B',
  inkMuted: '#5F5C82',
};

/** Тло всіх екранів: від бузкового вгорі до глибокого фіолетового внизу. */
export const screenGradient = ['#8A7ED8', '#5246A8', '#2A2462', '#1D1946'] as const;

export const gradients = {
  hero: ['#9C8FF0', '#6C5CE7'] as const,
  violet: ['#7A6CF2', '#9A8DF8'] as const,
  pink: ['#F2689F', '#F993BC'] as const,
  ocean: ['#4BA6F0', '#6C5CE7'] as const,
};

// Плитки іконок, ключі як у `gradients`.
export const tints = {
  hero: { bg: 'rgba(179,166,247,0.22)', fg: '#D4CCFF' },
  violet: { bg: 'rgba(179,166,247,0.22)', fg: '#D4CCFF' },
  pink: { bg: 'rgba(249,147,188,0.22)', fg: '#FFC2DA' },
  ocean: { bg: 'rgba(110,182,240,0.22)', fg: '#BFE1FF' },
} as const;

export const radius = { sm: 12, md: 18, lg: 24 };

export const shadow = {
  shadowColor: '#0B0920',
  shadowOpacity: 0.25,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 4,
};
