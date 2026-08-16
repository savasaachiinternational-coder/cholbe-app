import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
import {doctorPortalApi, type DoctorAppointment} from '../../api/doctorPortal';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {DoctorBottomNav} from './DoctorBottomNav';
import {
  APPOINTMENT_STATUS_FILTERS,
  formatAppointmentDate,
  formatAppointmentStatus,
  statusColor,
  type AppointmentStatusFilter,
} from './doctorNav';
import {openDoctorConsultation} from './doctorConsultationHelpers';

type Props = NativeStackScreenProps<RootStackParamList, 'DAppointments'>;

export function DoctorAppointmentsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AppointmentStatusFilter>('all');
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await doctorPortalApi.appointments(filter === 'all' ? undefined : filter);
      setAppointments(data);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await doctorPortalApi.updateAppointmentStatus(id, status);
      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not update status';
      Alert.alert('Error', msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const openConsultation = (appt: DoctorAppointment) => {
    openDoctorConsultation(navigation, appt);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.navigate('DHome')} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#1A2332" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Appointments</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}>
        {APPOINTMENT_STATUS_FILTERS.map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.filterChip, filter === item && styles.filterChipActive]}
            onPress={() => setFilter(item)}>
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
              {item === 'all' ? 'All' : formatAppointmentStatus(item)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4E929D" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, {paddingBottom: insets.bottom + 80}]}
          showsVerticalScrollIndicator={false}>
          {appointments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No appointments found</Text>
            </View>
          ) : (
            appointments.map(appt => (
              <View key={appt.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.patientName}>{appt.patient.fullName}</Text>
                    <Text style={styles.meta}>
                      {formatAppointmentDate(appt.scheduledDate)} · {appt.timeSlot} · {appt.durationMin} min
                    </Text>
                    <Text style={styles.meta}>{appt.consultationType} · ৳{appt.fee}</Text>
                  </View>
                  <View style={[styles.badge, {backgroundColor: `${statusColor(appt.status)}18`}]}>
                    <Text style={[styles.badgeText, {color: statusColor(appt.status)}]}>
                      {formatAppointmentStatus(appt.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => openConsultation(appt)}>
                    <Feather name="video" size={14} color="#4E929D" />
                    <Text style={styles.secondaryBtnText}>Open</Text>
                  </TouchableOpacity>
                  {appt.status.toLowerCase() !== 'confirmed' && (
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      disabled={updatingId === appt.id}
                      onPress={() => void updateStatus(appt.id, 'confirmed')}>
                      <Text style={styles.secondaryBtnText}>Confirm</Text>
                    </TouchableOpacity>
                  )}
                  {appt.status.toLowerCase() !== 'completed' && (
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      disabled={updatingId === appt.id}
                      onPress={() => void updateStatus(appt.id, 'completed')}>
                      <Text style={styles.primaryBtnText}>Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <DoctorBottomNav activeTab="appointments" bottomInset={insets.bottom} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {width: 32, height: 32, justifyContent: 'center'},
  title: {fontSize: 17, fontWeight: '600', color: '#1A2332'},
  filterScroll: {maxHeight: 48, backgroundColor: '#FFFFFF'},
  filterRow: {paddingHorizontal: 16, paddingBottom: 12, gap: 8},
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F3F6',
  },
  filterChipActive: {backgroundColor: '#4E929D'},
  filterText: {fontSize: 12, color: '#7E8B97', fontWeight: '500'},
  filterTextActive: {color: '#FFFFFF'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  list: {padding: 16, gap: 10},
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {color: '#7E8B97'},
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 10,
  },
  cardTop: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
  patientName: {fontSize: 15, fontWeight: '600', color: '#1A2332'},
  meta: {fontSize: 12, color: '#7E8B97', marginTop: 2},
  badge: {borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start'},
  badgeText: {fontSize: 11, fontWeight: '600'},
  actions: {flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap'},
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4E929D',
  },
  secondaryBtnText: {fontSize: 12, color: '#4E929D', fontWeight: '600'},
  primaryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#4E929D',
  },
  primaryBtnText: {fontSize: 12, color: '#FFFFFF', fontWeight: '600'},
});
