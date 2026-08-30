import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { FONT } from '../../../../theme/typography';

type Props = {
  badge: string;
  caption: string;
  image: ImageSourcePropType;
  onPress?: () => void;
};

function TelemedicinePromoBannerBase({
  badge,
  caption,
  image,
  onPress,
}: Props) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <LinearGradient
        colors={['#2D807C', '#4AA79E']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}>
        <Image source={image} style={styles.image} resizeMode="contain" />

        <View style={styles.textColumn}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
          <Text style={styles.caption}>{caption}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export const TelemedicinePromoBanner = React.memo(TelemedicinePromoBannerBase);

const styles = StyleSheet.create({
  container: {
    height: 108,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  image: {
    height: '92%',
    width: 96,
  },
  textColumn: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 8,
  },
  badge: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#F5C518',
  },
  badgeText: {
    color: '#1B2B3A',
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  caption: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
});
