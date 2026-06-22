import {useMemo, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';
import {
  ADMIN_ORDER_FILTERS,
  type AdminOrderFilter,
  type AdminOrderStatus,
} from './adminNav';

type Props = NativeStackScreenProps<RootStackParamList, 'AOrders'>;

type OrderRecord = {
  id: string;
  customerName: string;
  pharmacyName: string;
  phone: string;
  timeAgo: string;
  status: AdminOrderStatus;
};

const MOCK_ORDERS: OrderRecord[] = [
  {
    id: '#RK123457',
    customerName: 'Rayhan Ullah',
    pharmacyName: 'Medicare Pharmacy',
    phone: '01677589448',
    timeAgo: '2 min ago',
    status: 'Delivered',
  },
  {
    id: '#RK123457',
    customerName: 'Rayhan Ullah',
    pharmacyName: 'Medicare Pharmacy',
    phone: '01677589448',
    timeAgo: '2 min ago',
    status: 'Processing',
  },
  {
    id: '#RK123457',
    customerName: 'Rayhan Ullah',
    pharmacyName: 'Medicare Pharmacy',
    phone: '01677589448',
    timeAgo: '2 min ago',
    status: 'Delivered',
  },
  {
    id: '#RK123457',
    customerName: 'Rayhan Ullah',
    pharmacyName: 'Medicare Pharmacy',
    phone: '01677589448',
    timeAgo: '2 min ago',
    status: 'Pending',
  },
  {
    id: '#RK123457',
    customerName: 'Rayhan Ullah',
    pharmacyName: 'Medicare Pharmacy',
    phone: '01677589448',
    timeAgo: '2 min ago',
    status: 'Delivered',
  },
  {
    id: '#RK123457',
    customerName: 'Rayhan Ullah',
    pharmacyName: 'Medicare Pharmacy',
    phone: '01677589448',
    timeAgo: '2 min ago',
    status: 'Cancelled',
  },
];

function getStatusBadgeStyle(status: AdminOrderStatus) {
  switch (status) {
    case 'Delivered':
      return styles.badgeDelivered;
    case 'Processing':
      return styles.badgeProcessing;
    case 'Pending':
      return styles.badgePending;
    case 'Cancelled':
      return styles.badgeCancelled;
  }
}

function OrderCard({item}: {item: OrderRecord}) {
  return (
    <View style={styles.orderCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.orderIdText}>{item.id}</Text>
        <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
      </View>

      <View style={styles.cardBodyRow}>
        <Image
          source={{uri: 'https://via.placeholder.com/50/E2E8F0/000000?text=User'}}
          style={styles.customerAvatar}
        />
        <View style={styles.metaTextInfo}>
          <Text style={styles.customerNameText}>{item.customerName}</Text>
          <View style={styles.pharmacySubRow}>
            <MaterialCommunityIcons name="hospital-box" size={12} color="#7E8B97" />
            <Text style={styles.pharmacyNameText}>{item.pharmacyName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooterRow}>
        <View style={styles.phoneGroupRow}>
          <Feather name="phone" size={14} color="#7E8B97" />
          <Text style={styles.phoneText}>{item.phone}</Text>
        </View>

        <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );
}

export function AdminOrdersScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<AdminOrderFilter>('All');

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'All') {
      return MOCK_ORDERS;
    }
    return MOCK_ORDERS.filter(order => order.status === activeFilter);
  }, [activeFilter]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order</Text>
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
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#9AA6B2" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9AA6B2"
            style={styles.searchInput}
          />
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialCommunityIcons name="tune" size={20} color="#4E929D" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}>
          {ADMIN_ORDER_FILTERS.map(filter => {
            const isSelectedActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.chipItem, isSelectedActive && styles.chipItemActive]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filter)}>
                <Text style={[styles.chipItemText, isSelectedActive && styles.chipItemActiveText]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeaderLineRow}>
          <Text style={styles.sectionHeadingText}>Recent Order Requests</Text>
          <TouchableOpacity style={styles.viewAllInlineRow} activeOpacity={0.7}>
            <Text style={styles.viewAllInlineText}>View All</Text>
            <Feather name="chevron-right" size={14} color="#7E8B97" />
          </TouchableOpacity>
        </View>

        <View style={styles.itemsVerticalStack}>
          {filteredOrders.map((recordItem, index) => (
            <OrderCard key={`${recordItem.id}-${index}`} item={recordItem} />
          ))}
        </View>
      </ScrollView>

      <AdminBottomNav activeTab="orders" bottomInset={insets.bottom} navigation={navigation} />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    color: '#1A1C1E',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  chipItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  chipItemActive: {
    backgroundColor: '#4E929D',
    borderColor: '#4E929D',
  },
  chipItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7E8B97',
  },
  chipItemActiveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionHeaderLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333D47',
  },
  viewAllInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllInlineText: {
    fontSize: 11,
    color: '#7E8B97',
  },
  itemsVerticalStack: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  timeAgoText: {
    fontSize: 10,
    color: '#9AA6B2',
    fontWeight: '500',
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
    paddingBottom: 10,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  metaTextInfo: {
    flex: 1,
  },
  customerNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  pharmacySubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  pharmacyNameText: {
    fontSize: 11,
    color: '#7E8B97',
    fontWeight: '500',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  phoneGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneText: {
    fontSize: 11,
    color: '#5C6470',
    fontWeight: '500',
  },
  statusBadge: {
    borderRadius: 12,
    height: 24,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDelivered: {
    backgroundColor: '#4E929D',
  },
  badgeProcessing: {
    backgroundColor: '#1E90FF',
  },
  badgePending: {
    backgroundColor: '#FFA500',
  },
  badgeCancelled: {
    backgroundColor: '#E26D6D',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
