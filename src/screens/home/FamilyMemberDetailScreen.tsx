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
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {profileApi, type FamilyMemberDetails} from '../../api/profile';
import {ApiError} from '../../api/client';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'FamilyMemberDetail'>;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function FamilyMemberDetailScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const {memberId, memberName} = route.params;
  const [data, setData] = useState<FamilyMemberDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDetails = useCallback(async () => {
    setLoading(true);
    try {
      const details = await profileApi.familyMemberDetails(memberId);
      setData(details);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load member';
      Alert.alert('Family member', message, [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } finally {
      setLoading(false);
    }
  }, [memberId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadDetails();
    }, [loadDetails]),
  );

  const patient = data?.user.patientProfile;
  const loginId = data?.user.email ?? data?.user.phone ?? '—';

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {memberName ?? data?.familyMember.name ?? 'Family Member'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0D9488" style={styles.loader} />
      ) : data ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + 24}]}>
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {data.familyMember.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.memberName}>{data.familyMember.name}</Text>
            <Text style={styles.memberRelation}>{data.familyMember.relationship}</Text>
            <Text style={styles.memberMeta}>
              {[
                patient?.age != null ? `Age ${patient.age}` : null,
                patient?.gender,
                patient?.bloodGroup ? `Blood ${patient.bloodGroup}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
            <Text style={styles.memberLogin}>Login: {loginId}</Text>
            {data.defaultAddress ? (
              <Text style={styles.memberAddress}>📍 {data.defaultAddress.formattedAddress}</Text>
            ) : null}
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{data.medicationCount}</Text>
              <Text style={styles.metricLabel}>Medications</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{data.reports.length}</Text>
              <Text style={styles.metricLabel}>Reports</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{data.appointments.length}</Text>
              <Text style={styles.metricLabel}>Appointments</Text>
            </View>
          </View>

          {(data.healthVitals.bloodPressure || data.healthVitals.oxygen) && (
            <>
              <Text style={styles.sectionTitle}>Health Vitals</Text>
              <View style={styles.sectionCard}>
                {data.healthVitals.bloodPressure ? (
                  <View style={styles.rowItem}>
                    <Text style={styles.rowLabel}>Blood Pressure</Text>
                    <Text style={styles.rowValue}>{data.healthVitals.bloodPressure.value}</Text>
                  </View>
                ) : null}
                {data.healthVitals.oxygen ? (
                  <View style={styles.rowItem}>
                    <Text style={styles.rowLabel}>Oxygen</Text>
                    <Text style={styles.rowValue}>{data.healthVitals.oxygen.value}</Text>
                  </View>
                ) : null}
              </View>
            </>
          )}

          {data.nextAppointment ? (
            <>
              <Text style={styles.sectionTitle}>Next Appointment</Text>
              <View style={styles.sectionCard}>
                <Text style={styles.itemTitle}>
                  {data.nextAppointment.doctor.user.fullName}
                </Text>
                <Text style={styles.itemSub}>
                  {formatDate(data.nextAppointment.scheduledDate)} ·{' '}
                  {data.nextAppointment.timeSlot}
                </Text>
              </View>
            </>
          ) : null}

          <Text style={styles.sectionTitle}>Medications</Text>
          <View style={styles.sectionCard}>
            {data.medications.length === 0 ? (
              <Text style={styles.emptyText}>No medications recorded.</Text>
            ) : (
              data.medications.map(med => (
                <View key={med.id} style={styles.listItem}>
                  <FontAwesome name="medkit" size={16} color="#0D9488" />
                  <View style={styles.listItemBody}>
                    <Text style={styles.itemTitle}>{med.medicineName}</Text>
                    <Text style={styles.itemSub}>
                      {[med.dose, med.instruction].filter(Boolean).join(' · ') || '—'}
                    </Text>
                    {!med.isActive ? (
                      <Text style={styles.inactiveTag}>Inactive</Text>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </View>

          <Text style={styles.sectionTitle}>Reports</Text>
          <View style={styles.sectionCard}>
            {data.reports.length === 0 ? (
              <Text style={styles.emptyText}>No health reports yet.</Text>
            ) : (
              data.reports.map(report => (
                <View key={report.id} style={styles.listItem}>
                  <Feather name="file-text" size={16} color="#475569" />
                  <View style={styles.listItemBody}>
                    <Text style={styles.itemTitle}>{report.title}</Text>
                    <Text style={styles.itemSub}>
                      {report.reportType} · {formatDate(report.reportDate)}
                      {report.provider ? ` · ${report.provider}` : ''}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <Text style={styles.sectionTitle}>Appointments</Text>
          <View style={styles.sectionCard}>
            {data.appointments.length === 0 ? (
              <Text style={styles.emptyText}>No appointments yet.</Text>
            ) : (
              data.appointments.map(appt => (
                <View key={appt.id} style={styles.listItem}>
                  <Feather name="calendar" size={16} color="#0284C7" />
                  <View style={styles.listItemBody}>
                    <Text style={styles.itemTitle}>{appt.doctor.user.fullName}</Text>
                    <Text style={styles.itemSub}>
                      {formatDate(appt.scheduledDate)} · {appt.timeSlot} · {appt.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {patient?.conditions?.length ? (
            <>
              <Text style={styles.sectionTitle}>Conditions</Text>
              <View style={styles.chipsRow}>
                {patient.conditions.map(c => (
                  <View key={c} style={styles.chip}>
                    <Text style={styles.chipText}>{c}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F6F8FA'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {padding: 4, width: 32},
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerSpacer: {width: 32},
  loader: {marginTop: 40},
  scrollContent: {paddingHorizontal: 16, paddingTop: 16},
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarInitial: {fontSize: 24, fontFamily: FONT.semibold, fontWeight: '600', color: '#475569'},
  memberName: {fontSize: 20, fontFamily: FONT.semibold, fontWeight: '600', color: '#1E293B'},
  memberRelation: {fontSize: 13, color: '#0D9488', fontFamily: FONT.semibold, fontWeight: '600', marginTop: 2},
  memberMeta: {fontSize: 12, color: '#64748B', marginTop: 6},
  memberLogin: {fontSize: 12, color: '#475569', marginTop: 4, fontFamily: FONT.medium, fontWeight: '500'},
  memberAddress: {fontSize: 11, color: '#64748B', marginTop: 6, textAlign: 'center'},
  metricsRow: {flexDirection: 'row', gap: 10, marginBottom: 8},
  metricBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    alignItems: 'center',
  },
  metricValue: {fontSize: 18, fontFamily: FONT.semibold, fontWeight: '600', color: '#0D9488'},
  metricLabel: {fontSize: 10, color: '#64748B', marginTop: 2},
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {fontSize: 13, color: '#64748B'},
  rowValue: {fontSize: 14, fontFamily: FONT.semibold, fontWeight: '600', color: '#1E293B'},
  listItem: {flexDirection: 'row', alignItems: 'flex-start', gap: 10},
  listItemBody: {flex: 1},
  itemTitle: {fontSize: 14, fontFamily: FONT.semibold, fontWeight: '600', color: '#1E293B'},
  itemSub: {fontSize: 12, color: '#64748B', marginTop: 2},
  inactiveTag: {fontSize: 10, color: '#EF4444', marginTop: 2, fontFamily: FONT.semibold, fontWeight: '600'},
  emptyText: {fontSize: 13, color: '#94A3B8', paddingVertical: 4},
  chipsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  chip: {
    backgroundColor: '#FFEBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: {fontSize: 11, fontFamily: FONT.semibold, fontWeight: '600', color: '#EF4444'},
});
