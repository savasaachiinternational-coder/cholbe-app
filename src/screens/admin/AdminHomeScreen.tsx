import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { adminApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import type { RootStackParamList } from '../../navigation/types';
import { AdminBottomNav } from './AdminBottomNav';
import { RoleMenuDrawer } from '../../components/RoleMenuDrawer';
import { formatBdt } from '../../utils/pharmacyHelpers';
import { NotificationBell } from '../../components/NotificationBell';
import { WaveWithChild } from '../../components/WaveWithChild';

type Props = NativeStackScreenProps<RootStackParamList, 'AHome'>;

// Proxima Nova per the Figma typography. Android resolves a weight by the exact
// font file name, so each weight is referenced by its own family name.
const FONT = {
  regular: 'ProximaNova-Regular',
  medium: 'ProximaNova-Medium',
  semibold: 'ProximaNova-Semibold',
  bold: 'ProximaNova-Bold',
} as const;

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;
const CHART_PLOT_HEIGHT = 150;

type MonthlyPoint = { month: string; count: number };

type DashboardData = {
  totalOrders: number;
  totalUsers: number;
  totalVendors: number;
  totalRevenue: string | number;
  growthPercent: number;
};

function buildChartPoints(data: MonthlyPoint[]): { x: number; y: number }[] {
  if (data.length === 0) return [];
  const max = Math.max(...data.map(d => d.count), 1);
  const n = data.length;
  return data.map((d, i) => ({
    x: n === 1 ? 0.5 : i / (n - 1),
    y: 1 - d.count / max,
  }));
}

function formatRevenue(value: string | number) {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return formatBdt(n || 0);
}

function ChartLineSegment({
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
        styles.chartLineSegment,
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

function OrderOverviewChart({
  plotWidth,
  points,
}: {
  plotWidth: number;
  points: { x: number; y: number }[];
}) {
  if (points.length < 2) {
    return (
      <View
        style={[
          styles.chartPlot,
          {
            width: plotWidth,
            height: CHART_PLOT_HEIGHT,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <Text style={{ color: '#9AA6B2', fontSize: 12 }}>
          No chart data yet
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.chartPlot,
        { width: plotWidth, height: CHART_PLOT_HEIGHT },
      ]}
    >
      <LinearGradient
        colors={['rgba(78, 146, 157, 0.25)', 'rgba(78, 146, 157, 0)']}
        style={styles.chartGradientFill}
      />

      {points.slice(0, -1).map((point, index) => (
        <ChartLineSegment
          key={`line-${index}`}
          start={point}
          end={points[index + 1]}
          plotWidth={plotWidth}
          plotHeight={CHART_PLOT_HEIGHT}
        />
      ))}

      {points.map((point, index) => (
        <View
          key={`point-${index}`}
          style={[
            styles.chartPoint,
            {
              left: point.x * plotWidth - 3.5,
              top: point.y * CHART_PLOT_HEIGHT - 3.5,
            },
          ]}
        />
      ))}
    </View>
  );
}

function MetricCard({
  title,
  value,
  percentage,
}: {
  title: string;
  value: string;
  percentage: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricPercentage}>{percentage}</Text>
    </View>
  );
}

export function AdminHomeScreen({ navigation }: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [data, monthly] = await Promise.all([
        adminApi.dashboard(),
        adminApi.ordersMonthly(),
      ]);
      setDashboard(data);
      setMonthlyData(monthly);
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

  const chartPoints = useMemo(
    () => buildChartPoints(monthlyData),
    [monthlyData],
  );
  const chartMonthLabels = useMemo(
    () => monthlyData.map(d => d.month),
    [monthlyData],
  );
  const chartMaxCount = useMemo(
    () => Math.max(...monthlyData.map(d => d.count), 0),
    [monthlyData],
  );

  const metrics = useMemo(() => {
    const pct = dashboard ? `(${dashboard.growthPercent}%)` : '';
    return [
      [
        {
          title: 'Total Orders',
          value: String(dashboard?.totalOrders ?? '—'),
          percentage: pct,
        },
        {
          title: 'Total Revenue',
          value: dashboard ? formatRevenue(dashboard.totalRevenue) : '—',
          percentage: pct,
        },
      ],
      [
        {
          title: 'Total Users',
          value: String(dashboard?.totalUsers ?? '—'),
          percentage: pct,
        },
        {
          title: 'Total Vendor',
          value: String(dashboard?.totalVendors ?? '—'),
          percentage: pct,
        },
      ],
    ];
  }, [dashboard]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => setMenuOpen(true)}
        >
          <Feather name="menu" size={24} color="#1A1C1E" />
        </TouchableOpacity>
        <Image
          source={require('../../assets/logoImage.png')}
          style={styles.logoImage}
        />
        <NotificationBell
          style={styles.headerButton}
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 95 + insets.bottom },
        ]}
      >
        
        <View style={styles.waveHost}>
          <WaveWithChild color="#F4F1FD" style={styles.waveContent}>
            <View style={styles.welcomeContainer}>
              <Image
                source={{
                  uri: 'https://via.placeholder.com/60/E2E8F0/000000?text=Admin',
                }}
                style={styles.adminAvatar}
              />
              <View style={styles.welcomeTextColumn}>
                <Text style={styles.welcomeTitle}>
                  {(() => {
                    const h = new Date().getHours();
                    if (h < 12) return 'Good Morning, Admin';
                    if (h < 17) return 'Good Afternoon, Admin';
                    return 'Good Evening, Admin';
                  })()}
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  Here's what's happening today.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.dateSelectorDropdown}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <Feather name="calendar" size={18} color="#4DA69F" />
              <Text style={styles.dateSelectorText}>
                {new Date()
                  .toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                  .replace(/\//g, '-')}
              </Text>
              <Feather name="chevron-down" size={18} color="#424242" />
            </TouchableOpacity>
          </WaveWithChild>
        </View>

        {loading ? (
          <ActivityIndicator color="#4E929D" style={styles.loader} />
        ) : (
          metrics.map((row, rowIndex) => (
            <View
              key={row.map(metric => metric.title).join('-')}
              style={[
                styles.metricsGridRow,
                rowIndex > 0 && styles.metricsGridRowSpaced,
              ]}
            >
              {row.map(metric => (
                <MetricCard
                  key={metric.title}
                  title={metric.title}
                  value={metric.value}
                  percentage={metric.percentage}
                />
              ))}
            </View>
          ))
        )}

        {/* <View style={styles.quickLinksRow}>
          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => navigation.navigate('ADoctors')}
          >
            <Feather name="user-check" size={20} color="#0D9488" />
            <Text style={styles.quickLinkText}>Doctors</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => navigation.navigate('AAppointments')}
          >
            <Feather name="calendar" size={20} color="#0D9488" />
            <Text style={styles.quickLinkText}>Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => navigation.navigate('AReviews')}
          >
            <Feather name="star" size={20} color="#0D9488" />
            <Text style={styles.quickLinkText}>Reviews</Text>
          </TouchableOpacity>
        </View> */}

        <View style={styles.chartSectionCard}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartSectionHeadingText}>Order Overview</Text>
            <TouchableOpacity
              style={styles.chartTimeDropdown}
              activeOpacity={0.8}
            >
              <Text style={styles.chartTimeDropdownText}>This Week</Text>
              <Feather name="chevron-down" size={14} color="#4F5E6D" />
            </TouchableOpacity>
          </View>

          <View style={styles.graphBodyContainer}>
            <View style={styles.yAxisContainer}>
              {[
                chartMaxCount,
                Math.round(chartMaxCount * 0.75),
                Math.round(chartMaxCount * 0.5),
                Math.round(chartMaxCount * 0.25),
                0,
              ].map((label, i) => (
                <Text key={i} style={styles.axisLabelText}>
                  {label}
                </Text>
              ))}
            </View>

            <View style={styles.chartCanvasWrapper}>
              <View style={styles.gridLineGuide} />
              <View style={[styles.gridLineGuide, styles.gridLine25]} />
              <View style={[styles.gridLineGuide, styles.gridLine50]} />
              <View style={[styles.gridLineGuide, styles.gridLine75]} />
              <View style={[styles.gridLineGuide, styles.gridLine100]} />

              <OrderOverviewChart
                plotWidth={CHART_WIDTH - 40}
                points={chartPoints}
              />
            </View>
          </View>

          <View style={styles.xAxisRowLabelsContainer}>
            {chartMonthLabels.map(month => (
              <Text key={month} style={styles.xAxisLabelText}>
                {month}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>

      <AdminBottomNav
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
    backgroundColor: '#F0EFF8',
  },
  scrollContent: {
    paddingTop: 0,
  },
  loader: {
    marginVertical: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F4F1FD',
  },
  logoImage: {
    height: 48,
    width: 150,
    resizeMode: 'cover',
  },
  headerButton: {
    padding: 2,
    width: 32,
  },
  waveHost: {
    paddingHorizontal: 16,
    backgroundColor: '#F4F1FD',
  },
  waveContent: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    marginTop: 0,
    paddingBottom: 8,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  adminAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    backgroundColor: '#E2E8F0',
  },
  welcomeTextColumn: {
    flex: 1,
  },
  // Figma H6/bold: Proxima Nova 18px / 600 / 120%, Greyscale-900.
  welcomeTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 22,
    color: '#212121',
  },
  // Figma body/small/regular: 12px / 400, 0.2px tracking, Greyscale-700.
  welcomeSubtitle: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#616161',
    marginTop: 4,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  dateSelectorDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4DA69F',
    borderRadius: 100,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    height: 40,
    marginTop: 20,
    gap: 10,
  },
  dateSelectorText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: '#424242',
    fontWeight: '500',
  },
  metricsGridRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 16,
  },
  metricsGridRowSpaced: {
    marginTop: 12,
  },
  // Figma: 12px radius, #F5F4FD, soft 60px card shadow.
  metricCard: {
    flex: 1,
    backgroundColor: '#F5F4FD',
    borderRadius: 12,
    padding: 12,
    gap: 4,
    shadowColor: '#040620',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 2,
  },
  metricTitle: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: '#424242',
    fontWeight: '400',
  },
  metricValue: {
    fontSize: 24,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#212121',
  },
  metricPercentage: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#00A651',
    fontWeight: '400',
  },
  quickLinksRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  quickLinkCard: {
    flex: 1,
    backgroundColor: '#F5F4FD',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#040620',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 2,
  },
  quickLinkText: {
    fontSize: 13,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#424242',
    textAlign: 'center',
  },
  // Figma: 12px padding, 16px gap, 12px radius, #F5F4FD, 60px soft shadow.
  chartSectionCard: {
    backgroundColor: '#F5F4FD',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 20,
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
  chartSectionHeadingText: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  chartTimeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4FD',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 100,
    paddingHorizontal: 16,
    height: 40,
    elevation:1,
    gap: 8,
  },
  chartTimeDropdownText: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: '#424242',
    fontWeight: '400',
  },
  graphBodyContainer: {
    flexDirection: 'row',
    height: 150,
  },
  yAxisContainer: {
    justifyContent: 'space-between',
    height: '100%',
    paddingRight: 10,
    alignItems: 'flex-end',
    width: 32,
  },
  axisLabelText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#616161',
    fontWeight: '400',
  },
  chartCanvasWrapper: {
    flex: 1,
    position: 'relative',
    height: '100%',
  },
  chartPlot: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 5,
  },
  chartGradientFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '15%',
    bottom: 0,
  },
  chartLineSegment: {
    position: 'absolute',
    height: 2.5,
    backgroundColor: '#3EA08F',
    transformOrigin: 'left center',
  },
  chartPoint: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#3EA08F',
    zIndex: 6,
  },
  gridLineGuide: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E4E2EF',
  },
  gridLine25: {
    top: '25%',
  },
  gridLine50: {
    top: '50%',
  },
  gridLine75: {
    top: '75%',
  },
  gridLine100: {
    top: '100%',
  },
  xAxisRowLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 38,
    paddingRight: 6,
    marginTop: 12,
  },
  xAxisLabelText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#616161',
    fontWeight: '400',
    minWidth: 24,
    textAlign: 'center',
  },
});
