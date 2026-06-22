import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import {ADMIN_TABS, type AdminTabKey} from './adminNav';

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
        const color = active ? '#4E929D' : '#9AA6B2';

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => handlePress(tab.key)}>
            {tab.materialIcon ? (
              <MaterialIcons name={tab.materialIcon} size={18} color={color} />
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
    paddingHorizontal: 1,
  },
  navText: {
    fontSize: 8,
    color: '#9AA6B2',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeNavText: {
    color: '#4E929D',
    fontWeight: '600',
  },
});
