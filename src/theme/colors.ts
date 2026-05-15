/**
 * Coffee-themed palette. Names mirror the Simple Design System tokens used
 * in the source Figma (Brand/100, Brand/800, Gray/900, etc.) so the design →
 * code mapping is direct.
 */
export const palette = {
  brand: {
    50: '#FBF3E8',
    100: '#F5E6D0',
    200: '#EBD0AC',
    300: '#DDB58A',
    400: '#CDA178',
    500: '#B8895D',
    600: '#9A6E47',
    700: '#7D5638',
    800: '#5A3D29',
    900: '#3A2818',
  },
  gray: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#1E1E1E',
  },
  white: '#FFFFFF',
  black: '#000000',
  // Semantic accents
  success: '#3FA67A',
  warning: '#E0A458',
  danger: '#D26060',
  info: '#5B8FB9',
} as const;

export const colors = {
  // Surfaces
  background: palette.brand[50],
  surface: palette.white,
  surfaceMuted: palette.brand[100],
  surfaceInverse: palette.gray[900],

  // Brand surfaces (warm tan top bar / bottom nav)
  brandSurface: palette.brand[300],
  brandSurfaceStrong: palette.brand[500],
  brandSurfaceOnPress: palette.brand[600],

  // Text
  text: palette.gray[900],
  textMuted: palette.gray[600],
  textSubtle: palette.gray[500],
  textOnBrand: palette.gray[900],
  textInverse: palette.white,

  // Borders & dividers
  border: palette.brand[200],
  borderStrong: palette.brand[300],
  divider: palette.gray[200],

  // Interactive
  primary: palette.brand[500],
  primaryPressed: palette.brand[600],
  primaryText: palette.white,

  // Icon defaults
  icon: palette.gray[800],
  iconMuted: palette.gray[500],
  iconOnBrand: palette.gray[900],

  // Status
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  info: palette.info,

  // XP / accent (slightly warmer than primary)
  xp: palette.brand[600],
  xpBg: palette.brand[100],

  // Raw aliases for foregrounds on colored surfaces
  white: palette.white,
  black: palette.black,
} as const;

export type ColorToken = keyof typeof colors;
