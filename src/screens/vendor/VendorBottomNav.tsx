import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import {VENDOR_TABS, type VendorTabKey} from './vendorNav';

type Props = {
  activeTab: VendorTabKey;
  bottomInset: number;
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export function VendorBottomNav({activeTab, bottomInset, navigation}: Props) {
  const handlePress = (tab: VendorTabKey) => {
    if (tab === activeTab) {
      return;
    }

    switch (tab) {
      case 'home':
        navigation.navigate('VHome');
        break;
      case 'inventory':
        navigation.navigate('VInventory');
        break;
      case 'orders':
        navigation.navigate('VOrders');
        break;
      case 'payments':
        navigation.navigate('VPayments');
        break;
      case 'profile':
        navigation.navigate('VProfile');
        break;
      default:
        break;
    }
  };

  return (
    <View style={[styles.bottomNav, {paddingBottom: Math.max(bottomInset, 4)}]}>
      {VENDOR_TABS.map(tab => {
        const active = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => handlePress(tab.key)}>
            <Feather name={tab.icon} size={20} color={active ? '#4E929D' : '#9AA6B2'} />
            <Text style={[styles.navText, active && styles.activeNavText]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ECEFF3',
    paddingTop: 6,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    color: '#9AA6B2',
    marginTop: 3,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#4E929D',
    fontWeight: '600',
  },
});
