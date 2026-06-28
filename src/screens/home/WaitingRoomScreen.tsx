import {useEffect, useMemo, useState} from 'react';
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {appointmentsApi} from '../../api/appointments';
import {ApiError} from '../../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'WaitingRoom'>;

const DOCTOR_AVATAR = require('../../assets/b2.png');

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

export function WaitingRoomScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const appointmentId = route.params.appointmentId;

  const [doctorName, setDoctorName] = useState(route.params?.doctorName ?? 'Doctor');
  const [specialty, setSpecialty] = useState(route.params?.specialty ?? 'Specialist');
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState('--:--');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const appt = await appointmentsApi.getById(appointmentId);
        if (!mounted) return;
        setDoctorName(appt.doctor.user.fullName);
        setSpecialty(appt.doctor.specialty);
        setScheduledAt(new Date(appt.scheduledDate));
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Could not load appointment';
        Alert.alert('Waiting room', message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [appointmentId]);

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

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Waiting Room</Text>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={openChat}>
          <Feather name="message-square" size={22} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 120},
        ]}>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownTitle}>Your consultation is scheduled</Text>
          <Text style={styles.countdownSubtitle}>
            Call starts in <Text style={styles.countdownTimer}>{countdown} minutes</Text>
          </Text>
        </View>

        <View style={styles.roomCard}>
          <View style={styles.doctorProfileBlock}>
            <Image source={DOCTOR_AVATAR} style={styles.doctorAvatar} />
            <Text style={styles.doctorName}>{doctorName}</Text>
            <View style={styles.specialtyRow}>
              <View style={styles.greenDot} />
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.joinCallButton, !canJoin && styles.joinCallDisabled]}
            activeOpacity={0.9}
            disabled={!canJoin}
            onPress={() =>
              navigation.navigate('ActiveVideoCall', {
                appointmentId,
                doctorName,
                specialty,
              })
            }>
            <Text style={styles.joinCallButtonText}>
              {canJoin ? 'Join Video Call' : 'Available 1 hour before start'}
            </Text>
          </TouchableOpacity>

          <View style={styles.diagnosticGridRow}>
            <DiagnosticItem icon="camera" label="Camera" status="Ready" />
            <DiagnosticItem icon="mic" label="Mic" status="Ready" withDivider />
            <DiagnosticItem icon="wifi" label="Network" status="Good" withDivider />
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

function DiagnosticItem({
  icon,
  label,
  status,
  withDivider,
}: {
  icon: 'camera' | 'mic' | 'wifi';
  label: string;
  status: string;
  withDivider?: boolean;
}) {
  return (
    <View style={[styles.diagnosticItem, withDivider && styles.diagnosticDivider]}>
      <Feather name={icon} size={18} color="#0D9488" />
      <Text style={styles.diagnosticLabel}>{label}</Text>
      <Text style={styles.diagnosticStatus}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
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
  joinCallButton: {
    backgroundColor: '#0D9488',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  joinCallDisabled: {
    backgroundColor: '#94A3B8',
  },
  joinCallButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  diagnosticGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diagnosticItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  diagnosticDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  diagnosticLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  diagnosticStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
