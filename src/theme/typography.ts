import {TextStyle} from 'react-native';

export const fontFamily = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
} as const;

export const typography = {
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  } satisfies TextStyle,
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  } satisfies TextStyle,
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
  } satisfies TextStyle,
  skip: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  } satisfies TextStyle,
} as const;
