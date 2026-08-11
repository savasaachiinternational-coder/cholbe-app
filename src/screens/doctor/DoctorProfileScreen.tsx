import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {doctorPortalApi, type DoctorDashboard} from '../../api/doctorPortal';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {DoctorBottomNav} from './DoctorBottomNav';
import {performLogout} from '../../auth/sessionControl';
import {confirmAndDeleteAccount} from '../../auth/deleteAccount';

type Props = NativeStackScreenProps<RootStackParamList, 'DProfile'>;

export function DoctorProfileScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DoctorDashboard | null>(null);
  const [togglingOnline, setTogglingOnline] = useState(false);

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

  const toggleOnline = async (value: boolean) => {
    setTogglingOnline(true);
    try {
      const updated = await doctorPortalApi.updateProfile({isOnline: value});
      setDashboard(prev =>
        prev ? {...prev, doctor: {...prev.doctor, isOnline: updated.isOnline}} : prev,
      );
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not update status';
      Alert.alert('Error', msg);
    } finally {
      setTogglingOnline(false);
    }
  };

  const doctor = dashboard?.doctor;
  const stats = dashboard?.stats;

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.editBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('DEditProfile')}>
          <Feather name="edit-2" size={16} color="#4E929D" />
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4E929D" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 80}]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(doctor?.user.fullName ?? 'D').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.name}>{doctor?.user.fullName ?? 'Doctor'}</Text>
            <Text style={styles.specialty}>{doctor?.specialty ?? '—'}</Text>
            {doctor?.degree ? (
              <Text style={styles.degree}>{doctor.degree}</Text>
            ) : null}
            <Text style={styles.contact}>{doctor?.user.email ?? '—'}</Text>
            <Text style={styles.contact}>{doctor?.user.phone ?? '—'}</Text>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Consultation fee</Text>
              <Text style={styles.feeValue}>৳{doctor?.fee ?? '—'}</Text>
            </View>
            {doctor?.bio ? (
              <Text style={styles.experience}>{doctor.bio}</Text>
            ) : null}
            {doctor?.chamberAddress ? (
              <Text style={styles.chamber}>{doctor.chamberAddress}</Text>
            ) : null}
            {(doctor?.qualifications?.length ?? 0) > 0 ? (
              <View style={styles.qualList}>
                {doctor!.qualifications!.map((q, i) => (
                  <Text key={`${q.degree}-${i}`} style={styles.qualItem}>
                    {q.degree} — {q.institution}
                    {q.yearTo ? ` (${q.yearTo})` : ''}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.onlineRow}>
            <View>
              <Text style={styles.onlineTitle}>Available for consultations</Text>
              <Text style={styles.onlineSub}>
                {doctor?.isOnline ? 'Patients can book with you' : 'You appear offline'}
              </Text>
            </View>
            <Switch
              value={doctor?.isOnline ?? false}
              onValueChange={v => void toggleOnline(v)}
              disabled={togglingOnline}
              trackColor={{false: '#D8DEE6', true: '#A8D4DB'}}
              thumbColor={doctor?.isOnline ? '#4E929D' : '#F4F4F4'}
            />
          </View>

          <Text style={styles.sectionTitle}>Practice Management</Text>
          <ManageRow
            icon="users"
            title="Manage Patients"
            subtitle={`${stats?.totalPatients ?? 0} patients`}
            onPress={() => navigation.navigate('DPatients')}
          />
          <ManageRow
            icon="calendar"
            title="Manage Appointments"
            subtitle={`${stats?.upcomingAppointments ?? 0} upcoming`}
            onPress={() => navigation.navigate('DAppointments')}
          />
          <ManageRow
            icon="message-circle"
            title="Manage Consultations"
            subtitle={`${stats?.activeConsultations ?? 0} active · setup & earnings`}
            onPress={() => navigation.navigate('DConsultations')}
          />

          {(doctor?.earnings?.total ?? 0) > 0 || (doctor?.earnings?.availableBalance ?? 0) > 0 ? (
            <View style={styles.earningsBanner}>
              <View>
                <Text style={styles.earningsBannerLabel}>Available earnings</Text>
                <Text style={styles.earningsBannerValue}>
                  ৳{doctor?.earnings?.availableBalance ?? doctor?.earnings?.total ?? 0}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.earningsBannerBtn}
                onPress={() => navigation.navigate('DWithdraw')}>
                <Text style={styles.earningsBannerBtnText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Account</Text>
          <ManageRow
            icon="bell"
            title="Notifications"
            subtitle="View alerts and updates"
            onPress={() => navigation.navigate('Notifications')}
          />
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert('Log out', 'Are you sure you want to log out?', [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Log out', style: 'destructive', onPress: () => void performLogout()},
              ]);
            }}>
            <Feather name="log-out" size={16} color="#C62828" />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteAccountBtn}
            activeOpacity={0.7}
            onPress={confirmAndDeleteAccount}>
            <Feather name="trash-2" size={16} color="#C62828" />
            <Text style={styles.logoutText}>Delete account</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <DoctorBottomNav activeTab="profile" bottomInset={insets.bottom} navigation={navigation} />
    </View>
  );
}

function ManageRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.manageRow} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.manageIcon}>
        <Feather name={icon} size={18} color="#4E929D" />
      </View>
      <View style={styles.manageBody}>
        <Text style={styles.manageTitle}>{title}</Text>
        <Text style={styles.manageSub}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={18} color="#9AA6B2" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA'},
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {fontSize: 20, fontWeight: '700', color: '#1A2332'},
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4E929D',
  },
  editBtnText: {fontSize: 12, fontWeight: '600', color: '#4E929D'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  content: {padding: 16, gap: 10},
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {fontSize: 28, fontWeight: '700', color: '#4E929D'},
  name: {fontSize: 20, fontWeight: '700', color: '#1A2332'},
  specialty: {fontSize: 14, color: '#4E929D', marginTop: 4},
  degree: {fontSize: 13, color: '#7E8B97', marginTop: 4},
  contact: {fontSize: 13, color: '#7E8B97', marginTop: 4},
  feeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  feeLabel: {fontSize: 13, color: '#7E8B97'},
  feeValue: {fontSize: 15, fontWeight: '600', color: '#1A2332'},
  experience: {fontSize: 12, color: '#9AA6B2', marginTop: 8, textAlign: 'center'},
  chamber: {fontSize: 12, color: '#7E8B97', marginTop: 6, textAlign: 'center'},
  qualList: {marginTop: 10, gap: 4, alignSelf: 'stretch'},
  qualItem: {fontSize: 12, color: '#7E8B97', textAlign: 'center'},
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  onlineTitle: {fontSize: 14, fontWeight: '600', color: '#1A2332'},
  onlineSub: {fontSize: 12, color: '#7E8B97', marginTop: 2},
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7E8B97',
    marginTop: 8,
    marginBottom: 2,
    marginLeft: 4,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    gap: 12,
  },
  manageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageBody: {flex: 1},
  manageTitle: {fontSize: 15, fontWeight: '600', color: '#1A2332'},
  manageSub: {fontSize: 12, color: '#7E8B97', marginTop: 2},
  earningsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F4F6',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#B8DDE4',
  },
  earningsBannerLabel: {fontSize: 12, color: '#7E8B97'},
  earningsBannerValue: {fontSize: 20, fontWeight: '700', color: '#1A2332', marginTop: 2},
  earningsBannerBtn: {
    backgroundColor: '#4E929D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  earningsBannerBtnText: {fontSize: 12, fontWeight: '600', color: '#FFFFFF'},
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutText: {fontSize: 14, fontWeight: '600', color: '#C62828'},
});
