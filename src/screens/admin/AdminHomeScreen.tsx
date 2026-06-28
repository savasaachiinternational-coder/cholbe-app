import {useCallback, useMemo, useState} from 'react';
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
import {useFocusEffect} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {adminApi} from '../../api/admin';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';

type Props = NativeStackScreenProps<RootStackParamList, 'AHome'>;

const {width} = Dimensions.get('window');
const CHART_WIDTH = width - 64;
const CHART_PLOT_HEIGHT = 150;

const CHART_POINTS = [
  {x: 20 / 300, y: 111 / 150},
  {x: 63 / 300, y: 94 / 150},
  {x: 106 / 300, y: 72 / 150},
  {x: 148 / 300, y: 85 / 150},
  {x: 190 / 300, y: 62 / 150},
  {x: 232 / 300, y: 50 / 150},
  {x: 270 / 300, y: 74 / 150},
  {x: 295 / 300, y: 36 / 150},
];

type DashboardData = {
  totalOrders: number;
  totalUsers: number;
  totalVendors: number;
  totalRevenue: string | number;
  growthPercent: number;
};

function formatRevenue(value: string | number) {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return `Tk ${Math.round(n || 0).toLocaleString()}`;
}

function ChartLineSegment({
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
        styles.chartLineSegment,
        {
          left: x1,
          top: y1,
          width: length,
          transform: [{rotate: `${angle}deg`}],
        },
      ]}
    />
  );
}

function OrderOverviewChart({plotWidth}: {plotWidth: number}) {
  return (
    <View style={[styles.chartPlot, {width: plotWidth, height: CHART_PLOT_HEIGHT}]}>
      <LinearGradient
        colors={['rgba(78, 146, 157, 0.25)', 'rgba(78, 146, 157, 0)']}
        style={styles.chartGradientFill}
      />

      {CHART_POINTS.slice(0, -1).map((point, index) => (
        <ChartLineSegment
          key={`line-${index}`}
          start={point}
          end={CHART_POINTS[index + 1]}
          plotWidth={plotWidth}
          plotHeight={CHART_PLOT_HEIGHT}
        />
      ))}

      {CHART_POINTS.map((point, index) => (
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

export function AdminHomeScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.dashboard();
      setDashboard(data);
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

  const metrics = useMemo(() => {
    const pct = dashboard ? `(${dashboard.growthPercent}%)` : '';
    return [
      [
        {title: 'Total Orders', value: String(dashboard?.totalOrders ?? '—'), percentage: pct},
        {title: 'Total Revenue', value: dashboard ? formatRevenue(dashboard.totalRevenue) : '—', percentage: pct},
      ],
      [
        {title: 'Total Users', value: String(dashboard?.totalUsers ?? '—'), percentage: pct},
        {title: 'Total Vendor', value: String(dashboard?.totalVendors ?? '—'), percentage: pct},
      ],
    ];
  }, [dashboard]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}>
          <Feather name="menu" size={24} color="#1A1C1E" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoTextMain}>+ Cholbe</Text>
          <Text style={styles.logoTextSub}>PHARMACY</Text>
        </View>
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
          {paddingBottom: 95 + insets.bottom},
        ]}>
        <View style={styles.welcomeContainer}>
          <Image
            source={{uri: 'https://via.placeholder.com/60/E2E8F0/000000?text=Admin'}}
            style={styles.adminAvatar}
          />
          <View style={styles.welcomeTextColumn}>
            <Text style={styles.welcomeTitle}>Good Morning, Admin</Text>
            <Text style={styles.welcomeSubtitle}>Here's what's happening today.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.dateSelectorDropdown} activeOpacity={0.8}>
          <Feather name="calendar" size={16} color="#4F5E6D" />
          <Text style={styles.dateSelectorText}>25-10-2025</Text>
          <Feather name="chevron-down" size={16} color="#4F5E6D" />
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator color="#4E929D" style={styles.loader} />
        ) : (
          metrics.map((row, rowIndex) => (
            <View
              key={row.map(metric => metric.title).join('-')}
              style={[styles.metricsGridRow, rowIndex > 0 && styles.metricsGridRowSpaced]}>
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

        <View style={styles.chartSectionCard}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartSectionHeadingText}>Order Overview</Text>
            <TouchableOpacity style={styles.chartTimeDropdown} activeOpacity={0.8}>
              <Text style={styles.chartTimeDropdownText}>This Week</Text>
              <Feather name="chevron-down" size={14} color="#4F5E6D" />
            </TouchableOpacity>
          </View>

          <View style={styles.graphBodyContainer}>
            <View style={styles.yAxisContainer}>
              {['2k', '1.5k', '1k', '500', '0'].map(label => (
                <Text key={label} style={styles.axisLabelText}>
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

              <OrderOverviewChart plotWidth={CHART_WIDTH - 40} />
            </View>
          </View>

          <View style={styles.xAxisRowLabelsContainer}>
            {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
              <Text key={month} style={styles.xAxisLabelText}>
                {month}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>

      <AdminBottomNav activeTab="home" bottomInset={insets.bottom} navigation={navigation} />
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
  headerButton: {
    padding: 2,
    width: 32,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  adminAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  welcomeTextColumn: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#7E8B97',
    marginTop: 2,
    fontWeight: '500',
  },
  dateSelectorDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEFF5',
    borderRadius: 18,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    height: 36,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    gap: 8,
  },
  dateSelectorText: {
    fontSize: 12,
    color: '#1A1C1E',
    fontWeight: '600',
  },
  metricsGridRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  metricsGridRowSpaced: {
    marginTop: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  metricTitle: {
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
  metricPercentage: {
    fontSize: 11,
    color: '#00A884',
    fontWeight: '600',
    marginTop: 4,
  },
  chartSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartSectionHeadingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  chartTimeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3F6',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 32,
    gap: 4,
  },
  chartTimeDropdownText: {
    fontSize: 12,
    color: '#4F5E6D',
    fontWeight: '500',
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
    fontSize: 11,
    color: '#9AA6B2',
    fontWeight: '500',
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
    backgroundColor: '#4E929D',
    transformOrigin: 'left center',
  },
  chartPoint: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#4E929D',
    zIndex: 6,
  },
  gridLineGuide: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#ECEFF3',
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
    fontSize: 11,
    color: '#9AA6B2',
    fontWeight: '500',
    minWidth: 24,
    textAlign: 'center',
  },
});
