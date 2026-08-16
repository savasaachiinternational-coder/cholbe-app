import type {NavigationProp} from '@react-navigation/native';
import type {RootStackParamList} from '../../navigation/types';
import type {BottomTabKey} from './homeData';

export function navigateCustomerTab(
  navigation: NavigationProp<RootStackParamList>,
  tab: BottomTabKey,
) {
  switch (tab) {
    case 'home':
      navigation.navigate('Home');
      return;
    case 'pharmacy':
      navigation.navigate('PharmacyShop');
      return;
    case 'medication':
      navigation.navigate('MedicineList');
      return;
    case 'report':
      navigation.navigate('ReportsList');
      return;
    case 'profile':
      navigation.navigate('MyProfile');
      return;
  }
}
