import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {
  type AppointmentDetail,
  isUpcomingAppointment,
  toAppointmentDetail,
} from '../../api/utils/appointmentHelpers';
import {appointmentsApi, type Appointment} from '../../api/appointments';
import {ApiError} from '../../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'MyAppointment'>;
type AppointmentTab = 'upcoming' | 'past';

const DOCTOR_AVATAR = require('../../assets/b2.png');

export function MyAppointmentScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<AppointmentTab>('upcoming');
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await appointmentsApi.list();
      setItems(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load appointments';
      Alert.alert('Appointments', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [loadAppointments]),
  );

  const upcoming = useMemo(
    () => items.filter(isUpcomingAppointment).map(toAppointmentDetail),
    [items],
  );
  const past = useMemo(
    () => items.filter(a => !isUpcomingAppointment(a)).map(toAppointmentDetail),
    [items],
  );

  const listForTab = activeTab === 'upcoming' ? upcoming : past;

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

  const openConsultationSummary = (appt: AppointmentDetail) => {
    navigation.navigate('ConsultationSummary', {
      appointmentId: appt.id,
      doctorName: appt.doctorName,
      specialty: appt.specialty,
    });
  };

  const joinConsultation = async (appt: AppointmentDetail) => {
    if (appt.consultationTypeRaw === 'CHAT') {
      await appointmentsApi.updateStatus(appt.id, 'in_progress').catch(() => undefined);
      navigation.navigate('ConsultationChat', {
        appointmentId: appt.id,
        doctorName: appt.doctorName,
        specialty: appt.specialty,
      });
      return;
    }
    navigation.navigate('WaitingRoom', {
      appointmentId: appt.id,
      doctorName: appt.doctorName,
      specialty: appt.specialty,
    });
  };

  const cancelAppointment = (appt: AppointmentDetail) => {
    Alert.alert('Cancel appointment', `Cancel your visit with ${appt.doctorName}?`, [
      {text: 'Keep', style: 'cancel'},
      {
        text: 'Cancel visit',
        style: 'destructive',
        onPress: async () => {
          try {
            await appointmentsApi.updateStatus(appt.id, 'cancelled');
            await loadAppointments();
          } catch (err) {
            Alert.alert(
              'Cancel failed',
              err instanceof ApiError ? err.message : 'Could not cancel appointment',
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 110},
        ]}>
        <View style={styles.segmentedControlContainer}>
          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeTab === 'upcoming' && styles.segmentActiveTab,
            ]}
            activeOpacity={0.85}
            onPress={() => setActiveTab('upcoming')}>
            <Text
              style={[
                styles.segmentTabText,
                activeTab === 'upcoming' && styles.segmentActiveTabText,
              ]}>
              Upcoming
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeTab === 'past' && styles.segmentActiveTab,
            ]}
            activeOpacity={0.85}
            onPress={() => setActiveTab('past')}>
            <Text
              style={[
                styles.segmentTabText,
                activeTab === 'past' && styles.segmentActiveTabText,
              ]}>
              Past
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0D9488" style={{marginTop: 40}} />
        ) : listForTab.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No {activeTab} appointments yet.
            </Text>
            <TouchableOpacity
              style={styles.bookNowButton}
              onPress={() => navigation.navigate('DoctorList')}>
              <Text style={styles.bookNowButtonText}>Find a doctor</Text>
            </TouchableOpacity>
          </View>
        ) : (
          listForTab.map(appointment => (
            <View key={appointment.id} style={styles.appointmentListItem}>
              {activeTab === 'past' && appointment.status.toLowerCase() === 'completed' && (
                <View style={styles.statusRibbonContainer}>
                  <Feather
                    name="check-circle"
                    size={18}
                    color="#0D9488"
                    style={styles.ribbonIconMargin}
                  />
                  <Text style={styles.statusRibbonText}>
                    Your consultation with {appointment.doctorName} is complete
                  </Text>
                </View>
              )}

              <AppointmentMainCard
                appointment={appointment}
                isUpcoming={activeTab === 'upcoming'}
                onJoinCall={() => void joinConsultation(appointment)}
                onViewSummary={() => openConsultationSummary(appointment)}
                onCancel={() => cancelAppointment(appointment)}
              />

              {activeTab === 'past' && appointment.status.toLowerCase() === 'completed' && (
                <ReminderAdvisoryCard
                  appointment={appointment}
                  onSubmitFeedback={() => openConsultationSummary(appointment)}
                />
              )}
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.floatingScanButton, {bottom: insets.bottom + 90}]}
        activeOpacity={0.85}>
        <Feather name="maximize" size={24} color="#1E293B" />
      </TouchableOpacity>

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab="profile"
          bottomInset={insets.bottom}
          onTabPress={handleTabPress}
        />
      </View>
    </View>
  );
}

function AppointmentMainCard({
  appointment,
  isUpcoming,
  onJoinCall,
  onViewSummary,
  onCancel,
}: {
  appointment: AppointmentDetail;
  isUpcoming: boolean;
  onJoinCall: () => void;
  onViewSummary: () => void;
  onCancel: () => void;
}) {
  const joinLabel =
    appointment.consultationTypeRaw === 'CHAT'
      ? appointment.status.toLowerCase() === 'in_progress'
        ? 'Continue Chat'
        : 'Open Chat'
      : appointment.status.toLowerCase() === 'in_progress'
        ? 'Rejoin Call'
        : 'Join Call';
  const joinIcon = appointment.consultationTypeRaw === 'CHAT' ? 'message-circle' : 'video';

  return (
    <View style={styles.appointmentMainCard}>
      <View style={styles.doctorProfileBlockRow}>
        <Image source={DOCTOR_AVATAR} style={styles.doctorAvatarImage} />
        <View style={styles.doctorMetadataTextContainer}>
          <Text style={styles.doctorNameText}>{appointment.doctorName}</Text>
          <Text style={styles.doctorSpecialtyText}>{appointment.specialty}</Text>
        </View>
      </View>

      <View style={styles.bookingDetailsBlock}>
        <Text style={styles.dateTimestampLabelText}>
          {appointment.dateLabel}
        </Text>
        <Text style={styles.durationRangeLabelText}>
          {appointment.timeRange}
        </Text>

        <View style={styles.specDetailRow}>
          <Feather
            name="calendar"
            size={15}
            color="#408E91"
            style={styles.inlineIconSpacing}
          />
          <Text style={styles.specDetailMainText}>
            {appointment.consultationType}
          </Text>
          <View style={styles.smallSeparatingDot} />
          <Text style={styles.specDetailValueText}>{appointment.fee}</Text>
        </View>

        <View style={[styles.specDetailRow, styles.specDetailRowSpaced]}>
          <Feather
            name="clock"
            size={15}
            color="#408E91"
            style={styles.inlineIconSpacing}
          />
          <Text
            style={[
              styles.countdownAlertText,
              !isUpcoming && styles.countdownCompleteText,
            ]}>
            {appointment.countdownLabel}
          </Text>
        </View>
      </View>

      <View style={styles.cardActionButtonsRowContainer}>
        {isUpcoming ? (
          <>
            <TouchableOpacity
              style={styles.rescheduleSecondaryButton}
              activeOpacity={0.85}
              onPress={onCancel}>
              <Text style={styles.rescheduleSecondaryButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.joinCallPrimaryButton}
              activeOpacity={0.9}
              onPress={onJoinCall}>
              <Feather
                name={joinIcon}
                size={16}
                color="#FFFFFF"
                style={styles.videoIconMargin}
              />
              <Text style={styles.joinCallPrimaryButtonText}>{joinLabel}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.viewSummaryFullButton}
            activeOpacity={0.9}
            onPress={onViewSummary}>
            <Text style={styles.joinCallPrimaryButtonText}>
              View Consultation Summary
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function ReminderAdvisoryCard({
  appointment,
  onSubmitFeedback,
}: {
  appointment: AppointmentDetail;
  onSubmitFeedback: () => void;
}) {
  const reminderBody = (
    <>
      <Text style={styles.reminderBoldHeadingText}>Feedback: </Text>
      Share how your consultation with {appointment.doctorName} went.
    </>
  );

  return (
    <View style={[styles.reminderAdvisoryCard, styles.reminderCardSpaced]}>
      <View style={styles.reminderCardContentInnerRow}>
        <View style={styles.bellIconWrapperContainer}>
          <Feather name="bell" size={20} color="#FBBF24" />
        </View>
        <View style={styles.reminderTextMetaBlock}>
          <Text style={styles.reminderMainTitleBodyText}>{reminderBody}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.feedbackActionSubmitButton}
        activeOpacity={0.9}
        onPress={onSubmitFeedback}>
        <Text style={styles.feedbackActionSubmitButtonText}>
          Submit Feedback
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#F5F6FA',
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  segmentedControlContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginTop: 12,
    marginBottom: 16,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentActiveTab: {
    backgroundColor: '#408E91',
  },
  segmentTabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  segmentActiveTabText: {
    color: '#FFFFFF',
  },
  statusRibbonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  ribbonIconMargin: {
    marginRight: 8,
  },
  statusRibbonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  appointmentMainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  appointmentListItem: {
    marginBottom: 16,
  },
  reminderCardSpaced: {
    marginTop: 12,
  },
  doctorProfileBlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
  },
  doctorAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
  },
  doctorMetadataTextContainer: {
    marginLeft: 14,
  },
  doctorNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  doctorSpecialtyText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  bookingDetailsBlock: {
    paddingVertical: 14,
  },
  dateTimestampLabelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  durationRangeLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
    marginBottom: 10,
  },
  specDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specDetailRowSpaced: {
    marginTop: 6,
  },
  inlineIconSpacing: {
    marginRight: 6,
  },
  specDetailMainText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  smallSeparatingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#84CC16',
    marginHorizontal: 8,
  },
  specDetailValueText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  countdownAlertText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  countdownCompleteText: {
    color: '#0D9488',
    fontWeight: '600',
  },
  cardActionButtonsRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rescheduleSecondaryButton: {
    flex: 0.48,
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescheduleSecondaryButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  joinCallPrimaryButton: {
    flex: 0.48,
    backgroundColor: '#408E91',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIconMargin: {
    marginRight: 6,
  },
  joinCallPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  viewSummaryFullButton: {
    flex: 1,
    backgroundColor: '#408E91',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderAdvisoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  reminderCardContentInnerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bellIconWrapperContainer: {
    marginTop: 2,
  },
  reminderTextMetaBlock: {
    marginLeft: 10,
    flex: 1,
  },
  reminderMainTitleBodyText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    fontWeight: '500',
  },
  reminderBoldHeadingText: {
    color: '#1E293B',
    fontWeight: '700',
  },
  feedbackActionSubmitButton: {
    backgroundColor: '#408E91',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackActionSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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
    zIndex: 10,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 48,
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  bookNowButton: {
    backgroundColor: '#0D9488',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  bookNowButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
