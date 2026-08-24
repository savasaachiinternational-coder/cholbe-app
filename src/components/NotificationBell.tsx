import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useNotificationBadge} from '../context/NotificationContext';
import { FONT } from '../theme/typography';

type Props = {
  onPress: () => void;
  color?: string;
  size?: number;
  style?: object;
};

export function NotificationBell({onPress, color = '#1A1C1E', size = 24, style}: Props) {
  const {unreadCount} = useNotificationBadge();

  return (
    <TouchableOpacity style={[styles.container, style]} activeOpacity={0.7} onPress={onPress}>
      <Feather name="bell" size={size} color={color} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 2,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E53E3E',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 11,
  },
});
