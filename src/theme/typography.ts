import type { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

type Variant =
  | 'displayLg'
  | 'displayMd'
  | 'titleLg'
  | 'titleMd'
  | 'titleSm'
  | 'bodyLg'
  | 'body'
  | 'bodySm'
  | 'label'
  | 'caption'
  | 'button'
  | 'tab';

export const typography: Record<Variant, TextStyle> = {
  displayLg: { fontFamily: fontFamily.bold, fontSize: 32, lineHeight: 40, letterSpacing: -0.3 },
  displayMd: { fontFamily: fontFamily.semibold, fontSize: 28, lineHeight: 36, letterSpacing: -0.2 },
  titleLg: { fontFamily: fontFamily.semibold, fontSize: 22, lineHeight: 28 },
  titleMd: { fontFamily: fontFamily.semibold, fontSize: 18, lineHeight: 24 },
  titleSm: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22 },
  bodyLg: { fontFamily: fontFamily.regular, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22 },
  tab: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 18 },
};

export type TextVariant = Variant;
