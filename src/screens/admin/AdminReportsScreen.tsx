import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { adminApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import type { RootStackParamList } from '../../navigation/types';
import { AdminBottomNav } from './AdminBottomNav';
import { formatBdt } from '../../utils/pharmacyHelpers';
import { NotificationBell } from '../../components/NotificationBell';
import { ProductImage } from '../../components/ProductImage';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'AReports'>;

// Proxima Nova per the Figma typography. Android resolves a weight by the exact
// font file name, so each weight is referenced by its own family name.
type MedicineItem = {
  name: string;
  price: string;
};

type SalesReport = {
  totalOrders: number;
  totalRevenue: number;
  topSellingMedicines: { name: string; quantitySold: number | null }[];
};

const CHART_HEIGHT = 140;
const BAR_WIDTH = 13;
const BAR_GAP = 7;

function formatRevenue(value: number) {
  return formatBdt(value || 0);
}

function buildBarData(medicines: { quantitySold: number | null }[]) {
  const quantities = medicines.map(m => m.quantitySold ?? 0);
  const max = Math.max(...quantities, 1);
  return quantities.slice(0, 12).map((qty, index) => ({
    height: Math.max(20, Math.round((qty / max) * CHART_HEIGHT)),
    isSolid: index % 2 === 0,
  }));
}

function SalesBarChart({
  barData,
}: {
  barData: { height: number; isSolid: boolean }[];
}) {
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
              backgroundColor: bar.isSolid ? '#0FA88E' : '#D6EFE7',
              marginRight: index === barData.length - 1 ? 0 : BAR_GAP,
            },
          ]}
        />
      ))}
    </View>
  );
}

function MedicineRow({
  item,
  isLast,
}: {
  item: MedicineItem;
  isLast: boolean;
}) {
  return (
    <View
      style={[styles.medicineItemRow, isLast && styles.medicineItemRowLast]}
    >
      <View style={styles.medicineImageBox}>
        <ProductImage style={styles.medicineImage} />
      </View>
      <Text style={styles.medicineNameText} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.medicinePriceText}>tk {item.price}</Text>
    </View>
  );
}

export function AdminReportsScreen({ navigation }: Props) {
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
      const message =
        err instanceof ApiError ? err.message : 'Could not load report';
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
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
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
          { paddingBottom: 85 + insets.bottom },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#4E929D" style={styles.loader} />
        ) : (
          <>
            <TouchableOpacity
              style={styles.dateRangePicker}
              activeOpacity={0.8}
            >
              <Feather name="calendar" size={20} color="#9E9E9E" />
              <Text style={styles.datePickerText}>All time</Text>
              <Feather name="chevron-down" size={22} color="#424242" />
            </TouchableOpacity>

            <View style={styles.metricsRowGrid}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Total Orders</Text>
                <Text style={styles.metricValue}>
                  {report?.totalOrders ?? '—'}
                </Text>
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
                <TouchableOpacity
                  style={styles.timeframeDropdown}
                  activeOpacity={0.8}
                >
                  <Text style={styles.timeframeDropdownText}>
                    Top medicines
                  </Text>
                  <Feather name="chevron-down" size={18} color="#424242" />
                </TouchableOpacity>
              </View>

              <View style={styles.graphBodyWrapperRow}>
                <View style={styles.yAxisGuides}>
                  {(() => {
                    const maxQty = Math.max(
                      ...(report?.topSellingMedicines ?? []).map(
                        m => m.quantitySold ?? 0,
                      ),
                      0,
                    );
                    return [
                      maxQty,
                      Math.round(maxQty * 0.75),
                      Math.round(maxQty * 0.5),
                      Math.round(maxQty * 0.25),
                      0,
                    ].map((label, i) => (
                      <Text key={i} style={styles.axisText}>
                        {label}
                      </Text>
                    ));
                  })()}
                </View>

                <View style={styles.chartCanvasArea}>
                  <View style={styles.chartHorizontalLineGuide} />
                  <View
                    style={[styles.chartHorizontalLineGuide, { top: '25%' }]}
                  />
                  <View
                    style={[styles.chartHorizontalLineGuide, { top: '50%' }]}
                  />
                  <View
                    style={[styles.chartHorizontalLineGuide, { top: '75%' }]}
                  />
                  <SalesBarChart barData={barData} />
                </View>
              </View>
            </View>

            <Text style={styles.sectionHeadingTitle}>
              Top Selling Medicines
            </Text>
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

      <AdminBottomNav
        activeTab="report"
        bottomInset={insets.bottom}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F3FC',
  },
  scrollContent: {
    paddingTop: 4,
  },
  loader: { marginVertical: 48 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#F4F3FC',
  },
  // Figma H6/bold: Proxima Nova 18px / 600 / 120%, Greyscale-800.
  headerTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 22,
    color: '#424242',
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
    backgroundColor: '#F5F4FD',
    borderRadius: 100,
    height: 60,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 20,
    gap: 12,
    elevation:1,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: '#9E9E9E',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  metricsRowGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  // Figma: column, align-items flex-start, 8px gap, 12px radius.
  metricBox: {
    flex: 1,
    backgroundColor: '#F5F4FD',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
    gap: 8,
    shadowColor: '#040620',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 16,
    color: '#424242',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  metricValue: {
    fontSize: 24,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  // Figma: 12px padding, 16px gap, 12px radius, Card/Shadow 1.
  chartCardContainer: {
    backgroundColor: '#F5F4FD',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 12,
    gap: 16,
    shadowColor: '#040620',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 2,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartSectionHeading: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  timeframeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 100,
    paddingHorizontal: 16,
    height: 40,
    gap: 8,
  },
  timeframeDropdownText: {
    fontSize: 14,
    color: '#424242',
    fontFamily: FONT.regular,
    fontWeight: '400',
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
    fontSize: 12,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
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
    backgroundColor: '#E4E2EF',
  },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 4,
  },
  sectionHeadingTitle: {
    fontSize: 14,
    fontFamily: FONT.medium,
    fontWeight: '600',
    color: '#616161',
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 12,
  },
  medicinesContainerCard: {
    backgroundColor: '#F5F4FD',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#040620',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 2,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: FONT.regular,
    color: '#9E9E9E',
    fontSize: 14,
    paddingVertical: 24,
  },
  medicineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 12,
  },
  medicineItemRowLast: {
    borderBottomWidth: 0,
  },
  // White tile behind the pack shot, as in the mockup.
  medicineImageBox: {
    width: 56,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  medicineImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  medicineNameText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#424242',
  },
  medicinePriceText: {
    fontSize: 14,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
});
