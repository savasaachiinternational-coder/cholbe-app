import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';

type Props = NativeStackScreenProps<RootStackParamList, 'AReports'>;

type MedicineItem = {
  name: string;
  price: string;
};

const CHART_HEIGHT = 140;
const BAR_WIDTH = 13;
const BAR_GAP = 7;

const BAR_DATA = [
  {height: 75, isSolid: true},
  {height: 30, isSolid: false},
  {height: 130, isSolid: false},
  {height: 70, isSolid: true},
  {height: 85, isSolid: false},
  {height: 100, isSolid: false},
  {height: 110, isSolid: true},
  {height: 105, isSolid: false},
  {height: 50, isSolid: true},
  {height: 95, isSolid: false},
  {height: 78, isSolid: false},
  {height: 100, isSolid: true},
];

const MOCK_MEDICINES: MedicineItem[] = Array.from({length: 3}, () => ({
  name: 'Aamdocal Plus 50',
  price: '250',
}));

function SalesBarChart() {
  return (
    <View style={styles.barChartRow}>
      {BAR_DATA.map((bar, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              height: bar.height,
              backgroundColor: bar.isSolid ? '#00A884' : '#E6F4F1',
              marginRight: index === BAR_DATA.length - 1 ? 0 : BAR_GAP,
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
      <Image
        source={{uri: 'https://via.placeholder.com/60/ECEFF3/000000?text=Medicine'}}
        style={styles.medicineImage}
      />
      <Text style={styles.medicineNameText}>{item.name}</Text>
      <Text style={styles.medicinePriceText}>tk {item.price}</Text>
    </View>
  );
}

export function AdminReportsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

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
        <TouchableOpacity style={styles.dateRangePicker} activeOpacity={0.8}>
          <Feather name="calendar" size={16} color="#9AA6B2" />
          <Text style={styles.datePickerText}>May 12 - May,18 2026</Text>
          <Feather name="chevron-down" size={18} color="#1A1C1E" />
        </TouchableOpacity>

        <View style={styles.metricsRowGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Total Orders</Text>
            <Text style={styles.metricValue}>1500</Text>
            <Text style={styles.metricPercentage}>(18.6%)</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Total Revenue</Text>
            <Text style={styles.metricValue}>Tk 174511</Text>
            <Text style={styles.metricPercentage}>(18.6%)</Text>
          </View>
        </View>

        <View style={styles.chartCardContainer}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartSectionHeading}>Sales Overview</Text>
            <TouchableOpacity style={styles.timeframeDropdown} activeOpacity={0.8}>
              <Text style={styles.timeframeDropdownText}>This Week</Text>
              <Feather name="chevron-down" size={14} color="#4F5E6D" />
            </TouchableOpacity>
          </View>

          <View style={styles.graphBodyWrapperRow}>
            <View style={styles.yAxisGuides}>
              <Text style={styles.axisText}>80k</Text>
              <Text style={styles.axisText}>60k</Text>
              <Text style={styles.axisText}>40k</Text>
              <Text style={styles.axisText}>20k</Text>
              <Text style={styles.axisText}>0</Text>
            </View>

            <View style={styles.chartCanvasArea}>
              <View style={styles.chartHorizontalLineGuide} />
              <View style={[styles.chartHorizontalLineGuide, {top: '25%'}]} />
              <View style={[styles.chartHorizontalLineGuide, {top: '50%'}]} />
              <View style={[styles.chartHorizontalLineGuide, {top: '75%'}]} />
              <SalesBarChart />
            </View>
          </View>

          <View style={styles.xAxisRowLabels}>
            <Text style={styles.axisText}>12 May</Text>
            <Text style={styles.axisText}>14 May</Text>
            <Text style={styles.axisText}>16 May</Text>
            <Text style={styles.axisText}>18 May</Text>
            <Text style={styles.axisText}>20 May</Text>
          </View>
        </View>

        <Text style={styles.sectionHeadingTitle}>Top Selling Medicines</Text>
        <View style={styles.medicinesContainerCard}>
          {MOCK_MEDICINES.map((item, index) => (
            <MedicineRow
              key={`${item.name}-${index}`}
              item={item}
              isLast={index === MOCK_MEDICINES.length - 1}
            />
          ))}
        </View>
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
  metricPercentage: {
    fontSize: 11,
    color: '#00A884',
    fontWeight: '600',
    marginTop: 4,
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
  xAxisRowLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 42,
    paddingRight: 4,
    marginTop: 10,
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
