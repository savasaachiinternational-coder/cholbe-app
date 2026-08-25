// src/components/WaveWithChild.tsx
import type { ReactNode } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  children?: ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function WaveWithChild({ children, color, style }: Props) {
  return (
    <View style={styles.bandWrap}>
      <Image
        source={require('../assets/home_profile_bg4.png')}
        style={styles.bandArt}
        resizeMode="cover"
      />
      <View
        style={[styles.bandNotch, color && { backgroundColor: color }]}
        pointerEvents="none"
      />
      <View style={[styles.bandContent, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bandWrap: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  bandArt: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.6,
    height: SCREEN_WIDTH * 1.6,
    left: -SCREEN_WIDTH * 0.3,
    top: -SCREEN_WIDTH * 0.62,
    opacity: 0.8,
  },
  // the curve in the top center
  bandNotch: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_WIDTH,
    top: 25 - SCREEN_WIDTH,
    backgroundColor: '#F5F2FE',
    borderBottomLeftRadius: SCREEN_WIDTH / 2,
    borderBottomRightRadius: SCREEN_WIDTH / 2,
    transform: [{ scaleX: 2 }],
  },
  bandContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
});
