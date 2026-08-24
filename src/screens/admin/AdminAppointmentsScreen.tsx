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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {adminApi, type AdminAppointment} from '../../api/admin';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'AAppointments'>;

const STATUS_FILTERS = ['All', 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#3B82F6',
  confirmed: '#0D9488',
  in_progress: '#F59E0B',
  completed: '#10B981',
  cancelled: '#EF4444',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function StarRow({rating}: {rating: number}) {
  return (
    <View style={{flexDirection: 'row'}}>
      {[1, 2, 3, 4, 5].map(i => (
        <FontAwesome key={i} name="star" size={10} color={i <= rating ? '#FBBF24' : '#CBD5E1'} style={{marginRight: 1}} />
      ))}
    </View>
  );
}

export function AdminAppointmentsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>('All');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.appointments(filter === 'All' ? undefined : filter);
      setItems(data);
    } catch (err) {
      Alert.alert('Appointments', err instanceof ApiError ? err.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useFocusEffect(useCallback(() => {load();}, [load]));

  const updateStatus = (appt: AdminAppointment, newStatus: string) => {
    Alert.alert('Update Status', `Mark as "${newStatus}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await adminApi.updateAppointmentStatus(appt.id, newStatus);
            load();
          } catch (err) {
            Alert.alert('Error', err instanceof ApiError ? err.message : 'Failed');
          }
        },
      },
    ]);
  };

  const nextStatus = (current: string) => {
    const map: Record<string, string> = {
      scheduled: 'confirmed',
      confirmed: 'in_progress',
      in_progress: 'completed',
    };
    return map[current];
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Appointments</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f === 'All' ? 'All' : f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 100}]}>
        {loading ? (
          <ActivityIndicator color="#0D9488" style={{marginTop: 32}} />
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>No appointments found.</Text>
        ) : (
          items.map(appt => {
            const statusColor = STATUS_COLORS[appt.status] ?? '#94A3B8';
            const next = nextStatus(appt.status);
            return (
              <View key={appt.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, {backgroundColor: statusColor + '20', borderColor: statusColor}]}>
                    <Text style={[styles.statusText, {color: statusColor}]}>
                      {appt.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.typeText}>{appt.consultationType}</Text>
                </View>

                <View style={styles.row}>
                  <Feather name="user" size={14} color="#64748B" />
                  <Text style={styles.rowText}>
                    <Text style={styles.bold}>Patient: </Text>
                    {appt.patient.fullName}
                    {appt.patient.phone ? ` • ${appt.patient.phone}` : ''}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Feather name="activity" size={14} color="#64748B" />
                  <Text style={styles.rowText}>
                    <Text style={styles.bold}>Doctor: </Text>
                    {appt.doctor.user.fullName} ({appt.doctor.specialty})
                  </Text>
                </View>

                <View style={styles.row}>
                  <Feather name="calendar" size={14} color="#64748B" />
                  <Text style={styles.rowText}>
                    {formatDate(appt.scheduledDate)} • {appt.timeSlot} • {appt.durationMin} min
                  </Text>
                </View>

                <View style={styles.row}>
                  <Feather name="credit-card" size={14} color="#64748B" />
                  <Text style={styles.rowText}>Fee: ৳{appt.fee}</Text>
                </View>

                {appt.feedback ? (
                  <View style={styles.feedbackRow}>
                    <StarRow rating={appt.feedback.rating} />
                    {appt.feedback.comment ? (
                      <Text style={styles.feedbackComment} numberOfLines={1}>
                        "{appt.feedback.comment}"
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                {next ? (
                  <TouchableOpacity
                    style={styles.advanceBtn}
                    onPress={() => updateStatus(appt, next)}>
                    <Text style={styles.advanceBtnText}>
                      Mark as {next.replace('_', ' ')}
                    </Text>
                    <Feather name="arrow-right" size={14} color="#0D9488" />
                  </TouchableOpacity>
                ) : null}

                {appt.status !== 'cancelled' && appt.status !== 'completed' ? (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => updateStatus(appt, 'cancelled')}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      <AdminBottomNav activeTab="home" bottomInset={insets.bottom} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconBtn: {width: 32, alignItems: 'center'},
  title: {flex: 1, textAlign: 'center', fontSize: 18, fontFamily: FONT.semibold, fontWeight: '600', color: '#1E293B'},
  filterBar: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexGrow: 0,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  chipActive: {backgroundColor: '#0D9488'},
  chipText: {fontSize: 11, fontFamily: FONT.semibold, fontWeight: '600', color: '#475569'},
  chipTextActive: {color: '#FFF'},
  content: {padding: 16},
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10},
  statusBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {fontSize: 10, fontFamily: FONT.semibold, fontWeight: '600'},
  typeText: {fontSize: 11, color: '#64748B', fontFamily: FONT.medium, fontWeight: '500'},
  row: {flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 6},
  rowText: {fontSize: 13, color: '#475569', flex: 1},
  bold: {fontFamily: FONT.semibold,fontWeight: '600', color: '#1E293B'},
  feedbackRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 2},
  feedbackComment: {fontSize: 11, color: '#64748B', fontStyle: 'italic', flex: 1},
  advanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#0D9488',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 10,
  },
  advanceBtnText: {fontSize: 13, fontFamily: FONT.semibold, fontWeight: '600', color: '#0D9488'},
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 6,
    marginTop: 6,
  },
  cancelBtnText: {fontSize: 12, color: '#EF4444', fontFamily: FONT.medium, fontWeight: '500'},
  emptyText: {textAlign: 'center', color: '#94A3B8', marginTop: 40},
});
