import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderCompletedDetails'>;

const {width} = Dimensions.get('window');

const FULLY_COMPLETED_STEPS = [
  {
    id: '1',
    title: 'Order Placed',
    subtitle: 'Your order has been placed',
    time: '08:30 AM',
    completed: true,
  },
  {
    id: '2',
    title: 'Preparing',
    subtitle: 'Your order is preparing',
    time: '08:31 AM',
    completed: true,
  },
  {
    id: '3',
    title: 'On the Way',
    subtitle: 'Our delivery man is on the way',
    time: '08:30 AM',
    completed: true,
  },
  {
    id: '4',
    title: 'Delivered',
    subtitle: 'Your order has been delivered',
    time: '08:30 AM',
    completed: true,
  },
];

export function OrderCompletedDetailsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Order Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollCanvasContent, {paddingBottom: 140 + insets.bottom}]}>
        <View style={styles.trackingMainCard}>
          <View style={styles.timelineSectionContainer}>
            {FULLY_COMPLETED_STEPS.map((step, index) => {
              const isLast = index === FULLY_COMPLETED_STEPS.length - 1;
              return (
                <View key={step.id} style={styles.timelineItemRow}>
                  <View style={styles.nodeColumn}>
                    <View style={[styles.statusCircle, styles.completedCircle]}>
                      <Feather name="check" size={14} color="#FFFFFF" />
                    </View>
                    {!isLast && <View style={[styles.verticalTracerLine, styles.completedTracer]} />}
                  </View>

                  <View style={styles.infoColumn}>
                    <Text style={styles.stepTitleText}>{step.title}</Text>
                    <Text style={styles.stepSubtitleText}>{step.subtitle}</Text>
                  </View>

                  <Text style={styles.timestampText}>{step.time}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.horizontalDivider} />

          <View style={styles.addressSectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons
                name="truck-delivery-outline"
                size={22}
                color="#45A096"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionHeadingTitle}>Home Delivery</Text>
              <TouchableOpacity
                style={styles.mapSelectButton}
                onPress={() => navigation.navigate('AddressMapPicker')}>
                <Feather name="map-pin" size={14} color="#45A096" />
                <Text style={styles.mapSelectText}>Map</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.addressLineRow}>
              <Text style={styles.addressLabel}>Village :</Text>
              <Text style={styles.addressValue}>Mokimpur</Text>
            </View>
            <View style={styles.addressLineRow}>
              <Text style={styles.addressLabel}>Post Office :</Text>
              <Text style={styles.addressValue}>Mokimpur</Text>
            </View>
            <View style={styles.addressLineRow}>
              <Text style={styles.addressLabel}>Upazila :</Text>
              <Text style={styles.addressValue}>Haripur</Text>
            </View>
            <View style={styles.addressLineRow}>
              <Text style={styles.addressLabel}>District :</Text>
              <Text style={styles.addressValue}>Thakurgaon</Text>
            </View>
          </View>

          <View style={styles.horizontalDivider} />

          <TouchableOpacity style={styles.invoiceDownloadButtonBox} activeOpacity={0.8}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={22}
              color="#45A096"
              style={styles.invoiceIcon}
            />
            <Text style={styles.invoiceButtonLabelText}>Invoice Download</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToShopButton}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('PharmacyShop')}>
            <Text style={styles.backToShopButtonText}>Back to Shop</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.bottomTabBar, {paddingBottom: 12 + insets.bottom}]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('PharmacyShop')}>
          <MaterialCommunityIcons name="clippy" size={24} color="#45A096" />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Pharmacy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MedicineList')}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Medication</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ReportsList')}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MyProfile')}>
          <Feather name="user" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F9F9FE'},
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F9F9FE',
  },
  backButton: {padding: 2},
  headerTitleText: {fontSize: 20, fontFamily: FONT.semibold, fontWeight: '600', color: '#333333'},
  headerSpacer: {width: 28},
  scrollCanvasContent: {paddingHorizontal: 20, paddingTop: 8},
  trackingMainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 16,
    shadowColor: '#E0E4F0',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#ECEFF7',
  },
  timelineSectionContainer: {width: '100%', paddingVertical: 8, paddingHorizontal: 4},
  timelineItemRow: {flexDirection: 'row', alignItems: 'flex-start', minHeight: 64, position: 'relative'},
  nodeColumn: {alignItems: 'center', width: 28, marginRight: 12, height: '100%'},
  statusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  completedCircle: {backgroundColor: '#45A096'},
  verticalTracerLine: {position: 'absolute', top: 24, bottom: -10, width: 2, zIndex: 1},
  completedTracer: {backgroundColor: '#45A096'},
  infoColumn: {flex: 1, paddingTop: 1},
  stepTitleText: {fontSize: 15, fontFamily: FONT.semibold, fontWeight: '600', color: '#212529', marginBottom: 4},
  stepSubtitleText: {fontSize: 13, color: '#8A94A6', fontFamily: FONT.regular, fontWeight: '400'},
  timestampText: {fontSize: 11, color: '#8A94A6', fontFamily: FONT.regular, fontWeight: '400', paddingTop: 3, textAlign: 'right'},
  horizontalDivider: {height: 1, backgroundColor: '#F1F3F7', marginVertical: 16},
  addressSectionBlock: {width: '100%', paddingHorizontal: 4},
  sectionHeaderRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 16},
  sectionIcon: {marginRight: 8},
  sectionHeadingTitle: {fontSize: 16, fontFamily: FONT.semibold, fontWeight: '600', color: '#1E3A60'},
  mapSelectButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#72C1B6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  mapSelectText: {fontSize: 12, color: '#45A096', fontFamily: FONT.semibold, fontWeight: '600'},
  addressLineRow: {flexDirection: 'row', alignItems: 'center', marginVertical: 6},
  addressLabel: {fontSize: 14, color: '#8A94A6', fontFamily: FONT.medium, fontWeight: '500', width: 90},
  addressValue: {fontSize: 14, color: '#495057', fontFamily: FONT.semibold, fontWeight: '600', flex: 1},
  invoiceDownloadButtonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2FAF9',
    borderWidth: 1,
    borderColor: '#E1F2F0',
    height: 48,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  invoiceIcon: {marginRight: 10},
  invoiceButtonLabelText: {fontSize: 15, color: '#45A096', fontFamily: FONT.semibold, fontWeight: '600'},
  backToShopButton: {
    backgroundColor: '#45A096',
    width: '100%',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
    shadowColor: '#45A096',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  backToShopButtonText: {color: '#FFFFFF', fontSize: 18, fontFamily: FONT.semibold, fontWeight: '600'},
  bottomTabBar: {
    flexDirection: 'row',
    minHeight: 74,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F7',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {alignItems: 'center', justifyContent: 'center', width: width / 5},
  tabLabel: {fontSize: 11, color: '#9CA3AF', marginTop: 5, fontFamily: FONT.medium, fontWeight: '500'},
  activeTabLabel: {color: '#45A096', fontFamily: FONT.semibold, fontWeight: '600'},
});
