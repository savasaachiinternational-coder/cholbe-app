import {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Platform,
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
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {
  PROFILE_SUB_TABS,
  QUICK_ACTIONS,
  type ProfileSubTabKey,
  type QuickAction,
} from './profileData';
import {profileApi, type ProfileOverview} from '../../api/profile';
import {ApiError} from '../../api/client';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - 44) / 2;

type Props = NativeStackScreenProps<RootStackParamList, 'MyProfile'>;

const PROFILE_AVATAR = require('../../assets/b1.png');
const DOCTOR_AVATAR = require('../../assets/b2.png');

export function MyProfileScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeProfileTab, setActiveProfileTab] =
    useState<ProfileSubTabKey>('overview');
  const [overview, setOverview] = useState<ProfileOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await profileApi.overview();
      setOverview(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load profile';
      Alert.alert('Profile', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const user = overview?.user;
  const patient = user?.patientProfile;
  const doctorName =
    overview?.assignedDoctor?.user.fullName ??
    overview?.nextAppointment?.doctor.user.fullName ??
    'Book a doctor';
  const specialty =
    overview?.assignedDoctor?.specialty ??
    overview?.nextAppointment?.doctor.specialty ??
    'Video consultation';
  const appointmentId = overview?.nextAppointment?.id;
  const assignedDoctorId =
    overview?.nextAppointment?.doctor.id ?? overview?.assignedDoctor?.id;

  const demographics = useMemo(() => {
    const parts = [
      patient?.age != null ? `Age : ${patient.age}` : null,
      patient?.gender ? patient.gender : null,
      patient?.bloodGroup ? `Blood Group: ${patient.bloodGroup}` : null,
    ].filter(Boolean);
    return parts.join('  •  ') || 'Complete your health profile';
  }, [patient]);

  const location =
    overview?.defaultAddress?.formattedAddress ?? 'Add delivery address';
  const conditions = patient?.conditions ?? [];
  const emergencyContacts = patient?.emergencyContacts ?? [];
  const familyMembers = patient?.familyMembers ?? [];
  const medicationCount = overview?.medicationCount ?? 0;

  const healthSummary = useMemo(() => {
    const items = [];
    if (overview?.latestReport) {
      items.push({
        id: 'report',
        label: 'Latest Report',
        value: overview.latestReport.title,
        sub: new Date(overview.latestReport.reportDate).toLocaleDateString('en-GB'),
      });
    }
    if (overview?.nextAppointment) {
      items.push({
        id: 'appt',
        label: 'Next Appointment',
        value: new Date(overview.nextAppointment.scheduledDate).toLocaleDateString('en-GB'),
        sub: overview.nextAppointment.timeSlot,
      });
    }
    return items;
  }, [overview]);

  const openChat = () => {
    navigation.navigate('ConsultationChat', {
      doctorName,
      specialty,
      appointmentId,
    });
  };

  const bookAppointment = () => {
    if (assignedDoctorId) {
      navigation.navigate('BookVideoCall', {
        doctorId: assignedDoctorId,
        doctorName,
        specialty,
        consultationFee: 'BDT 800',
      });
      return;
    }
    navigation.navigate('DoctorList');
  };

  const dialPhone = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  const smsPhone = (phone: string) => {
    Linking.openURL(`sms:${phone.replace(/\s/g, '')}`);
  };

  if (loading && !overview) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

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
      return;
    }
    navigation.navigate('Home');
  };

  const onQuickAction = (action: QuickAction) => {
    if (action.id === 'medications') {
      navigation.navigate('MedicineList');
      return;
    }
    if (action.id === 'upload') {
      navigation.navigate('ReportsList');
    }
  };

  const onProfileSubTabPress = (key: ProfileSubTabKey) => {
    const tab = PROFILE_SUB_TABS.find(t => t.key === key);
    if (tab?.route) {
      navigation.navigate(tab.route);
      return;
    }
    setActiveProfileTab('overview');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.editProfileTopButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('EditProfile')}>
          <Feather
            name="edit-2"
            size={14}
            color="#475569"
            style={styles.editIconMargin}
          />
          <Text style={styles.editProfileTopText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSubTabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          style={styles.profileSubTabsScroll}
          contentContainerStyle={styles.profileSubTabsContent}>
          {PROFILE_SUB_TABS.map(tab => {
            const active = activeProfileTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.profileSubTab,
                  active && styles.profileSubTabActive,
                ]}
                activeOpacity={0.85}
                onPress={() => onProfileSubTabPress(tab.key)}>
                <Text
                  style={[
                    styles.profileSubTabText,
                    active && styles.profileSubTabTextActive,
                  ]}
                  numberOfLines={1}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 110},
        ]}>
        <View style={styles.profileBioSection}>
          <View style={styles.avatarWrapper}>
            <Image source={PROFILE_AVATAR} style={styles.profileAvatar} />
            <View style={styles.avatarCameraBadge}>
              <Feather name="camera" size={12} color="#0D9488" />
            </View>
          </View>

          <View style={styles.bioTextContainer}>
            <Text style={styles.userNameText}>{user?.fullName ?? '—'}</Text>
            <Text style={styles.userDemographicsText}>{demographics}</Text>
            <Text style={styles.userMetaRow}>📍 {location}</Text>
            <Text style={styles.userMetaRow}>📞 {user?.phone ?? '—'}</Text>
            <Text style={styles.userMetaRow}>✉️ {user?.email ?? '—'}</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.summaryHorizontalScroll}
          contentContainerStyle={styles.summaryScrollContent}>
          <View style={styles.summaryMetricsCard}>
            <View style={styles.summaryCardHeader}>
              <Feather name="heart" size={16} color="#E11D48" />
              <Text style={styles.summaryCardTitle}>Medical Conditions</Text>
              <Feather
                name="chevron-right"
                size={16}
                color="#94A3B8"
                style={styles.summaryCardArrow}
              />
            </View>
            <View style={styles.chipsRowGrid}>
              {conditions.map(condition => (
                <View key={condition} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{condition}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.summaryMetricsCard}>
            <View style={styles.summaryCardHeader}>
              <FontAwesome name="medkit" size={16} color="#0D9488" />
              <Text style={styles.summaryCardTitle}>Current Medications</Text>
              <Feather
                name="chevron-right"
                size={16}
                color="#94A3B8"
                style={styles.summaryCardArrow}
              />
            </View>
            <Text style={styles.medicationQuantityText}>
              {medicationCount} Active Medication{medicationCount === 1 ? '' : 's'}
            </Text>
            <TouchableOpacity
              style={styles.viewDetailsChipLink}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('MedicineList')}>
              <Text style={styles.viewDetailsChipText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Text style={styles.sectionTitleLabel}>Assigned Doctor</Text>
        <View style={styles.assignedDoctorCard}>
          <Image source={DOCTOR_AVATAR} style={styles.doctorAvatarThumb} />
          <View style={styles.doctorCardMeta}>
            <Text style={styles.doctorCardNameText}>{doctorName}</Text>
            <Text style={styles.doctorCardSpecText}>{specialty}</Text>
          </View>
          <View style={styles.doctorActionButtonsRow}>
            <TouchableOpacity
              style={styles.doctorInlineChatButton}
              activeOpacity={0.8}
              onPress={openChat}>
              <Text style={styles.doctorInlineChatText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.doctorInlineBookButton}
              activeOpacity={0.8}
              onPress={bookAppointment}>
              <Text style={styles.doctorInlineBookText}>Book Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionTitleHeaderRow}>
          <Text style={styles.sectionTitleLabelNoMargin}>Emergency Contract</Text>
          <TouchableOpacity style={styles.sectionInlineEditRow} activeOpacity={0.7}>
            <Feather name="edit-2" size={12} color="#64748B" />
            <Text style={styles.sectionInlineEditText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emergencyContractsContainer}>
          {emergencyContacts.map((contact, index) => (
            <View
              key={contact.id}
              style={[
                styles.emergencyContactCardRow,
                index === emergencyContacts.length - 1 &&
                  styles.emergencyContactRowLast,
              ]}>
              <View style={styles.contactAvatarPlaceholder}>
                <Text style={styles.contactAvatarInitial}>
                  {contact.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.contactBaseMeta}>
                <Text style={styles.contactNameTitle}>{contact.name}</Text>
                <Text style={styles.contactRelationLabel}>
                  {contact.relation}
                </Text>
              </View>
              <Text style={styles.contactPhoneText}>{contact.phone}</Text>
              <View style={styles.contactActionButtonsGroup}>
                <TouchableOpacity
                  style={styles.contactCallButton}
                  activeOpacity={0.8}
                  onPress={() => dialPhone(contact.phone)}>
                  <Feather name="phone" size={12} color="#475569" />
                  <Text style={styles.contactActionText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.contactCallButton}
                  activeOpacity={0.8}
                  onPress={() => smsPhone(contact.phone)}>
                  <Feather name="message-square" size={12} color="#475569" />
                  <Text style={styles.contactActionText}>SMS</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addContractButton} activeOpacity={0.9}>
            <Feather
              name="plus"
              size={16}
              color="#FFFFFF"
              style={styles.plusIconMargin}
            />
            <Text style={styles.addContractButtonText}>
              Add Emergency Contract
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionTitleHeaderRow}>
          <Text style={styles.sectionTitleLabelNoMargin}>Family Members</Text>
          <TouchableOpacity
            style={styles.sectionInlineEditRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddFamilyMember')}>
            <Feather name="edit-2" size={12} color="#64748B" />
            <Text style={styles.sectionInlineEditText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.familyCarouselScroll}
          contentContainerStyle={styles.familyScrollContent}>
          {familyMembers.map(member => (
            <View key={member.id} style={styles.familyAvatarCard}>
              <View style={styles.familyAvatarPlaceholder}>
                <Text style={styles.familyAvatarInitial}>
                  {member.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.familyMemberMeta}>
                <Text style={styles.familyMemberName} numberOfLines={1}>
                  {member.name}
                </Text>
                <Text style={styles.familyMemberRelation}>
                  {member.relationship}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.profileActionsRow}>
          <TouchableOpacity
            style={styles.profileActionButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('ConsultationSummary', {
                doctorName,
                specialty,
              })
            }>
            <Feather name="file-text" size={18} color="#0D9488" />
            <Text style={styles.profileActionButtonText}>
              Consultation Summary
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileActionButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MyAppointment')}>
            <Feather name="calendar" size={18} color="#0D9488" />
            <Text style={styles.profileActionButtonText}>My Appointment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.healthSummaryHeaderRow}>
          <Text style={styles.sectionTitleLabelNoMargin}>Health Summary</Text>
          <TouchableOpacity
            style={styles.viewAllRowLink}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ReportsList')}>
            <Text style={styles.viewAllTextLink}>View All Reports</Text>
            <Feather name="chevron-right" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryGridContainer}>
          {healthSummary.length === 0 ? (
            <Text style={styles.emptySummaryText}>
              No health summary yet. Upload a report or book a consultation.
            </Text>
          ) : (
            healthSummary.map(item => (
              <View key={item.id} style={styles.gridSummaryCard}>
                <Feather name="calendar" size={20} color="#1E293B" />
                <Text style={styles.gridSummaryLabel}>{item.label}</Text>
                <Text style={styles.gridSummaryValue}>{item.value}</Text>
                <Text style={styles.gridSummarySub}>{item.sub}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitleLabel}>Quick Actions</Text>
        <View style={styles.summaryGridContainer}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionGridRowButton}
              activeOpacity={0.85}
              onPress={() => onQuickAction(action)}>
              <View style={styles.actionIconContainer}>
                <QuickActionIcon type={action.icon} />
              </View>
              <View style={styles.actionButtonTextMeta}>
                <Text style={styles.actionButtonTitleText}>{action.title}</Text>
                <Text style={styles.actionButtonSubText}>{action.subtitle}</Text>
              </View>
              <Feather
                name="chevron-right"
                size={16}
                color="#64748B"
                style={styles.actionArrowIconRight}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitleLabel}>App Settings</Text>
        <View style={styles.settingsSubmenuContainer}>
          <TouchableOpacity
            style={styles.settingsRowItem}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Notifications')}>
            <View style={[styles.settingsIconWrapper, styles.notifIconBg]}>
              <Feather name="bell" size={20} color="#0284C7" />
            </View>
            <View style={styles.settingsTextContent}>
              <Text style={styles.settingsTitleText}>Notifications</Text>
              <Text style={styles.settingsSubText}>
                Manage reminders and alerts
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.settingsInnerSeparatorLine} />

          <TouchableOpacity style={styles.settingsRowItem} activeOpacity={0.8}>
            <View style={[styles.settingsIconWrapper, styles.langIconBg]}>
              <Feather name="globe" size={20} color="#475569" />
            </View>
            <View style={styles.settingsTextContent}>
              <Text style={styles.settingsTitleText}>Language</Text>
              <Text style={styles.settingsSubText}>English</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
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

function QuickActionIcon({type}: {type: QuickAction['icon']}) {
  if (type === 'medications') {
    return <FontAwesome name="medkit" size={20} color="#0D9488" />;
  }
  if (type === 'upload') {
    return <Feather name="upload-cloud" size={20} color="#1E293B" />;
  }
  if (type === 'passport') {
    return <Feather name="activity" size={20} color="#0D9488" />;
  }
  return <Feather name="shield" size={20} color="#0D9488" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  profileSubTabsWrap: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    minHeight: 56,
    justifyContent: 'center',
  },
  profileSubTabsScroll: {
    flexGrow: 0,
  },
  profileSubTabsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  profileSubTab: {
    paddingHorizontal: 16,
    minHeight: 36,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSubTabActive: {
    backgroundColor: '#408E91',
  },
  profileSubTabText: {
    fontSize: 13,
    lineHeight: Platform.OS === 'android' ? 18 : undefined,
    fontWeight: '600',
    color: '#64748B',
    ...(Platform.OS === 'android' ? {includeFontPadding: false} : {}),
  },
  profileSubTabTextActive: {
    color: '#FFFFFF',
  },
  headerIconButton: {
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
  editProfileTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editIconMargin: {
    marginRight: 4,
  },
  editProfileTopText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  profileBioSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  profileAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#CBD5E1',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E6F4F1',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bioTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  userDemographicsText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 4,
  },
  userMetaRow: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  summaryHorizontalScroll: {
    marginVertical: 8,
    marginHorizontal: -16,
  },
  summaryScrollContent: {
    paddingHorizontal: 16,
  },
  summaryMetricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    width: SCREEN_WIDTH * 0.58,
    marginRight: 12,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  summaryCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 6,
    paddingRight: 16,
    flex: 1,
  },
  summaryCardArrow: {
    position: 'absolute',
    right: 0,
  },
  chipsRowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    backgroundColor: '#FFEBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
  },
  medicationQuantityText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  viewDetailsChipLink: {
    backgroundColor: '#E6F4F1',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  viewDetailsChipText: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '600',
  },
  sectionTitleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitleLabelNoMargin: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  sectionTitleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  healthSummaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionInlineEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionInlineEditText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  assignedDoctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatarThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#CBD5E1',
  },
  doctorCardMeta: {
    marginLeft: 12,
    flex: 1,
    minWidth: 0,
  },
  doctorCardNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  doctorCardSpecText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  doctorActionButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 0,
  },
  doctorInlineChatButton: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  doctorInlineChatText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  doctorInlineBookButton: {
    backgroundColor: '#408E91',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  doctorInlineBookText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emergencyContractsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
  },
  emergencyContactCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  emergencyContactRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  contactAvatarThumb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  contactAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  contactBaseMeta: {
    marginLeft: 10,
    width: SCREEN_WIDTH * 0.18,
  },
  contactNameTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  contactRelationLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  contactPhoneText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  contactActionButtonsGroup: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 0,
  },
  contactCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  contactActionText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  addContractButton: {
    backgroundColor: '#E11D48',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  plusIconMargin: {
    marginRight: 4,
  },
  addContractButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  familyCarouselScroll: {
    marginHorizontal: -16,
  },
  familyScrollContent: {
    paddingHorizontal: 16,
  },
  familyAvatarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.42,
    marginRight: 10,
  },
  familyMemberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CBD5E1',
  },
  familyAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyAvatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  emptySummaryText: {
    fontSize: 13,
    color: '#64748B',
    paddingVertical: 8,
  },
  familyMemberMeta: {
    marginLeft: 8,
    flex: 1,
  },
  familyMemberName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  familyMemberRelation: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  profileActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 4,
  },
  profileActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  profileActionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  viewAllRowLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllTextLink: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginRight: 2,
  },
  summaryGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  gridSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    width: GRID_ITEM_WIDTH,
  },
  gridSummaryLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 6,
  },
  gridSummaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  gridSummarySub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  actionGridRowButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: GRID_ITEM_WIDTH,
    position: 'relative',
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonTextMeta: {
    marginLeft: 8,
    flex: 1,
    paddingRight: 10,
  },
  actionButtonTitleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  actionButtonSubText: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  actionArrowIconRight: {
    position: 'absolute',
    right: 8,
  },
  settingsSubmenuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 4,
    marginBottom: 8,
  },
  settingsRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  settingsIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIconBg: {
    backgroundColor: '#E0F2FE',
  },
  langIconBg: {
    backgroundColor: '#F1F5F9',
  },
  settingsTextContent: {
    marginLeft: 12,
    flex: 1,
  },
  settingsTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  settingsSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  settingsInnerSeparatorLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 14,
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
});
