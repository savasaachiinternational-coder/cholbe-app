import {useMemo, useState} from 'react';
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
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {TIME_SLOTS, type PaymentMethod} from './bookVideoCallData';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const SLOT_WIDTH = (SCREEN_WIDTH - 32 - 24) / 4;

type Props = NativeStackScreenProps<RootStackParamList, 'BookVideoCall'>;

export function BookVideoCallScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const doctorName = route.params?.doctorName ?? 'Dr. Ahmed';
  const specialty = route.params?.specialty ?? 'Cardiologist';
  const baseFee = route.params?.consultationFee ?? 'BDT 800';

  const [duration, setDuration] = useState<'15' | '30'>('15');
  const [day, setDay] = useState<'today' | 'tomorrow'>('today');
  const [selectedTime, setSelectedTime] = useState('10:30 PM');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');

  const consultationFee = useMemo(() => {
    if (baseFee.startsWith('BDT')) {
      return duration === '30' ? 'BDT 1200' : baseFee;
    }
    return duration === '30' ? 'BDT 1200' : 'BDT 800';
  }, [baseFee, duration]);

  const durationLabel = duration === '15' ? '15 Minutes' : '30 Minutes';

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
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Video Call</Text>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('ConsultationChat', {
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

        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentTab,
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
              styles.segmentTab,
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
          <View style={styles.metaRow}>
            <Feather name="clock" size={14} color="#14B8A6" />
            <Text style={styles.metaRowText}>About {durationLabel}</Text>
          </View>
          <View style={[styles.metaRow, styles.metaRowSpaced]}>
            <Feather name="calendar" size={14} color="#14B8A6" />
            <Text style={styles.metaRowText}>Taken: Monday,12 Feb</Text>
          </View>
        </View>

        <View style={[styles.segmentContainer, styles.daySegment]}>
          <TouchableOpacity
            style={[styles.segmentTab, day === 'today' && styles.segmentActiveTab]}
            onPress={() => setDay('today')}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.segmentTabText,
                day === 'today' && styles.segmentActiveTabText,
              ]}>
              Today Apr 26
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentTab,
              day === 'tomorrow' && styles.segmentActiveTab,
            ]}
            onPress={() => setDay('tomorrow')}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.segmentTabText,
                day === 'tomorrow' && styles.segmentActiveTabText,
              ]}>
              Tomorrow
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.blockSectionTitle}>Available Time Slot</Text>
        <View style={styles.slotsGrid}>
          {TIME_SLOTS.map(slot => (
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
          ))}
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

        <TouchableOpacity style={styles.confirmCheckoutButton} activeOpacity={0.9}>
          <Text style={styles.confirmCheckoutButtonText}>
            Confirm Booking - {consultationFee}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={[styles.floatingScanButton, {bottom: insets.bottom + 160}]}
        activeOpacity={0.85}>
        <Feather name="maximize" size={24} color="#1E293B" />
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
    backgroundColor: '#F9FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    padding: 4,
    width: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  doctorProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
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
    fontWeight: '700',
    color: '#0F172A',
  },
  doctorSpecialty: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
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
    color: '#64748B',
    fontWeight: '500',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    justifyContent: 'space-between',
  },
  daySegment: {
    marginTop: 20,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pricingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  pricingDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
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
  blockSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 20,
    marginBottom: 12,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotBadgeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    marginTop: 12,
    marginBottom: 16,
  },
  confirmCheckoutButton: {
    backgroundColor: '#408E91',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#408E91',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmCheckoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
