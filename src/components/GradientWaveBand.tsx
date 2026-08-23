// src/components/GradientWaveBand.tsx
// A wave band drawn entirely with gradients — no background image.
// Renders whatever children you pass, centred by default.
import type {ReactNode} from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const W = SCREEN_WIDTH;

// Base wash: mint throughout, deepest at the left and easing to a cooler tone on
// the right. Kept in the teal family — a blue-grey right stop reads as a
// different colour rather than a lighter one.
const BAND_COLORS = ['#BEDEDB', '#D0EFF4', '#CEEDF2'];
const BAND_LOCATIONS = [0, 0.5, 1];

// Crests fade out at both ends. The fade is what makes them read as water — a
// solid bar reads as a painted stripe.
const WAVE_COLORS = [
  'rgba(255,255,255,0)',
  'rgba(255,255,255,0.95)',
  'rgba(255,255,255,0)',
];

// How far the curved top edge dips into the band, in dp. Override per-instance
// with the `notchDepth` prop.
const DEFAULT_NOTCH_DEPTH = 25;

type Props = {
  children?: ReactNode;
  /** Band wash. Two or more colours. */
  colors?: string[];
  /** Stop positions (0-1) for `colors`. Must match its length when given. */
  locations?: number[];
  /** Colour ramp for the wave crests. */
  waveColors?: string[];
  /** Style for the content container that holds children. */
  style?: StyleProp<ViewStyle>;
  /** Style for the band itself (height, padding, margins). */
  bandStyle?: StyleProp<ViewStyle>;
  /** Hide the crests for a plain gradient band. */
  showWaves?: boolean;
  /** Top-notch fill. Match the page background so it reads as a curved edge. */
  notchColor?: string;
  /** How far the notch dips into the band, in dp. */
  notchDepth?: number;
  /** Drop the curved top edge entirely. */
  showNotch?: boolean;
};

export function GradientWaveBand({
  children,
  colors = BAND_COLORS,
  locations = colors === BAND_COLORS ? BAND_LOCATIONS : undefined,
  waveColors = WAVE_COLORS,
  style,
  bandStyle,
  showWaves = true,
  notchColor = '#F4F1FD',
  notchDepth = DEFAULT_NOTCH_DEPTH,
  showNotch = true,
}: Props) {
  return (
    <View style={[styles.band, bandStyle]}>
      <LinearGradient
        colors={colors}
        locations={locations}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0.85}}
        style={StyleSheet.absoluteFill}
      />

      {showWaves ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Wave colors={waveColors} style={styles.waveA} />
          <Wave colors={waveColors} style={styles.waveB} />
          <Wave colors={waveColors} style={styles.waveC} />
          <Wave colors={waveColors} style={styles.waveD} />
        </View>
      ) : null}

      {/* The curved top edge. An oversized block sitting above the band, painted
          in the page colour, with a huge bottom radius stretched 2x wide — the
          arc it cuts out of the band is the notch. Drawn over the wash and
          crests but under the content. */}
      {showNotch ? (
        <View
          style={[
            styles.bandNotch,
            {backgroundColor: notchColor, top: notchDepth - SCREEN_WIDTH},
          ]}
          pointerEvents="none"
        />
      ) : null}

      <View style={[styles.content, style]}>{children}</View>
    </View>
  );
}

// A single crest: a long rounded bar tilted a few degrees, filled with a
// transparent -> light -> transparent ramp so both ends dissolve into the wash.
function Wave({
  colors,
  style,
}: {
  colors: string[];
  style: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wave, style]}>
      <LinearGradient
        colors={colors}
        start={{x: 0, y: 0.5}}
        end={{x: 1, y: 0.5}}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    paddingTop: 26,
    paddingBottom: 18,
    paddingHorizontal: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // `top` is supplied at render time from notchDepth.
  bandNotch: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_WIDTH,
    borderBottomLeftRadius: SCREEN_WIDTH / 2,
    borderBottomRightRadius: SCREEN_WIDTH / 2,
    transform: [{scaleX: 2}],
  },
  // Every crest is a long rounded bar, wider than the screen and starting
  // off-canvas so its ends never show. All four tilt the SAME way (negative
  // degrees) so they run parallel instead of crossing each other.
  wave: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
  },
  waveA: {
    width: W * 1.7,
    height: 46,
    left: -W * 0.35,
    top: -14,
    opacity: 0.8,
    transform: [{rotate: '-6deg'}],
  },
  waveB: {
    width: W * 1.6,
    height: 26,
    left: -W * 0.3,
    top: 28,
    opacity: 0.5,
    transform: [{rotate: '-5deg'}],
  },
  waveC: {
    width: W * 1.8,
    height: 20,
    left: -W * 0.4,
    bottom: 22,
    opacity: 0.6,
    transform: [{rotate: '-6.5deg'}],
  },
  waveD: {
    width: W * 1.5,
    height: 34,
    left: -W * 0.25,
    bottom: -18,
    opacity: 0.45,
    transform: [{rotate: '-5.5deg'}],
  },
});
