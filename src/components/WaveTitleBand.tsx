// src/components/WaveTitleBand.tsx
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { FONT } from '../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  title: string;
  color?:string;
  icon?:string;
  style?:{};
};

export function WaveTitleBand({ title, color, icon,style }: Props) {
  return (
    <View style={[styles.bandWrap]}>
      <Image
        source={require('../assets/home_profile_bg.png')}
        style={styles.bandArt}
        resizeMode="cover"
      />
      <View style={[styles.bandNotch, color && {backgroundColor:color} ]} pointerEvents="none" />
      <View style={styles.bandRow}>
        {icon ? (
          <Feather name={icon} size={20} color="#0D9488" style={styles.successIconMargin} />
        ) : null}
        <Text style={[styles.bandTitle, style]}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bandWrap: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 32,
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
    opacity: 0.4,
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
  bandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  successIconMargin: {marginRight: 8},
  successStatusText: {fontSize: 13, fontFamily: FONT.medium, fontWeight: '500', color: '#334155', flex: 1},

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
