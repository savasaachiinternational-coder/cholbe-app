import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  type ImageSourcePropType,
} from 'react-native';
import React, {useCallback} from 'react';
import { FONT } from '../../../../theme/typography';

export const CATEGORY_GRID_GAP = 16;
const SCREEN_PADDING = 16;
const CARD_WIDTH =
  (Dimensions.get('window').width - SCREEN_PADDING * 2 - CATEGORY_GRID_GAP) / 2;

type Props = {
  image: ImageSourcePropType;
  title: string;
  selected?: boolean;
  onPress?: (title: string) => void;
};

function AiHelpCategoryCardBase({image, title, selected, onPress}: Props) {
  const handlePress = useCallback(() => onPress?.(title), [onPress, title]);

  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected]}
      activeOpacity={0.8}
      onPress={handlePress}>
      <Image source={image} style={styles.icon} resizeMode="contain" />
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export const AiHelpCategoryCard = React.memo(AiHelpCategoryCardBase);

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    minHeight: 118,
    padding: 16,
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F5F4FD',
    shadowColor: '#04060F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 1,
  },
  icon: {
    height: 48,
    width: 48,
  },
  containerSelected: {
    backgroundColor: '#E9F7F1',
    borderWidth: 1,
    borderColor: '#3BAE8C',
  },
  title: {
    color: '#091B27',
    fontSize: 13,
    fontFamily: FONT.medium,
    fontWeight: '500',
    textAlign: 'center',
  },
});
