import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useState} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {RootStackParamList} from '../../navigation/types';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import {HomeBottomNav} from './HomeBottomNav';
import {
  RELATED_PRODUCTS,
  SCHEDULE_GROUPS,
  SCHEDULE_TABS,
  type BottomTabKey,
  type ScheduleItem,
  type ScheduleTab,
} from './homeData';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = SCREEN_WIDTH * 0.43;

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeNavigation>();

  const [activeTab, setActiveTab] = useState<BottomTabKey>('home');
  const [scheduleTab, setScheduleTab] = useState<ScheduleTab>('upcoming');

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === 'medication') {
      navigation.navigate('MedicineList');
      return;
    }
    if (tab === 'report') {
      navigation.navigate('ReportsList');
      return;
    }
    if (tab === 'profile') {
      navigation.navigate('MyProfile');
      return;
    }
    setActiveTab(tab);
  };

  const openReportsList = () => navigation.navigate('ReportsList');

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Feather name="menu" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoTextPrimary}>Cholbe</Text>
          <Text style={styles.logoTextSecondary}>PHARMACY</Text>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}>
          <View style={styles.bellDot} />
          <Feather name="bell" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 100},
        ]}>
        <View style={styles.userInfoContainer}>
          <Image
            source={require('../../assets/b2.png')}
            style={styles.avatar}
          />
          <View style={styles.userMeta}>
            <Text style={styles.userName}>Rahman Uddin</Text>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={14} color="#64748B" />
              <Text style={styles.locationText}>Uttara, Dhaka</Text>
            </View>
            <Text style={styles.lastSeenText}>
              Last seen by Dashboard: 2 weeks ago
            </Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.waveDecorator1} />
          <View style={styles.waveDecorator2} />

          <View style={styles.heroHeaderRow}>
            <Feather name="bell" size={16} color="#475569" />
            <Text style={styles.heroLabel}>Next Medication</Text>
          </View>

          <Text style={styles.medicationTitle}>Amlodipine 5mg</Text>
          <Text style={styles.medicationSubtitle}>Time to take your medicine</Text>

          <View style={styles.timeTag}>
            <Feather name="activity" size={12} color="#0EA5E9" />
            <Text style={styles.timeTagText}>In 10 Minutes</Text>
          </View>

          <TouchableOpacity style={styles.markTakenButton} activeOpacity={0.85}>
            <Text style={styles.markTakenButtonText}>Mark as Taken</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.snoozeButton} activeOpacity={0.7}>
            <Text style={styles.snoozeText}>Snooze 10 minutes</Text>
            <Feather name="chevron-right" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Feather
              name="shopping-cart"
              size={18}
              color="#2DD4BF"
              style={styles.actionIcon}
            />
            <Text style={styles.actionButtonText}>Order Medicine</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DoctorList')}>
            <Feather
              name="phone"
              size={18}
              color="#2DD4BF"
              style={styles.actionIcon}
            />
            <Text style={styles.actionButtonText}>Contact Doctor</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Feather name="bell" size={16} color="#475569" />
            <Text style={styles.statusTitle}>Health Status</Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Feather
                name="activity"
                size={20}
                color="#2DD4BF"
                style={styles.metricIcon}
              />
              <View>
                <Text style={styles.metricLabel}>
                  Bp <Text style={styles.metricValue}>130/85</Text>
                </Text>
                <Text style={styles.metricTimestamp}>
                  Last checked: 2 days ago
                </Text>
              </View>
            </View>

            <View style={[styles.metricItem, styles.metricBorderLeft]}>
              <Feather
                name="heart"
                size={20}
                color="#2DD4BF"
                style={styles.metricIcon}
              />
              <View>
                <Text style={styles.metricLabel}>
                  Oxygen: <Text style={styles.metricValue}>97%</Text>
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewReportsButton}
            activeOpacity={0.8}
            onPress={openReportsList}>
            <Text style={styles.viewReportsText}>View Reports</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertLeftContent}>
            <View style={styles.alertRow}>
              <Feather name="bell" size={16} color="#475569" />
              <Text style={styles.alertText}>Next refill in 5days</Text>
            </View>
            <View style={[styles.alertRow, styles.alertRowSpaced]}>
              <Feather name="users" size={16} color="#10B981" />
              <Text style={styles.alertSubtext}>Family is monitoring you</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.scanBadge} activeOpacity={0.8}>
            <Feather name="activity" size={22} color="#059669" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewMedicineButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MedicineList')}>
            <Text style={styles.viewMedicineText}>View Medicine</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statBox, styles.statTaken]}>
            <View style={styles.statBoxHeader}>
              <Text style={[styles.statLabel, styles.statLabelTaken]}>Taken</Text>
              <Feather name="check-circle" size={16} color="#16A34A" />
            </View>
            <Text style={styles.statNumber}>3</Text>
          </View>
          <View style={[styles.statBox, styles.statMissed]}>
            <View style={styles.statBoxHeader}>
              <Text style={[styles.statLabel, styles.statLabelMissed]}>Missed</Text>
              <Feather name="x-circle" size={16} color="#EF4444" />
            </View>
            <Text style={styles.statNumber}>1</Text>
          </View>
        </View>

        <View style={[styles.statsGrid, styles.statsGridSecond]}>
          <View style={[styles.statBox, styles.statRemaining]}>
            <View style={styles.statBoxHeader}>
              <Text style={[styles.statLabel, styles.statLabelRemaining]}>
                Remaining
              </Text>
              <FontAwesome name="medkit" size={16} color="#7C3AED" />
            </View>
            <Text style={styles.statNumber}>2</Text>
          </View>
          <View style={[styles.statBox, styles.statTotal]}>
            <View style={styles.statBoxHeader}>
              <Text style={[styles.statLabel, styles.statLabelTotal]}>Total</Text>
              <Feather name="activity" size={16} color="#2563EB" />
            </View>
            <Text style={styles.statNumber}>6</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addMedicineButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AddMedication')}>
          <Feather
            name="plus"
            size={20}
            color="#FFFFFF"
            style={styles.addMedIcon}
          />
          <Text style={styles.addMedicineButtonText}>Add Medicine</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}>
          {SCHEDULE_TABS.map(tab => {
            const active =
              tab.key !== 'waitingRoom' && scheduleTab === tab.key;
            const isWaitingRoom = tab.key === 'waitingRoom';
            return (
              <TouchableOpacity
                key={tab.key}
                style={
                  isWaitingRoom
                    ? styles.waitingRoomTab
                    : active
                      ? styles.activeTab
                      : styles.inactiveTab
                }
                onPress={() => {
                  if (isWaitingRoom) {
                    navigation.navigate('WaitingRoom');
                    return;
                  }
                  setScheduleTab(tab.key);
                }}
                activeOpacity={0.8}>
                {active && <View style={styles.activeTabDot} />}
                <Text
                  style={
                    isWaitingRoom
                      ? styles.waitingRoomTabText
                      : active
                        ? styles.activeTabText
                        : styles.inactiveTabText
                  }>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {SCHEDULE_GROUPS.map(group => (
          <View key={group.time}>
            <Text style={styles.timeSectionHeader}>{group.time}</Text>
            {group.items.map(item => (
              <ScheduleRow key={item.id} item={item} />
            ))}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.viewReportsButton, styles.viewReportsSpaced]}
          activeOpacity={0.8}
          onPress={openReportsList}>
          <Text style={styles.viewReportsText}>View Reports</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Related Medicine</Text>
          <TouchableOpacity
            style={styles.viewAllRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MedicineList')}>
            <Text style={styles.viewAllText}>View All</Text>
            <Feather name="chevron-right" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}>
          {RELATED_PRODUCTS.map(product => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discount}</Text>
              </View>
              <Image source={product.image} style={styles.productImage} />
              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.productWeight}>{product.subtitle}</Text>
              <View style={styles.productPricingRow}>
                <Text style={styles.productVol}>{product.volume}</Text>
                <Text style={styles.oldPrice}>{product.originalPrice}</Text>
                <Text style={styles.currentPrice}>{product.price}</Text>
              </View>
              <TouchableOpacity style={styles.addToCartButton} activeOpacity={0.8}>
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab={activeTab}
          bottomInset={insets.bottom}
          onTabPress={handleTabPress}
        />
      </View>
    </View>
  );
}

function ScheduleRow({item}: {item: ScheduleItem}) {
  const active = item.active;

  return (
    <View
      style={[
        styles.medicationRowCard,
        active && styles.medicationActiveCard,
      ]}>
      {item.icon === 'insulin' ? (
        <Feather
          name="activity"
          size={22}
          color={active ? '#FFFFFF' : '#94A3B8'}
        />
      ) : (
        <FontAwesome
          name="medkit"
          size={20}
          color={active ? '#FFFFFF' : '#94A3B8'}
        />
      )}
      <View style={styles.medicationRowMeta}>
        <Text
          style={[
            styles.medicationRowTitle,
            active && styles.medicationRowTitleActive,
          ]}>
          {item.name}
        </Text>
        <Text
          style={[
            styles.medicationRowSub,
            active && styles.medicationRowSubActive,
          ]}>
          {item.detail}
        </Text>
      </View>
      <View style={styles.actionIconsRight}>
        {item.showDismiss !== false && (
          <Feather
            name="x-circle"
            size={22}
            color={active ? '#FFFFFF' : '#CBD5E1'}
            style={styles.dismissIcon}
          />
        )}
        <Feather
          name="check-circle"
          size={22}
          color={active ? '#FFFFFF' : '#000000'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainScroll: {
    flex: 1,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    position: 'relative',
    padding: 4,
    width: 40,
    alignItems: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 4,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    zIndex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  logoTextPrimary: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0284C7',
  },
  logoTextSecondary: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 4,
    letterSpacing: 1,
    marginBottom: 3,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
  },
  userMeta: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 4,
  },
  lastSeenText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: '#E0F2FE',
    borderRadius: 24,
    padding: 20,
    marginTop: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  waveDecorator1: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#BAE6FD',
    opacity: 0.4,
  },
  waveDecorator2: {
    position: 'absolute',
    right: 20,
    bottom: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#BAE6FD',
    opacity: 0.3,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 6,
  },
  medicationTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  medicationSubtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  timeTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0EA5E9',
    marginLeft: 4,
  },
  markTakenButton: {
    backgroundColor: '#334E68',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  markTakenButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  snoozeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  snoozeText: {
    fontSize: 13,
    color: '#64748B',
    marginRight: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metricBorderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    paddingLeft: 16,
  },
  metricIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  metricTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  viewReportsButton: {
    backgroundColor: '#F0FDFA',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  viewReportsText: {
    color: '#0D9488',
    fontSize: 14,
    fontWeight: '600',
  },
  viewReportsSpaced: {
    marginVertical: 16,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    position: 'relative',
  },
  alertLeftContent: {
    paddingRight: 60,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertRowSpaced: {
    marginTop: 8,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 6,
  },
  alertSubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: '#10B981',
    marginLeft: 6,
  },
  scanBadge: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewMedicineButton: {
    backgroundColor: '#F0FDFA',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  viewMedicineText: {
    color: '#0D9488',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  statsGridSecond: {
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
  },
  statTaken: {
    backgroundColor: '#F0FDF4',
  },
  statMissed: {
    backgroundColor: '#FEF2F2',
  },
  statRemaining: {
    backgroundColor: '#F5F3FF',
  },
  statTotal: {
    backgroundColor: '#EFF6FF',
  },
  statBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statLabelTaken: {
    color: '#16A34A',
  },
  statLabelMissed: {
    color: '#DC2626',
  },
  statLabelRemaining: {
    color: '#7C3AED',
  },
  statLabelTotal: {
    color: '#2563EB',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
  },
  addMedicineButton: {
    backgroundColor: '#E11D48',
    borderRadius: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  addMedIcon: {
    marginRight: 6,
  },
  addMedicineButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  tabsContainer: {
    marginTop: 20,
    marginBottom: 12,
    marginHorizontal: -16,
  },
  tabsContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  inactiveTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    justifyContent: 'center',
  },
  inactiveTabText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  waitingRoomTab: {
    backgroundColor: '#F0FDFA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  waitingRoomTabText: {
    fontSize: 14,
    color: '#0D9488',
    fontWeight: '600',
  },
  activeTab: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  activeTabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FB923C',
    marginRight: 6,
  },
  activeTabText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeSectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 8,
  },
  medicationRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  medicationActiveCard: {
    backgroundColor: '#38A3A5',
    borderColor: '#38A3A5',
  },
  medicationRowMeta: {
    flex: 1,
    marginLeft: 12,
  },
  medicationRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  medicationRowTitleActive: {
    color: '#FFFFFF',
  },
  medicationRowSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  medicationRowSubActive: {
    color: '#E2E8F0',
  },
  actionIconsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dismissIcon: {
    marginRight: 10,
    opacity: 0.8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 2,
  },
  carouselContent: {
    paddingBottom: 8,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    width: PRODUCT_CARD_WIDTH,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#F43F5E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    resizeMode: 'cover',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
  },
  productWeight: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  productPricingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  productVol: {
    fontSize: 11,
    color: '#94A3B8',
    flex: 1,
  },
  oldPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  addToCartButton: {
    borderWidth: 1,
    borderColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addToCartText: {
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '600',
  },
});
