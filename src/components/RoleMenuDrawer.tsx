import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type {RootStackParamList} from '../navigation/types';
import type {AppRole} from '../navigation/roleRoutes';
import {
  getMenuForRole,
  normalizeRole,
  ROLE_MENU_TITLES,
  type RoleMenuItem,
} from '../navigation/roleMenus';
import {getStoredUser} from '../api/tokenStorage';
import {performLogout} from '../auth/sessionControl';

const PANEL_WIDTH = Math.min(Dimensions.get('window').width * 0.82, 320);
const OPEN_MS = 220;
const CLOSE_MS = 180;

type Props = {
  visible: boolean;
  onClose: () => void;
  navigation: NavigationProp<RootStackParamList>;
};

/**
 * Left slide-in navigation drawer whose contents come from the signed-in
 * user's role.
 *
 * Built on Modal + Animated rather than @react-navigation/drawer: that library
 * needs react-native-gesture-handler and react-native-reanimated, both of which
 * are native dependencies requiring MainActivity changes and a full rebuild.
 */
export function RoleMenuDrawer({visible, onClose, navigation}: Props) {
  const insets = useSafeAreaInsets();
  const currentRoute = useRoute().name;
  const [role, setRole] = useState<AppRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Keep the panel mounted until the close animation has finished, otherwise it
  // vanishes instantly instead of sliding out.
  const [mounted, setMounted] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    getStoredUser()
      .then(user => {
        if (!active) return;
        setRole(normalizeRole(user?.role));
        setUserName(user?.fullName ?? null);
      })
      .catch(() => {
        if (active) setRole('CUSTOMER');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: OPEN_MS,
        useNativeDriver: true,
      }).start();
      return;
    }
    Animated.timing(anim, {
      toValue: 0,
      duration: CLOSE_MS,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished) setMounted(false);
    });
  }, [visible, anim]);

  if (!mounted) return null;

  const open = (item: RoleMenuItem) => {
    onClose();
    if (item.userFilter) {
      navigation.navigate('AUsers', {initialFilter: item.userFilter});
      return;
    }
    // Every non-filter menu route is param-free (see roleMenus.ts), but the
    // union of 89 routes cannot express that to navigate() without a cast.
    navigation.navigate(item.route as 'Home');
  };

  const confirmLogout = () => {
    onClose();
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => void performLogout(),
      },
    ]);
  };

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-PANEL_WIDTH, 0],
  });

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, {opacity: anim}]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            {
              width: PANEL_WIDTH,
              paddingTop: insets.top + 16,
              paddingBottom: Math.max(insets.bottom, 12),
              transform: [{translateX}],
            },
          ]}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Feather name="user" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.userName} numberOfLines={1}>
                {userName ?? 'Signed in'}
              </Text>
              <Text style={styles.menuTitle}>
                {role ? ROLE_MENU_TITLES[role] : 'Menu'}
              </Text>
            </View>
            <TouchableOpacity hitSlop={10} activeOpacity={0.8} onPress={onClose}>
              <Feather name="x" size={20} color="#5F6B76" />
            </TouchableOpacity>
          </View>

          {/* Nothing until the role is known, so a customer never sees the
              admin list flash first. */}
          {role ? (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}>
              {getMenuForRole(role).map(item => {
                const active = !item.userFilter && item.route === currentRoute;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.row, active && styles.rowActive]}
                    activeOpacity={0.7}
                    onPress={() => open(item)}>
                    <Feather
                      name={item.icon}
                      size={18}
                      color={active ? '#0D9488' : '#4E929D'}
                    />
                    <Text
                      style={[styles.rowLabel, active && styles.rowLabelActive]}>
                      {item.label}
                    </Text>
                    <Feather name="chevron-right" size={18} color="#CBD5E1" />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.list} />
          )}

          <TouchableOpacity
            style={styles.logoutRow}
            activeOpacity={0.7}
            onPress={confirmLogout}>
            <Feather name="log-out" size={18} color="#C62828" />
            <Text style={styles.logoutLabel}>Log out</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#040620',
    shadowOffset: {width: 4, height: 0},
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4E929D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  userName: {
    color: '#1A1C1E',
    fontSize: 15,
    fontWeight: '700',
  },
  menuTitle: {
    marginTop: 1,
    color: '#7E8B97',
    fontSize: 12,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  rowActive: {
    backgroundColor: '#F2FFFC',
  },
  rowLabel: {
    flex: 1,
    color: '#1A1C1E',
    fontSize: 14,
    fontWeight: '600',
  },
  rowLabelActive: {
    color: '#0D9488',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F3F6',
  },
  logoutLabel: {
    flex: 1,
    color: '#C62828',
    fontSize: 14,
    fontWeight: '600',
  },
});
