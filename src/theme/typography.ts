import {TextStyle} from 'react-native';

/**
 * Proxima Nova, app-wide.
 *
 * Android resolves a weight by the exact font file name rather than by
 * `fontWeight`, so every weight is referenced by its own family name and the
 * numeric weight is kept alongside it for iOS.
 *
 * Only three weights are used: 400 regular, 500 medium, 600 semibold.
 */
export const FONT = {
  regular: 'ProximaNova-Regular',
  medium: 'ProximaNova-Medium',
  semibold: 'ProximaNova-Semibold',
} as const;

export type FontWeightToken = keyof typeof FONT;

/** Kept for the original export shape; `bold` folds into semibold. */
export const fontFamily = {
  regular: FONT.regular,
  medium: FONT.medium,
  semibold: FONT.semibold,
  bold: FONT.semibold,
} as const;

export const typography = {
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    letterSpacing: -0.5,
  } satisfies TextStyle,
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FONT.regular,
    fontWeight: '400',
  } satisfies TextStyle,
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  } satisfies TextStyle,
  skip: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: FONT.medium,
    fontWeight: '500',
  } satisfies TextStyle,
} as const;
