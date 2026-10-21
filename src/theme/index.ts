export const colors = {
  bg: '#F6F7FD',
  card: '#FFFFFF',
  text: '#1F1D3B',
  muted: '#8B8AA8',
  primary: '#6C5CE7',
  primaryDark: '#4F3FD1',
  primarySoft: '#EDEAFF',
  success: '#34C47C',
  border: '#ECEBF6',
};

export const gradients = {
  hero: ['#7A6CF2', '#5A48DB'] as const,
  violet: ['#7A6CF2', '#9A8DF8'] as const,
  pink: ['#F2689F', '#F993BC'] as const,
  ocean: ['#4BA6F0', '#6C5CE7'] as const,
};

// Soft tile colors for icons, keyed like `gradients`.
export const tints = {
  hero: { bg: '#EDEAFF', fg: '#6C5CE7' },
  violet: { bg: '#EDEAFF', fg: '#6C5CE7' },
  pink: { bg: '#FFE9F2', fg: '#E8528D' },
  ocean: { bg: '#E3F1FF', fg: '#2F8FE5' },
} as const;

export const radius = { sm: 12, md: 16, lg: 22 };

export const shadow = {
  shadowColor: '#4F3FD1',
  shadowOpacity: 0.07,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};
