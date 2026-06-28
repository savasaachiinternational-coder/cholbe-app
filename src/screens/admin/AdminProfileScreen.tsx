import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {authApi} from '../../api/auth';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';

type Props = NativeStackScreenProps<RootStackParamList, 'AProfile'>;

type AdminUser = {
  fullName: string;
  role: string;
  avatarUrl: string | null;
};

type SettingItem = {
  iconName: string;
  label: string;
  useMaterialIcon?: boolean;
  onPress?: () => void;
};

function roleLabel(role: string) {
  if (role === 'ADMIN') return 'Super Administrator';
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function SettingRow({item, isLast}: {item: SettingItem; isLast: boolean}) {
  return (
    <TouchableOpacity
      style={[styles.settingRow, isLast && styles.settingRowLast]}
      activeOpacity={0.7}
      onPress={item.onPress}>
      <View style={styles.rowLeftGroup}>
        {item.useMaterialIcon ? (
          <MaterialCommunityIcons name={item.iconName} size={20} color="#4E929D" />
        ) : (
          <Feather name={item.iconName} size={18} color="#4E929D" />
        )}
        <Text style={styles.rowLabelText}>{item.label}</Text>
      </View>
      <Feather name="chevron-right" size={16} color="#7E8B97" />
    </TouchableOpacity>
  );
}

export function AdminProfileScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authApi.getMe();
      const user = data as AdminUser;
      setAdmin(user);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load profile';
      Alert.alert('Profile', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const menuItems: SettingItem[] = [
    {iconName: 'user', label: 'Profile Information'},
    {iconName: 'lock', label: 'Change Password'},
    {
      iconName: 'account-group-outline',
      label: 'Manage Users',
      useMaterialIcon: true,
      onPress: () => navigation.navigate('AUsers'),
    },
    {
      iconName: 'stethoscope',
      label: 'Manage Doctors',
      useMaterialIcon: true,
      onPress: () => navigation.navigate('AUsers', {initialFilter: 'Doctors'}),
    },
    {
      iconName: 'layers',
      label: 'Specialties',
      onPress: () => navigation.navigate('AUsers', {initialFilter: 'Specialties'}),
    },
    {
      iconName: 'archive',
      label: 'Inventory Analytics',
      onPress: () => navigation.navigate('AInventory'),
    },
    {iconName: 'shield', label: 'Roles & Permissions'},
    {iconName: 'smartphone', label: 'App Settings'},
    {iconName: 'bell', label: 'Notification Settings'},
    {iconName: 'info', label: 'About App'},
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color="#1A1C1E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: 85 + insets.bottom},
        ]}>
        <TouchableOpacity style={styles.profileHeroCard} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#4E929D" style={styles.profileLoader} />
          ) : (
            <>
              <Image
                source={{
                  uri:
                    admin?.avatarUrl ??
                    'https://via.placeholder.com/60/E2E8F0/000000?text=Admin',
                }}
                style={styles.adminAvatar}
              />
              <View style={styles.adminMetaDetails}>
                <Text style={styles.adminNameText}>{admin?.fullName ?? 'Admin'}</Text>
                <Text style={styles.adminRoleText}>
                  {admin ? roleLabel(admin.role) : 'Super Administrator'}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#7E8B97" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.menuContainerCard}>
          {menuItems.map((item, index) => (
            <SettingRow
              key={item.label}
              item={item}
              isLast={index === menuItems.length - 1}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButtonBox} activeOpacity={0.8}>
          <Feather name="log-out" size={18} color="#E26D6D" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <AdminBottomNav activeTab="profile" bottomInset={insets.bottom} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  scrollContent: {
    paddingTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#F9FAFC',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1E',
    flex: 1,
    marginLeft: 12,
  },
  headerButton: {
    padding: 2,
    width: 32,
  },
  profileHeroCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF3',
    minHeight: 80,
  },
  profileLoader: {
    flex: 1,
  },
  adminAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  adminMetaDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  adminNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  adminRoleText: {
    fontSize: 12,
    color: '#7E8B97',
    fontWeight: '500',
    marginTop: 2,
  },
  menuContainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    paddingVertical: 6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  rowLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333D47',
  },
  logoutButtonBox: {
    flexDirection: 'row',
    backgroundColor: '#FCECEC',
    borderWidth: 1,
    borderColor: '#F9D5D5',
    borderRadius: 12,
    height: 48,
    marginHorizontal: 16,
    marginTop: 18,
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  logoutButtonText: {
    color: '#E26D6D',
    fontSize: 13,
    fontWeight: '700',
  },
});
