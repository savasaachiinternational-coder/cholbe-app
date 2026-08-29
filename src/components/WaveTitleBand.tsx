// src/components/WaveTitleBand.tsx
import { useCallback, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { LayoutChangeEvent, StyleProp, TextStyle } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { FONT } from '../theme/typography';

type Props = {
  title: string;
  color?: string;
  icon?: string;
  style?: StyleProp<TextStyle>;
};

// How far the curve's centre dips below its edges, in dp. Constant on purpose:
// the arc should look identical on a 320dp phone and a 900dp tablet.
const CURVE_DEPTH = 28;
// Where the lowest point of the curve sits, measured from the band's top edge.
const CURVE_BOTTOM = 25;

export function WaveTitleBand({ title, color, icon, style }: Props) {
  const { width: screenWidth } = useWindowDimensions();

  // Width the band actually occupies, and how far it must bleed past each edge
  // of its parent to reach the screen edges. Parents pad by different amounts
  // (16, 20, ...), so we measure instead of assuming. Each pass folds the
  // leftover gap into the current bleed, so it settles after one extra frame
  // and re-settles on rotation or a window resize.
  const [bandWidth, setBandWidth] = useState(screenWidth);
  const [bleed, setBleed] = useState(0);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const measured = event.nativeEvent.layout.width;
      if (Math.abs(measured - bandWidth) > 0.5) {
        setBandWidth(measured);
      }
      const nextBleed = bleed + (screenWidth - measured) / 2;
      if (Math.abs(nextBleed - bleed) > 0.5) {
        setBleed(nextBleed);
      }
    },
    [bandWidth, bleed, screenWidth],
  );

  // The notch is a box as wide as the band whose bottom corners are rounded by
  // half its width, i.e. its bottom edge is a semicircle of radius bandWidth/2.
  // Stretching it horizontally by `curveScaleX` turns that into an ellipse and
  // shows only its flatter middle. Solving
  //   CURVE_DEPTH = (bandWidth / 2) * (1 - sqrt(1 - 1 / scaleX^2))
  // for scaleX keeps the visible dip at CURVE_DEPTH whatever the width is.
  // A fixed scaleX cannot: it makes the dip a fixed *fraction* of the width,
  // so the arc deepens as the screen gets wider.
  const chord = 1 - (2 * CURVE_DEPTH) / bandWidth;
  const curveScaleX = chord > 0 ? 1 / Math.sqrt(1 - chord * chord) : 1;

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.bandWrap,
        { marginHorizontal: -bleed, paddingHorizontal: bleed },
      ]}>
      <Image
        source={require('../assets/home_profile_bg4.png')}
        style={[
          styles.bandArt,
          {
            width: bandWidth * 1.4,
            height: bandWidth * 1.2,
            left: -bandWidth * 0.3,
            top: -bandWidth * 0.62,
          },
        ]}
        resizeMode="cover"
      />
      <View
        style={[
          styles.bandNotch,
          {
            height: bandWidth,
            top: CURVE_BOTTOM - bandWidth,
            borderBottomLeftRadius: bandWidth / 2,
            borderBottomRightRadius: bandWidth / 2,
            transform: [{ scaleX: curveScaleX }],
          },
          color && { backgroundColor: color },
        ]}
        pointerEvents="none"
      />
      <View style={styles.bandRow}>
        {icon ? (
          <Feather
            name={icon}
            size={20}
            color="#0D9488"
            style={styles.successIconMargin}
          />
        ) : null}
        <Text style={[styles.bandTitle, style]}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bandWrap: {
    alignSelf: 'stretch',
    paddingTop: 32,
    paddingBottom: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  bandArt: {
    position: 'absolute',
    opacity: 0.8,
  },
  // the curve in the top center
  bandNotch: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F5F2FE',
  },
  bandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  successIconMargin: { marginRight: 8 },
  successStatusText: {
    fontSize: 13,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },

  bandTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
