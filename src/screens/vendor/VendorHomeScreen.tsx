import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { vendorApi } from '../../api/vendor';
import { ApiError } from '../../api/client';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import type { RootStackParamList } from '../../navigation/types';
import { ProductImage } from '../../components/ProductImage';
import { formatBdt } from '../../utils/pharmacyHelpers';
import { VendorBottomNav } from './VendorBottomNav';
import type { VendorOrderStatus } from './vendorNav';
import { NotificationBell } from '../../components/NotificationBell';
import { RoleMenuDrawer } from '../../components/RoleMenuDrawer';
import { WaveWithChild } from '../../components/WaveWithChild';

// Proxima Nova per the Figma typography. Android resolves a weight by the exact
// font file name, so each weight is referenced by its own family name.
const FONT = {
  regular: 'ProximaNova-Regular',
  medium: 'ProximaNova-Medium',
  semibold: 'ProximaNova-Semibold',
  bold: 'ProximaNova-Bold',
} as const;

// Figma "Card/Shadow 1": 0 4px 60px 0 rgba(4, 6, 15, 0.08).
const CARD_SHADOW = {
  shadowColor: '#04060F',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 30,
  elevation: 2,
} as const;

const CHART_WIDTH = Dimensions.get('window').width - 56;
const CHART_PLOT_HEIGHT = 120;

function buildRevenueChartPoints(
  data: { revenue: number }[],
): { x: number; y: number }[] {
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
  start: { x: number; y: number };
  end: { x: number; y: number };
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
        {
          left: x1,
          top: y1,
          width: length,
          transform: [{ rotate: `${angle}deg` }],
        },
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
  addressSnapshot?: { formattedAddress?: string; region?: string } | null;
  customer?: { fullName: string; phone?: string | null };
  items: { name: string; genericName?: string | null }[];
};

type DashboardData = {
  vendor: {
    id: string;
    pharmacyName: string;
    address?: string | null;
    user?: { fullName: string };
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
  const unit =
    typeof product.unitPrice === 'string'
      ? parseFloat(product.unitPrice)
      : product.unitPrice;
  const disc =
    typeof product.discountPrice === 'string'
      ? parseFloat(product.discountPrice)
      : product.discountPrice;
  if (disc >= unit) return null;
  return `(-${Math.round((1 - disc / unit) * 100)}%)`;
}

function mapOrderStatus(status: string): VendorOrderStatus {
  if (status === 'PENDING') return 'Pending';
  if (status === 'DELIVERED') return 'Delivered';
  if (
    status === 'CONFIRMED' ||
    status === 'PREPARING' ||
    status === 'ON_THE_WAY'
  )
    return 'Accepted';
  return 'Pending';
}

function paymentMethodLabel(method: string) {
  if (method === 'BKASH') return 'bKash';
  if (method === 'NAGAD') return 'Nagad';
  if (method === 'CARD') return 'Credit Card';
  return 'Cash on Delivery';
}

function orderLocation(order: VendorOrder) {
  const snap = order.addressSnapshot;
  if (!snap) return '—';
  return snap.formattedAddress ?? snap.region ?? '—';
}

export function VendorHomeScreen({ navigation }: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<
    { month: string; revenue: number }[]
  >([]);
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
      const message =
        err instanceof ApiError ? err.message : 'Could not load dashboard';
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
        const message =
          err instanceof ApiError ? err.message : 'Could not update order';
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
          (p.genericName?.toLowerCase().includes(search.trim().toLowerCase()) ??
            false),
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
  const revenueChartLabels = useMemo(
    () => monthlyRevenue.map(d => d.month),
    [monthlyRevenue],
  );
  const revenueMax = useMemo(
    () => Math.max(...monthlyRevenue.map(d => d.revenue), 0),
    [monthlyRevenue],
  );

  const renderInventoryItem = (product: VendorProduct) => {
    const discount = discountLabel(product);
    return (
      <View key={product.id} style={styles.inventoryCard}>
        <View style={styles.inventoryImageBox}>
          <ProductImage
            imageUrl={product.imageUrl}
            style={styles.inventoryImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.inventoryDetails}>
          <Text style={styles.itemTitle}>{product.name}</Text>
          {product.genericName ? (
            <Text style={styles.itemMetaText}>
              Generic: {product.genericName}
            </Text>
          ) : null}
          <Text style={styles.itemMetaText}>
            In Stock: {product.stockQuantity} {product.unitType ?? 'units'}
          </Text>
          <Text style={styles.itemMetaText}>
            Price: {formatTk(product.discountPrice ?? product.unitPrice)}
            {product.unitType ? `/${product.unitType.toLowerCase()}` : ''}
            {discount ? (
              <Text style={styles.discountText}> {discount}</Text>
            ) : null}
          </Text>

          {product.category ? (
            <View style={styles.categoryPill}>
              <Feather name="edit-2" size={12} color="#616161" />
              <Text style={styles.categoryPillText}>{product.category}</Text>
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.statusToggleTrack,
            product.isActive
              ? styles.statusToggleTrackOn
              : styles.statusToggleTrackOff,
          ]}
        >
          <View style={styles.statusToggleKnob} />
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
        <Text style={styles.orderMetaText}>
          <Text style={styles.orderMetaLabel}>Order ID: </Text>
          {order.orderNumber}
        </Text>
        <Text style={styles.orderMetaText}>
          <Text style={styles.orderMetaLabel}>Phone: </Text>
          {order.customer?.phone ?? '—'}
        </Text>
        <Text style={styles.orderMetaText}>
          <Text style={styles.orderMetaLabel}>Delivery Location : </Text>
          {orderLocation(order)}
        </Text>

        {firstItem ? (
          <View style={styles.orderProductRow}>
            <View style={styles.orderProductImageBox}>
              <ProductImage style={styles.orderProductImage} />
            </View>
            <View style={styles.orderProductInfo}>
              <Text style={styles.orderProductTitle}>{firstItem.name}</Text>
              {firstItem.genericName ? (
                <Text style={styles.orderMetaText}>
                  <Text style={styles.orderMetaLabel}>Generic: </Text>
                  {firstItem.genericName}
                </Text>
              ) : null}
              <Text style={styles.orderMetaText}>
                <Text style={styles.orderMetaLabel}>Status: </Text>
                {uiStatus}
              </Text>
              <Text style={styles.orderMetaText}>
                <Text style={styles.orderMetaLabel}>Payment: </Text>
                {paymentMethodLabel(order.paymentMethod)}
              </Text>

              {uiStatus === 'Pending' ? (
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnAccept]}
                    activeOpacity={0.85}
                    disabled={isUpdating}
                    onPress={() => updateOrderStatus(order.id, 'CONFIRMED')}
                  >
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.actionBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnDecline]}
                    activeOpacity={0.85}
                    disabled={isUpdating}
                    onPress={() => updateOrderStatus(order.id, 'CANCELLED')}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.actionBtnText}>Declined</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {uiStatus === 'Accepted' && order.status !== 'ON_THE_WAY' ? (
                <TouchableOpacity
                  style={styles.readyPickupBtn}
                  activeOpacity={0.85}
                  disabled={isUpdating}
                  onPress={() => updateOrderStatus(order.id, 'ON_THE_WAY')}
                >
                  <MaterialCommunityIcons
                    name="truck-check-outline"
                    size={20}
                    color="#4DA69F"
                  />
                  <Text style={styles.outlinePillText}>Ready for Pickup</Text>
                </TouchableOpacity>
              ) : null}

              {uiStatus === 'Delivered' ? (
                <View style={styles.successPill}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#4DA69F"
                  />
                  <Text style={styles.outlinePillText}>Successful</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => setMenuOpen(true)}>
          <Feather name="menu" size={24} color="#1A1C1E" />
        </TouchableOpacity>
        {/* <View style={styles.logoContainer}>
          <Text style={styles.logoTextMain}>+ Cholbe</Text>
          <Text style={styles.logoTextSub}>PHARMACY</Text>
        </View> */}

        <Image
          source={require('../../assets/logoImage.png')}
          style={styles.iconImage}
        />

        <NotificationBell
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>

      {loading && !dashboard ? (
        <ActivityIndicator color="#4DA69F" style={styles.loader} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 80 + insets.bottom },
          ]}
        >
          <View style={styles.waveHost}>
            <WaveWithChild color="#F4F1FD" style={styles.waveContent}>
              <View style={styles.merchantHeaderCard}>
                <View style={styles.merchantIconContainer}>
                  <MaterialCommunityIcons
                    name="storefront-outline"
                    size={32}
                    color="#4DA69F"
                  />
                </View>
                <View style={styles.merchantInfoText}>
                  <Text style={styles.merchantName} numberOfLines={2}>
                    {dashboard?.vendor.pharmacyName ?? '—'}
                  </Text>
                  <Text style={styles.merchantMetaStrong}>
                    Merchant ID:{' '}
                    {dashboard?.vendor.id?.slice(0, 8).toUpperCase() ?? '—'}
                  </Text>
                  {/* {dashboard?.vendor.address ? (
                    <Text style={styles.merchantMeta}>{dashboard.vendor.address}</Text>
                  ) : null} */}
                  <Text style={styles.merchantMeta}>
                    Opening Hours: 09:00AM - 11:00PM
                  </Text>
                </View>
              </View>
            </WaveWithChild>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={[styles.metricLabel, styles.metricLabelRevenue]}>
                Total Revenue Today
              </Text>
              <Text
                style={styles.metricValue}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatTk(dashboard?.stats.totalRevenue ?? 0)}
              </Text>
              <Text style={[styles.metricSub, styles.metricSubPositive]}>
                (0%)
              </Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricLabel, styles.metricLabelOrders]}>
                Total Orders Today
              </Text>
              <Text
                style={styles.metricValue}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {dashboard?.stats.orderCount ?? 0}
              </Text>
              <Text style={styles.metricSub}>
                ({dashboard?.stats.pendingOrders ?? 0} pending)
              </Text>
            </View>
          </View>

          <View style={[styles.metricsGrid, styles.metricsGridSpaced]}>
            <View style={styles.metricBox}>
              <Text style={[styles.metricLabel, styles.metricLabelLowStock]}>
                Low Stock Items
              </Text>
              <Text
                style={styles.metricValue}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {lowStockCount}
              </Text>
              <Text style={[styles.metricSub, styles.metricSubAlert]}>
                (Need Attention)
              </Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricLabel, styles.metricLabelOutStock]}>
                Out of Stock Items
              </Text>
              <Text
                style={styles.metricValue}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {outOfStockCount}
              </Text>
              <Text style={styles.metricSub}> </Text>
            </View>
          </View>

          <View style={styles.revenueChartCard}>
            <Text style={styles.revenueChartTitle}>
              Revenue Overview (Last 6 Months)
            </Text>

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
                <View
                  style={[styles.revenueGridLine, styles.revenueGridLineMid]}
                />
                <View
                  style={[styles.revenueGridLine, styles.revenueGridLineBottom]}
                />

                {revenueChartPoints.length < 2 ? (
                  <View
                    style={[
                      styles.revenueChartPlot,
                      {
                        width: CHART_WIDTH - 40,
                        height: CHART_PLOT_HEIGHT,
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    ]}
                  >
                    <Text style={styles.revenueChartEmpty}>No data yet</Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.revenueChartPlot,
                      { width: CHART_WIDTH - 40, height: CHART_PLOT_HEIGHT },
                    ]}
                  >
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
            onPress={() => navigation.navigate('VAddProduct')}
          >
            <Feather name="plus" size={24} color="#FFFFFF" />
            <Text style={styles.addProductBtnText}>Add New Product</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Inventory List</Text>
            <TouchableOpacity
              style={styles.viewAllRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('VInventory')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Feather name="chevron-right" size={18} color="#616161" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#9E9E9E" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#9E9E9E"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
            <MaterialCommunityIcons
              name="tune-variant"
              size={22}
              color="#4DA69F"
            />
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
              onPress={() => navigation.navigate('VOrders')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Feather name="chevron-right" size={18} color="#616161" />
            </TouchableOpacity>
          </View>

          {(dashboard?.recentOrders ?? []).length === 0 ? (
            <Text style={styles.emptyText}>No recent orders.</Text>
          ) : (
            (dashboard?.recentOrders ?? []).map(renderOrderCard)
          )}
        </ScrollView>
      )}

      <VendorBottomNav
        activeTab="home"
        bottomInset={insets.bottom}
        navigation={navigation}
      />

      <RoleMenuDrawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1FD',
  },
  iconImage: {
    height: 48,
    width: 150,
    resizeMode: 'cover',
  },
  loader: {
    marginTop: 40,
  },
  // Figma body/medium/regular: 14px / 400, Greyscale-700.
  emptyText: {
    textAlign: 'center',
    color: '#616161',
    fontSize: 14,
    fontFamily: FONT.regular,
    fontWeight: '400',
    marginVertical: 16,
  },
  scrollContent: {
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F4F1FD',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoTextMain: {
    fontSize: 18,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#3F8694',
  },
  logoTextSub: {
    fontSize: 8,
    letterSpacing: 2,
    color: '#616161',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginTop: -2,
  },

  // ---- Profile band (wave background) ----
  waveHost: {
    paddingHorizontal: 16,
    backgroundColor: '#F4F1FD',
  },
  waveContent: {
    marginTop: -10,
    paddingTop: 20,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  merchantHeaderCard: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4,
  },
  merchantIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  merchantInfoText: {
    flex: 1,
  },
  // Figma H6/bold: Proxima Nova 18px / 600 / 120%, Greyscale-900.
  merchantName: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 22,
    color: '#212121',
  },
  // Figma body/small/medium: 12px / 500, 0.2px tracking, Greyscale-800.
  merchantMetaStrong: {
    fontSize: 12,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#424242',
    letterSpacing: 0.2,
    marginTop: 4,
  },
  // Figma body/small/regular: 12px / 400, 0.2px tracking, Greyscale-700.
  merchantMeta: {
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#616161',
    letterSpacing: 0.2,
    marginTop: 2,
  },

  // ---- Metric cards ----
  // Figma Frame 424: 167.5 x 110, 8px column gap inside a 16px gutter.
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  metricsGridSpaced: {
    marginTop: 8,
  },
  // Figma: 12px padding, 6px gap, 12px radius, 1px Greyscale-300 border,
  // #F5F4FD fill, Card/Shadow 1.
  metricBox: {
    flex: 1,
    minHeight: 110,
    backgroundColor: '#F5F4FD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    gap: 6,
    alignItems: 'flex-start',
    ...CARD_SHADOW,
  },
  // Figma body/large/regular: 16px / 400.
  metricLabel: {
    fontSize: 16,
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  metricLabelRevenue: {
    color: '#4DA69F',
  },
  metricLabelOrders: {
    color: '#424242',
  },
  metricLabelLowStock: {
    color: '#E26D6D',
  },
  metricLabelOutStock: {
    color: '#F37021',
  },
  // Figma H4/bold: 32px / 700 / 120%, Greyscale-900.
  metricValue: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#212121',
    alignSelf: 'stretch',
  },
  metricSub: {
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#616161',
    letterSpacing: 0.2,
  },
  metricSubPositive: {
    color: '#00A651',
  },
  metricSubAlert: {
    color: '#E26D6D',
  },

  // ---- Primary action ----
  // Figma: 12px 16px padding, 10px gap, 100px radius, Primary-500.
  addProductBtn: {
    backgroundColor: '#4DA69F',
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  addProductBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },

  // ---- Section headers ----
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
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#616161',
  },

  // ---- Search ----
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4FD',
    marginHorizontal: 16,
    borderRadius: 100,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
    gap: 10,
    ...CARD_SHADOW,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONT.regular,
    fontWeight: '400',
    padding: 0,
    color: '#212121',
  },

  // ---- Inventory list ----
  inventoryCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F4FD',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    gap: 12,
    alignItems: 'flex-start',
    ...CARD_SHADOW,
  },
  inventoryImageBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inventoryImage: {
    width: 72,
    height: 72,
  },
  inventoryDetails: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  itemMetaText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#616161',
    letterSpacing: 0.2,
  },
  discountText: {
    color: '#E26D6D',
  },
  // Figma: 100px radius pill, white fill, 1px Greyscale-300 border.
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 100,
    paddingHorizontal: 12,
    height: 32,
    marginTop: 8,
    gap: 6,
  },
  categoryPillText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#424242',
  },
  statusToggleTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    padding: 3,
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  statusToggleTrackOn: {
    backgroundColor: '#4DA69F',
    alignItems: 'flex-end',
  },
  statusToggleTrackOff: {
    backgroundColor: '#E0E0E0',
    alignItems: 'flex-start',
  },
  statusToggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },

  // ---- Recent order requests ----
  orderRequestCard: {
    backgroundColor: '#F5F4FD',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    marginBottom: 12,
    ...CARD_SHADOW,
  },
  // Figma H6/bold at Greyscale-800.
  customerName: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 22,
    color: '#424242',
    marginBottom: 4,
  },
  orderMetaText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#616161',
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  orderMetaLabel: {
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  // Figma: 8px padding, 8px gap, 8px radius, #F3F2FB, Card/Shadow 1.
  orderProductRow: {
    flexDirection: 'row',
    marginTop: 8,
    backgroundColor: '#F3F2FB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    padding: 8,
    gap: 8,
    alignItems: 'flex-start',
    ...CARD_SHADOW,
    elevation: 0,
  },
  orderProductImageBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  orderProductImage: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
  },
  orderProductInfo: {
    flex: 1,
    gap: 2,
  },
  orderProductTitle: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnAccept: {
    backgroundColor: '#4DA69F',
  },
  btnDecline: {
    backgroundColor: '#E26D6D',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  // Figma: 40px outline pill, 100px radius, white fill, Primary-500 border.
  readyPickupBtn: {
    borderWidth: 1,
    borderColor: '#4DA69F',
    height: 40,
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  successPill: {
    borderWidth: 1,
    borderColor: '#4DA69F',
    height: 40,
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  outlinePillText: {
    color: '#424242',
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },

  // ---- Revenue overview card ----
  revenueChartCard: {
    backgroundColor: '#F5F4FD',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...CARD_SHADOW,
  },
  revenueChartTitle: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
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
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#616161',
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
    backgroundColor: '#E4E2EF',
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
    color: '#9E9E9E',
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  vChartLineSegment: {
    position: 'absolute',
    height: 2.5,
    backgroundColor: '#4DA69F',
    transformOrigin: 'left center',
  },
  revenueChartDot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4DA69F',
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
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#616161',
    minWidth: 20,
    textAlign: 'center',
  },
});
