import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {NotificationBell} from './NotificationBell';

type Props = {
  onMenuPress: () => void;
  onNotificationPress: () => void;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function HeaderWithLogo({
  onMenuPress,
  onNotificationPress,
  iconColor = '#1E293B',
  style,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, {paddingTop: insets.top + 8}, style]}>
      <View style={styles.side}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onMenuPress}>
          <Feather name="menu" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logoImage.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      <View style={[styles.side, styles.sideRight]}>
        <NotificationBell
          style={styles.iconButton}
          color={iconColor}
          onPress={onNotificationPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F6F4FE',
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  iconButton: {
    position: 'relative',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    height: 36,
    width: 132,
  },
});
