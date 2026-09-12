/**
 * DayDuel Theme Tokens - Arcade Heat
 */

export const colors = {
  // Backgrounds
  bg: '#0B0B0F',
  card: '#16161D',
  cardBorder: '#1F1F28',
  
  // Primary
  orange: '#FF5A1F',
  orangeLight: '#FF7A45',
  orangeDark: '#E54D17',
  
  // Accent
  magenta: '#FF2D95',
  magentaLight: '#FF5AAD',
  
  // Text
  text: '#F5F5F7',
  textSecondary: '#E5E5E7',
  muted: '#A1A1AA',
  mutedDark: '#71717A',
  
  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Transparency
  overlayDark: 'rgba(11, 11, 15, 0.8)',
  overlayLight: 'rgba(255, 90, 31, 0.15)',
  orangeGlow: 'rgba(255, 90, 31, 0.4)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  // Bold condensed display for scores/CTAs
  display: {
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  // System sans for UI
  body: {
    fontWeight: '400' as const,
  },
  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
    display: 64,
  },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  glow: {
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
