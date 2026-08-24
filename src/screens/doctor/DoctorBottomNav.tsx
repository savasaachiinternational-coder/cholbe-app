import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import type {NavigationProp} from '@react-navigation/native';
import type {RootStackParamList} from '../../navigation/types';
import {DOCTOR_TABS, type DoctorTabKey} from './doctorNav';
import { FONT } from '../../theme/typography';

type Props = {
  activeTab: DoctorTabKey;
  bottomInset: number;
  navigation: NavigationProp<RootStackParamList>;
};

export function DoctorBottomNav({activeTab, bottomInset, navigation}: Props) {
  const handlePress = (tab: DoctorTabKey) => {
    if (tab === activeTab) return;
    switch (tab) {
      case 'home':
        navigation.navigate('DHome');
        break;
      case 'appointments':
        navigation.navigate('DAppointments');
        break;
      case 'patients':
        navigation.navigate('DPatients');
        break;
      case 'profile':
        navigation.navigate('DProfile');
        break;
      default:
        break;
    }
  };

  return (
    <View style={[styles.bottomNav, {paddingBottom: Math.max(bottomInset, 4)}]}>
      {DOCTOR_TABS.map(tab => {
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
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#4E929D',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
