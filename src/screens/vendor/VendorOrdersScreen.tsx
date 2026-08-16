import {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
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
import {NotificationBell} from '../../components/NotificationBell';

type Props = NativeStackScreenProps<RootStackParamList, 'VOrders'>;

type ApiOrderItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: string | number;
  imageUrl?: string | null;
};

type ApiOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  total?: string | number;
  paymentStatus?: string;
  addressSnapshot?: {formattedAddress?: string; region?: string} | null;
  customer?: {fullName: string; phone?: string | null; email?: string | null};
  items: ApiOrderItem[];
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
  total: string;
  raw: ApiOrder;
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

function formatBdt(n: number) {
  return '৳' + n.toLocaleString('en-BD', {maximumFractionDigits: 0});
}

function formatOrderTotal(total?: string | number) {
  const n = typeof total === 'string' ? parseFloat(total) : (total ?? 0);
  return formatBdt(Number.isFinite(n) ? n : 0);
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
    total: formatOrderTotal(order.total),
    raw: order,
  };
}

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED'];

function statusLabel(s: string) {
  if (s === 'PENDING') return 'Pending';
  if (s === 'CONFIRMED') return 'Accepted';
  if (s === 'PREPARING') return 'Preparing';
  if (s === 'ON_THE_WAY') return 'On the Way';
  if (s === 'DELIVERED') return 'Delivered';
  if (s === 'CANCELLED') return 'Cancelled';
  return s;
}

type OrderDetailModalProps = {
  order: OrderItem;
  visible: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  updating: boolean;
};

function OrderDetailModal({order, visible, onClose, onStatusChange, updating}: OrderDetailModalProps) {
  const raw = order.raw;
  const stepIndex = STATUS_STEPS.indexOf(raw.status);
  const isCancelled = raw.status === 'CANCELLED';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={detailStyles.overlay}>
        <Pressable style={detailStyles.backdrop} onPress={onClose} />
        <View style={detailStyles.sheet}>
          <View style={detailStyles.handle} />
          <View style={detailStyles.sheetHeader}>
            <Text style={detailStyles.sheetTitle}>Order Detail</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={detailStyles.sheetScroll}>
            <View style={detailStyles.orderIdRow}>
              <Text style={detailStyles.orderIdText}>{raw.orderNumber}</Text>
              <View style={[detailStyles.statusChip, isCancelled && detailStyles.statusChipRed]}>
                <Text style={[detailStyles.statusChipText, isCancelled && detailStyles.statusChipTextRed]}>
                  {statusLabel(raw.status)}
                </Text>
              </View>
            </View>

            <View style={detailStyles.section}>
              <Text style={detailStyles.sectionLabel}>Customer</Text>
              <View style={detailStyles.infoRow}>
                <Feather name="user" size={14} color="#4E929D" />
                <Text style={detailStyles.infoText}>{raw.customer?.fullName ?? '—'}</Text>
              </View>
              <View style={detailStyles.infoRow}>
                <Feather name="phone" size={14} color="#4E929D" />
                <Text style={detailStyles.infoText}>{raw.customer?.phone ?? '—'}</Text>
              </View>
              <View style={detailStyles.infoRow}>
                <Feather name="map-pin" size={14} color="#4E929D" />
                <Text style={detailStyles.infoText}>{orderLocation(raw)}</Text>
              </View>
            </View>

            <View style={detailStyles.section}>
              <Text style={detailStyles.sectionLabel}>Items ({raw.items.length})</Text>
              {raw.items.map(item => (
                <View key={item.id} style={detailStyles.itemRow}>
                  {item.imageUrl ? (
                    <Image source={{uri: item.imageUrl}} style={detailStyles.itemImage} />
                  ) : (
                    <View style={[detailStyles.itemImage, detailStyles.itemImageFallback]}>
                      <MaterialCommunityIcons name="pill" size={18} color="#47B39D" />
                    </View>
                  )}
                  <View style={detailStyles.itemInfo}>
                    <Text style={detailStyles.itemName}>{item.name}</Text>
                    <Text style={detailStyles.itemQty}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={detailStyles.itemPrice}>{formatOrderTotal(item.unitPrice)}</Text>
                </View>
              ))}
            </View>

            <View style={detailStyles.section}>
              <Text style={detailStyles.sectionLabel}>Payment</Text>
              <View style={detailStyles.payRow}>
                <Text style={detailStyles.payLabel}>Method</Text>
                <Text style={detailStyles.payValue}>{paymentMethodLabel(raw.paymentMethod)}</Text>
              </View>
              <View style={detailStyles.payRow}>
                <Text style={detailStyles.payLabel}>Total</Text>
                <Text style={[detailStyles.payValue, detailStyles.payTotal]}>{order.total}</Text>
              </View>
              {raw.paymentStatus ? (
                <View style={detailStyles.payRow}>
                  <Text style={detailStyles.payLabel}>Payment Status</Text>
                  <Text style={[detailStyles.payValue, raw.paymentStatus === 'PAID' && detailStyles.paidText]}>
                    {raw.paymentStatus}
                  </Text>
                </View>
              ) : null}
            </View>

            {!isCancelled && (
              <View style={detailStyles.section}>
                <Text style={detailStyles.sectionLabel}>Progress</Text>
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= stepIndex;
                  return (
                    <View key={step} style={detailStyles.timelineRow}>
                      <View style={[detailStyles.timelineDot, done && detailStyles.timelineDotActive]} />
                      {i < STATUS_STEPS.length - 1 ? (
                        <View style={[detailStyles.timelineLine, done && detailStyles.timelineLineActive]} />
                      ) : null}
                      <Text style={[detailStyles.timelineLabel, done && detailStyles.timelineLabelActive]}>
                        {statusLabel(step)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {raw.status === 'PENDING' && (
              <View style={detailStyles.actionsRow}>
                <TouchableOpacity
                  style={[detailStyles.actionBtn, detailStyles.btnAccept]}
                  activeOpacity={0.85}
                  disabled={updating}
                  onPress={() => onStatusChange(raw.id, 'CONFIRMED')}>
                  {updating ? <ActivityIndicator color="#FFF" size="small" /> : (
                    <>
                      <Feather name="check-circle" size={15} color="#FFF" />
                      <Text style={detailStyles.btnTextWhite}>Accept Order</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[detailStyles.actionBtn, detailStyles.btnDecline]}
                  activeOpacity={0.85}
                  disabled={updating}
                  onPress={() => onStatusChange(raw.id, 'CANCELLED')}>
                  <Feather name="x-circle" size={15} color="#FFF" />
                  <Text style={detailStyles.btnTextWhite}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}

            {raw.status === 'CONFIRMED' && (
              <TouchableOpacity
                style={[detailStyles.actionBtn, detailStyles.btnFull, detailStyles.btnPrepare]}
                activeOpacity={0.85}
                disabled={updating}
                onPress={() => onStatusChange(raw.id, 'PREPARING')}>
                {updating ? <ActivityIndicator color="#FFF" size="small" /> : (
                  <>
                    <MaterialCommunityIcons name="hammer-wrench" size={15} color="#FFF" />
                    <Text style={detailStyles.btnTextWhite}>Mark as Preparing</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {raw.status === 'PREPARING' && (
              <TouchableOpacity
                style={[detailStyles.actionBtn, detailStyles.btnFull, detailStyles.btnPickup]}
                activeOpacity={0.85}
                disabled={updating}
                onPress={() => onStatusChange(raw.id, 'ON_THE_WAY')}>
                {updating ? <ActivityIndicator color="#4E929D" size="small" /> : (
                  <>
                    <MaterialCommunityIcons name="truck-fast" size={15} color="#4E929D" />
                    <Text style={detailStyles.btnPickupText}>Ready for Pickup / On the Way</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {raw.status === 'ON_THE_WAY' && (
              <TouchableOpacity
                style={[detailStyles.actionBtn, detailStyles.btnFull, detailStyles.btnDeliver]}
                activeOpacity={0.85}
                disabled={updating}
                onPress={() => onStatusChange(raw.id, 'DELIVERED')}>
                {updating ? <ActivityIndicator color="#FFF" size="small" /> : (
                  <>
                    <Feather name="package" size={15} color="#FFF" />
                    <Text style={detailStyles.btnTextWhite}>Mark as Delivered</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

type OrderCardProps = {
  order: OrderItem;
  onTap: (order: OrderItem) => void;
  updating: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onReadyPickup: (id: string) => void;
};

function OrderCard({order, onTap, updating, onAccept, onDecline, onReadyPickup}: OrderCardProps) {
  return (
    <TouchableOpacity style={styles.orderCardContainer} activeOpacity={0.9} onPress={() => onTap(order)}>
      <Text style={styles.customerText}>Customer : {order.customer}</Text>
      <Text style={styles.metaSubtext}>Order ID: {order.orderId}</Text>
      <Text style={styles.metaSubtext}>Phone: {order.phone}</Text>
      <Text style={styles.metaSubtext}>Delivery Location : {order.location}</Text>

      <View style={styles.productRow}>
        <View style={[styles.productImage, styles.productImageFallback]}>
          <MaterialCommunityIcons name="pill" size={22} color="#47B39D" />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{order.productTitle}</Text>
          <Text style={styles.statusText}>Status: {order.status}</Text>
          <Text style={styles.paymentText}>Payment: {order.paymentMethod}</Text>
        </View>
        <Text style={styles.totalText}>{order.total}</Text>
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

      <View style={styles.tapHintRow}>
        <Text style={styles.tapHint}>Tap for full details</Text>
        <Feather name="chevron-right" size={12} color="#B0B8C4" />
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({title}: {title: string}) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
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
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

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
        setDetailVisible(false);
        setSelectedOrder(null);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Could not update order';
        Alert.alert('Order', message);
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [loadOrders],
  );

  const handleOpenDetail = useCallback((order: OrderItem) => {
    setSelectedOrder(order);
    setDetailVisible(true);
  }, []);

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
        <NotificationBell
          style={styles.headerIconBtn}
          onPress={() => navigation.navigate('Notifications')}
        />
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
                    onTap={handleOpenDetail}
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
                    onTap={handleOpenDetail}
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
                      onTap={handleOpenDetail}
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
                    onTap={handleOpenDetail}
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

      {selectedOrder ? (
        <OrderDetailModal
          order={selectedOrder}
          visible={detailVisible}
          onClose={() => {
            setDetailVisible(false);
            setSelectedOrder(null);
          }}
          onStatusChange={updateOrderStatus}
          updating={updatingOrderId === selectedOrder.id}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F6F8FB'},
  scrollContent: {paddingTop: 4},
  loader: {marginVertical: 24},
  emptyText: {textAlign: 'center', color: '#7E8B97', fontSize: 13, marginVertical: 12},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#F9FAFC',
  },
  headerTitle: {fontSize: 18, fontWeight: '700', color: '#1A1C1E', flex: 1, textAlign: 'center'},
  headerIconBtn: {padding: 2, width: 32},
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
  searchInput: {flex: 1, fontSize: 14, padding: 0, color: '#1A1C1E'},
  chipsContent: {paddingHorizontal: 16, paddingVertical: 16, gap: 8},
  chipItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F0F3F6',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipItemActive: {backgroundColor: '#E26D6D'},
  chipText: {fontSize: 12, fontWeight: '500', color: '#4F5E6D'},
  chipTextActive: {color: '#FFFFFF', fontWeight: '600'},
  sectionHeaderRow: {paddingHorizontal: 16, marginTop: 12, marginBottom: 10},
  sectionTitle: {fontSize: 14, fontWeight: '700', color: '#333D47'},
  orderCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  customerText: {fontSize: 14, fontWeight: '700', color: '#333D47', marginBottom: 4},
  metaSubtext: {fontSize: 11, color: '#5C6470', lineHeight: 15, marginTop: 1},
  productRow: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  productImage: {width: 55, height: 55, borderRadius: 6, marginRight: 12},
  productImageFallback: {backgroundColor: '#E8F4F6', alignItems: 'center', justifyContent: 'center'},
  productInfo: {flex: 1},
  productTitle: {fontSize: 13, fontWeight: '700', color: '#1A1C1E'},
  statusText: {fontSize: 11, fontWeight: '600', color: '#7E8B97', marginTop: 1},
  paymentText: {fontSize: 11, fontWeight: '500', color: '#7E8B97'},
  totalText: {fontSize: 14, fontWeight: '700', color: '#4E929D'},
  actionsRow: {flexDirection: 'row', gap: 12, marginTop: 12},
  actionBtn: {
    flex: 1,
    height: 34,
    borderRadius: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnAccept: {backgroundColor: '#47B39D'},
  btnDecline: {backgroundColor: '#E26D6D'},
  btnTextWhite: {color: '#FFFFFF', fontSize: 12, fontWeight: '600'},
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
  readyPickupText: {color: '#4E929D', fontSize: 12, fontWeight: '600'},
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
  successStatusText: {color: '#1A1C1E', fontSize: 12, fontWeight: '600'},
  tapHintRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, gap: 2},
  tapHint: {fontSize: 10, color: '#B0B8C4'},
});

const detailStyles = StyleSheet.create({
  overlay: {flex: 1, justifyContent: 'flex-end'},
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF3',
  },
  sheetTitle: {fontSize: 17, fontWeight: '700', color: '#1A1C1E'},
  sheetScroll: {paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8},
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  orderIdText: {fontSize: 16, fontWeight: '800', color: '#1A1C1E'},
  statusChip: {backgroundColor: '#E8F4F6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4},
  statusChipRed: {backgroundColor: '#FEE2E2'},
  statusChipText: {fontSize: 12, fontWeight: '700', color: '#4E929D'},
  statusChipTextRed: {color: '#DC2626'},
  section: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9AA6B2',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  infoRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6},
  infoText: {fontSize: 13, color: '#333D47', flex: 1},
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  itemImage: {width: 44, height: 44, borderRadius: 8, marginRight: 12},
  itemImageFallback: {backgroundColor: '#E8F4F6', alignItems: 'center', justifyContent: 'center'},
  itemInfo: {flex: 1},
  itemName: {fontSize: 13, fontWeight: '700', color: '#1A1C1E'},
  itemQty: {fontSize: 11, color: '#7E8B97', marginTop: 2},
  itemPrice: {fontSize: 13, fontWeight: '700', color: '#4E929D'},
  payRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
  payLabel: {fontSize: 13, color: '#7E8B97'},
  payValue: {fontSize: 13, fontWeight: '600', color: '#333D47'},
  payTotal: {fontSize: 15, fontWeight: '800', color: '#1A1C1E'},
  paidText: {color: '#16A34A'},
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    position: 'relative',
    paddingLeft: 28,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
    position: 'absolute',
    left: 0,
    top: 2,
  },
  timelineDotActive: {backgroundColor: '#4E929D'},
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 14,
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  timelineLineActive: {backgroundColor: '#4E929D'},
  timelineLabel: {fontSize: 13, color: '#9AA6B2', marginBottom: 16},
  timelineLabelActive: {color: '#333D47', fontWeight: '600'},
  actionsRow: {flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 8},
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnFull: {
    flex: 0,
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
  },
  btnAccept: {backgroundColor: '#47B39D'},
  btnDecline: {backgroundColor: '#E26D6D'},
  btnPrepare: {backgroundColor: '#7C3AED'},
  btnPickup: {
    borderWidth: 1.5,
    borderColor: '#4E929D',
    backgroundColor: '#E6F3F5',
  },
  btnPickupText: {color: '#4E929D', fontSize: 13, fontWeight: '700'},
  btnDeliver: {backgroundColor: '#16A34A'},
  btnTextWhite: {color: '#FFFFFF', fontSize: 13, fontWeight: '700'},
});
