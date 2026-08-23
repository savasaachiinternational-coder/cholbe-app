import { useEffect, useMemo, useState } from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import type { RootStackParamList } from '../../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeBottomNav } from './HomeBottomNav';
import type { BottomTabKey } from './homeData';
import { appointmentsApi } from '../../api/appointments';
import { ApiError } from '../../api/client';
import { getStoredUser } from '../../api/tokenStorage';
import { getAppointmentDateTime } from '../../api/utils/appointmentHelpers';
import { requestCallPermissions } from '../../utils/callPermissions';

type Props = NativeStackScreenProps<RootStackParamList, 'WaitingRoom'>;

const DOCTOR_AVATAR = require('../../assets/b2.png');
const JOIN_BUTTON_GRADIENT = ['#6BB9B4', '#0D9488'] as const;
const JOIN_BUTTON_DISABLED_GRADIENT = ['#CBD5E1', '#94A3B8'] as const;

function formatCountdown(target: Date): string {
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return '00:00';
  const totalSec = Math.floor(diffMs / 1000);
  const min = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, '0');
  const sec = (totalSec % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

export function WaitingRoomScreen({ navigation, route }: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const appointmentId = route.params.appointmentId;

  const [doctorName, setDoctorName] = useState(
    route.params?.doctorName ?? 'Doctor',
  );
  const [specialty, setSpecialty] = useState(
    route.params?.specialty ?? 'Specialist',
  );
  const [isDoctorViewer, setIsDoctorViewer] = useState(
    route.params?.viewerRole === 'DOCTOR',
  );
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [consultationType, setConsultationType] = useState<
    'VIDEO' | 'CHAT' | 'AUDIO'
  >('VIDEO');
  const [countdown, setCountdown] = useState('--:--');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await getStoredUser();
      if (mounted && stored?.role === 'DOCTOR') {
        setIsDoctorViewer(true);
      }
      try {
        const appt = await appointmentsApi.getById(appointmentId);
        if (!mounted) return;
        if (
          stored?.role === 'DOCTOR' ||
          route.params?.viewerRole === 'DOCTOR'
        ) {
          setDoctorName(
            appt.patient?.fullName ?? route.params?.doctorName ?? 'Patient',
          );
          setSpecialty('Patient consultation');
        } else {
          setDoctorName(appt.doctor.user.fullName);
          setSpecialty(appt.doctor.specialty);
        }
        setScheduledAt(getAppointmentDateTime(appt));
        setConsultationType(
          (appt.consultationType ?? 'VIDEO') as 'VIDEO' | 'CHAT' | 'AUDIO',
        );
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Could not load appointment';
        Alert.alert('Waiting room', message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [appointmentId, route.params?.doctorName, route.params?.viewerRole]);

  useEffect(() => {
    if (!scheduledAt) return;
    const tick = () => setCountdown(formatCountdown(scheduledAt));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [scheduledAt]);

  const canJoin = useMemo(() => {
    if (!scheduledAt) return true;
    return scheduledAt.getTime() - Date.now() <= 60 * 60 * 1000;
  }, [scheduledAt, countdown]);

  const openChat = () => {
    navigation.navigate('ConsultationChat', {
      doctorName,
      specialty,
      appointmentId,
      viewerRole: isDoctorViewer ? 'DOCTOR' : 'CUSTOMER',
    });
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

  const joinConsultation = async () => {
    if (consultationType !== 'CHAT') {
      const allowed = await requestCallPermissions();
      if (!allowed) {
        Alert.alert(
          'Permissions required',
          'Please allow camera and microphone access to join the video call.',
        );
        return;
      }
    }
    await appointmentsApi
      .updateStatus(appointmentId, 'in_progress')
      .catch(() => undefined);
    if (consultationType === 'CHAT') {
      navigation.navigate('ConsultationChat', {
        doctorName,
        specialty,
        appointmentId,
        viewerRole: isDoctorViewer ? 'DOCTOR' : 'CUSTOMER',
      });
      return;
    }
    navigation.navigate('ActiveVideoCall', {
      appointmentId,
      doctorName,
      specialty,
      viewerRole: isDoctorViewer ? 'DOCTOR' : 'CUSTOMER',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerBackTitle}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isDoctorViewer ? 'Consultation Room' : 'Your Waiting Room'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={openChat}
        >
          <Feather name="message-square" size={22} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownTitle}>
            {isDoctorViewer
              ? 'Patient consultation scheduled'
              : 'Your consultation is scheduled'}
          </Text>
          <Text style={styles.countdownSubtitle}>
            Call starts in{' '}
            <Text style={styles.countdownTimer}>{countdown} minutes</Text>
          </Text>
        </View>

        <View style={styles.roomCard}>
          <View style={styles.doctorProfileBlock}>
            <Image source={DOCTOR_AVATAR} style={styles.doctorAvatar} />
            <Text style={styles.doctorName}>
              {isDoctorViewer ? doctorName : doctorName}
            </Text>
            <View style={styles.specialtyRow}>
              <View style={styles.greenDot} />
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.joinCallButtonWrap}
            activeOpacity={0.9}
            disabled={!canJoin}
            onPress={() => void joinConsultation()}
          >
            <LinearGradient
              colors={
                canJoin
                  ? [...JOIN_BUTTON_GRADIENT]
                  : [...JOIN_BUTTON_DISABLED_GRADIENT]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.joinCallButton}
            >
              <Text style={styles.joinCallButtonText}>
                {canJoin
                  ? consultationType === 'CHAT'
                    ? 'Open Chat Consultation'
                    : 'Join Video Call'
                  : 'Available 1 hour before start'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.cardDivider} />

          <View style={styles.diagnosticGridRow}>
            <DiagnosticItem
              icon="camera"
              label="Camera"
              status="Ready"
              tone="solid"
            />
            <DiagnosticItem
              icon="mic"
              label="Mic"
              status="Ready"
              tone="muted"
              withDivider
            />
            <DiagnosticItem
              icon="wifi"
              label="Network"
              status="Good"
              tone="plain"
              withDivider
            />
          </View>

          <View style={styles.cardDivider} />

          <Text style={styles.readyNote}>
            Please be ready before the call starts.{'\n'}
            Ensure a good internet connections.
          </Text>

          <View style={styles.cardDivider} />

          <ConsultationActionRow
            icon="headphones"
            label="Switch to Audio Call"
            onPress={() => void joinConsultation()}
          />
          <ConsultationActionRow
            icon="message-circle"
            label="Chat With Doctor"
            onPress={openChat}
          />
        </View>

        <Text style={styles.paidNote}>
          This is a paid consultation. By using this services,{'\n'}
          you agree to Our Terms.
        </Text>
      </ScrollView>
      <TouchableOpacity
        style={[styles.floatingScanButton, { bottom: insets.bottom + 100 }]}
        activeOpacity={0.85}
      >
        <Image source={require('../../assets/syaiicon.png')} />
      </TouchableOpacity>

      {!isDoctorViewer ? (
        <View style={styles.bottomNavWrap}>
          <HomeBottomNav
            activeTab="home"
            bottomInset={insets.bottom}
            onTabPress={handleTabPress}
          />
        </View>
      ) : null}
    </View>
  );
}

function DiagnosticItem({
  icon,
  label,
  status,
  tone = 'plain',
  withDivider,
}: {
  icon: 'camera' | 'mic' | 'wifi';
  label: string;
  status: string;
  tone?: 'solid' | 'muted' | 'plain';
  withDivider?: boolean;
}) {
  const iconColor =
    tone === 'solid' ? '#FFFFFF' : tone === 'muted' ? '#64748B' : '#0D9488';
  return (
    <View
      style={[styles.diagnosticItem, withDivider && styles.diagnosticDivider]}
    >
      <View style={styles.diagnosticHeadRow}>
        <View
          style={[
            styles.diagnosticIconBadge,
            tone === 'solid' && styles.diagnosticIconBadgeSolid,
            tone === 'muted' && styles.diagnosticIconBadgeMuted,
          ]}
        >
          <Feather name={icon} size={14} color={iconColor} />
        </View>
        <Text style={styles.diagnosticLabel}>{label}</Text>
      </View>
      <View style={styles.diagnosticStatusRow}>
        <Feather name="check" size={13} color="#22C55E" />
        <Text style={styles.diagnosticStatus}>{status}</Text>
      </View>
    </View>
  );
}

function ConsultationActionRow({
  icon,
  label,
  onPress,
}: {
  icon: 'headphones' | 'message-circle';
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.actionRow}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.actionIconCircle}>
        <Feather name={icon} size={16} color="#0D9488" />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
      <Feather name="chevron-right" size={20} color="#94A3B8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F3FC',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    color:'#F5F4FD'
  },
  headerBackTitle:{
    flexDirection:'row',
    alignItems:'center',
    gap:10,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  countdownSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  countdownTimer: {
    color: '#0D9488',
    fontWeight: '700',
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doctorProfileBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  doctorAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  specialtyText: {
    fontSize: 13,
    color: '#64748B',
  },
  joinCallButtonWrap: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  joinCallButton: {
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  joinCallButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  diagnosticGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diagnosticItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  diagnosticDivider: {
    borderLeftWidth: 1,
    borderColor: '#E2E8F0',
  },
  diagnosticHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diagnosticIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  diagnosticIconBadgeSolid: {
    backgroundColor: '#0D9488',
  },
  diagnosticIconBadgeMuted: {
    backgroundColor: '#E2E8F0',
  },
  diagnosticLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  diagnosticStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  diagnosticStatus: {
    fontSize: 12,
    fontWeight: '500',
    color: '#22C55E',
    marginLeft: 4,
  },
  readyNote: {
    fontSize: 12,
    fontWeight:'400',
    color: '#616161',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  actionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    color: '#616161',
  },
  paidNote: {
    marginTop: 16,
    paddingHorizontal: 4,
    fontSize: 12,
    fontWeight:'400',
    color: '#616161',
    lineHeight: 19,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 99,
  },
});
