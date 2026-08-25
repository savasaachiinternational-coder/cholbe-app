import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { use, useCallback, useMemo, useState } from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../navigation/types';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import { HomeBottomNav } from './HomeBottomNav';
import { NotificationBell } from '../../components/NotificationBell';
import { navigateCustomerTab } from './customerTabNavigation';
import {
  SCHEDULE_TABS,
  type BottomTabKey,
  type ScheduleItem,
  type ScheduleTab,
} from './homeData';
import { ProductImage } from '../../components/ProductImage';
import { AvatarImage } from '../../components/AvatarImage';
import { RoleMenuDrawer } from '../../components/RoleMenuDrawer';
import { UpdateHealthVitalsModal } from '../../components/UpdateHealthVitalsModal';
import { formatBdt, productUnitPrice } from '../../utils/pharmacyHelpers';
import { homeApi, type PatientHomeDashboard } from '../../api/home';
import { profileApi } from '../../api/profile';
import { medicationSchedulesApi } from '../../api/medications';
import { cartApi } from '../../api/cart';
import { ApiError } from '../../api/client';
import { FONT } from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = SCREEN_WIDTH * 0.43;

// Shared geometry for the design system's 286deg gradients. A CSS angle of
// 286deg points left-and-slightly-up — direction (sin a, -cos a) — so the run
// goes from the right edge, just below centre, to the left edge, just above it.
const GRADIENT_286 = {
  start: { x: 0.98, y: 0.64 },
  end: { x: 0.02, y: 0.36 },
};
// Gradients/Gradient-Green: linear-gradient(286deg, #307887 0%, #74ACB3 100%)
const GRADIENT_GREEN = ['#307887', '#74ACB3'];
const GRADIENT_DISABLED = ['#94A3B8', '#94A3B8'];
// Gradients/Gradient-Red: linear-gradient(286deg, #CB5D67 0%, #F66D74 100%)
const GRADIENT_RED = ['#CB5D67', '#F66D74'];

function normalizeTime(timeStr: string) {
  return timeStr.trim().replace(/\s+/g, ' ').toUpperCase();
}

function isSlotTaken(
  logs: Array<{ status: string; scheduledTime: string | null }>,
  scheduledTime: string,
) {
  const normalized = normalizeTime(scheduledTime);
  return logs.some(
    log =>
      log.status === 'taken' &&
      log.scheduledTime &&
      normalizeTime(log.scheduledTime) === normalized,
  );
}

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeNavigation>();

  const [activeTab, setActiveTab] = useState<BottomTabKey>('home');
  const [scheduleTab, setScheduleTab] = useState<ScheduleTab>('upcoming');
  const [dashboard, setDashboard] = useState<PatientHomeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [savingVitals, setSavingVitals] = useState(false);

  const loadHome = useCallback(async () => {
    setLoading(true);
    try {
      const data = await homeApi.dashboard();
      setDashboard(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not load home';
      Alert.alert('Home', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHome();
    }, [loadHome]),
  );

  const scheduleGroups = useMemo(() => {
    const schedules = dashboard?.schedules ?? [];
    const nextSlot = dashboard?.nextMedication
      ? {
          scheduleId: dashboard.nextMedication.scheduleId,
          scheduledTime: dashboard.nextMedication.scheduledTime,
        }
      : null;
    const map = new Map<string, ScheduleItem[]>();
    schedules.forEach(s => {
      const times = s.times.length ? s.times : ['Anytime'];
      times.forEach((time, tIdx) => {
        const taken =
          time !== 'Anytime' ? isSlotTaken(s.todayLogs ?? [], time) : false;
        const isNext =
          nextSlot?.scheduleId === s.id &&
          nextSlot.scheduledTime &&
          normalizeTime(nextSlot.scheduledTime) === normalizeTime(time);
        const items = map.get(time) ?? [];
        items.push({
          id: `${s.id}-${tIdx}`,
          name: s.medicineName,
          detail:
            [s.dose, formatMealTiming(s.mealTiming)]
              .filter(Boolean)
              .join(' • ') || 'Scheduled dose',
          icon: 'pill',
          active: !!(isNext && !taken),
          taken,
          showDismiss: !taken,
          showCheck: !taken,
          scheduleId: s.id,
          scheduledTime: time !== 'Anytime' ? time : undefined,
        });
        map.set(time, items);
      });
    });
    return Array.from(map.entries()).map(([time, items]) => ({ time, items }));
  }, [dashboard]);

  const markTaken = async (scheduleId?: string, scheduledTime?: string) => {
    const targetScheduleId =
      scheduleId ?? dashboard?.nextMedication?.scheduleId;
    const targetTime =
      scheduledTime ?? dashboard?.nextMedication?.scheduledTime;
    if (!targetScheduleId || !targetTime) return;
    if (
      !scheduleId &&
      dashboard?.nextMedication &&
      !dashboard.nextMedication.canMarkTaken
    ) {
      return;
    }
    try {
      await medicationSchedulesApi.logDose(targetScheduleId, 'taken', {
        scheduledTime: targetTime,
      });
      loadHome();
    } catch (err) {
      Alert.alert(
        'Medication',
        err instanceof ApiError ? err.message : 'Could not log dose',
      );
    }
  };

  const snoozeMedication = async () => {
    const scheduleId = dashboard?.nextMedication?.scheduleId;
    const scheduledTime = dashboard?.nextMedication?.scheduledTime;
    if (
      !scheduleId ||
      !scheduledTime ||
      !dashboard?.nextMedication?.canMarkTaken
    )
      return;
    try {
      await medicationSchedulesApi.logDose(scheduleId, 'snoozed', {
        snoozeMinutes: 10,
        scheduledTime,
      });
      loadHome();
    } catch (err) {
      Alert.alert(
        'Medication',
        err instanceof ApiError ? err.message : 'Could not snooze',
      );
    }
  };

  const addToCart = async (productId: string) => {
    try {
      await cartApi.addItem(productId, 1);
      Alert.alert('Cart', 'Added to cart');
    } catch (err) {
      Alert.alert(
        'Cart',
        err instanceof ApiError ? err.message : 'Could not add to cart',
      );
    }
  };

  const user = dashboard?.user;
  const nextMed = dashboard?.nextMedication;
  const allDosesTaken = dashboard?.allDosesTakenToday ?? false;
  const canMarkTaken = nextMed?.canMarkTaken ?? false;
  const stats = dashboard?.medicationStats;
  const vitals = dashboard?.healthVitals;
  const refill = dashboard?.refill;
  const unreadCount = dashboard?.unreadNotifications ?? 0;

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === 'home') {
      setActiveTab('home');
      return;
    }
    navigateCustomerTab(navigation, tab);
  };

  const openReportsList = () => navigation.navigate('ReportsList');

  const saveVitals = async (payload: {
    bloodPressure?: string;
    oxygen?: string;
  }) => {
    setSavingVitals(true);
    try {
      await profileApi.updateVitals(payload);
      setVitalsModalOpen(false);
      await loadHome();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not save vitals';
      Alert.alert('Health Status', message);
    } finally {
      setSavingVitals(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => setMenuOpen(true)}
        >
          <Feather name="menu" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logoImage.png')}
            style={styles.iconImage}
          />
        </View>
        <NotificationBell
          style={styles.iconButton}
          color="#1E293B"
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>

      {loading && !dashboard ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#0D9488" />
        </View>
      ) : (
        <ScrollView
          style={styles.mainScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
        >
          <View style={styles.profileBgWrap}>
            <Image
              source={require('../../assets/home_profile_bg4.png')}
              style={styles.profileBgArt}
              resizeMode="cover"
            />
            <View style={styles.profileBgNotch} pointerEvents="none" />
            <View style={styles.userInfoContainer}>
              <AvatarImage uri={user?.avatarUrl} style={styles.avatar} />
              <View style={styles.userMeta}>
                <Text style={styles.userName}>{user?.fullName ?? '—'}</Text>
                <View style={styles.locationRow}>
                  <Feather name="map-pin" size={14} color="#64748B" />
                  <Text style={styles.locationText}>
                    {user?.location ?? 'Add address'}
                  </Text>
                </View>
                <Text style={styles.lastSeenText}>
                  Last seen by Dashboard: {user?.lastActiveLabel ?? '—'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.heroCard}>
            {/* <View style={styles.waveDecorator1} />
          <View style={styles.waveDecorator2} /> */}
            <Image
              source={require('../../assets/medicine_cardbg.png')}
              style={styles.heroCardBg}
              resizeMode="cover"
            />
            <View style={styles.heroHeaderRow}>
              <Feather name="bell" size={16} color="#475569" />
              <Text style={styles.heroLabel}>Next Medication</Text>
            </View>

            <Text style={styles.medicationTitle}>
              {allDosesTaken
                ? "You're all caught up"
                : nextMed?.medicineName ?? 'No medication scheduled'}
            </Text>
            <Text style={styles.medicationSubtitle}>
              {allDosesTaken
                ? 'All doses taken for today. Great job!'
                : nextMed?.dose
                ? `${nextMed.dose} — Time to take your medicine`
                : 'Add a medication to get reminders'}
            </Text>

            {nextMed && !allDosesTaken ? (
              <View style={styles.timeTag}>
                <Feather name="activity" size={12} color="#0EA5E9" />
                <Text style={styles.timeTagText}>
                  {nextMed.minutesUntilLabel}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.markTakenButtonWrap}
              activeOpacity={0.85}
              onPress={() => markTaken()}
              disabled={!canMarkTaken || allDosesTaken}
            >
              <LinearGradient
                colors={
                  !canMarkTaken || allDosesTaken
                    ? GRADIENT_DISABLED
                    : GRADIENT_GREEN
                }
                start={GRADIENT_286.start}
                end={GRADIENT_286.end}
                style={[
                  styles.markTakenButton,
                  (!canMarkTaken || allDosesTaken) &&
                    styles.markTakenButtonDisabled,
                ]}
              >
                <Text style={styles.markTakenButtonText}>
                  {allDosesTaken ? 'Taken for today' : 'Mark as Taken'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.snoozeButton}
              activeOpacity={0.7}
              onPress={snoozeMedication}
              disabled={!canMarkTaken || allDosesTaken}
            >
              <Text
                style={[
                  styles.snoozeText,
                  (!canMarkTaken || allDosesTaken) && styles.snoozeTextDisabled,
                ]}
              >
                Snooze 10 minutes
              </Text>
              <Feather
                name="chevron-right"
                size={14}
                color={!canMarkTaken || allDosesTaken ? '#CBD5E1' : '#64748B'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('PharmacyShop')}
            >
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
              onPress={() => navigation.navigate('DoctorList')}
            >
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
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setVitalsModalOpen(true)}
              >
                <Text style={styles.updateVitalsLink}>Update</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setVitalsModalOpen(true)}
            >
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
                      Bp{' '}
                      <Text style={styles.metricValue}>
                        {vitals?.bloodPressure?.value ?? '—'}
                      </Text>
                    </Text>
                    <Text style={styles.metricTimestamp}>
                      Last checked: {vitals?.bloodPressure?.checkedAgo ?? '—'}
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
                      Oxygen:{' '}
                      <Text style={styles.metricValue}>
                        {vitals?.oxygen?.value ?? '—'}
                      </Text>
                    </Text>
                    <Text style={styles.metricTimestamp}>
                      Last checked: {vitals?.oxygen?.checkedAgo ?? '—'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewReportsButton}
              activeOpacity={0.8}
              onPress={openReportsList}
            >
              <Text style={styles.viewReportsText}>View Reports</Text>
            </TouchableOpacity>
          </View>

          <UpdateHealthVitalsModal
            visible={vitalsModalOpen}
            initialBloodPressure={vitals?.bloodPressure?.value ?? ''}
            initialOxygen={vitals?.oxygen?.value ?? ''}
            saving={savingVitals}
            onClose={() => setVitalsModalOpen(false)}
            onSave={saveVitals}
          />

          <View style={styles.alertCard}>
            <View style={styles.alertLeftContent}>
              <View style={styles.alertRow}>
                <Feather name="bell" size={20} color="#475569" />
                <Text style={styles.alertText}>
                  Next refill in {refill?.daysUntil ?? 0} days
                </Text>
              </View>
              <View style={[styles.alertRow, styles.alertRowSpaced]}>
                <Feather name="users" size={16} color="#10B981" />
                <Text style={styles.alertSubtext}>
                  {refill?.familyMonitoring
                    ? 'Family is monitoring you'
                    : 'Add family members to enable monitoring'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.scanBadge}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AiSymptomHome')}
            >
              <Image
                style={styles.aiHelpIcon}
                source={require('../../assets/syaiicon.png')}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewMedicineButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('MedicineList')}
            >
              <Text style={styles.viewMedicineText}>View Medicine</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, styles.statTaken]}>
              <View style={styles.statBoxHeader}>
                <Text style={[styles.statLabel, styles.statLabelTaken]}>
                  Taken
                </Text>
                <Feather name="check-circle" size={16} color="#16A34A" />
              </View>
              <Text style={styles.statNumber}>{stats?.taken ?? 0}</Text>
            </View>
            <View style={[styles.statBox, styles.statMissed]}>
              <View style={styles.statBoxHeader}>
                <Text style={[styles.statLabel, styles.statLabelMissed]}>
                  Missed
                </Text>
                <Feather name="x-circle" size={16} color="#EF4444" />
              </View>
              <Text style={styles.statNumber}>{stats?.missed ?? 0}</Text>
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
              <Text style={styles.statNumber}>{stats?.remaining ?? 0}</Text>
            </View>
            <View style={[styles.statBox, styles.statTotal]}>
              <View style={styles.statBoxHeader}>
                <Text style={[styles.statLabel, styles.statLabelTotal]}>
                  Total
                </Text>
                <Feather name="activity" size={16} color="#2563EB" />
              </View>
              <Text style={styles.statNumber}>{stats?.total ?? 0}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addMedicineButtonWrap}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('AddMedication')}
          >
            <LinearGradient
              colors={GRADIENT_RED}
              start={GRADIENT_286.start}
              end={GRADIENT_286.end}
              style={styles.addMedicineButton}
            >
              <Feather
                name="plus"
                size={20}
                color="#FFFFFF"
                style={styles.addMedIcon}
              />
              <Text style={styles.addMedicineButtonText}>Add Medicine</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.tabsOuterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabsContainer}
              contentContainerStyle={styles.tabsContent}
            >
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
                        const appt = dashboard?.nextAppointment;
                        if (appt) {
                          navigation.navigate('WaitingRoom', {
                            appointmentId: appt.id,
                            doctorName: appt.doctorName,
                            specialty: appt.specialty,
                          });
                        } else {
                          navigation.navigate('MyAppointment');
                        }
                        return;
                      }
                      setScheduleTab(tab.key);
                    }}
                    activeOpacity={0.8}
                  >
                    {active && <View style={styles.activeTabDot} />}
                    <Text
                      style={
                        isWaitingRoom
                          ? styles.waitingRoomTabText
                          : active
                          ? styles.activeTabText
                          : styles.inactiveTabText
                      }
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {scheduleGroups.map(group => (
              <View key={group.time}>
                <Text style={styles.timeSectionHeader}>{group.time}</Text>
                {group.items.map(item => (
                  <ScheduleRow
                    key={item.id}
                    item={item}
                    onTaken={
                      item.taken || !item.scheduleId || !item.scheduledTime
                        ? undefined
                        : () => markTaken(item.scheduleId, item.scheduledTime)
                    }
                  />
                ))}
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.viewReportsButton, styles.viewReportsSpaced]}
            activeOpacity={0.8}
            onPress={openReportsList}
          >
            <Text style={styles.viewReportsText}>View Reports</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Related Medicine</Text>
            <TouchableOpacity
              style={styles.viewAllRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('MedicineList')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Feather name="chevron-right" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
          >
            {dashboard?.relatedProducts.map(product => {
              const price = Number(product.discountPrice ?? product.unitPrice);
              const original = Number(product.unitPrice);
              const discount =
                product.discountPrice && original > price
                  ? `${Math.round(((original - price) / original) * 100)}%`
                  : null;
              return (
                <View key={product.id} style={styles.productCard}>
                  <TouchableOpacity
                    style={styles.productCardBody}
                    activeOpacity={0.85}
                    onPress={() =>
                      navigation.navigate('PharmacyDetails', {
                        productId: product.id,
                      })
                    }
                  >
                    {discount ? (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{discount}</Text>
                      </View>
                    ) : null}
                    <ProductImage
                      imageUrl={product.imageUrl}
                      style={styles.productImage}
                    />
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productWeight} numberOfLines={1}>
                      {product.genericName ?? product.category ?? ' '}
                    </Text>
                    <View style={styles.productPricingRow}>
                      <Text style={styles.productVol} numberOfLines={1}>
                        {product.category ?? 'Item'}
                      </Text>
                      {product.discountPrice ? (
                        <Text style={styles.oldPrice}>
                          {formatBdt(original)}
                        </Text>
                      ) : null}
                      <Text style={styles.currentPrice}>
                        {formatBdt(price)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addToCartButton}
                    activeOpacity={0.8}
                    onPress={() => addToCart(product.id)}
                  >
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </ScrollView>
      )}

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab={activeTab}
          bottomInset={insets.bottom}
          onTabPress={handleTabPress}
        />
      </View>

      <RoleMenuDrawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        navigation={navigation}
      />
    </View>
  );
}

/** The API returns "before"/"after"; the row spells it out. */
function formatMealTiming(value?: string | null) {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.includes('before')) return 'Before Eating';
  if (normalized.includes('after')) return 'After Eating';
  return value;
}

/** "20mg • Before Eating" -> the orange-bulleted chips in the design. */
function detailParts(detail: string) {
  return detail
    .split('•')
    .map(part => part.trim())
    .filter(Boolean);
}

function ScheduleRow({
  item,
  onTaken,
}: {
  item: ScheduleItem;
  onTaken?: () => void;
}) {
  const active = item.active;
  const taken = item.taken;
  const parts = detailParts(item.detail);

  return (
    <View
      style={[
        styles.medicationRowCard,
        active && styles.medicationActiveCard,
        taken && styles.medicationTakenCard,
      ]}
    >
      {active ? (
        <LinearGradient
          colors={['#2E8F92', '#57BCBE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {item.icon === 'insulin' ? (
        <Feather
          name="activity"
          size={22}
          color={active ? '#FFFFFF' : '#94A3B8'}
        />
      ) : (
        <MaterialCommunityIcons
          name="pill"
          size={20}
          color={active ? '#FFFFFF' : '#94A3B8'}
        />
      )}

      <View style={styles.medicationRowMeta}>
        <Text
          style={[
            styles.medicationRowTitle,
            active && styles.medicationRowTitleActive,
          ]}
        >
          {item.name}
        </Text>
        <View style={styles.medicationRowSubRow}>
          {parts.map(part => (
            <View key={part} style={styles.medicationRowSubItem}>
              <View style={styles.medicationRowDot} />
              <Text
                style={[
                  styles.medicationRowSub,
                  active && styles.medicationRowSubActive,
                ]}
              >
                {part}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actionIconsRight}>
        {item.showDismiss !== false && !taken && (
          <View
            style={[styles.dismissCircle, active && styles.dismissCircleActive]}
          >
            <Feather
              name="x"
              size={13}
              color={active ? 'rgba(255, 255, 255, 0.9)' : '#CBD5E1'}
            />
          </View>
        )}
        {taken ? (
          <View style={[styles.checkCircle, styles.checkCircleActive]}>
            <Feather name="check" size={15} color="#FFFFFF" />
          </View>
        ) : item.showCheck !== false ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onTaken}
            disabled={!onTaken}
          >
            <View
              style={[styles.checkCircle, active && styles.checkCircleActive]}
            >
              <Feather name="check" size={15} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2FE',
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: '#F5F2FE',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#F5F2FE',
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
  iconImage: {
    height: 48,
    width: 150,
    resizeMode: 'cover',
  },
  profileBgWrap: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 34,
    overflow: 'hidden',
    position: 'relative',
  },
  profileBgCurve: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileBgArt: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.4,
    height: SCREEN_WIDTH * 1.2,
    left: -SCREEN_WIDTH * 0.3,
    top: -SCREEN_WIDTH * 0.62,
    opacity: 0.7,
  },

  profileBgNotch: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_WIDTH,
    top: 30 - SCREEN_WIDTH,
    backgroundColor: '#F5F2FE',
    borderBottomLeftRadius: SCREEN_WIDTH / 2,
    borderBottomRightRadius: SCREEN_WIDTH / 2,
    transform: [{ scaleX: 2 }],
  },
  heroCardBg: {
    position: 'absolute',
    top: 0,
    left: -40,
    width: '160%',
    height: '160%',
    opacity: 0.25,
    transform: [{ rotate: '-15deg' }],
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
  },
  userMeta: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: FONT.bold,
    fontWeight: '600',
    color: '#212121',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#616161',
    marginLeft: 4,
  },
  lastSeenText: {
    fontSize: 10,
    color: '#616161',
    fontWeight: '400',
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: '#F3F2FB',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: -25,
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroLabel: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#616161',
    marginLeft: 6,
  },
  medicationTitle: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  medicationSubtitle: {
    fontSize: 12,
    color: '#616161',
    marginTop: 2,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F2FB',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  timeTagText: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#4DA69F',
    marginLeft: 4,
  },
  // The gradient fill lives on the inner LinearGradient; the wrapper keeps the
  // spacing and clips the gradient to the pill's radius.
  markTakenButtonWrap: {
    borderRadius: 40,
    overflow: 'hidden',
    marginTop: 8,
  },
  markTakenButton: {
    borderRadius: 40,
    paddingVertical: 14,
    alignItems: 'center',
  },
  markTakenButtonDisabled: {
    opacity: 0.85,
  },
  markTakenButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  snoozeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 3,
  },
  snoozeText: {
    fontSize: 12,
    color: '#424242',
    marginRight: 2,
  },
  snoozeTextDisabled: {
    color: '#CBD5E1',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  aiHelpIcon: {
    height: 44,
    width: 44,
    borderRadius: 22,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F0F9',
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E3EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusCard: {
    backgroundColor: '#F5F4FD',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    elevation: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusTitle: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#616161',
    marginLeft: 6,
  },
  updateVitalsLink: {
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#0D9488',
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E293B',
  },
  metricTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  viewReportsButton: {
    backgroundColor: '#EDF7F6',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  viewReportsText: {
    color: '#0D9488',
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  viewReportsSpaced: {
    marginVertical: 16,
  },
  alertCard: {
    backgroundColor: '#F3F2FB',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    position: 'relative',
    elevation: 1,
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
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#616161',
    marginLeft: 6,
  },
  alertSubtext: {
    fontSize: 13,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#10B981',
    marginLeft: 6,
  },
  scanBadge: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewMedicineButton: {
    backgroundColor: '#EDF7F6',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  viewMedicineText: {
    color: '#0D9488',
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  statSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginTop: 16,
    elevation: 1,
  },
  statSummaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statSummaryDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#5ad7c0',
  },
  statSummaryText: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    marginLeft: 6,
  },
  statSummaryTaken: {
    color: '#2DBDA8',
  },
  statSummaryUpcoming: {
    color: '#F5A623',
  },
  statSummaryMissed: {
    color: '#F26D6D',
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
    fontFamily: FONT.semibold,
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
  },
  // Wrapper keeps the spacing and clips the gradient to the pill's radius.
  addMedicineButtonWrap: {
    borderRadius: 40,
    overflow: 'hidden',
    marginTop: 16,
  },
  addMedicineButton: {
    borderRadius: 40,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMedIcon: {
    marginRight: 6,
  },
  addMedicineButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  tabsOuterContainer: {
    marginTop:12,
    paddingTop:16,
    backgroundColor: '#F3F2FB',
    paddingHorizontal:16,
    elevation:1,
   
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
    fontFamily: FONT.medium,
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  activeTab: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  activeTabDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  activeTabText: {
    fontSize: 13,
    color: '#F3F2FB',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  timeSectionHeader: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 8,
  },
  medicationRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F2FB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEF0F6',
    elevation: 1,
    // Clips the active row's gradient to the rounded corners.
    overflow: 'hidden',
  },
  // No background here on purpose — the gradient paints it.
  medicationActiveCard: {
    borderColor: '#38A3A5',
  },
  medicationTakenCard: {
    opacity: 0.72,
  },
  medicationRowMeta: {
    flex: 1,
    marginLeft: 12,
  },
  medicationRowTitle: {
    fontSize: 15,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E293B',
  },
  medicationRowTitleActive: {
    color: '#FFFFFF',
  },
  medicationRowSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  medicationRowSubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  // Stays orange on the active row too, as in the design.
  medicationRowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9F43',
    marginRight: 6,
  },
  medicationRowSub: {
    fontSize: 12,
    color: '#64748B',
  },
  medicationRowSubActive: {
    color: '#FFFFFF',
  },
  actionIconsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dismissCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dismissCircleActive: {
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: '#22C55E',
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
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
    backgroundColor: '#F5F4FD',
    borderRadius: 20,
    padding: 12,
    width: PRODUCT_CARD_WIDTH,
    height: 268,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  productCardBody: {
    flex: 1,
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
    minHeight: 36,
    lineHeight: 18,
  },
  productWeight: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    minHeight: 14,
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
