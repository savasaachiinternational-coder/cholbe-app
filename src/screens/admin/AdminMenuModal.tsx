import {Modal, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {ComponentProps} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';

type MenuItem = {
  label: string;
  icon: ComponentProps<typeof Feather>['name'];
  route: keyof RootStackParamList;
  userFilter?: 'Doctors' | 'Specialties';
};

const MENU_ITEMS: MenuItem[] = [
  {label: 'Dashboard', icon: 'home', route: 'AHome'},
  {label: 'Orders', icon: 'file-text', route: 'AOrders'},
  {label: 'Vendors', icon: 'users', route: 'AVendors'},
  {label: 'Medicine', icon: 'activity', route: 'AMedicines'},
  {label: 'Payments', icon: 'credit-card', route: 'APayments'},
  {label: 'Reports', icon: 'pie-chart', route: 'AReports'},
  {label: 'Users', icon: 'user', route: 'AUsers'},
  {label: 'Doctors', icon: 'user-plus', route: 'AUsers', userFilter: 'Doctors'},
  {label: 'Specialties', icon: 'layers', route: 'AUsers', userFilter: 'Specialties'},
  {label: 'Inventory', icon: 'archive', route: 'AInventory'},
  {label: 'Profile', icon: 'settings', route: 'AProfile'},
];

type Props = {
  visible: boolean;
  onClose: () => void;
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export function AdminMenuModal({visible, onClose, navigation}: Props) {
  const open = (item: MenuItem) => {
    onClose();
    if (item.userFilter) {
      navigation.navigate('AUsers', {initialFilter: item.userFilter});
      return;
    }
    navigation.navigate(item.route as 'AHome');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Admin Menu</Text>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => open(item)}>
              <Feather name={item.icon} size={18} color="#4E929D" />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-start',
    paddingTop: 72,
    paddingHorizontal: 16,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1C1E',
  },
});
