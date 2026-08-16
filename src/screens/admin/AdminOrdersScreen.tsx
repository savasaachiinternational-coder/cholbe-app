import {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import {adminApi, type AdminOrderDetail} from '../../api/admin';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';
import {formatBdt} from '../../utils/pharmacyHelpers';
import {NotificationBell} from '../../components/NotificationBell';
import {
  ADMIN_ORDER_FILTERS,
  type AdminOrderFilter,
  type AdminOrderStatus,
} from './adminNav';

type Props = NativeStackScreenProps<RootStackParamList, 'AOrders'>;

type ApiOrder = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  total: string | number;
  customer: {fullName: string; phone: string | null; avatarUrl: string | null};
  vendor?: {pharmacyName: string} | null;
  items: {name: string; quantity: number; unitPrice: string | number}[];
};

type OrderRecord = {
  id: string;
  rawId: string;
  customerName: string;
  pharmacyName: string;
  phone: string;
  timeAgo: string;
  status: AdminOrderStatus;
  rawStatus: string;
  total: string | number;
};

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'];

function mapOrderStatus(status: string): AdminOrderStatus {
  switch (status) {
    case 'PENDING': return 'Pending';
    case 'PREPARING':
    case 'CONFIRMED':
    case 'ON_THE_WAY': return 'Processing';
    case 'DELIVERED': return 'Delivered';
    case 'CANCELLED': return 'Cancelled';
    default: return 'Pending';
  }
}

function filterToApiStatus(filter: AdminOrderFilter): string | undefined {
  if (filter === 'All' || filter === 'Processing') return undefined;
  if (filter === 'Pending') return 'PENDING';
  if (filter === 'Delivered') return 'DELIVERED';
  if (filter === 'Cancelled') return 'CANCELLED';
  return undefined;
}

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day ago`;
}

function mapOrder(record: ApiOrder): OrderRecord {
  return {
    id: `#${record.orderNumber}`,
    rawId: record.id,
    customerName: record.customer.fullName,
    pharmacyName: record.vendor?.pharmacyName ?? '—',
    phone: record.customer.phone ?? '—',
    timeAgo: formatTimeAgo(record.createdAt),
    status: mapOrderStatus(record.status),
    rawStatus: record.status,
    total: record.total,
  };
}

function getStatusBadgeStyle(status: AdminOrderStatus) {
  switch (status) {
    case 'Delivered': return styles.badgeDelivered;
    case 'Processing': return styles.badgeProcessing;
    case 'Pending': return styles.badgePending;
    case 'Cancelled': return styles.badgeCancelled;
  }
}

function formatNum(v: string | number) {
  return formatBdt(typeof v === 'string' ? parseFloat(v) : v);
}

function OrderDetailModal({
  detail,
  onClose,
  onStatusUpdate,
  updatingStatus,
}: {
  detail: AdminOrderDetail | null;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: string) => void;
  updatingStatus: boolean;
}) {
  const [showInvoice, setShowInvoice] = useState(false);

  if (!detail) return null;

  const subtotal = typeof detail.subtotal === 'string' ? parseFloat(detail.subtotal) : detail.subtotal;
  const delivery = typeof detail.deliveryCharge === 'string' ? parseFloat(detail.deliveryCharge) : detail.deliveryCharge;
  const total = typeof detail.total === 'string' ? parseFloat(detail.total) : detail.total;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.detailModal}>
          <View style={styles.detailModalHeader}>
            <Text style={styles.detailModalTitle}>
              {showInvoice ? 'Invoice' : 'Order Details'}
            </Text>
            <View style={styles.headerActions}>
              {!showInvoice && (
                <TouchableOpacity
                  style={styles.invoiceBtn}
                  onPress={() => setShowInvoice(true)}
                  activeOpacity={0.8}>
                  <Feather name="file-text" size={14} color="#4E929D" />
                  <Text style={styles.invoiceBtnText}>Invoice</Text>
                </TouchableOpacity>
              )}
              {showInvoice && (
                <TouchableOpacity onPress={() => setShowInvoice(false)} activeOpacity={0.7}>
                  <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
                <Feather name="x" size={22} color="#1A1C1E" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {showInvoice ? (
              // Invoice view
              <View style={styles.invoiceContainer}>
                <View style={styles.invoiceHeader}>
                  <Text style={styles.invoiceBrand}>+ Cholbe PHARMACY</Text>
                  <Text style={styles.invoiceSubtitle}>Tax Invoice</Text>
                </View>
                <View style={styles.invoiceDivider} />
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Order ID</Text>
                  <Text style={styles.invoiceValue}>#{detail.orderNumber}</Text>
                </View>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Date</Text>
                  <Text style={styles.invoiceValue}>
                    {new Date(detail.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Customer</Text>
                  <Text style={styles.invoiceValue}>{detail.customer.fullName}</Text>
                </View>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Phone</Text>
                  <Text style={styles.invoiceValue}>{detail.customer.phone ?? '—'}</Text>
                </View>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Pharmacy</Text>
                  <Text style={styles.invoiceValue}>{detail.vendor?.pharmacyName ?? '—'}</Text>
                </View>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Payment</Text>
                  <Text style={styles.invoiceValue}>{detail.paymentMethod}</Text>
                </View>
                <View style={styles.invoiceDivider} />
                <Text style={styles.invoiceSectionTitle}>Items</Text>
                {detail.items.map(item => (
                  <View key={item.id} style={styles.invoiceItemRow}>
                    <View style={styles.invoiceItemLeft}>
                      <Text style={styles.invoiceItemName}>{item.name}</Text>
                      <Text style={styles.invoiceItemQty}>x{item.quantity} @ {formatNum(item.unitPrice)}</Text>
                    </View>
                    <Text style={styles.invoiceItemTotal}>{formatNum(item.lineTotal)}</Text>
                  </View>
                ))}
                <View style={styles.invoiceDivider} />
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Subtotal</Text>
                  <Text style={styles.invoiceValue}>{formatNum(subtotal)}</Text>
                </View>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Delivery</Text>
                  <Text style={styles.invoiceValue}>{formatNum(delivery)}</Text>
                </View>
                <View style={[styles.invoiceRow, styles.invoiceTotalRow]}>
                  <Text style={styles.invoiceTotalLabel}>Total</Text>
                  <Text style={styles.invoiceTotalValue}>{formatNum(total)}</Text>
                </View>
              </View>
            ) : (
              // Order detail view
              <>
                <View style={styles.orderInfoCard}>
                  <View style={styles.orderInfoRow}>
                    <Text style={styles.orderInfoLabel}>Order ID</Text>
                    <Text style={styles.orderInfoValue}>#{detail.orderNumber}</Text>
                  </View>
                  <View style={styles.orderInfoRow}>
                    <Text style={styles.orderInfoLabel}>Customer</Text>
                    <Text style={styles.orderInfoValue}>{detail.customer.fullName}</Text>
                  </View>
                  <View style={styles.orderInfoRow}>
                    <Text style={styles.orderInfoLabel}>Phone</Text>
                    <Text style={styles.orderInfoValue}>{detail.customer.phone ?? '—'}</Text>
                  </View>
                  <View style={styles.orderInfoRow}>
                    <Text style={styles.orderInfoLabel}>Pharmacy</Text>
                    <Text style={styles.orderInfoValue}>{detail.vendor?.pharmacyName ?? '—'}</Text>
                  </View>
                  <View style={styles.orderInfoRow}>
                    <Text style={styles.orderInfoLabel}>Status</Text>
                    <Text style={styles.orderInfoValue}>{detail.status}</Text>
                  </View>
                  <View style={styles.orderInfoRow}>
                    <Text style={styles.orderInfoLabel}>Payment</Text>
                    <Text style={styles.orderInfoValue}>
                      {detail.paymentMethod} ({detail.paymentStatus})
                    </Text>
                  </View>
                  <View style={styles.orderInfoRow}>
                    <Text style={styles.orderInfoLabel}>Total</Text>
                    <Text style={[styles.orderInfoValue, styles.totalText]}>{formatNum(total)}</Text>
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Items ({detail.items.length})</Text>
                <View style={styles.itemsCard}>
                  {detail.items.map((item, idx) => (
                    <View
                      key={item.id}
                      style={[styles.itemRow, idx === detail.items.length - 1 && styles.itemRowLast]}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemMeta}>
                          {item.variant} · x{item.quantity} · {formatNum(item.unitPrice)} each
                        </Text>
                      </View>
                      <Text style={styles.itemLineTotal}>{formatNum(item.lineTotal)}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>Timeline</Text>
                <View style={styles.timelineCard}>
                  {detail.statusEvents.map((evt, idx) => (
                    <View key={evt.id} style={styles.timelineItem}>
                      <View style={[styles.timelineDot, idx === 0 && styles.timelineDotFirst]} />
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineStatus}>{evt.status}</Text>
                        {evt.note ? (
                          <Text style={styles.timelineNote}>{evt.note}</Text>
                        ) : null}
                        <Text style={styles.timelineDate}>
                          {new Date(evt.createdAt).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>Update Status</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.statusButtons}>
                  {ORDER_STATUSES.map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.statusBtn,
                        detail.status === s && styles.statusBtnActive,
                      ]}
                      disabled={updatingStatus || detail.status === s}
                      onPress={() => onStatusUpdate(detail.id, s)}
                      activeOpacity={0.8}>
                      <Text
                        style={[
                          styles.statusBtnText,
                          detail.status === s && styles.statusBtnTextActive,
                        ]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function AdminOrdersScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<AdminOrderFilter>('All');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDetail, setSelectedDetail] = useState<AdminOrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.orders(filterToApiStatus(activeFilter));
      let mapped = (data as ApiOrder[]).map(mapOrder);
      if (activeFilter === 'Processing') {
        mapped = mapped.filter(o => o.status === 'Processing');
      }
      setOrders(mapped);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load orders';
      Alert.alert('Orders', message);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const openOrder = useCallback(async (rawId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await adminApi.getOrder(rawId);
      setSelectedDetail(detail);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load order details';
      Alert.alert('Order', message);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleStatusUpdate = useCallback(
    async (orderId: string, status: string) => {
      setUpdatingStatus(true);
      try {
        await adminApi.updateOrderStatus(orderId, status);
        const updated = await adminApi.getOrder(orderId);
        setSelectedDetail(updated);
        await loadOrders();
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Could not update status';
        Alert.alert('Error', message);
      } finally {
        setUpdatingStatus(false);
      }
    },
    [loadOrders],
  );

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      o =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.pharmacyName.toLowerCase().includes(q) ||
        o.phone.includes(q),
    );
  }, [orders, search]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <NotificationBell
          style={styles.headerButton}
          onPress={() => navigation.navigate('Notifications')}
        />
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
          <Text style={styles.countText}>{filteredOrders.length} orders</Text>
        </View>

        <View style={styles.itemsVerticalStack}>
          {loading ? (
            <ActivityIndicator color="#4E929D" style={styles.loader} />
          ) : filteredOrders.length === 0 ? (
            <Text style={styles.emptyText}>No orders found.</Text>
          ) : (
            filteredOrders.map((recordItem, index) => (
              <TouchableOpacity
                key={`${recordItem.rawId}-${index}`}
                onPress={() => openOrder(recordItem.rawId)}
                activeOpacity={0.85}
                style={styles.orderCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.orderIdText}>{recordItem.id}</Text>
                  <Text style={styles.timeAgoText}>{recordItem.timeAgo}</Text>
                </View>

                <View style={styles.cardBodyRow}>
                  <View style={styles.metaTextInfo}>
                    <Text style={styles.customerNameText}>{recordItem.customerName}</Text>
                    <View style={styles.pharmacyRow}>
                      <MaterialCommunityIcons name="hospital-box" size={12} color="#7E8B97" />
                      <Text style={styles.pharmacyNameText}>{recordItem.pharmacyName}</Text>
                    </View>
                  </View>
                  <Text style={styles.totalText}>{formatNum(recordItem.total)}</Text>
                </View>

                <View style={styles.cardFooterRow}>
                  <View style={styles.phoneGroupRow}>
                    <Feather name="phone" size={14} color="#7E8B97" />
                    <Text style={styles.phoneText}>{recordItem.phone}</Text>
                  </View>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(recordItem.status)]}>
                    <Text style={styles.statusBadgeText}>{recordItem.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {loadingDetail && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#4E929D" size="large" />
        </View>
      )}

      <AdminBottomNav activeTab="orders" bottomInset={insets.bottom} navigation={navigation} />

      <OrderDetailModal
        detail={selectedDetail}
        onClose={() => setSelectedDetail(null)}
        onStatusUpdate={handleStatusUpdate}
        updatingStatus={updatingStatus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F6F8FB'},
  scrollContent: {paddingTop: 4},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#F9FAFC',
  },
  headerTitle: {fontSize: 18, fontWeight: '700', color: '#1A1C1E', flex: 1, marginLeft: 12},
  headerButton: {padding: 2, width: 32},
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
  searchInput: {flex: 1, fontSize: 14, padding: 0, color: '#1A1C1E'},
  filtersContent: {paddingHorizontal: 16, paddingVertical: 16, gap: 8},
  chipItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  chipItemActive: {backgroundColor: '#4E929D', borderColor: '#4E929D'},
  chipItemText: {fontSize: 12, fontWeight: '500', color: '#7E8B97'},
  chipItemActiveText: {color: '#FFFFFF', fontWeight: '600'},
  sectionHeaderLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeadingText: {fontSize: 14, fontWeight: '700', color: '#333D47'},
  countText: {fontSize: 11, color: '#9AA6B2'},
  itemsVerticalStack: {gap: 12},
  loader: {marginVertical: 32},
  emptyText: {textAlign: 'center', color: '#9AA6B2', fontSize: 14, paddingVertical: 32},
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  cardHeaderRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  orderIdText: {fontSize: 12, fontWeight: '700', color: '#1A1C1E'},
  timeAgoText: {fontSize: 10, color: '#9AA6B2', fontWeight: '500'},
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  metaTextInfo: {flex: 1},
  customerNameText: {fontSize: 14, fontWeight: '700', color: '#1A1C1E'},
  pharmacyRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2},
  pharmacyNameText: {fontSize: 11, color: '#7E8B97', fontWeight: '500'},
  totalText: {fontSize: 13, fontWeight: '700', color: '#4E929D'},
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  phoneGroupRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  phoneText: {fontSize: 11, color: '#5C6470', fontWeight: '500'},
  statusBadge: {borderRadius: 12, height: 24, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center'},
  badgeDelivered: {backgroundColor: '#4E929D'},
  badgeProcessing: {backgroundColor: '#1E90FF'},
  badgePending: {backgroundColor: '#FFA500'},
  badgeCancelled: {backgroundColor: '#E26D6D'},
  statusBadgeText: {color: '#FFFFFF', fontSize: 11, fontWeight: '600'},
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  // Modal
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end'},
  detailModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailModalTitle: {fontSize: 16, fontWeight: '700', color: '#1A1C1E'},
  headerActions: {flexDirection: 'row', alignItems: 'center', gap: 10},
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  invoiceBtnText: {fontSize: 12, color: '#4E929D', fontWeight: '600'},
  backText: {fontSize: 13, color: '#4E929D', fontWeight: '600'},
  closeBtn: {marginLeft: 4},
  orderInfoCard: {
    backgroundColor: '#F6F8FB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF3',
  },
  orderInfoLabel: {fontSize: 12, color: '#7E8B97', fontWeight: '500'},
  orderInfoValue: {fontSize: 12, color: '#1A1C1E', fontWeight: '600', maxWidth: '60%', textAlign: 'right'},
  sectionLabel: {fontSize: 13, fontWeight: '700', color: '#333D47', marginBottom: 8, marginTop: 4},
  itemsCard: {
    backgroundColor: '#F6F8FB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF3',
  },
  itemRowLast: {borderBottomWidth: 0},
  itemInfo: {flex: 1},
  itemName: {fontSize: 13, fontWeight: '600', color: '#1A1C1E'},
  itemMeta: {fontSize: 11, color: '#7E8B97', marginTop: 2},
  itemLineTotal: {fontSize: 13, fontWeight: '700', color: '#1A1C1E'},
  timelineCard: {
    backgroundColor: '#F6F8FB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    padding: 12,
    marginBottom: 16,
  },
  timelineItem: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12},
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9AA6B2',
    marginTop: 3,
    marginRight: 10,
  },
  timelineDotFirst: {backgroundColor: '#4E929D'},
  timelineContent: {flex: 1},
  timelineStatus: {fontSize: 13, fontWeight: '600', color: '#1A1C1E'},
  timelineNote: {fontSize: 11, color: '#7E8B97', marginTop: 1},
  timelineDate: {fontSize: 10, color: '#9AA6B2', marginTop: 1},
  statusButtons: {paddingBottom: 20, gap: 8},
  statusBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F0F3F6',
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginRight: 4,
  },
  statusBtnActive: {backgroundColor: '#4E929D', borderColor: '#4E929D'},
  statusBtnText: {fontSize: 12, fontWeight: '500', color: '#7E8B97'},
  statusBtnTextActive: {color: '#FFFFFF', fontWeight: '700'},
  // Invoice
  invoiceContainer: {padding: 4},
  invoiceHeader: {alignItems: 'center', marginBottom: 16},
  invoiceBrand: {fontSize: 18, fontWeight: '800', color: '#3F8694'},
  invoiceSubtitle: {fontSize: 12, color: '#7E8B97', marginTop: 2},
  invoiceDivider: {height: 1, backgroundColor: '#ECEFF3', marginVertical: 12},
  invoiceRow: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5},
  invoiceLabel: {fontSize: 12, color: '#7E8B97'},
  invoiceValue: {fontSize: 12, color: '#1A1C1E', fontWeight: '500'},
  invoiceSectionTitle: {fontSize: 13, fontWeight: '700', color: '#333D47', marginBottom: 8},
  invoiceItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  invoiceItemLeft: {flex: 1},
  invoiceItemName: {fontSize: 12, fontWeight: '600', color: '#1A1C1E'},
  invoiceItemQty: {fontSize: 11, color: '#7E8B97', marginTop: 1},
  invoiceItemTotal: {fontSize: 12, fontWeight: '600', color: '#1A1C1E'},
  invoiceTotalRow: {marginTop: 4},
  invoiceTotalLabel: {fontSize: 14, fontWeight: '700', color: '#1A1C1E'},
  invoiceTotalValue: {fontSize: 14, fontWeight: '700', color: '#4E929D'},
});
