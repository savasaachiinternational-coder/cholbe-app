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

// Proxima Nova per the Figma typography. Android resolves a weight by the exact
// font file name, so each weight is referenced by its own family name.
const FONT = {
  regular: 'ProximaNova-Regular',
  semibold: 'ProximaNova-Semibold',
} as const;

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
            <Feather name={tab.icon} size={24} color={active ? '#3EA08F' : '#9E9E9E'} />
            <Text style={[styles.navText, active && styles.activeNavText]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Rounded top corners with a soft lift instead of a hairline border.
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 72,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    shadowColor: '#040620',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  navText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#9E9E9E',
    fontWeight: '400',
  },
  activeNavText: {
    color: '#3EA08F',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
