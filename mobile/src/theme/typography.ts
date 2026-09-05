import { TextStyle } from 'react-native';

export const typography = {
  fontSizes: {
    micro: 7,
    xxs: 8,
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    display: 32,
  },
  fontWeights: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    heavy: '800' as TextStyle['fontWeight'],
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    medium: 0.5,
    wide: 0.8,
    wider: 1.2,
    widest: 1.5,
  },
  fontFamilies: {
    mono: 'monospace',
  },
};
