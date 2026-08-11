import {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {vendorApi} from '../../api/vendor';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {ProductImage} from '../../components/ProductImage';
import {formatBdt} from '../../utils/pharmacyHelpers';
import {VendorBottomNav} from './VendorBottomNav';
import type {VendorOrderStatus} from './vendorNav';
import {NotificationBell} from '../../components/NotificationBell';

const CHART_WIDTH = Dimensions.get('window').width - 64;
const CHART_PLOT_HEIGHT = 120;

function buildRevenueChartPoints(data: {revenue: number}[]): {x: number; y: number}[] {
  if (data.length === 0) return [];
  const max = Math.max(...data.map(d => d.revenue), 1);
  const n = data.length;
  return data.map((d, i) => ({
    x: n === 1 ? 0.5 : i / (n - 1),
    y: 1 - d.revenue / max,
  }));
}

function VChartLineSegment({
  start,
  end,
  plotWidth,
  plotHeight,
}: {
  start: {x: number; y: number};
  end: {x: number; y: number};
  plotWidth: number;
  plotHeight: number;
}) {
  const x1 = start.x * plotWidth;
  const y1 = start.y * plotHeight;
  const x2 = end.x * plotWidth;
  const y2 = end.y * plotHeight;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <View
      style={[
        styles.vChartLineSegment,
        {left: x1, top: y1, width: length, transform: [{rotate: `${angle}deg`}]},
      ]}
    />
  );
}

type Props = NativeStackScreenProps<RootStackParamList, 'VHome'>;

type VendorProduct = {
  id: string;
  name: string;
  genericName?: string | null;
  category?: string | null;
  unitPrice: string | number;
  discountPrice?: string | number | null;
  stockQuantity: number;
  minAlertLevel: number;
  unitType?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
};

type VendorOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  addressSnapshot?: {formattedAddress?: string; region?: string} | null;
  customer?: {fullName: string; phone?: string | null};
  items: {name: string; genericName?: string | null}[];
};

type DashboardData = {
  vendor: {
    id: string;
    pharmacyName: string;
    address?: string | null;
    user?: {fullName: string};
  };
  stats: {
    productCount: number;
    orderCount: number;
    pendingOrders: number;
    totalRevenue: string | number;
  };
  recentProducts: VendorProduct[];
  recentOrders: VendorOrder[];
};

function formatTk(amount: string | number) {
  return formatBdt(amount);
}

function discountLabel(product: VendorProduct) {
  if (!product.discountPrice) return null;
  const unit = typeof product.unitPrice === 'string' ? parseFloat(product.unitPrice) : product.unitPrice;
  const disc = typeof product.discountPrice === 'string' ? parseFloat(product.discountPrice) : product.discountPrice;
  if (disc >= unit) return null;
  return `(-${Math.round((1 - disc / unit) * 100)}%)`;
}

function mapOrderStatus(status: string): VendorOrderStatus {
  if (status === 'PENDING') return 'Pending';
  if (status === 'DELIVERED') return 'Delivered';
  if (status === 'CONFIRMED' || status === 'PREPARING' || status === 'ON_THE_WAY') return 'Accepted';
  return 'Pending';
}

function orderLocation(order: VendorOrder) {
  const snap = order.addressSnapshot;
  if (!snap) return '—';
  return snap.formattedAddress ?? snap.region ?? '—';
}

export function VendorHomeScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{month: string; revenue: number}[]>([]);
  const [search, setSearch] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [data, monthly] = await Promise.all([
        vendorApi.dashboard(),
        vendorApi.revenueMonthly().catch(() => []),
      ]);
      setDashboard(data as DashboardData);
      setMonthlyRevenue(monthly);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load dashboard';
      Alert.alert('Dashboard', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: string) => {
      setUpdatingOrderId(orderId);
      try {
        await vendorApi.updateOrderStatus(orderId, status);
        await loadDashboard();
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Could not update order';
        Alert.alert('Order', message);
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [loadDashboard],
  );

  const products = dashboard?.recentProducts ?? [];
  const filteredProducts = search.trim()
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(search.trim().toLowerCase()) ||
          (p.genericName?.toLowerCase().includes(search.trim().toLowerCase()) ?? false),
      )
    : products;

  const lowStockCount = products.filter(
    p => p.stockQuantity > 0 && p.stockQuantity <= p.minAlertLevel,
  ).length;
  const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;

  const revenueChartPoints = useMemo(
    () => buildRevenueChartPoints(monthlyRevenue),
    [monthlyRevenue],
  );
  const revenueChartLabels = useMemo(() => monthlyRevenue.map(d => d.month), [monthlyRevenue]);
  const revenueMax = useMemo(
    () => Math.max(...monthlyRevenue.map(d => d.revenue), 0),
    [monthlyRevenue],
  );

  const renderInventoryItem = (product: VendorProduct) => {
    const discount = discountLabel(product);
    return (
      <View key={product.id} style={styles.inventoryCard}>
        <ProductImage
          imageUrl={product.imageUrl}
          style={styles.inventoryImage}
        />
        <View style={styles.inventoryDetails}>
          <Text style={styles.itemTitle}>{product.name}</Text>
          {product.genericName ? (
            <Text style={styles.itemMetaText}>Generic: {product.genericName}</Text>
          ) : null}
          <Text style={styles.itemMetaText}>
            In Stock: {product.stockQuantity} {product.unitType ?? 'units'}
          </Text>
          <Text style={styles.itemPriceText}>
            Price: {formatTk(product.discountPrice ?? product.unitPrice)}
            {product.unitType ? `/${product.unitType.toLowerCase()}` : ''}
            {discount ? <Text style={styles.discountText}> {discount}</Text> : null}
          </Text>

          {product.category ? (
            <View style={styles.tagBadge}>
              <FontAwesome5 name="capsules" size={10} color="#7E8B97" />
              <Text style={styles.tagBadgeText}>{product.category}</Text>
            </View>
          ) : null}
        </View>

        <View style={product.isActive ? styles.statusToggleActive : styles.statusToggleInactive}>
          {product.isActive ? <View style={styles.statusToggleInner} /> : null}
        </View>
      </View>
    );
  };

  const renderOrderCard = (order: VendorOrder) => {
    const uiStatus = mapOrderStatus(order.status);
    const firstItem = order.items[0];
    const isUpdating = updatingOrderId === order.id;

    return (
      <View key={order.id} style={styles.orderRequestCard}>
        <Text style={styles.customerName}>
          Customer : {order.customer?.fullName ?? '—'}
        </Text>
        <Text style={styles.orderMetaText}>Order ID: {order.orderNumber}</Text>
        <Text style={styles.orderMetaText}>Phone: {order.customer?.phone ?? '—'}</Text>
        <Text style={styles.orderMetaText}>Delivery Location : {orderLocation(order)}</Text>

        {firstItem ? (
          <View style={styles.orderProductRow}>
            <ProductImage style={styles.orderProductImage} />
            <View style={styles.orderProductInfo}>
              <Text style={styles.orderProductTitle}>{firstItem.name}</Text>
              {firstItem.genericName ? (
                <Text style={styles.itemMetaText}>Generic: {firstItem.genericName}</Text>
              ) : null}
              <Text
                style={
                  uiStatus === 'Pending'
                    ? styles.statusLabelPending
                    : uiStatus === 'Accepted'
                      ? styles.statusLabelAccepted
                      : styles.statusLabelPending
                }>
                Status: {uiStatus}
              </Text>
            </View>
          </View>
        ) : null}

        {uiStatus === 'Pending' ? (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.btnAccept]}
              activeOpacity={0.85}
              disabled={isUpdating}
              onPress={() => updateOrderStatus(order.id, 'CONFIRMED')}>
              <Feather name="check-circle" size={14} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.btnDecline]}
              activeOpacity={0.85}
              disabled={isUpdating}
              onPress={() => updateOrderStatus(order.id, 'CANCELLED')}>
              <Feather name="x-circle" size={14} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Declined</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {uiStatus === 'Accepted' && order.status !== 'ON_THE_WAY' ? (
          <TouchableOpacity
            style={styles.readyPickupBtn}
            activeOpacity={0.85}
            disabled={isUpdating}
            onPress={() => updateOrderStatus(order.id, 'ON_THE_WAY')}>
            <MaterialCommunityIcons name="hammer-wrench" size={14} color="#4E929D" />
            <Text style={styles.readyPickupBtnText}>Ready for Pickup</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}>
          <Feather name="menu" size={24} color="#1A1C1E" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoTextMain}>+ Cholbe</Text>
          <Text style={styles.logoTextSub}>PHARMACY</Text>
        </View>
        <NotificationBell
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>

      {loading && !dashboard ? (
        <ActivityIndicator color="#4E929D" style={styles.loader} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: 80 + insets.bottom},
          ]}>
          <View style={styles.merchantHeaderCard}>
            <View style={styles.merchantIconContainer}>
              <MaterialCommunityIcons name="storefront-outline" size={28} color="#4E929D" />
            </View>
            <View style={styles.merchantInfoText}>
              <Text style={styles.merchantName}>
                {dashboard?.vendor.pharmacyName ?? '—'}
              </Text>
              <Text style={styles.merchantMeta}>
                Merchant ID: {dashboard?.vendor.id?.slice(0, 8).toUpperCase() ?? '—'}
              </Text>
              {dashboard?.vendor.address ? (
                <Text style={styles.merchantMeta}>{dashboard.vendor.address}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={[styles.metricLabel, styles.metricLabelRevenue]}>Total Revenue Today</Text>
              <Text style={styles.metricValue}>
                {formatTk(dashboard?.stats.totalRevenue ?? 0)}
              </Text>
              <Text style={[styles.metricSub, styles.metricSubPositive]}>(0%)</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricLabel, styles.metricLabelOrders]}>Total Orders Today</Text>
              <Text style={styles.metricValue}>{dashboard?.stats.orderCount ?? 0}</Text>
              <Text style={styles.metricSub}>
                ({dashboard?.stats.pendingOrders ?? 0} pending)
              </Text>
            </View>
          </View>

          <View style={[styles.metricsGrid, styles.metricsGridSpaced]}>
            <View style={styles.metricBox}>
              <Text style={[styles.metricLabel, styles.metricLabelLowStock]}>Low Stock Items</Text>
              <Text style={styles.metricValue}>{lowStockCount}</Text>
              <Text style={[styles.metricSub, styles.metricLabelLowStock]}>Need Attention</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricLabel, styles.metricLabelOutStock]}>Out of Stock Items</Text>
              <Text style={styles.metricValue}>{outOfStockCount}</Text>
              <Text style={styles.metricSub}> </Text>
            </View>
          </View>

          <View style={styles.revenueChartCard}>
            <Text style={styles.revenueChartTitle}>Revenue Overview (Last 6 Months)</Text>

            <View style={styles.revenueGraphBody}>
              <View style={styles.revenueYAxis}>
                {[revenueMax, Math.round(revenueMax / 2), 0].map((val, i) => (
                  <Text key={i} style={styles.revenueYAxisLabel}>
                    {val > 0 ? `${Math.round(val / 1000)}k` : '0'}
                  </Text>
                ))}
              </View>

              <View style={styles.revenueChartCanvas}>
                <View style={styles.revenueGridLine} />
                <View style={[styles.revenueGridLine, styles.revenueGridLineMid]} />
                <View style={[styles.revenueGridLine, styles.revenueGridLineBottom]} />

                {revenueChartPoints.length < 2 ? (
                  <View
                    style={[
                      styles.revenueChartPlot,
                      {width: CHART_WIDTH - 40, height: CHART_PLOT_HEIGHT, justifyContent: 'center', alignItems: 'center'},
                    ]}>
                    <Text style={styles.revenueChartEmpty}>No data yet</Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.revenueChartPlot,
                      {width: CHART_WIDTH - 40, height: CHART_PLOT_HEIGHT},
                    ]}>
                    {revenueChartPoints.slice(0, -1).map((point, index) => (
                      <VChartLineSegment
                        key={`seg-${index}`}
                        start={point}
                        end={revenueChartPoints[index + 1]}
                        plotWidth={CHART_WIDTH - 40}
                        plotHeight={CHART_PLOT_HEIGHT}
                      />
                    ))}
                    {revenueChartPoints.map((point, index) => (
                      <View
                        key={`dot-${index}`}
                        style={[
                          styles.revenueChartDot,
                          {
                            left: point.x * (CHART_WIDTH - 40) - 3.5,
                            top: point.y * CHART_PLOT_HEIGHT - 3.5,
                          },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.revenueXAxisRow}>
              {revenueChartLabels.map(month => (
                <Text key={month} style={styles.revenueXAxisLabel}>
                  {month}
                </Text>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.addProductBtn}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('VAddProduct')}>
            <Feather name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.addProductBtnText}>Add New Product</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Inventory List</Text>
            <TouchableOpacity
              style={styles.viewAllRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('VInventory')}>
              <Text style={styles.viewAllText}>View All</Text>
              <Feather name="chevron-right" size={14} color="#7E8B97" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Feather name="search" size={18} color="#9AA6B2" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#9AA6B2"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
            <MaterialCommunityIcons name="tune" size={18} color="#4E929D" />
          </View>

          {filteredProducts.length === 0 ? (
            <Text style={styles.emptyText}>No products yet.</Text>
          ) : (
            filteredProducts.map(renderInventoryItem)
          )}

          <View style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
            <Text style={styles.sectionTitle}>Recent Order Requests</Text>
            <TouchableOpacity
              style={styles.viewAllRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('VOrders')}>
              <Text style={styles.viewAllText}>View All</Text>
              <Feather name="chevron-right" size={14} color="#7E8B97" />
            </TouchableOpacity>
          </View>

          {(dashboard?.recentOrders ?? []).length === 0 ? (
            <Text style={styles.emptyText}>No recent orders.</Text>
          ) : (
            (dashboard?.recentOrders ?? []).map(renderOrderCard)
          )}
        </ScrollView>
      )}

      <VendorBottomNav activeTab="home" bottomInset={insets.bottom} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7E8B97',
    fontSize: 13,
    marginVertical: 12,
  },
  scrollContent: {
    paddingTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#ECEFF3',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoTextMain: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3F8694',
  },
  logoTextSub: {
    fontSize: 8,
    letterSpacing: 2,
    color: '#7E8B97',
    fontWeight: '600',
    marginTop: -2,
  },
  merchantHeaderCard: {
    flexDirection: 'row',
    backgroundColor: '#E6F3F5',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  merchantIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  merchantInfoText: {
    flex: 1,
  },
  merchantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  merchantMeta: {
    fontSize: 11,
    color: '#5C6470',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  metricsGridSpaced: {
    marginTop: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricLabelRevenue: {
    color: '#4E929D',
  },
  metricLabelOrders: {
    color: '#8B4F4F',
  },
  metricLabelLowStock: {
    color: '#E26D6D',
  },
  metricLabelOutStock: {
    color: '#F37021',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1C1E',
    marginTop: 6,
  },
  metricSub: {
    fontSize: 10,
    color: '#7E8B97',
    marginTop: 2,
    fontWeight: '500',
  },
  metricSubPositive: {
    color: '#00A884',
  },
  addProductBtn: {
    backgroundColor: '#4E929D',
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 18,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addProductBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderSpaced: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    color: '#7E8B97',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
    color: '#1A1C1E',
  },
  inventoryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  inventoryImage: {
    width: 70,
    height: 60,
    borderRadius: 6,
    resizeMode: 'contain',
    marginRight: 12,
  },
  inventoryDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  itemMetaText: {
    fontSize: 11,
    color: '#7E8B97',
    marginTop: 1,
  },
  itemPriceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1C1E',
    marginTop: 2,
  },
  discountText: {
    color: '#E26D6D',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0F3F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
    gap: 4,
  },
  tagBadgeText: {
    fontSize: 10,
    color: '#7E8B97',
    fontWeight: '500',
  },
  statusToggleActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#47B39D',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  statusToggleInactive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  statusToggleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#47B39D',
  },
  orderRequestCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333D47',
    marginBottom: 4,
  },
  orderMetaText: {
    fontSize: 11,
    color: '#5C6470',
    lineHeight: 15,
    marginTop: 1,
  },
  orderProductRow: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  orderProductImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    resizeMode: 'contain',
    marginRight: 10,
  },
  orderProductInfo: {
    flex: 1,
  },
  orderProductTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  statusLabelPending: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F37021',
    marginTop: 2,
  },
  statusLabelAccepted: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00A884',
    marginTop: 2,
  },
  actionButtonsRow: {
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
  actionBtnText: {
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
  readyPickupBtnText: {
    color: '#4E929D',
    fontSize: 12,
    fontWeight: '600',
  },
  revenueChartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  revenueChartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 16,
  },
  revenueGraphBody: {
    flexDirection: 'row',
    height: CHART_PLOT_HEIGHT,
  },
  revenueYAxis: {
    justifyContent: 'space-between',
    height: '100%',
    paddingRight: 8,
    alignItems: 'flex-end',
    width: 36,
  },
  revenueYAxisLabel: {
    fontSize: 10,
    color: '#9AA6B2',
    fontWeight: '500',
  },
  revenueChartCanvas: {
    flex: 1,
    position: 'relative',
    height: '100%',
  },
  revenueGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#ECEFF3',
    top: 0,
  },
  revenueGridLineMid: {
    top: '50%',
  },
  revenueGridLineBottom: {
    top: '100%',
  },
  revenueChartPlot: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 5,
  },
  revenueChartEmpty: {
    color: '#9AA6B2',
    fontSize: 12,
  },
  vChartLineSegment: {
    position: 'absolute',
    height: 2.5,
    backgroundColor: '#4E929D',
    transformOrigin: 'left center',
  },
  revenueChartDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#4E929D',
    zIndex: 6,
  },
  revenueXAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 36,
    paddingRight: 4,
    marginTop: 10,
  },
  revenueXAxisLabel: {
    fontSize: 10,
    color: '#9AA6B2',
    fontWeight: '500',
    minWidth: 20,
    textAlign: 'center',
  },
});
