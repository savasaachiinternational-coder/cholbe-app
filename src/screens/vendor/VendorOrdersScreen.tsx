import {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import {vendorApi} from '../../api/vendor';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {VendorBottomNav} from './VendorBottomNav';
import {ORDER_FILTER_CHIPS, type VendorOrderStatus} from './vendorNav';

type Props = NativeStackScreenProps<RootStackParamList, 'VOrders'>;

type ApiOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  addressSnapshot?: {formattedAddress?: string; region?: string} | null;
  customer?: {fullName: string; phone?: string | null};
  items: {name: string}[];
};

type OrderItem = {
  id: string;
  customer: string;
  orderId: string;
  phone: string;
  location: string;
  productTitle: string;
  paymentMethod: string;
  status: VendorOrderStatus;
  rawStatus: string;
};

function mapOrderStatus(status: string): VendorOrderStatus {
  if (status === 'PENDING') return 'Pending';
  if (status === 'DELIVERED') return 'Delivered';
  if (status === 'CONFIRMED' || status === 'PREPARING' || status === 'ON_THE_WAY') return 'Accepted';
  return 'Pending';
}

function paymentMethodLabel(method: string) {
  if (method === 'BKASH') return 'bKash';
  if (method === 'NAGAD') return 'Nagad';
  if (method === 'CARD') return 'Credit Card';
  return 'Cash on Delivery';
}

function orderLocation(order: ApiOrder) {
  const snap = order.addressSnapshot;
  if (!snap) return '—';
  return snap.formattedAddress ?? snap.region ?? '—';
}

function toOrderItem(order: ApiOrder): OrderItem {
  return {
    id: order.id,
    customer: order.customer?.fullName ?? '—',
    orderId: order.orderNumber,
    phone: order.customer?.phone ?? '—',
    location: orderLocation(order),
    productTitle: order.items[0]?.name ?? '—',
    paymentMethod: paymentMethodLabel(order.paymentMethod),
    status: mapOrderStatus(order.status),
    rawStatus: order.status,
  };
}

type OrderCardProps = {
  order: OrderItem;
  updating: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onReadyPickup: (id: string) => void;
};

function OrderCard({order, updating, onAccept, onDecline, onReadyPickup}: OrderCardProps) {
  return (
    <View style={styles.orderCardContainer}>
      <Text style={styles.customerText}>Customer : {order.customer}</Text>
      <Text style={styles.metaSubtext}>Order ID: {order.orderId}</Text>
      <Text style={styles.metaSubtext}>Phone: {order.phone}</Text>
      <Text style={styles.metaSubtext}>Delivery Location : {order.location}</Text>

      <View style={styles.productRow}>
        <Image
          source={{uri: 'https://via.placeholder.com/60/ECEFF3/000000?text=Medicine'}}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{order.productTitle}</Text>
          <Text style={styles.statusText}>Status: {order.status}</Text>
          <Text style={styles.paymentText}>Payment: {order.paymentMethod}</Text>
        </View>
      </View>

      {order.status === 'Pending' ? (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnAccept]}
            activeOpacity={0.85}
            disabled={updating}
            onPress={() => onAccept(order.id)}>
            <Feather name="check-circle" size={14} color="#FFFFFF" />
            <Text style={styles.btnTextWhite}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnDecline]}
            activeOpacity={0.85}
            disabled={updating}
            onPress={() => onDecline(order.id)}>
            <Feather name="x-circle" size={14} color="#FFFFFF" />
            <Text style={styles.btnTextWhite}>Declined</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {order.status === 'Accepted' && order.rawStatus !== 'ON_THE_WAY' ? (
        <TouchableOpacity
          style={styles.readyPickupBtn}
          activeOpacity={0.85}
          disabled={updating}
          onPress={() => onReadyPickup(order.id)}>
          <MaterialCommunityIcons name="hammer-wrench" size={14} color="#4E929D" />
          <Text style={styles.readyPickupText}>Ready for Pickup</Text>
        </TouchableOpacity>
      ) : null}

      {order.status === 'Delivered' ? (
        <View style={styles.successStatusRow}>
          <Feather name="check-circle" size={14} color="#00A884" />
          <Text style={styles.successStatusText}>Successful</Text>
        </View>
      ) : null}
    </View>
  );
}

function SectionHeader({title}: {title: string}) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity style={styles.viewAllRow} activeOpacity={0.7}>
        <Text style={styles.viewAllText}>View All</Text>
        <Feather name="chevron-right" size={14} color="#7E8B97" />
      </TouchableOpacity>
    </View>
  );
}

export function VendorOrdersScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeChip, setActiveChip] = useState<string>('Accepted');
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vendorApi.orders();
      setOrders(data as ApiOrder[]);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load orders';
      Alert.alert('Orders', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: string) => {
      setUpdatingOrderId(orderId);
      try {
        await vendorApi.updateOrderStatus(orderId, status);
        await loadOrders();
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Could not update order';
        Alert.alert('Order', message);
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [loadOrders],
  );

  const mappedOrders = useMemo(() => orders.map(toOrderItem), [orders]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = mappedOrders;

    if (activeChip === 'Pending') {
      list = list.filter(o => o.status === 'Pending');
    } else if (activeChip === 'Accepted') {
      list = list.filter(o => o.status === 'Accepted');
    } else if (activeChip === 'Declined') {
      list = list.filter(o => o.rawStatus === 'CANCELLED');
    }

    if (!q) return list;
    return list.filter(
      o =>
        o.customer.toLowerCase().includes(q) ||
        o.orderId.toLowerCase().includes(q) ||
        o.phone.includes(q),
    );
  }, [mappedOrders, activeChip, search]);

  const recentOrders = filteredOrders.filter(o => o.status === 'Pending');
  const acceptedOrders = filteredOrders.filter(o => o.status === 'Accepted');
  const deliveredOrders = filteredOrders.filter(o => o.status === 'Delivered');

  const showSections = activeChip === 'Last 1 Weeks' || activeChip === 'Accepted';

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <TouchableOpacity
          style={styles.headerIconBtn}
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
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#9AA6B2" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9AA6B2"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialCommunityIcons name="tune" size={20} color="#4E929D" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}>
          {ORDER_FILTER_CHIPS.map(chip => {
            const isChipActive = activeChip === chip;
            return (
              <TouchableOpacity
                key={chip}
                style={[styles.chipItem, isChipActive && styles.chipItemActive]}
                activeOpacity={0.8}
                onPress={() => setActiveChip(chip)}>
                <Text style={[styles.chipText, isChipActive && styles.chipTextActive]}>
                  {chip}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color="#4E929D" style={styles.loader} />
        ) : (
          <>
            {(showSections || activeChip === 'Pending') && recentOrders.length > 0 ? (
              <>
                <SectionHeader title="Recent Order Requests" />
                {recentOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    updating={updatingOrderId === order.id}
                    onAccept={id => updateOrderStatus(id, 'CONFIRMED')}
                    onDecline={id => updateOrderStatus(id, 'CANCELLED')}
                    onReadyPickup={id => updateOrderStatus(id, 'ON_THE_WAY')}
                  />
                ))}
              </>
            ) : null}

            {(showSections || activeChip === 'Accepted') && acceptedOrders.length > 0 ? (
              <>
                <SectionHeader title="Accepted Requests" />
                {acceptedOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    updating={updatingOrderId === order.id}
                    onAccept={id => updateOrderStatus(id, 'CONFIRMED')}
                    onDecline={id => updateOrderStatus(id, 'CANCELLED')}
                    onReadyPickup={id => updateOrderStatus(id, 'ON_THE_WAY')}
                  />
                ))}
              </>
            ) : null}

            {(showSections || activeChip === 'Declined') &&
            filteredOrders.some(o => o.rawStatus === 'CANCELLED') ? (
              <>
                <SectionHeader title="Declined" />
                {filteredOrders
                  .filter(o => o.rawStatus === 'CANCELLED')
                  .map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      updating={updatingOrderId === order.id}
                      onAccept={id => updateOrderStatus(id, 'CONFIRMED')}
                      onDecline={id => updateOrderStatus(id, 'CANCELLED')}
                      onReadyPickup={id => updateOrderStatus(id, 'ON_THE_WAY')}
                    />
                  ))}
              </>
            ) : null}

            {showSections && deliveredOrders.length > 0 ? (
              <>
                <SectionHeader title="Delivered" />
                {deliveredOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    updating={updatingOrderId === order.id}
                    onAccept={id => updateOrderStatus(id, 'CONFIRMED')}
                    onDecline={id => updateOrderStatus(id, 'CANCELLED')}
                    onReadyPickup={id => updateOrderStatus(id, 'ON_THE_WAY')}
                  />
                ))}
              </>
            ) : null}

            {!loading && filteredOrders.length === 0 ? (
              <Text style={styles.emptyText}>No orders found.</Text>
            ) : null}
          </>
        )}
      </ScrollView>

      <VendorBottomNav activeTab="orders" bottomInset={insets.bottom} navigation={navigation} />
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
  loader: {
    marginVertical: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7E8B97',
    fontSize: 13,
    marginVertical: 12,
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
    textAlign: 'center',
  },
  headerIconBtn: {
    padding: 2,
    width: 32,
  },
  searchBar: {
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
  chipsContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  chipItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F0F3F6',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipItemActive: {
    backgroundColor: '#E26D6D',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4F5E6D',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333D47',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 11,
    color: '#7E8B97',
  },
  orderCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  customerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333D47',
    marginBottom: 4,
  },
  metaSubtext: {
    fontSize: 11,
    color: '#5C6470',
    lineHeight: 15,
    marginTop: 1,
  },
  productRow: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  productImage: {
    width: 55,
    height: 55,
    borderRadius: 6,
    resizeMode: 'contain',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7E8B97',
    marginTop: 1,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#7E8B97',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    height: 34,
    borderRadius: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnAccept: {
    backgroundColor: '#47B39D',
  },
  btnDecline: {
    backgroundColor: '#E26D6D',
  },
  btnTextWhite: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  readyPickupBtn: {
    borderWidth: 1,
    borderColor: '#4E929D',
    height: 34,
    borderRadius: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#E6F3F5',
    gap: 6,
  },
  readyPickupText: {
    color: '#4E929D',
    fontSize: 12,
    fontWeight: '600',
  },
  successStatusRow: {
    borderWidth: 1,
    borderColor: '#EAEFF5',
    height: 34,
    borderRadius: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#F4F7F6',
    gap: 6,
  },
  successStatusText: {
    color: '#1A1C1E',
    fontSize: 12,
    fontWeight: '600',
  },
});
