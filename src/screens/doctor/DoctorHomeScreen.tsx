import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {doctorPortalApi, type DoctorDashboard} from '../../api/doctorPortal';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {NotificationBell} from '../../components/NotificationBell';
import {DoctorBottomNav} from './DoctorBottomNav';
import {formatAppointmentDate, formatAppointmentStatus, statusColor} from './doctorNav';
import {openDoctorConsultation} from './doctorConsultationHelpers';

type Props = NativeStackScreenProps<RootStackParamList, 'DHome'>;

export function DoctorHomeScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DoctorDashboard | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await doctorPortalApi.dashboard();
      setDashboard(data);
    } catch {
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const doctor = dashboard?.doctor;
  const stats = dashboard?.stats;

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.title}>{doctor?.user.fullName ?? 'Doctor'}</Text>
          <Text style={styles.subtitle}>{doctor?.specialty ?? '—'}</Text>
        </View>
        <NotificationBell onPress={() => navigation.navigate('Notifications')} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4E929D" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 80}]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.statsRow}>
            <StatCard label="Today" value={stats?.todayAppointments ?? 0} icon="calendar" />
            <StatCard label="Upcoming" value={stats?.upcomingAppointments ?? 0} icon="clock" />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Patients" value={stats?.totalPatients ?? 0} icon="users" />
            <StatCard label="Consultations" value={stats?.activeConsultations ?? 0} icon="message-circle" />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Next Appointment</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DAppointments')}>
              <Text style={styles.linkText}>View all</Text>
            </TouchableOpacity>
          </View>

          {dashboard?.nextAppointment ? (
            <AppointmentCard
              appointment={dashboard.nextAppointment}
              onJoin={() => openDoctorConsultation(navigation, dashboard.nextAppointment!)}
            />
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No upcoming appointments</Text>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
          </View>

          {(dashboard?.recentAppointments ?? []).slice(0, 3).map(appt => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onJoin={() => openDoctorConsultation(navigation, appt)}
            />
          ))}

          <View style={styles.quickActions}>
            <QuickAction
              title="Manage Appointments"
              icon="calendar"
              onPress={() => navigation.navigate('DAppointments')}
            />
            <QuickAction
              title="Manage Patients"
              icon="users"
              onPress={() => navigation.navigate('DPatients')}
            />
            <QuickAction
              title="Manage Consultations"
              icon="message-circle"
              onPress={() => navigation.navigate('DConsultations')}
            />
          </View>
        </ScrollView>
      )}

      <DoctorBottomNav activeTab="home" bottomInset={insets.bottom} navigation={navigation} />
    </View>
  );
}

function StatCard({label, value, icon}: {label: string; value: number; icon: string}) {
  return (
    <View style={styles.statCard}>
      <Feather name={icon} size={18} color="#4E929D" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({title, icon, onPress}: {title: string; icon: string; onPress: () => void}) {
  return (
    <TouchableOpacity style={styles.quickAction} activeOpacity={0.7} onPress={onPress}>
      <Feather name={icon} size={18} color="#4E929D" />
      <Text style={styles.quickActionText}>{title}</Text>
      <Feather name="chevron-right" size={16} color="#9AA6B2" />
    </TouchableOpacity>
  );
}

function AppointmentCard({
  appointment,
  onJoin,
}: {
  appointment: DoctorDashboard['recentAppointments'][0];
  onJoin: () => void;
}) {
  return (
    <View style={styles.apptCard}>
      <View style={styles.apptTop}>
        <View>
          <Text style={styles.patientName}>{appointment.patient.fullName}</Text>
          <Text style={styles.apptMeta}>
            {formatAppointmentDate(appointment.scheduledDate)} · {appointment.timeSlot}
          </Text>
        </View>
        <View style={[styles.statusBadge, {backgroundColor: `${statusColor(appointment.status)}18`}]}>
          <Text style={[styles.statusText, {color: statusColor(appointment.status)}]}>
            {formatAppointmentStatus(appointment.status)}
          </Text>
        </View>
      </View>
      <View style={styles.apptFooter}>
        <Text style={styles.consultType}>{appointment.consultationType} consultation</Text>
        <TouchableOpacity style={styles.joinBtn} onPress={onJoin}>
          <Text style={styles.joinBtnText}>Open</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA'},
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {fontSize: 13, color: '#7E8B97'},
  title: {fontSize: 22, fontWeight: '700', color: '#1A2332', marginTop: 2},
  subtitle: {fontSize: 14, color: '#4E929D', marginTop: 2},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  content: {padding: 16, gap: 12},
  statsRow: {flexDirection: 'row', gap: 12},
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  statValue: {fontSize: 22, fontWeight: '700', color: '#1A2332'},
  statLabel: {fontSize: 12, color: '#7E8B97'},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: {fontSize: 16, fontWeight: '600', color: '#1A2332'},
  linkText: {fontSize: 13, color: '#4E929D', fontWeight: '600'},
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  emptyText: {color: '#7E8B97'},
  apptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 8,
  },
  apptTop: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
  patientName: {fontSize: 15, fontWeight: '600', color: '#1A2332'},
  apptMeta: {fontSize: 12, color: '#7E8B97', marginTop: 2},
  statusBadge: {borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start'},
  statusText: {fontSize: 11, fontWeight: '600'},
  apptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  consultType: {fontSize: 12, color: '#7E8B97'},
  joinBtn: {
    backgroundColor: '#4E929D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  joinBtnText: {color: '#FFFFFF', fontSize: 12, fontWeight: '600'},
  quickActions: {gap: 8, marginTop: 8},
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  quickActionText: {flex: 1, fontSize: 14, fontWeight: '500', color: '#1A2332'},
});
