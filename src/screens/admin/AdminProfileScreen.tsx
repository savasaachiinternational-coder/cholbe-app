import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import {performLogout} from '../../auth/sessionControl';
import {confirmAndDeleteAccount} from '../../auth/deleteAccount';
import {NotificationBell} from '../../components/NotificationBell';
import {AvatarImage} from '../../components/AvatarImage';
import { FONT } from '../../theme/typography';
import {useKeyboardHeight} from '../../hooks/useKeyboardHeight';

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

function ChangePasswordModal({visible, onClose}: {visible: boolean; onClose: () => void}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const handleSave = async () => {
    if (!current || !next || !confirm) {
      Alert.alert('Password', 'All fields are required.');
      return;
    }
    if (next.length < 8) {
      Alert.alert('Password', 'New password must be at least 8 characters.');
      return;
    }
    if (next !== confirm) {
      Alert.alert('Password', 'Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword(current, next);
      Alert.alert('Success', 'Password changed successfully.');
      setCurrent('');
      setNext('');
      setConfirm('');
      onClose();
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Could not change password');
    } finally {
      setSaving(false);
    }
  };

  const keyboardHeight = useKeyboardHeight();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={[styles.cpOverlay, {paddingBottom: keyboardHeight}]}>
        <View style={styles.cpModal}>
          <View style={styles.cpHeader}>
            <Text style={styles.cpTitle}>Change Password</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={22} color="#1A1C1E" />
            </TouchableOpacity>
          </View>
          <View style={styles.cpField}>
            <Text style={styles.cpLabel}>Current Password</Text>
            <View style={styles.cpInputRow}>
              <TextInput
                style={styles.cpInput}
                placeholder="••••••••"
                placeholderTextColor="#9AA6B2"
                secureTextEntry={!showCurrent}
                value={current}
                onChangeText={setCurrent}
              />
              <TouchableOpacity onPress={() => setShowCurrent(v => !v)} activeOpacity={0.7}>
                <Feather name={showCurrent ? 'eye-off' : 'eye'} size={18} color="#9AA6B2" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cpField}>
            <Text style={styles.cpLabel}>New Password</Text>
            <View style={styles.cpInputRow}>
              <TextInput
                style={styles.cpInput}
                placeholder="••••••••"
                placeholderTextColor="#9AA6B2"
                secureTextEntry={!showNext}
                value={next}
                onChangeText={setNext}
              />
              <TouchableOpacity onPress={() => setShowNext(v => !v)} activeOpacity={0.7}>
                <Feather name={showNext ? 'eye-off' : 'eye'} size={18} color="#9AA6B2" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cpField}>
            <Text style={styles.cpLabel}>Confirm New Password</Text>
            <View style={styles.cpInputRow}>
              <TextInput
                style={styles.cpInput}
                placeholder="••••••••"
                placeholderTextColor="#9AA6B2"
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.cpSaveBtn, saving && styles.cpSaveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.cpSaveBtnText}>Save Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export function AdminProfileScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

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

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', style: 'destructive', onPress: () => void performLogout()},
    ]);
  }, []);

  const menuItems: SettingItem[] = [
    {iconName: 'user', label: 'Profile Information'},
    {iconName: 'lock', label: 'Change Password', onPress: () => setChangePasswordVisible(true)},
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
        <NotificationBell
          style={styles.headerButton}
          onPress={() => navigation.navigate('Notifications')}
        />
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
              <AvatarImage uri={admin?.avatarUrl} style={styles.adminAvatar} />
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

        <TouchableOpacity style={styles.logoutButtonBox} activeOpacity={0.8} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#E26D6D" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteAccountButtonBox}
          activeOpacity={0.8}
          onPress={confirmAndDeleteAccount}>
          <Feather name="trash-2" size={18} color="#E26D6D" />
          <Text style={styles.logoutButtonText}>Delete account</Text>
        </TouchableOpacity>
      </ScrollView>

      <AdminBottomNav activeTab="profile" bottomInset={insets.bottom} navigation={navigation} />
      <ChangePasswordModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FE',
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
    backgroundColor: '#F5F3FE',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
    flex: 1,
    marginLeft: 12,
  },
  headerButton: {
    padding: 2,
    width: 32,
  },
  profileHeroCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F2FB',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E3EE',
    minHeight: 80,
    elevation:1,
  },
  profileLoader: {
    flex: 1,
  },
  adminAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    borderColor:'#F5F3FE',
    zIndex:11
  },
  adminMetaDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  adminNameText: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  adminRoleText: {
    fontSize: 12,
    color: '#7E8B97',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginTop: 2,
  },
  menuContainerCard: {
    backgroundColor: '#F5F3FE',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E6E3EE',
    paddingVertical: 6,
    elevation:1
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#333D47',
  },
  logoutButtonBox: {
    flexDirection: 'row',
    backgroundColor: '#FBE9E9',
    borderWidth: 1,
    borderColor: '#EFAAA9',
    borderRadius: 10,
    height: 48,
    marginHorizontal: 16,
    marginTop: 18,
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  deleteAccountButtonBox: {
    flexDirection: 'row',
    backgroundColor: '#FCECEC',
    borderWidth: 1,
    borderColor: '#F9D5D5',
    borderRadius: 12,
    height: 48,
    marginHorizontal: 16,
    marginTop: 10,
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  logoutButtonText: {
    color: '#E26D6D',
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  cpOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  cpModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  cpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cpTitle: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  cpField: {
    marginBottom: 14,
  },
  cpLabel: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#4F5E6D',
    marginBottom: 6,
  },
  cpInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F8FB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
  },
  cpInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1C1E',
    padding: 0,
  },
  cpSaveBtn: {
    backgroundColor: '#4E929D',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  cpSaveBtnDisabled: {
    opacity: 0.6,
  },
  cpSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
