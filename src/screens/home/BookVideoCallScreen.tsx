import {useEffect, useMemo, useState} from 'react';
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
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {type PaymentMethod} from './bookVideoCallData';
import {appointmentsApi} from '../../api/appointments';
import {doctorsApi, type DoctorAvailabilityDate} from '../../api/doctors';
import {ApiError} from '../../api/client';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const SLOT_WIDTH = (SCREEN_WIDTH - 32 - 24) / 4;
/** Sized so two dates fill the pill exactly; a third onwards scrolls. */
const DATE_CHIP_WIDTH = (SCREEN_WIDTH - 32 - 8) / 2;

type Props = NativeStackScreenProps<RootStackParamList, 'BookVideoCall'>;

/** Whole days from today: 0 = today, 1 = tomorrow. */
function dayOffsetFromToday(date: string): number {
  const d = new Date(`${date}T12:00:00`);
  const today = new Date();
  return Math.round(
    (new Date(d.toDateString()).getTime() -
      new Date(today.toDateString()).getTime()) /
      86400000,
  );
}

/** "Mon, 28 Apr" — the full picker's label. */
function formatFullDateLabel(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** "Today Apr 26" / "Tomorrow" / "Mon, 28 Apr", matching the design. */
function formatDateChipLabel(date: string): string {
  const offset = dayOffsetFromToday(date);
  if (offset === 0) {
    return `Today ${new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
    })}`;
  }
  if (offset === 1) {
    return 'Tomorrow';
  }
  return formatFullDateLabel(date);
}

export function BookVideoCallScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const doctorId = route.params.doctorId;
  const doctorName = route.params?.doctorName ?? 'Dr. Ahmed';
  const specialty = route.params?.specialty ?? 'Cardiologist';
  const baseFee = route.params?.consultationFee ?? 'BDT 800';

  const [duration, setDuration] = useState<'15' | '30'>('15');
  // no need need to delete the consultation type
  const [consultationType, setConsultationType] = useState<'VIDEO' | 'AUDIO' | 'CHAT'>('VIDEO');
  const [availableDates, setAvailableDates] = useState<DoctorAvailabilityDate[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [booking, setBooking] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  useEffect(() => {
    if (!doctorId) return;
    setLoadingAvailability(true);
    doctorsApi
      .availableDates(doctorId)
      .then(dates => {
        setAvailableDates(dates);
        const first = dates.find(d => d.available);
        if (first) setSelectedDate(first.date);
      })
      .catch(() => setAvailableDates([]))
      .finally(() => setLoadingAvailability(false));
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId || !selectedDate) return;
    doctorsApi.availableSlots(doctorId, selectedDate).then(res => {
      setTimeSlots(res.slots);
      setSelectedTime(prev => (res.slots.includes(prev) ? prev : res.slots[0] ?? ''));
    });
  }, [doctorId, selectedDate]);

  const consultationFee = useMemo(() => {
    if (baseFee.startsWith('BDT')) {
      return duration === '30' ? 'BDT 1200' : baseFee;
    }
    return duration === '30' ? 'BDT 1200' : 'BDT 800';
  }, [baseFee, duration]);

  const durationLabel = duration === '15' ? '15 Minutes' : '30 Minutes';

  /** Today / tomorrow only — the quick pill above the full date picker. */
  const quickDates = useMemo(
    () => availableDates.filter(d => dayOffsetFromToday(d.date) <= 1),
    [availableDates],
  );

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return 'Select date';
    const d = new Date(`${selectedDate}T12:00:00`);
    return d.toLocaleDateString('en-GB', {weekday: 'long', day: 'numeric', month: 'short'});
  }, [selectedDate]);

  const confirmBooking = async () => {
    if (!doctorId) {
      Alert.alert('Booking', 'Doctor not selected. Please pick a doctor first.');
      navigation.navigate('DoctorList');
      return;
    }
    if (!selectedDate || !selectedTime) {
      Alert.alert('Booking', 'Please select an available date and time slot.');
      return;
    }
    setBooking(true);
    try {
      const appointment = await appointmentsApi.book({
        doctorId,
        scheduledDate: selectedDate,
        timeSlot: selectedTime,
        durationMin: duration === '30' ? 30 : 15,
        paymentMethod: paymentMethod.toUpperCase(),
        consultationType,
      });
      if (consultationType === 'CHAT') {
        navigation.replace('ConsultationChat', {
          appointmentId: appointment.id,
          doctorName: appointment.doctor.user.fullName,
          specialty: appointment.doctor.specialty,
        });
        return;
      }
      navigation.replace('WaitingRoom', {
        appointmentId: appointment.id,
        doctorName: appointment.doctor.user.fullName,
        specialty: appointment.doctor.specialty,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Booking failed';
      Alert.alert('Booking', message);
    } finally {
      setBooking(false);
    }
  };

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === 'home') {
      navigation.navigate('Home');
      return;
    }
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
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <View style={styles.headerIconTitle}> 
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Video Call</Text>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('ConsultationChat', {
              doctorId,
              doctorName,
              specialty,
            })
          }>
          <Feather name="message-square" size={22} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 130},
        ]}>
        <View style={styles.doctorProfileCard}>
          <Image
            source={require('../../assets/b2.png')}
            style={styles.doctorAvatar}
          />
          <View style={styles.doctorMeta}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <Text style={styles.doctorSpecialty}>{specialty}</Text>
            <View style={styles.onlineStatusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineStatusText}>Online</Text>
            </View>
          </View>
        </View>

        {/* <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentTab,
              consultationType === 'VIDEO' && styles.segmentActiveTab,
            ]}
            onPress={() => setConsultationType('VIDEO')}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.segmentTabText,
                consultationType === 'VIDEO' && styles.segmentActiveTabText,
              ]}>
              Video Call
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentTab,
              consultationType === 'AUDIO' && styles.segmentActiveTab,
            ]}
            onPress={() => setConsultationType('AUDIO')}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.segmentTabText,
                consultationType === 'AUDIO' && styles.segmentActiveTabText,
              ]}>
              Audio Call
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentTab,
              consultationType === 'CHAT' && styles.segmentActiveTab,
            ]}
            onPress={() => setConsultationType('CHAT')}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.segmentTabText,
                consultationType === 'CHAT' && styles.segmentActiveTabText,
              ]}>
              Chat
            </Text>
          </TouchableOpacity>
        </View> */}

        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              duration === '15' && styles.segmentActiveTab,
            ]}
            onPress={() => setDuration('15')}
            activeOpacity={0.8}>
            <Feather
              name="clock"
              size={16}
              color={duration === '15' ? '#FFFFFF' : '#64748B'}
              style={styles.segmentIcon}
            />
            <Text
              style={[
                styles.segmentTabText,
                duration === '15' && styles.segmentActiveTabText,
              ]}>
              15 Minutes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButtonRight,
              duration === '30' && styles.segmentActiveTab,
            ]}
            onPress={() => setDuration('30')}
            activeOpacity={0.8}>
            <Feather
              name="clock"
              size={16}
              color={duration === '30' ? '#FFFFFF' : '#64748B'}
              style={styles.segmentIcon}
            />
            <Text
              style={[
                styles.segmentTabText,
                duration === '30' && styles.segmentActiveTabText,
              ]}>
              30 Minutes
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pricingDetailsCard}>
          <Text style={styles.pricingValue}>{consultationFee}</Text>
          <Text style={styles.pricingDescription}>
            Paid video Consultation (Via cholbe App)
          </Text>
          <View style={styles.pricingDivider} />
          <View style={styles.metaRow}>
            <Feather name="clock" size={14} color="#14B8A6" />
            <Text style={styles.metaRowText}>About {durationLabel}</Text>
          </View>
          <View style={[styles.metaRow, styles.metaRowSpaced]}>
            <Feather name="calendar" size={14} color="#14B8A6" />
            <Text style={styles.metaRowText}>Taken: {selectedDateLabel}</Text>
          </View>
        </View>

        {loadingAvailability ? (
          <ActivityIndicator color="#14B8A6" style={styles.availabilityLoader} />
        ) : (
          <>
            {quickDates.length > 0 && (
              <View style={styles.daySegment}>
                {quickDates.map((item, index) => (
                  <DateChip
                    key={item.date}
                    date={item.date}
                    label={formatDateChipLabel(item.date)}
                    available={item.available}
                    active={selectedDate === item.date}
                    side={
                      quickDates.length > 1
                        ? index === 0
                          ? 'left'
                          : 'right'
                        : undefined
                    }
                    widthStyle={styles.dateChip}
                    onSelect={setSelectedDate}
                  />
                ))}
              </View>
            )}

            {/* <Text style={styles.blockSectionTitle}>Select Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dateScroller}>
              {availableDates.map(item => (
                <DateChip
                  key={item.date}
                  date={item.date}
                  label={formatFullDateLabel(item.date)}
                  available={item.available}
                  active={selectedDate === item.date}
                  widthStyle={styles.dateChipWide}
                  onSelect={setSelectedDate}
                />
              ))}
            </ScrollView> */}
          </>
        )}

        <Text style={styles.blockSectionTitle}>Available Time Slot</Text>
        <View style={styles.slotsGrid}>
          {timeSlots.length === 0 ? (
            <Text style={styles.disclaimerText}>No slots available for this date.</Text>
          ) : (
            timeSlots.map(slot => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slotBadgeButton,
                {width: SLOT_WIDTH},
                selectedTime === slot && styles.slotActiveBadgeButton,
              ]}
              onPress={() => setSelectedTime(slot)}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.slotBadgeText,
                  selectedTime === slot && styles.slotActiveBadgeText,
                ]}>
                {slot}
              </Text>
            </TouchableOpacity>
            ))
          )}
        </View>

        <Text style={styles.blockSectionTitle}>Payment Method</Text>

        <PaymentOption
          method="bkash"
          label="bkash"
          selected={paymentMethod}
          onSelect={setPaymentMethod}
          brandColor="#E11D48"
          brandInitial="b"
        />
        <PaymentOption
          method="nagad"
          label="Nagad"
          selected={paymentMethod}
          onSelect={setPaymentMethod}
          brandColor="#EA580C"
          brandInitial="n"
        />
        <PaymentOption
          method="card"
          label="Card"
          selected={paymentMethod}
          onSelect={setPaymentMethod}
          brandColor="#1E293B"
          useCardIcon
        />

        <Text style={styles.disclaimerText}>
          By making this booking, you agree to our cancellation policy. This is
          paid services. Please ensure timely participation
        </Text>

        <TouchableOpacity
          style={[styles.confirmCheckoutButton, booking && styles.confirmDisabled]}
          activeOpacity={0.9}
          disabled={booking}
          onPress={confirmBooking}>
          {booking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmCheckoutButtonText}>
              Confirm Booking - {consultationFee}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={[styles.floatingScanButton, {bottom: insets.bottom + 100}]}
        activeOpacity={0.85}>
        <Image source={require('../../assets/syaiicon.png')} />
      </TouchableOpacity>

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

type DateChipProps = {
  date: string;
  label: string;
  available: boolean;
  active: boolean;
  side?: 'left' | 'right';
  widthStyle: StyleProp<ViewStyle>;
  onSelect: (date: string) => void;
};

function DateChip({
  date,
  label,
  available,
  active,
  side,
  widthStyle,
  onSelect,
}: DateChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.segmentTab,
        widthStyle,
        active && styles.segmentActiveTab,
        !available && styles.dateChipDisabled,
        side === 'left' && styles.chipRoundedLeft,
        side === 'right' && styles.chipRoundedRight,
      ]}
      disabled={!available}
      onPress={() => onSelect(date)}
      activeOpacity={0.8}>
      <Text
        style={[
          styles.segmentTabText,
          active && styles.segmentActiveTabText,
          !available && styles.dateChipDisabledText,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

type PaymentOptionProps = {
  method: PaymentMethod;
  label: string;
  selected: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
  brandColor: string;
  brandInitial?: string;
  useCardIcon?: boolean;
};

function PaymentOption({
  method,
  label,
  selected,
  onSelect,
  brandColor,
  brandInitial,
  useCardIcon,
}: PaymentOptionProps) {
  const active = selected === method;

  return (
    <TouchableOpacity
      style={[styles.paymentCardRow, active && styles.paymentActiveCardRow]}
      onPress={() => onSelect(method)}
      activeOpacity={0.8}>
      <View style={styles.paymentLeftMeta}>
        <View style={[styles.brandLogoPlaceholder, {backgroundColor: brandColor}]}>
          {useCardIcon ? (
            <Feather name="credit-card" size={16} color="#FFFFFF" />
          ) : (
            <Text style={styles.brandLogoInitial}>{brandInitial}</Text>
          )}
        </View>
        <Text style={styles.paymentMethodLabel}>{label}</Text>
      </View>
      <View style={[styles.radioCircle, active && styles.radioActiveCircle]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F3FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#F4F3FC',
  },
  headerIconTitle:{
    flexDirection:'row',
    gap:10
  },
  iconButton: {
    padding: 4,
    width: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  doctorProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    backgroundColor:'#F4F3FC'
  },
  doctorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
  },
  doctorMeta: {
    marginLeft: 14,
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#616161',
    fontWeight: '400',
    marginTop: 1,
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  onlineStatusText: {
    fontSize: 12,
    color: '#616161',
    fontWeight: '400',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 40,
    justifyContent: 'space-between',
  },
  // Date row mirrors the duration segment: one pill track, active chip filled.
  daySegment: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 40,
    marginTop: 16,
  },
  availabilityLoader: {
    marginTop: 16,
  },
  dateChip: {
    width: DATE_CHIP_WIDTH,
    flex: 0,
  },
  // Half-pill corners. These MUST zero the opposite side: segmentTab sets
  // borderRadius: 40, so only naming the corners you want rounded leaves the
  // other two rounded too, and the chip stays a full pill.
  chipRoundedLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  chipRoundedRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  // Full date picker below the quick pill. flexGrow:0 keeps the horizontal
  // scroller from stretching, so the 16dp gap to the next heading stays exact.
  dateScroller: {
    flexGrow: 0,
  },
  dateChipWide: {
    minWidth: 96,
    marginRight: 8,
    flex: 0,
  },
  dateChipDisabled: {
    opacity: 0.45,
    backgroundColor: '#F1F5F9',
  },
  dateChipDisabledText: {
    color: '#94A3B8',
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Matches segmentButton so the date pill and duration pill are the same height.
    paddingVertical: 10,
    borderRadius: 40,
    marginHorizontal: 2,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopLeftRadius: 40,
    borderBottomLeftRadius:40,
    marginHorizontal: 2,
  },
  segmentButtonRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopRightRadius: 40,
    borderBottomRightRadius:40,
    marginHorizontal: 2,
  },
  segmentActiveTab: {
    backgroundColor: '#408E91',
  },
  segmentIcon: {
    marginRight: 6,
  },
  segmentTabText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  segmentActiveTabText: {
    color: '#FFFFFF',
  },
  pricingDetailsCard: {
    backgroundColor: '#F4F3FC',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation:0.1,
  },
  pricingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#616161',
  },
  pricingDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 12,
  },
  pricingDivider: {
    height: 1,
    backgroundColor: '#E6E3EE',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRowSpaced: {
    marginTop: 6,
  },
  metaRowText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  // Owns the 16dp gap above every section heading, per the design annotations.
  blockSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
    marginBottom: 12,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotBadgeButton: {
    backgroundColor: '#E6E3EE',
    borderWidth: 1,
    borderColor: '#E6E3EE',
    borderRadius: 40,
    paddingVertical: 8,
    alignItems: 'center',
  },
  slotActiveBadgeButton: {
    backgroundColor: '#408E91',
    borderColor: '#408E91',
  },
  slotBadgeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  slotActiveBadgeText: {
    color: '#FFFFFF',
  },
  paymentCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F4F3FC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6E3EE',
  },
  paymentActiveCardRow: {
    borderColor: '#408E91',
  },
  paymentLeftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandLogoInitial: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  paymentMethodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  radioActiveCircle: {
    borderColor: '#059669',
    backgroundColor: '#FFFFFF',
    borderWidth: 5,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
    marginTop: 16,
    marginBottom: 48,
  },
  confirmCheckoutButton: {
    backgroundColor: '#408E91',
    borderRadius: 40,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#408E91',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmDisabled: {
    opacity: 0.7,
  },
  confirmCheckoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingScanButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 99,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
