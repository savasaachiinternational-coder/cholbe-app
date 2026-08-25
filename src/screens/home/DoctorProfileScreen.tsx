import {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {navigateCustomerTab} from './customerTabNavigation';
import {doctorsApi, type Doctor} from '../../api/doctors';
import {formatBdt} from '../../utils/pharmacyHelpers';
import {FONT} from '../../theme/typography';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
/** Card is screen width less the 16px screen gutters and its own 12px padding. */
const CARD_INNER_WIDTH = SCREEN_WIDTH - 32 - 24;
/** Four chips per row with 4px gaps, matching the 77px chips in the design. */
const SLOT_WIDTH = (CARD_INNER_WIDTH - 12) / 4;
const DOCTOR_PLACEHOLDER = require('../../assets/profile.png');

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorProfile'>;

/**
 * The public /doctors endpoint carries no bio, languages, patient count or
 * chamber, so these follow the design copy until the API grows the fields.
 */
const PLACEHOLDER_ABOUT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
const PLACEHOLDER_PATIENTS = '2,500+';
const PLACEHOLDER_LANGUAGE = 'English';
const PLACEHOLDER_CHAMBER = 'Cholbe Pharmacy App';
const PLACEHOLDER_EXPERIENCE = '5+ years Experience';

const CONSULTATION_FACTS = [
  {icon: 'shield-check-outline', value: '100%', label: 'Secure'},
  {icon: 'video-outline', value: 'Video Call', label: 'Consolation'},
  {icon: 'note-text-outline', value: 'e-prescription', label: 'Provided'},
  {icon: 'clock-outline', value: '15-20 min', label: 'Per Session'},
] as const;

const PAYMENT_METHODS = [
  {key: 'bkash', label: 'bkash', color: '#E2136E', icon: 'cellphone'},
  {key: 'nagad', label: 'Nagad', color: '#D12053', icon: 'cellphone-wireless'},
  {key: 'card', label: 'Card', color: '#02275A', icon: 'credit-card-outline'},
] as const;

function formatFee(fee: string | number): string {
  const amount = typeof fee === 'string' ? Number(fee) : fee;
  return Number.isNaN(amount) ? String(fee) : formatBdt(amount);
}

export function DoctorProfileScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const {doctorId, doctorName, specialty, consultationFee} = route.params;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => {
    let active = true;
    doctorsApi
      .getById(doctorId)
      .then(data => {
        if (active) setDoctor(data);
      })
      .catch(() => {
        // Route params already carry enough to render a useful screen.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [doctorId]);

  // Slots for the doctor's next open day, shown as the Schedule chips.
  useEffect(() => {
    let active = true;
    doctorsApi
      .availableDates(doctorId)
      .then(dates => {
        const next = dates.find(d => d.available);
        if (!next) return null;
        return doctorsApi.availableSlots(doctorId, next.date);
      })
      .then(res => {
        if (!active || !res) return;
        setSlots(res.slots.slice(0, 8));
        setSelectedSlot(res.slots[0] ?? '');
      })
      .catch(() => {
        if (active) setSlots([]);
      });
    return () => {
      active = false;
    };
  }, [doctorId]);

  const handleTabPress = useCallback(
    (tab: BottomTabKey) => navigateCustomerTab(navigation, tab),
    [navigation],
  );

  const name = doctor?.user.fullName ?? doctorName ?? '—';
  const doctorSpecialty = doctor?.specialty ?? specialty ?? '—';
  const fee = doctor ? formatFee(doctor.fee) : consultationFee ?? '—';
  const reviewCount = doctor?.reviewCount ?? 0;
  const reviewAverage = Number(doctor?.reviewAverage ?? 0).toFixed(1);
  const avatarUri = doctor?.imageUrl ?? doctor?.user.avatarUrl ?? null;

  const goToBooking = () =>
    navigation.navigate('BookVideoCall', {
      doctorId,
      doctorName: name,
      specialty: doctorSpecialty,
      consultationFee: fee,
    });

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#424242" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <TouchableOpacity
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={22} color="#424242" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 110},
        ]}>
        <View style={styles.card}>
          {loading && !doctor ? (
            <ActivityIndicator color="#4DA69F" style={styles.loader} />
          ) : null}

          {/* Identity */}
          <View style={styles.identityRow}>
            <Image
              source={avatarUri ? {uri: avatarUri} : DOCTOR_PLACEHOLDER}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.identityMeta}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {name}
                </Text>
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={16}
                  color="#4ADE80"
                />
              </View>
              <Text style={styles.degree} numberOfLines={1}>
                {doctor?.degree ?? 'Licensed specialist'}
              </Text>
              <View style={styles.specialtyRow}>
                <Text style={styles.degree} numberOfLines={1}>
                  {doctorSpecialty}
                </Text>
                <View style={styles.experiencePill}>
                  <Text style={styles.experienceText}>
                    {PLACEHOLDER_EXPERIENCE}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Rating + chamber */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingLeft}>
              <FontAwesome name="star" size={14} color="#FBBC05" />
              <Text style={styles.mutedSmall}>
                {reviewAverage} ({reviewCount} Reviews)
              </Text>
            </View>
            <Text style={styles.mutedSmall} numberOfLines={1}>
              <Text style={styles.chamberLabel}>Chamber: </Text>
              {PLACEHOLDER_CHAMBER}
            </Text>
          </View>

          {/* Teal stats strip */}
          <View style={styles.statsStrip}>
            <StatCell
              icon="stethoscope"
              label="Physician"
              value={PLACEHOLDER_PATIENTS}
            />
            <View style={styles.statsDivider} />
            <StatCell
              icon="translate"
              label="Language"
              value={PLACEHOLDER_LANGUAGE}
            />
            <View style={styles.statsDivider} />
            <StatCell
              icon="hospital-building"
              label="Consolation"
              value={doctor?.isOnline === false ? 'Offline' : 'Online'}
            />
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Doctor</Text>
            <Text style={styles.bodyText}>{PLACEHOLDER_ABOUT}</Text>
          </View>

          {/* Schedule */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Schedule</Text>
              <TouchableOpacity
                style={styles.linkButton}
                activeOpacity={0.7}
                onPress={goToBooking}>
                <Text style={styles.linkText}>View Full Schedule</Text>
                <Feather name="chevron-right" size={12} color="#424242" />
              </TouchableOpacity>
            </View>

            {slots.length === 0 ? (
              <Text style={styles.bodyText}>No slots available right now.</Text>
            ) : (
              <View style={styles.slotGrid}>
                {slots.map(slot => {
                  const active = slot === selectedSlot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.slotChip,
                        {width: SLOT_WIDTH},
                        active && styles.slotChipActive,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedSlot(slot)}>
                      <Text
                        style={[
                          styles.slotText,
                          active && styles.slotTextActive,
                        ]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Consultation charge */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consultation Charge</Text>
            <View style={styles.chargeCard}>
              <Image
                source={require('../../assets/medicine_cardbg.png')}
                style={styles.chargeCardBg}
                resizeMode="cover"
              />
              <View style={styles.chargeIconBox}>
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={16}
                  color="#4DA69F"
                />
              </View>
              <View style={styles.chargeMeta}>
                <Text style={styles.chargeAmount}>+{fee}</Text>
                <Text style={styles.chargeCaption}>Online Appointment</Text>
              </View>
            </View>
          </View>

          {/* Payment method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentRow}>
              {PAYMENT_METHODS.map(method => (
                <View key={method.key} style={styles.paymentChip}>
                  <MaterialCommunityIcons
                    name={method.icon}
                    size={18}
                    color={method.color}
                  />
                  <Text style={styles.paymentLabel}>{method.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* About consultation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Consultation</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.factRow}>
              {CONSULTATION_FACTS.map(fact => (
                <View key={fact.value} style={styles.factChip}>
                  <View style={styles.factIconBox}>
                    <MaterialCommunityIcons
                      name={fact.icon}
                      size={20}
                      color="#4DA69F"
                    />
                  </View>
                  <View>
                    <Text style={styles.factValue}>{fact.value}</Text>
                    <Text style={styles.factLabel}>{fact.label}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Footer actions */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.footerButton, styles.footerSecondary]}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('ConsultationChat', {
                  doctorId,
                  doctorName: name,
                  specialty: doctorSpecialty,
                  viewerRole: 'CUSTOMER',
                })
              }>
              <Text style={styles.footerSecondaryText}>Chat with Doctor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.footerPrimary]}
              activeOpacity={0.85}
              onPress={goToBooking}>
              <Text style={styles.footerPrimaryText}>Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab="home"
          bottomInset={insets.bottom}
          onTabPress={handleTabPress}
        />
      </View>
    </View>
  );
}

function StatCell({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statCell}>
      <MaterialCommunityIcons name={icon} size={24} color="#EDF7F6" />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1FD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerIconButton: {
    width: 28,
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
    marginLeft: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  loader: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#F5F4FD',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 24,
    gap: 12,
    // drop shadow x0 y4 blur 60 #04060F 8%
    shadowColor: '#04060F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 3,
  },
  identityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6E3EE',
  },
  identityMeta: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    flexShrink: 1,
    fontSize: 20,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  degree: {
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
    letterSpacing: 0.2,
    color: '#616161',
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  experiencePill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#EDF7F6',
    borderWidth: 1,
    borderColor: '#DCEFED',
    borderRadius: 40,
  },
  experienceText: {
    fontSize: 10,
    fontFamily: FONT.regular,
    fontWeight: '400',
    letterSpacing: 0.2,
    color: '#4DA69F',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mutedSmall: {
    fontSize: 10,
    fontFamily: FONT.regular,
    fontWeight: '400',
    letterSpacing: 0.2,
    color: '#616161',
  },
  chamberLabel: {
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: '#4DA69F',
    borderRadius: 8,
    shadowColor: '#04060F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 2,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statsDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#96CFCA',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
    letterSpacing: 0.2,
    color: '#EDF7F6',
  },
  statValue: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: '#EDF7F6',
  },
  section: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: FONT.bold,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: '#616161',
  },
  bodyText: {
    fontSize: 10,
    lineHeight: 15,
    fontFamily: FONT.regular,
    fontWeight: '400',
    letterSpacing: 0.2,
    color: '#616161',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 10,
    fontFamily: FONT.regular,
    fontWeight: '400',
    letterSpacing: 0.2,
    color: '#424242',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  slotChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E3EE',
    borderRadius: 40,
  },
  slotChipActive: {
    backgroundColor: '#4DA69F',
  },
  slotText: {
    fontSize: 10,
    fontFamily: FONT.regular,
    fontWeight: '400',
    letterSpacing: 0.2,
    color: '#424242',
  },
  slotTextActive: {
    color: '#EDF7F6',
  },
  chargeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#F5F4FD',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#04060F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 2,
  },
  chargeCardBg: {
    position: 'absolute',
    top: 20,
    left: 0,
    width: '120%',
    height: '130%',
    opacity: 0.1,
  },
  chargeIconBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCEFED',
    borderRadius: 4,
  },
  chargeMeta: {
    flex: 1,
    gap: 4,
  },
  chargeAmount: {
    fontSize: 24,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#4DA69F',
  },
  chargeCaption: {
    fontSize: 10,
    fontFamily: FONT.regular,
    fontWeight: '400',
    letterSpacing: 0.2,
    color: '#454F5B',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 4,
  },
  paymentChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F4F3FC',
    borderWidth: 1,
    borderColor: '#E6E3EE',
    borderRadius: 8,
  },
  paymentLabel: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: '#424242',
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 4,
  },
  factChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  factIconBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCEFED',
    borderRadius: 4,
  },
  factValue: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: '#4DA69F',
  },
  factLabel: {
    fontSize: 10,
    fontFamily: FONT.regular,
    fontWeight: '400',
    letterSpacing: 0.2,
    color: '#454F5B',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
  },
  footerSecondary: {
    backgroundColor: '#E6E3EE',
  },
  footerSecondaryText: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: '#4DA69F',
  },
  footerPrimary: {
    backgroundColor: '#4DA69F',
  },
  footerPrimaryText: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: '#FFFFFF',
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
