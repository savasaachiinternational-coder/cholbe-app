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
import {doctorPortalApi, type DoctorPatientRow} from '../../api/doctorPortal';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {DoctorBottomNav} from './DoctorBottomNav';
import {formatAppointmentDate, formatAppointmentStatus, statusColor} from './doctorNav';

type Props = NativeStackScreenProps<RootStackParamList, 'DPatients'>;

export function DoctorPatientsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<DoctorPatientRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await doctorPortalApi.patients();
      setPatients(data);
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.navigate('DHome')} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#1A2332" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Patients</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4E929D" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, {paddingBottom: insets.bottom + 80}]}
          showsVerticalScrollIndicator={false}>
          {patients.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="users" size={32} color="#C5CDD6" />
              <Text style={styles.emptyTitle}>No patients yet</Text>
              <Text style={styles.emptyText}>Patients appear here after they book with you.</Text>
            </View>
          ) : (
            patients.map(row => (
              <View key={row.patient.id} style={styles.card}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {row.patient.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.name}>{row.patient.fullName}</Text>
                  <Text style={styles.meta}>
                    {row.patient.phone || row.patient.email || 'No contact'}
                  </Text>
                  {row.patient.patientProfile ? (
                    <Text style={styles.meta}>
                      {[
                        row.patient.patientProfile.age ? `${row.patient.patientProfile.age} yrs` : null,
                        row.patient.patientProfile.gender,
                        row.patient.patientProfile.bloodGroup,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'Profile incomplete'}
                    </Text>
                  ) : null}
                  <View style={styles.footer}>
                    <Text style={styles.footerText}>
                      {row.appointmentCount} appointment{row.appointmentCount === 1 ? '' : 's'}
                    </Text>
                    <Text style={styles.footerText}>
                      Last: {formatAppointmentDate(row.lastAppointmentDate)}
                    </Text>
                  </View>
                  <View style={[styles.badge, {backgroundColor: `${statusColor(row.lastStatus)}18`}]}>
                    <Text style={[styles.badgeText, {color: statusColor(row.lastStatus)}]}>
                      {formatAppointmentStatus(row.lastStatus)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <DoctorBottomNav activeTab="patients" bottomInset={insets.bottom} navigation={navigation} />
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
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  list: {padding: 16},
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {fontSize: 16, fontWeight: '600', color: '#1A2332'},
  emptyText: {fontSize: 13, color: '#7E8B97', textAlign: 'center'},
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {fontSize: 18, fontWeight: '700', color: '#4E929D'},
  cardBody: {flex: 1},
  name: {fontSize: 15, fontWeight: '600', color: '#1A2332'},
  meta: {fontSize: 12, color: '#7E8B97', marginTop: 2},
  footer: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 8},
  footerText: {fontSize: 11, color: '#9AA6B2'},
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
  },
  badgeText: {fontSize: 11, fontWeight: '600'},
});
