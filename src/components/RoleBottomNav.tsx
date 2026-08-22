import React, {useEffect, useState} from 'react';
import type {NavigationProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import type {AppRole} from '../navigation/roleRoutes';
import {getStoredUser} from '../api/tokenStorage';
import {HomeBottomNav} from '../screens/home/HomeBottomNav';
import {DoctorBottomNav} from '../screens/doctor/DoctorBottomNav';
import {VendorBottomNav} from '../screens/vendor/VendorBottomNav';
import {AdminBottomNav} from '../screens/admin/AdminBottomNav';
import type {BottomTabKey} from '../screens/home/homeData';

type Props = {
  bottomInset: number;
  navigation: NavigationProp<RootStackParamList>;
  activeTab?: BottomTabKey;
  onTabPress: (tab: BottomTabKey) => void;
};

/**
 * Renders the bottom navigation belonging to the signed-in user's role.
 *
 * Screens shared across roles (notifications, for example) would otherwise show
 * the customer tabs to a doctor or admin.
 */
export function RoleBottomNav({
  bottomInset,
  navigation,
  activeTab = 'home',
  onTabPress,
}: Props) {
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    let active = true;
    getStoredUser()
      .then(user => {
        if (!active) return;
        const stored = user?.role?.toUpperCase();
        setRole(
          stored === 'DOCTOR' ||
            stored === 'VENDOR' ||
            stored === 'ADMIN' ||
            stored === 'CUSTOMER'
            ? stored
            : 'CUSTOMER',
        );
      })
      .catch(() => {
        if (active) setRole('CUSTOMER');
      });
    return () => {
      active = false;
    };
  }, []);

  // Nothing until the role is known, so the wrong tab bar never flashes first.
  if (!role) return null;

  // The vendor and admin bars declare the native-stack type but only ever call
  // navigate(), which the base NavigationProp already provides.
  const stackNavigation =
    navigation as NativeStackNavigationProp<RootStackParamList>;

  switch (role) {
    case 'DOCTOR':
      return (
        <DoctorBottomNav
          activeTab="home"
          bottomInset={bottomInset}
          navigation={navigation}
        />
      );
    case 'VENDOR':
      return (
        <VendorBottomNav
          activeTab="home"
          bottomInset={bottomInset}
          navigation={stackNavigation}
        />
      );
    case 'ADMIN':
      return (
        <AdminBottomNav
          activeTab="home"
          bottomInset={bottomInset}
          navigation={stackNavigation}
        />
      );
    case 'CUSTOMER':
    default:
      return (
        <HomeBottomNav
          activeTab={activeTab}
          bottomInset={bottomInset}
          onTabPress={onTabPress}
        />
      );
  }
}
