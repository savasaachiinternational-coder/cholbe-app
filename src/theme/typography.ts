import {TextStyle} from 'react-native';

/**
 * Proxima Nova, app-wide.
 *
 * Android resolves a weight by the exact font file name rather than by
 * `fontWeight`, so every weight is referenced by its own family name and the
 * numeric weight is kept alongside it for iOS.
 *
 * Styles use 400 regular, 500 medium and 600 semibold; `bold` is available for
 * anything that needs to sit heavier than a semibold heading.
 */
export const FONT = {
  regular: 'ProximaNova-Regular',
  medium: 'ProximaNova-Medium',
  semibold: 'ProximaNova-Semibold',
  bold: 'ProximaNova-Bold',
} as const;

export type FontWeightToken = keyof typeof FONT;

/** Kept for the original export shape. */
export const fontFamily = {
  regular: FONT.regular,
  medium: FONT.medium,
  semibold: FONT.semibold,
  bold: FONT.bold,
} as const;

/**
 * Figma's greyscale ramp, the names used in the design-note comments across
 * the screens.
 */
export const GREYSCALE = {
  700: '#616161',
  800: '#424242',
  900: '#212121',
} as const;

/** Text colour by the role the text plays in a block. */
export const TEXT_COLOR = {
  title: GREYSCALE[700],
  subtitle: GREYSCALE[800],
  other: GREYSCALE[900],
} as const;

/**
 * Figma `body/small/semibold` — 12px / 600, 0.2px tracking, Greyscale-700.
 * The style behind labels like "Next refill in 5days".
 */
export const bodySmallSemibold = {
  fontSize: 12,
  fontFamily: FONT.semibold,
  fontWeight: '600',
  letterSpacing: 0.2,
  color: TEXT_COLOR.title,
} satisfies TextStyle;

export const typography = {
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    letterSpacing: -0.5,
    color: TEXT_COLOR.title,
  } satisfies TextStyle,
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: TEXT_COLOR.subtitle,
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
