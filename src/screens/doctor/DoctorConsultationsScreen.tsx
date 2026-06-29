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
import {
  doctorPortalApi,
  type DoctorAppointment,
  type DoctorFinance,
  type DoctorProfileDetail,
} from '../../api/doctorPortal';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {formatAppointmentDate, formatAppointmentStatus, statusColor} from './doctorNav';
import {openDoctorConsultation} from './doctorConsultationHelpers';
import {DoctorBottomNav} from './DoctorBottomNav';
import {formatBdt} from '../../utils/pharmacyHelpers';

type Props = NativeStackScreenProps<RootStackParamList, 'DConsultations'>;

type SetupRow = {
  key: string;
  icon: string;
  title: string;
  subtitle: string;
  tab: NonNullable<RootStackParamList['DEditProfile']>['initialTab'];
};

const SETUP_ROWS: SetupRow[] = [
  {key: 'education', icon: 'book', title: 'Education', subtitle: 'Qualifications & degrees', tab: 'qualifications'},
  {key: 'experience', icon: 'briefcase', title: 'Experience', subtitle: 'Work history', tab: 'experience'},
  {key: 'training', icon: 'award', title: 'Training', subtitle: 'Certifications & courses', tab: 'instructions'},
  {key: 'schedule', icon: 'calendar', title: 'Schedule', subtitle: 'Weekly availability', tab: 'availability'},
  {key: 'payment', icon: 'credit-card', title: 'Payment', subtitle: 'Payout methods', tab: 'payment'},
];

export function DoctorConsultationsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState<DoctorAppointment[]>([]);
  const [profile, setProfile] = useState<DoctorProfileDetail | null>(null);
  const [finance, setFinance] = useState<DoctorFinance | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [consultData, profileData, financeData] = await Promise.all([
        doctorPortalApi.consultations(),
        doctorPortalApi.getProfile(),
        doctorPortalApi.getFinance(),
      ]);
      setConsultations(consultData);
      setProfile(profileData);
      setFinance(financeData);
    } catch {
      setConsultations([]);
      setProfile(null);
      setFinance(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const wallet = finance?.wallet;

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.navigate('DProfile')} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#1A2332" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Consultations</Text>
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
          <View style={styles.financeRow}>
            <TouchableOpacity
              style={styles.earningsCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('DEarnings')}>
              <Text style={styles.cardLabel}>Total Earnings</Text>
              <Text style={styles.cardValue}>৳{formatBdt(wallet?.totalEarnings ?? 0)}</Text>
              <Text style={styles.cardSub}>
                {wallet?.completedConsultations ?? 0} completed consultations
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.withdrawCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('DWithdraw')}>
              <Text style={[styles.cardLabel, styles.withdrawCardLabel]}>Available to Withdraw</Text>
              <Text style={styles.withdrawValue}>৳{formatBdt(wallet?.availableBalance ?? 0)}</Text>
              <View style={styles.withdrawBtn}>
                <Text style={styles.withdrawBtnText}>Withdraw</Text>
                <Feather name="arrow-right" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Active Consultations</Text>
          {consultations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="message-circle" size={28} color="#C5CDD6" />
              <Text style={styles.emptyText}>No active consultations</Text>
            </View>
          ) : (
            consultations.map(appt => (
              <TouchableOpacity
                key={appt.id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => openDoctorConsultation(navigation, appt)}>
                <View style={styles.iconWrap}>
                  <Feather
                    name={appt.consultationType === 'CHAT' ? 'message-circle' : 'video'}
                    size={18}
                    color="#4E929D"
                  />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.name}>{appt.patient.fullName}</Text>
                  <Text style={styles.meta}>
                    {appt.consultationType} · {formatAppointmentDate(appt.scheduledDate)}
                  </Text>
                </View>
                <View style={[styles.badge, {backgroundColor: `${statusColor(appt.status)}18`}]}>
                  <Text style={[styles.badgeText, {color: statusColor(appt.status)}]}>
                    {formatAppointmentStatus(appt.status)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}

          <Text style={styles.sectionTitle}>Profile & Setup</Text>
          {SETUP_ROWS.map(row => {
            let countLabel = row.subtitle;
            if (row.key === 'education') countLabel = `${profile?.qualifications?.length ?? 0} qualifications`;
            if (row.key === 'experience') countLabel = `${profile?.experiences?.length ?? 0} roles`;
            if (row.key === 'training') countLabel = `${profile?.instructions?.length ?? 0} items`;
            if (row.key === 'schedule') {
              const active = profile?.weeklyAvailability?.filter(s => s.isActive).length ?? 0;
              countLabel = `${active} time blocks`;
            }
            if (row.key === 'payment') {
              countLabel = `${profile?.payoutMethods?.length ?? 0} payout methods`;
            }
            return (
              <TouchableOpacity
                key={row.key}
                style={styles.setupRow}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('DEditProfile', {initialTab: row.tab})}>
                <View style={styles.setupIcon}>
                  <Feather name={row.icon} size={18} color="#4E929D" />
                </View>
                <View style={styles.setupBody}>
                  <Text style={styles.setupTitle}>{row.title}</Text>
                  <Text style={styles.setupSub}>{countLabel}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#9AA6B2" />
              </TouchableOpacity>
            );
          })}

          <Text style={styles.sectionTitle}>Finance</Text>
          <TouchableOpacity
            style={styles.setupRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DEarnings')}>
            <View style={styles.setupIcon}>
              <Feather name="trending-up" size={18} color="#4E929D" />
            </View>
            <View style={styles.setupBody}>
              <Text style={styles.setupTitle}>Earnings History</Text>
              <Text style={styles.setupSub}>View all consultation payments</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#9AA6B2" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.setupRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DWithdraw')}>
            <View style={styles.setupIcon}>
              <Feather name="download" size={18} color="#4E929D" />
            </View>
            <View style={styles.setupBody}>
              <Text style={styles.setupTitle}>Withdraw</Text>
              <Text style={styles.setupSub}>
                ৳{formatBdt(wallet?.availableBalance ?? 0)} available
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#9AA6B2" />
          </TouchableOpacity>
        </ScrollView>
      )}

      <DoctorBottomNav activeTab="profile" bottomInset={insets.bottom} navigation={navigation} />
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
  financeRow: {flexDirection: 'row', gap: 10, marginBottom: 16},
  earningsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  withdrawCard: {
    flex: 1,
    backgroundColor: '#4E929D',
    borderRadius: 12,
    padding: 14,
  },
  withdrawCardLabel: {color: 'rgba(255,255,255,0.85)'},
  cardLabel: {fontSize: 11, color: '#7E8B97', fontWeight: '500'},
  cardValue: {fontSize: 20, fontWeight: '700', color: '#1A2332', marginTop: 4},
  cardSub: {fontSize: 11, color: '#7E8B97', marginTop: 4},
  withdrawValue: {fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginTop: 4},
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  withdrawBtnText: {fontSize: 11, fontWeight: '600', color: '#FFFFFF'},
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7E8B97',
    marginBottom: 8,
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  emptyText: {fontSize: 13, color: '#7E8B97'},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 8,
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {flex: 1},
  name: {fontSize: 14, fontWeight: '600', color: '#1A2332'},
  meta: {fontSize: 12, color: '#7E8B97', marginTop: 2},
  badge: {borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4},
  badgeText: {fontSize: 10, fontWeight: '600'},
  setupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 8,
    gap: 12,
  },
  setupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupBody: {flex: 1},
  setupTitle: {fontSize: 15, fontWeight: '600', color: '#1A2332'},
  setupSub: {fontSize: 12, color: '#7E8B97', marginTop: 2},
});
