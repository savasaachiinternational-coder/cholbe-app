import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import {ADMIN_TABS, type AdminTabKey} from './adminNav';
import { FONT } from '../../theme/typography';

// Proxima Nova per the Figma typography. Android resolves a weight by the exact
// font file name, so each weight is referenced by its own family name.
type Props = {
  activeTab: AdminTabKey;
  bottomInset: number;
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export function AdminBottomNav({activeTab, bottomInset, navigation}: Props) {
  const handlePress = (tab: AdminTabKey) => {
    if (tab === activeTab) {
      return;
    }

    switch (tab) {
      case 'home':
        navigation.navigate('AHome');
        break;
      case 'orders':
        navigation.navigate('AOrders');
        break;
      case 'vendors':
        navigation.navigate('AVendors');
        break;
      case 'medicine':
        navigation.navigate('AMedicines');
        break;
      case 'payments':
        navigation.navigate('APayments');
        break;
      case 'report':
        navigation.navigate('AReports');
        break;
      case 'user':
        navigation.navigate('AUsers');
        break;
      case 'inventory':
        navigation.navigate('AInventory');
        break;
      case 'profile':
        navigation.navigate('AProfile');
        break;
      default:
        break;
    }
  };

  return (
    <View style={[styles.bottomNav, {paddingBottom: Math.max(bottomInset, 4)}]}>
      {ADMIN_TABS.map(tab => {
        const active = tab.key === activeTab;
        const color = active ? '#3EA08F' : '#9E9E9E';

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => handlePress(tab.key)}>
            {tab.materialIcon ? (
              <MaterialIcons name={tab.materialIcon} size={24} color={color} />
            ) : (
              <Feather name={tab.icon} size={18} color={color} />
            )}
            <Text
              style={[styles.navText, active && styles.activeNavText]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Same chrome as the vendor bar; icon and label sizes stay compact because
  // this bar carries nine tabs rather than five.
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 64,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom:10,
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
    paddingHorizontal: 1,
    paddingBottom:10,
    gap: 4,
  },
  navText: {
    fontSize: 9,
    color: '#9E9E9E',
    fontFamily: FONT.regular,
    fontWeight: '400',
    textAlign: 'center',
  },
  activeNavText: {
    color: '#3EA08F',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
