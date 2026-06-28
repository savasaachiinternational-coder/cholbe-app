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
import {adminApi} from '../../api/admin';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';

type Props = NativeStackScreenProps<RootStackParamList, 'AInventory'>;

type LowStockItem = {
  id: string;
  name: string;
  type: string;
  stockCount: number;
  imageUrl: string | null;
};

type StockSegment = {
  color: string;
  percent: number;
  label: string;
  value: string;
};

type InventoryOverview = {
  totalItems: number;
  lowStockCount: number;
  outOfStock: number;
  lowStockItems: {
    id: string;
    name: string;
    category: string | null;
    unitType: string | null;
    stockQuantity: number;
    imageUrl: string | null;
  }[];
};

const DONUT_SIZE = 140;
const DONUT_HOLE = 82;

function buildStockSegments(overview: InventoryOverview | null): StockSegment[] {
  if (!overview || overview.totalItems === 0) {
    return [
      {color: '#00A884', percent: 1, label: 'In Stock', value: '0 (0%)'},
    ];
  }

  const {totalItems, lowStockCount, outOfStock} = overview;
  const inStock = Math.max(0, totalItems - lowStockCount - outOfStock);
  const pct = (n: number) => (totalItems > 0 ? n / totalItems : 0);
  const labelPct = (n: number) => Math.round(pct(n) * 100);

  return [
    {
      color: '#00A884',
      percent: pct(inStock),
      label: 'In Stock',
      value: `${inStock.toLocaleString()} (${labelPct(inStock)}%)`,
    },
    {
      color: '#FFC107',
      percent: pct(lowStockCount),
      label: 'Low Stock',
      value: `${lowStockCount.toLocaleString()} (${labelPct(lowStockCount)}%)`,
    },
    {
      color: '#E26D6D',
      percent: pct(outOfStock),
      label: 'Out of Stock',
      value: `${outOfStock.toLocaleString()} (${labelPct(outOfStock)}%)`,
    },
  ].filter(s => s.percent > 0);
}

function PieSlice({
  startPercent,
  sweepPercent,
  color,
  size,
}: {
  startPercent: number;
  sweepPercent: number;
  color: string;
  size: number;
}) {
  const startAngle = startPercent * 360;
  const sweepAngle = sweepPercent * 360;
  const radius = size / 2;

  const renderHalf = (rotation: number, angle: number) => (
    <View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        transform: [{rotate: `${rotation}deg`}],
      }}>
      <View style={{width: radius, height: size, overflow: 'hidden', marginLeft: radius}}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: color,
            marginLeft: -radius,
            transform: [{rotate: `${angle}deg`}],
          }}
        />
      </View>
    </View>
  );

  if (sweepAngle <= 180) {
    return renderHalf(startAngle, sweepAngle);
  }

  return (
    <>
      {renderHalf(startAngle, 180)}
      {renderHalf(startAngle + 180, sweepAngle - 180)}
    </>
  );
}

function StockDonutChart({segments}: {segments: StockSegment[]}) {
  let cumulative = 0;

  return (
    <View style={styles.donutCanvasWrapper}>
      <View style={styles.donutPieLayer}>
        {segments.map(segment => {
          const slice = (
            <PieSlice
              key={segment.label}
              startPercent={cumulative}
              sweepPercent={segment.percent}
              color={segment.color}
              size={DONUT_SIZE}
            />
          );
          cumulative += segment.percent;
          return slice;
        })}
      </View>
      <View style={styles.donutHollowCenterShim} />
    </View>
  );
}

function LowStockRow({item}: {item: LowStockItem}) {
  return (
    <View style={styles.alertCard}>
      <Image
        source={{
          uri:
            item.imageUrl ??
            'https://via.placeholder.com/60/ECEFF3/000000?text=Medicine',
        }}
        style={styles.alertItemImage}
      />
      <View style={styles.alertMetaColumn}>
        <Text style={styles.alertItemName}>{item.name}</Text>
        <Text style={styles.alertItemType}>{item.type}</Text>
      </View>
      <Text style={styles.stockCountText}>
        Stock: <Text style={styles.boldStockNum}>{item.stockCount}</Text>
      </Text>
    </View>
  );
}

export function AdminInventoryScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.inventoryOverview();
      setOverview(data as InventoryOverview);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load inventory';
      Alert.alert('Inventory', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInventory();
    }, [loadInventory]),
  );

  const stockSegments = useMemo(() => buildStockSegments(overview), [overview]);

  const lowStockItems = useMemo(() => {
    const items =
      overview?.lowStockItems.map(item => ({
        id: item.id,
        name: item.name,
        type: item.category ?? item.unitType ?? '—',
        stockCount: item.stockQuantity,
        imageUrl: item.imageUrl,
      })) ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      i => i.name.toLowerCase().includes(q) || i.type.toLowerCase().includes(q),
    );
  }, [overview, search]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory</Text>
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
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialCommunityIcons name="tune" size={20} color="#4E929D" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#4E929D" style={styles.loader} />
        ) : (
          <>
            <View style={styles.metricsRowGrid}>
              <View style={styles.metricItemBox}>
                <Text style={styles.metricLabelText}>Total Items</Text>
                <Text style={styles.metricValueText}>{overview?.totalItems ?? '—'}</Text>
              </View>
              <View style={styles.metricItemBox}>
                <Text style={styles.metricLabelText}>Low Stock</Text>
                <Text style={styles.metricValueText}>{overview?.lowStockCount ?? '—'}</Text>
              </View>
              <View style={styles.metricItemBox}>
                <Text style={styles.metricLabelText}>Out of Stock</Text>
                <Text style={styles.metricValueText}>{overview?.outOfStock ?? '—'}</Text>
              </View>
            </View>

            <View style={styles.analyticsSectionCard}>
              <View style={styles.analyticsHeaderRow}>
                <Text style={styles.analyticsTitleText}>Stock Overview</Text>
                <TouchableOpacity style={styles.timeframeDropdown} activeOpacity={0.8}>
                  <Text style={styles.timeframeDropdownText}>This Week</Text>
                  <Feather name="chevron-down" size={14} color="#4F5E6D" />
                </TouchableOpacity>
              </View>

              <View style={styles.chartBodyFlexLayoutRow}>
                <StockDonutChart segments={stockSegments} />

                <View style={styles.legendContainerStack}>
                  {stockSegments.map(segment => (
                    <View key={segment.label} style={styles.legendItemUnit}>
                      <View style={styles.legendRowHeaderInline}>
                        <View
                          style={[styles.legendDotIndicator, {backgroundColor: segment.color}]}
                        />
                        <Text style={styles.legendMainLabel}>{segment.label}</Text>
                      </View>
                      <Text style={styles.legendSubValue}>{segment.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.sectionHeaderLineRow}>
              <Text style={styles.sectionHeadingText}>Low Stock Alert</Text>
              <TouchableOpacity style={styles.viewAllInlineRow} activeOpacity={0.7}>
                <Text style={styles.viewAllInlineText}>View All</Text>
                <Feather name="chevron-right" size={14} color="#7E8B97" />
              </TouchableOpacity>
            </View>

            <View style={styles.alertsVerticalStack}>
              {lowStockItems.length === 0 ? (
                <Text style={styles.emptyText}>No low stock items.</Text>
              ) : (
                lowStockItems.map(item => <LowStockRow key={item.id} item={item} />)
              )}
            </View>
          </>
        )}
      </ScrollView>

      <AdminBottomNav activeTab="inventory" bottomInset={insets.bottom} navigation={navigation} />
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
  loader: {marginVertical: 48},
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
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    color: '#1A1C1E',
  },
  metricsRowGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  metricItemBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  metricLabelText: {
    fontSize: 12,
    color: '#4F5E6D',
    fontWeight: '500',
  },
  metricValueText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1C1E',
    marginTop: 6,
  },
  analyticsSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  analyticsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analyticsTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  timeframeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3F6',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 32,
    gap: 4,
  },
  timeframeDropdownText: {
    fontSize: 12,
    color: '#4F5E6D',
    fontWeight: '500',
  },
  chartBodyFlexLayoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  donutCanvasWrapper: {
    position: 'relative',
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutPieLayer: {
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    transform: [{rotate: '-90deg'}],
  },
  donutHollowCenterShim: {
    position: 'absolute',
    width: DONUT_HOLE,
    height: DONUT_HOLE,
    borderRadius: DONUT_HOLE / 2,
    backgroundColor: '#FFFFFF',
  },
  legendContainerStack: {
    gap: 14,
    minWidth: 120,
  },
  legendItemUnit: {
    gap: 2,
  },
  legendRowHeaderInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDotIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendMainLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333D47',
  },
  legendSubValue: {
    fontSize: 12,
    color: '#9AA6B2',
    fontWeight: '500',
    paddingLeft: 18,
  },
  sectionHeaderLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 22,
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
  alertsVerticalStack: {
    gap: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9AA6B2',
    fontSize: 14,
    paddingVertical: 24,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  alertItemImage: {
    width: 50,
    height: 45,
    borderRadius: 6,
    resizeMode: 'contain',
    marginRight: 12,
  },
  alertMetaColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 1,
  },
  alertItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  alertItemType: {
    fontSize: 11,
    color: '#7E8B97',
    fontWeight: '500',
  },
  stockCountText: {
    fontSize: 12,
    color: '#4F5E6D',
    fontWeight: '500',
  },
  boldStockNum: {
    fontWeight: '700',
    color: '#1A1C1E',
  },
});
