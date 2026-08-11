import {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {adminApi} from '../../api/admin';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';
import {formatBdt} from '../../utils/pharmacyHelpers';
import {NotificationBell} from '../../components/NotificationBell';
import {ProductImage} from '../../components/ProductImage';

type Props = NativeStackScreenProps<RootStackParamList, 'AReports'>;

type MedicineItem = {
  name: string;
  price: string;
};

type SalesReport = {
  totalOrders: number;
  totalRevenue: number;
  topSellingMedicines: {name: string; quantitySold: number | null}[];
};

const CHART_HEIGHT = 140;
const BAR_WIDTH = 13;
const BAR_GAP = 7;

function formatRevenue(value: number) {
  return formatBdt(value || 0);
}

function buildBarData(medicines: {quantitySold: number | null}[]) {
  const quantities = medicines.map(m => m.quantitySold ?? 0);
  const max = Math.max(...quantities, 1);
  return quantities.slice(0, 12).map((qty, index) => ({
    height: Math.max(20, Math.round((qty / max) * CHART_HEIGHT)),
    isSolid: index % 2 === 0,
  }));
}

function SalesBarChart({barData}: {barData: {height: number; isSolid: boolean}[]}) {
  if (barData.length === 0) {
    return null;
  }

  return (
    <View style={styles.barChartRow}>
      {barData.map((bar, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              height: bar.height,
              backgroundColor: bar.isSolid ? '#00A884' : '#E6F4F1',
              marginRight: index === barData.length - 1 ? 0 : BAR_GAP,
            },
          ]}
        />
      ))}
    </View>
  );
}

function MedicineRow({item, isLast}: {item: MedicineItem; isLast: boolean}) {
  return (
    <View style={[styles.medicineItemRow, isLast && styles.medicineItemRowLast]}>
      <ProductImage style={styles.medicineImage} />
      <Text style={styles.medicineNameText}>{item.name}</Text>
      <Text style={styles.medicinePriceText}>tk {item.price}</Text>
    </View>
  );
}

export function AdminReportsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.salesReport();
      setReport(data as SalesReport);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load report';
      Alert.alert('Reports', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [loadReport]),
  );

  const barData = useMemo(
    () => buildBarData(report?.topSellingMedicines ?? []),
    [report?.topSellingMedicines],
  );

  const topMedicines = useMemo(
    () =>
      (report?.topSellingMedicines ?? []).slice(0, 10).map(m => ({
        name: m.name,
        price: String(m.quantitySold ?? 0),
      })),
    [report?.topSellingMedicines],
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
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
        {loading ? (
          <ActivityIndicator color="#4E929D" style={styles.loader} />
        ) : (
          <>
            <TouchableOpacity style={styles.dateRangePicker} activeOpacity={0.8}>
              <Feather name="calendar" size={16} color="#9AA6B2" />
              <Text style={styles.datePickerText}>All time</Text>
              <Feather name="chevron-down" size={18} color="#1A1C1E" />
            </TouchableOpacity>

            <View style={styles.metricsRowGrid}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Total Orders</Text>
                <Text style={styles.metricValue}>{report?.totalOrders ?? '—'}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Total Revenue</Text>
                <Text style={styles.metricValue}>
                  {report ? formatRevenue(report.totalRevenue) : '—'}
                </Text>
              </View>
            </View>

            <View style={styles.chartCardContainer}>
              <View style={styles.chartHeaderRow}>
                <Text style={styles.chartSectionHeading}>Sales Overview</Text>
                <TouchableOpacity style={styles.timeframeDropdown} activeOpacity={0.8}>
                  <Text style={styles.timeframeDropdownText}>Top medicines</Text>
                  <Feather name="chevron-down" size={14} color="#4F5E6D" />
                </TouchableOpacity>
              </View>

              <View style={styles.graphBodyWrapperRow}>
                <View style={styles.yAxisGuides}>
                  {(() => {
                    const maxQty = Math.max(...(report?.topSellingMedicines ?? []).map(m => m.quantitySold ?? 0), 0);
                    return [maxQty, Math.round(maxQty * 0.75), Math.round(maxQty * 0.5), Math.round(maxQty * 0.25), 0].map((label, i) => (
                      <Text key={i} style={styles.axisText}>{label}</Text>
                    ));
                  })()}
                </View>

                <View style={styles.chartCanvasArea}>
                  <View style={styles.chartHorizontalLineGuide} />
                  <View style={[styles.chartHorizontalLineGuide, {top: '25%'}]} />
                  <View style={[styles.chartHorizontalLineGuide, {top: '50%'}]} />
                  <View style={[styles.chartHorizontalLineGuide, {top: '75%'}]} />
                  <SalesBarChart barData={barData} />
                </View>
              </View>
            </View>

            <Text style={styles.sectionHeadingTitle}>Top Selling Medicines</Text>
            <View style={styles.medicinesContainerCard}>
              {topMedicines.length === 0 ? (
                <Text style={styles.emptyText}>No sales data yet.</Text>
              ) : (
                topMedicines.map((item, index) => (
                  <MedicineRow
                    key={`${item.name}-${index}`}
                    item={item}
                    isLast={index === topMedicines.length - 1}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      <AdminBottomNav activeTab="report" bottomInset={insets.bottom} navigation={navigation} />
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
  dateRangePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 48,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    gap: 8,
  },
  datePickerText: {
    flex: 1,
    fontSize: 14,
    color: '#9AA6B2',
    fontWeight: '500',
  },
  metricsRowGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  metricLabel: {
    fontSize: 12,
    color: '#4F5E6D',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1C1E',
    marginTop: 8,
  },
  chartCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartSectionHeading: {
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
  graphBodyWrapperRow: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
  },
  yAxisGuides: {
    justifyContent: 'space-between',
    height: '100%',
    paddingRight: 12,
    alignItems: 'flex-end',
    width: 34,
  },
  axisText: {
    fontSize: 11,
    color: '#9AA6B2',
    fontWeight: '500',
  },
  chartCanvasArea: {
    flex: 1,
    position: 'relative',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartHorizontalLineGuide: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#ECEFF3',
  },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 2,
  },
  sectionHeadingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333D47',
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 12,
  },
  medicinesContainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    paddingVertical: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9AA6B2',
    fontSize: 14,
    paddingVertical: 24,
  },
  medicineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
  },
  medicineItemRowLast: {
    borderBottomWidth: 0,
  },
  medicineImage: {
    width: 50,
    height: 40,
    borderRadius: 6,
    resizeMode: 'contain',
    marginRight: 14,
  },
  medicineNameText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333D47',
  },
  medicinePriceText: {
    fontSize: 12,
    color: '#7E8B97',
    fontWeight: '500',
  },
});
