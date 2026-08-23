import {useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import {authApi} from '../../api/auth';
import {ApiError} from '../../api/client';
import {performLogout} from '../../auth/sessionControl';
import {confirmAndDeleteAccount} from '../../auth/deleteAccount';
import {AddEmergencyContactModal} from '../../components/AddEmergencyContactModal';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - 44) / 2;
const SUMMARY_CARD_GAP = 12;
const SUMMARY_CARD_WIDTH = SCREEN_WIDTH * 0.42;
const SUMMARY_SNAP_INTERVAL = SUMMARY_CARD_WIDTH + SUMMARY_CARD_GAP;
const SUB_TAB_SCROLL_STEP = 160;
// Single source for the page tint so the header, sub-tab bar and body stay aligned.
const PAGE_BG = '#F4F1FD';

type SummaryCarouselItem =
  | {id: 'conditions'; type: 'conditions'}
  | {id: 'medications'; type: 'medications'}
  | {id: 'vitals'; type: 'vitals'};

type Props = NativeStackScreenProps<RootStackParamList, 'MyProfile'>;

const PROFILE_AVATAR = require('../../assets/b1.png');
const DOCTOR_AVATAR = require('../../assets/b2.png');

// Proxima Nova is applied on this screen only. Android resolves a weight by the
// exact font file name, so each weight is referenced by its own family name.
const FONT = {
  regular: 'ProximaNova-Regular',
  medium: 'ProximaNova-Medium',
  semibold: 'ProximaNova-Semibold',
  bold: 'ProximaNova-Bold',
} as const;

export function MyProfileScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeProfileTab, setActiveProfileTab] =
    useState<ProfileSubTabKey>('overview');
  const [overview, setOverview] = useState<ProfileOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [savingEmergency, setSavingEmergency] = useState(false);
  const [changePwVisible, setChangePwVisible] = useState(false);
  const [activeSummaryIndex, setActiveSummaryIndex] = useState(0);
  const subTabsScrollRef = useRef<ScrollView>(null);
  const [subTabScrollX, setSubTabScrollX] = useState(0);
  const [subTabContentWidth, setSubTabContentWidth] = useState(0);
  const [subTabViewportWidth, setSubTabViewportWidth] = useState(0);

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
  const isFamilyDependent = overview?.isFamilyDependent ?? false;
  const guardian = overview?.guardian ?? null;
  const medicationCount = overview?.medicationCount ?? 0;
  const healthVitals = overview?.healthVitals;

  const summaryCarouselItems = useMemo<SummaryCarouselItem[]>(() => {
    const items: SummaryCarouselItem[] = [
      {id: 'conditions', type: 'conditions'},
      {id: 'medications', type: 'medications'},
    ];
    if (healthVitals?.bloodPressure || healthVitals?.oxygen) {
      items.push({id: 'vitals', type: 'vitals'});
    }
    return items;
  }, [healthVitals?.bloodPressure, healthVitals?.oxygen]);

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
    if (overview?.healthVitals?.bloodPressure) {
      items.push({
        id: 'bp',
        label: 'Blood Pressure',
        value: overview.healthVitals.bloodPressure.value,
        sub: `Checked ${overview.healthVitals.bloodPressure.checkedAgo}`,
      });
    }
    if (overview?.healthVitals?.oxygen) {
      items.push({
        id: 'oxygen',
        label: 'Oxygen',
        value: overview.healthVitals.oxygen.value,
        sub: `Checked ${overview.healthVitals.oxygen.checkedAgo}`,
      });
    }
    return items;
  }, [overview]);

  const openEmergencyModal = () => setEmergencyModalVisible(true);

  const saveEmergencyContact = async (payload: {
    name: string;
    relation: string;
    phone: string;
  }) => {
    setSavingEmergency(true);
    try {
      await profileApi.addEmergencyContact(payload);
      setEmergencyModalVisible(false);
      await loadProfile();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not add emergency contact';
      Alert.alert('Emergency contact', message);
    } finally {
      setSavingEmergency(false);
    }
  };

  const openChat = () => {
    navigation.navigate('ConsultationChat', {
      doctorName,
      specialty,
      appointmentId,
      doctorId: assignedDoctorId,
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

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          void performLogout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    confirmAndDeleteAccount();
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
      return;
    }
    if (action.id === 'passport') {
      navigation.navigate('ReportsList');
      return;
    }
    if (action.id === 'emergency') {
      openEmergencyModal();
    }
  };

  const onProfileSubTabPress = (key: ProfileSubTabKey) => {
    const tab = PROFILE_SUB_TABS.find(t => t.key === key);
    if (tab?.route === 'ConsultationSummary') {
      navigation.navigate('MyAppointment');
      return;
    }
    if (tab?.route) {
      navigation.navigate(tab.route);
      return;
    }
    setActiveProfileTab('overview');
  };

  const canScrollSubTabsLeft = subTabScrollX > 4;
  const subTabsOverflow = subTabContentWidth > subTabViewportWidth + 4;
  const canScrollSubTabsRight =
    subTabsOverflow && subTabScrollX + subTabViewportWidth < subTabContentWidth - 4;

  const scrollSubTabs = (direction: 'left' | 'right') => {
    const maxOffset = Math.max(0, subTabContentWidth - subTabViewportWidth);
    const nextOffset =
      direction === 'left'
        ? Math.max(0, subTabScrollX - SUB_TAB_SCROLL_STEP)
        : Math.min(maxOffset, subTabScrollX + SUB_TAB_SCROLL_STEP);
    subTabsScrollRef.current?.scrollTo({x: nextOffset, animated: true});
    setSubTabScrollX(nextOffset);
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

      <View >
        {/* {subTabsOverflow ? (
          <TouchableOpacity
            style={[
              styles.subTabArrowButton,
              !canScrollSubTabsLeft && styles.subTabArrowButtonDisabled,
            ]}
            activeOpacity={0.75}
            disabled={!canScrollSubTabsLeft}
            onPress={() => scrollSubTabs('left')}>
            <Feather
              name="chevron-left"
              size={18}
              color={canScrollSubTabsLeft ? '#475569' : '#CBD5E1'}
            />
          </TouchableOpacity>
        ) : null} */}

        {/* <View style={styles.profileSubTabsScrollWrap}>
          <ScrollView
            ref={subTabsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled
            scrollEventThrottle={16}
            style={styles.profileSubTabsScroll}
            contentContainerStyle={styles.profileSubTabsContent}
            onLayout={event => setSubTabViewportWidth(event.nativeEvent.layout.width)}
            onContentSizeChange={width => setSubTabContentWidth(width)}
            onScroll={event => setSubTabScrollX(event.nativeEvent.contentOffset.x)}>
            {(isFamilyDependent
              ? PROFILE_SUB_TABS.filter(tab => tab.key !== 'addFamilyMember')
              : PROFILE_SUB_TABS
            ).map(tab => {
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
        </View> */}

        {/* {subTabsOverflow ? (
          <TouchableOpacity
            style={[
              styles.subTabArrowButton,
              !canScrollSubTabsRight && styles.subTabArrowButtonDisabled,
            ]}
            activeOpacity={0.75}
            disabled={!canScrollSubTabsRight}
            onPress={() => scrollSubTabs('right')}>
            <Feather
              name="chevron-right"
              size={18}
              color={canScrollSubTabsRight ? '#475569' : '#CBD5E1'}
            />
          </TouchableOpacity>
        ) : null} */}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
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
            {isFamilyDependent && guardian ? (
              <Text style={styles.guardianHintText}>
                Family account · Managed by {guardian.fullName}
              </Text>
            ) : null}
            <Text style={styles.userDemographicsText}>{demographics}</Text>
            <View style={styles.userMetaLine}>
              <Feather name="map-pin" size={11} color="#408E91" />
              <Text style={styles.userMetaRow}>{location}</Text>
            </View>
            <View style={styles.userMetaLine}>
              <Feather name="phone" size={11} color="#408E91" />
              <Text style={styles.userMetaRow}>{user?.phone ?? '—'}</Text>
            </View>
            <View style={styles.userMetaLine}>
              <Feather name="mail" size={11} color="#408E91" />
              <Text style={styles.userMetaRow}>{user?.email ?? '—'}</Text>
            </View>
          </View>
        </View>

        <FlatList
          horizontal
          data={summaryCarouselItems}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          decelerationRate="fast"
          snapToInterval={SUMMARY_SNAP_INTERVAL}
          snapToAlignment="start"
          disableIntervalMomentum
          bounces={false}
          style={styles.summaryHorizontalScroll}
          contentContainerStyle={styles.summaryScrollContent}
          getItemLayout={(_, index) => ({
            length: SUMMARY_SNAP_INTERVAL,
            offset: SUMMARY_SNAP_INTERVAL * index,
            index,
          })}
          onMomentumScrollEnd={event => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / SUMMARY_SNAP_INTERVAL,
            );
            setActiveSummaryIndex(
              Math.min(Math.max(index, 0), summaryCarouselItems.length - 1),
            );
          }}
          renderItem={({item}) => {
            if (item.type === 'conditions') {
              return (
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
                    {conditions.length === 0 ? (
                      <Text style={styles.summaryEmptyText}>No conditions listed</Text>
                    ) : (
                      conditions.map(condition => (
                        <View key={condition} style={styles.tagChip}>
                          <Text style={styles.tagChipText}>{condition}</Text>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              );
            }

            if (item.type === 'medications') {
              return (
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
                    {medicationCount} Active Medication
                    {medicationCount === 1 ? '' : 's'}
                  </Text>
                  <TouchableOpacity
                    style={styles.viewDetailsChipLink}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('MedicineList')}>
                    <Text style={styles.viewDetailsChipText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              );
            }

            return (
              <View style={styles.summaryMetricsCard}>
                <View style={styles.summaryCardHeader}>
                  <Feather name="activity" size={16} color="#0D9488" />
                  <Text style={styles.summaryCardTitle}>Health Vitals</Text>
                  <Feather
                    name="chevron-right"
                    size={16}
                    color="#94A3B8"
                    style={styles.summaryCardArrow}
                  />
                </View>
                {healthVitals?.bloodPressure ? (
                  <View style={styles.vitalRow}>
                    <Text style={styles.vitalLabel}>Blood Pressure</Text>
                    <Text style={styles.vitalValue}>
                      {healthVitals.bloodPressure.value}
                    </Text>
                  </View>
                ) : null}
                {healthVitals?.oxygen ? (
                  <View style={styles.vitalRow}>
                    <Text style={styles.vitalLabel}>Oxygen</Text>
                    <Text style={styles.vitalValue}>{healthVitals.oxygen.value}</Text>
                  </View>
                ) : null}
                <TouchableOpacity
                  style={styles.viewDetailsChipLink}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('EditProfile')}>
                  <Text style={styles.viewDetailsChipText}>Update Vitals</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />

        {summaryCarouselItems.length > 1 ? (
          <View style={styles.summaryDotsRow}>
            {summaryCarouselItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.summaryDot,
                  index === activeSummaryIndex && styles.summaryDotActive,
                ]}
              />
            ))}
          </View>
        ) : null}

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
          <TouchableOpacity
            style={styles.sectionInlineEditRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EditProfile')}>
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

          <TouchableOpacity
            style={styles.addContractButton}
            activeOpacity={0.9}
            onPress={openEmergencyModal}>
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

        {!isFamilyDependent ? (
          <>
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
              {familyMembers.length === 0 ? (
                <TouchableOpacity
                  style={styles.familyAvatarCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('AddFamilyMember')}>
                  <View style={styles.familyAddPlaceholder}>
                    <Feather name="plus" size={20} color="#0D9488" />
                  </View>
                  <View style={styles.familyMemberMeta}>
                    <Text style={styles.familyMemberName}>Add member</Text>
                    <Text style={styles.familyMemberRelation}>Creates login account</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                familyMembers.map(member => {
                  const loginId =
                    member.memberUser?.email ??
                    member.email ??
                    member.memberUser?.phone ??
                    member.phone ??
                    '—';
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={styles.familyAvatarCard}
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate('FamilyMemberDetail', {
                          memberId: member.id,
                          memberName: member.name,
                        })
                      }>
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
                        {/* <Text style={styles.familyMemberLogin} numberOfLines={1}>
                          {loginId}
                        </Text>
                        <Text style={styles.familyTapHint}>Tap for full details</Text> */}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </>
        ) : null}

        <View style={styles.profileActionsRow}>
          <TouchableOpacity
            style={styles.profileActionButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MyAppointment')}>
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

          <View style={styles.settingsInnerSeparatorLine} />

          <TouchableOpacity
            style={styles.settingsRowItem}
            activeOpacity={0.8}
            onPress={() => setChangePwVisible(true)}>
            <View style={[styles.settingsIconWrapper, {backgroundColor: '#EFF6FF'}]}>
              <Feather name="lock" size={20} color="#2563EB" />
            </View>
            <View style={styles.settingsTextContent}>
              <Text style={styles.settingsTitleText}>Change Password</Text>
              <Text style={styles.settingsSubText}>Update your account password</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.settingsInnerSeparatorLine} />

          <TouchableOpacity
            style={styles.settingsRowItem}
            activeOpacity={0.8}
            onPress={handleLogout}>
            <View style={[styles.settingsIconWrapper, styles.logoutIconBg]}>
              <Feather name="log-out" size={20} color="#DC2626" />
            </View>
            <View style={styles.settingsTextContent}>
              <Text style={styles.settingsTitleTextLogout}>Logout</Text>
              <Text style={styles.settingsSubText}>Sign out of your account</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.settingsInnerSeparatorLine} />

          <TouchableOpacity
            style={styles.settingsRowItem}
            activeOpacity={0.8}
            onPress={handleDeleteAccount}>
            <View style={[styles.settingsIconWrapper, styles.logoutIconBg]}>
              <Feather name="trash-2" size={20} color="#DC2626" />
            </View>
            <View style={styles.settingsTextContent}>
              <Text style={styles.settingsTitleTextLogout}>Delete account</Text>
              <Text style={styles.settingsSubText}>
                Permanently remove your data from Cholbe
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.floatingScanButton, {bottom: insets.bottom + 90}]}
        activeOpacity={0.85} 
        onPress={() => navigation.navigate('AiSymptomHome')}>
         <Image source={require('../../assets/syaiicon.png')} />
      </TouchableOpacity>

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab="profile"
          bottomInset={insets.bottom}
          onTabPress={handleTabPress}
        />
      </View>

      <AddEmergencyContactModal
        visible={emergencyModalVisible}
        saving={savingEmergency}
        onClose={() => setEmergencyModalVisible(false)}
        onSave={saveEmergencyContact}
      />

      <CustomerChangePasswordModal
        visible={changePwVisible}
        onClose={() => setChangePwVisible(false)}
      />
    </View>
  );
}

function CustomerChangePasswordModal({visible, onClose}: {visible: boolean; onClose: () => void}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!current || !next || !confirm) {
      Alert.alert('Password', 'All fields are required.');
      return;
    }
    if (next.length < 8) {
      Alert.alert('Password', 'New password must be at least 8 characters.');
      return;
    }
    if (next !== confirm) {
      Alert.alert('Password', 'Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword(current, next);
      Alert.alert('Success', 'Password changed successfully.');
      setCurrent('');
      setNext('');
      setConfirm('');
      onClose();
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Could not change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={cpStyles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={cpStyles.modal}>
          <View style={cpStyles.header}>
            <Text style={cpStyles.title}>Change Password</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={22} color="#1E293B" />
            </TouchableOpacity>
          </View>
          {[
            {label: 'Current Password', value: current, setter: setCurrent},
            {label: 'New Password', value: next, setter: setNext},
            {label: 'Confirm Password', value: confirm, setter: setConfirm},
          ].map(field => (
            <View key={field.label} style={cpStyles.field}>
              <Text style={cpStyles.label}>{field.label}</Text>
              <TextInput
                style={cpStyles.input}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={field.value}
                onChangeText={field.setter}
              />
            </View>
          ))}
          <TouchableOpacity
            style={[cpStyles.btn, saving && cpStyles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={cpStyles.btnText}>Save Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const cpStyles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end'},
  modal: {
    backgroundColor: '#F5F4FD',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {fontSize: 16, fontFamily: FONT.bold, fontWeight: '700', color: '#1E293B'},
  field: {marginBottom: 14},
  label: {fontSize: 12, fontFamily: FONT.semibold, fontWeight: '600', color: '#475569', marginBottom: 6},
  input: {
    backgroundColor: '#F2F1FB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF0F6',
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    fontFamily: FONT.regular,
    color: '#1E293B',
  },
  btn: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {opacity: 0.6},
  btnText: {color: '#FFFFFF', fontSize: 15, fontFamily: FONT.bold, fontWeight: '700'},
});

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
    backgroundColor: PAGE_BG,
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
    paddingBottom: 20,
    backgroundColor: PAGE_BG,
  },
  profileSubTabsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PAGE_BG,
    minHeight: 56,
    paddingHorizontal: 6,
    gap: 4,
  },
  subTabArrowButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E4F0',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  subTabArrowButtonDisabled: {
    opacity: 0.45,
  },
  profileSubTabsScrollWrap: {
    flex: 1,
    minWidth: 0,
    backgroundColor:'#F4F1FD',
    overflow: 'hidden',
  },
  profileSubTabsScroll: {
    flex: 1,
  },
  profileSubTabsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  profileSubTab: {
    paddingHorizontal: 14,
    minHeight: 36,
    borderRadius: 20,
    backgroundColor: 'transparent',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  profileSubTabActive: {
    backgroundColor: '#408E91',
  },
  profileSubTabText: {
    fontSize: 13,
    fontFamily: FONT.semibold,
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
    flex: 1,
    marginLeft: 6,
    textAlign: 'left',
  },
  editProfileTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F1FD',
    borderWidth: 1,
    borderColor: '#EEF0F6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  editIconMargin: {
    marginRight: 4,
  },
  editProfileTopText: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#475569',
  },
  profileBioSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E6E4F0',
    paddingVertical: 16,
    marginTop: 4,
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
    fontSize: 18,
    fontFamily: FONT.bold,
    fontWeight: '600',
    color: '#212121',
  },
  userDemographicsText: {
    fontSize: 10,
    fontFamily: FONT.medium,
    color: '#424242',
    fontWeight: '400',
    marginTop: 2,
    marginBottom: 4,
  },
  guardianHintText: {
    fontSize: 11,
    fontFamily: FONT.semibold,
    color: '#0D9488',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 2,
  },
  userMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  userMetaRow: {
    fontSize: 10,
    fontFamily: FONT.regular,
    color: '#424242',
    lineHeight: 15,
    flex: 1,
  },
  summaryHorizontalScroll: {
    marginTop: 8,
    marginBottom: 4,
    marginHorizontal: -16,
  },
  summaryScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  summaryMetricsCard: {
    backgroundColor: '#FAF9FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F6',
    padding: 12,
    width: SUMMARY_CARD_WIDTH,
    marginRight: SUMMARY_CARD_GAP,
    minHeight: 112,
  },
  summaryDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  summaryDotActive: {
    width: 18,
    backgroundColor: '#408E91',
  },
  summaryEmptyText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: '#94A3B8',
    fontWeight: '500',
  },
  vitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  vitalLabel: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: '#64748B',
    fontWeight: '500',
  },
  vitalValue: {
    fontSize: 14,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#1E293B',
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  summaryCardTitle: {
    fontSize: 13,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 6,
    paddingRight: 18,
    flex: 1,
    lineHeight: 17,
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#EF4444',
  },
  medicationQuantityText: {
    fontSize: 13,
    fontFamily: FONT.medium,
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
    fontFamily: FONT.semibold,
    color: '#0D9488',
    fontWeight: '600',
  },
  sectionTitleLabel: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#475569',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitleLabelNoMargin: {
    fontSize: 14,
    fontFamily: FONT.semibold,
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
    fontFamily: FONT.medium,
    color: '#64748B',
    fontWeight: '500',
  },
  assignedDoctorCard: {
    backgroundColor: '#FAF9FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F6',
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
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#1E293B',
  },
  doctorCardSpecText: {
    fontSize: 12,
    fontFamily: FONT.medium,
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
    borderRadius: 40,
  },
  doctorInlineChatText: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    color: '#475569',
    fontWeight: '600',
  },
  doctorInlineBookButton: {
    backgroundColor: '#408E91',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 40,
  },
  doctorInlineBookText: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emergencyContractsContainer: {
    backgroundColor: '#FAF9FF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF0F6',
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
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#475569',
  },
  contactBaseMeta: {
    marginLeft: 10,
    width: SCREEN_WIDTH * 0.18,
  },
  contactNameTitle: {
    fontSize: 14,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#1E293B',
  },
  contactRelationLabel: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: '#64748B',
    fontWeight: '500',
  },
  contactPhoneText: {
    fontSize: 12,
    fontFamily: FONT.medium,
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
    fontFamily: FONT.semibold,
    color: '#475569',
    fontWeight: '600',
  },
  addContractButton: {
    backgroundColor: '#E11D48',
    borderRadius: 40,
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
    fontFamily: FONT.bold,
    fontWeight: '700',
  },
  familyCarouselScroll: {
    marginHorizontal: -16,
  },
  familyScrollContent: {
    paddingHorizontal: 16,
  },
  familyAvatarCard: {
    backgroundColor: '#FAF9FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F6',
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
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#475569',
  },
  emptySummaryText: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: '#64748B',
    paddingVertical: 8,
  },
  familyMemberMeta: {
    marginLeft: 8,
    flex: 1,
  },
  familyMemberName: {
    fontSize: 13,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#1E293B',
  },
  familyMemberRelation: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: '#64748B',
    fontWeight: '500',
  },
  familyMemberLogin: {
    fontSize: 10,
    fontFamily: FONT.regular,
    color: '#94A3B8',
    marginTop: 2,
  },
  familyTapHint: {
    fontSize: 9,
    fontFamily: FONT.semibold,
    color: '#0D9488',
    marginTop: 4,
    fontWeight: '600',
  },
  familyAddPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderColor: '#EEF0F6',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  profileActionButtonText: {
    fontSize: 12,
    fontFamily: FONT.semibold,
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
    fontFamily: FONT.semibold,
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
    borderColor: '#EEF0F6',
    padding: 12,
    width: GRID_ITEM_WIDTH,
  },
  gridSummaryLabel: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: '#64748B',
    fontWeight: '500',
  },
  gridSummaryValue: {
    fontSize: 14,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  gridSummarySub: {
    fontSize: 10,
    fontFamily: FONT.regular,
    color: '#94A3B8',
    marginTop: 4,
  },
  actionGridRowButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F6',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: GRID_ITEM_WIDTH,
    position: 'relative',
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4F1',
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
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#1E293B',
  },
  actionButtonSubText: {
    fontSize: 9,
    fontFamily: FONT.regular,
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
    borderColor: '#EEF0F6',
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
  logoutIconBg: {
    backgroundColor: '#FEE2E2',
  },
  settingsTextContent: {
    marginLeft: 12,
    flex: 1,
  },
  settingsTitleText: {
    fontSize: 14,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#1E293B',
  },
  settingsTitleTextLogout: {
    fontSize: 14,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#DC2626',
  },
  settingsSubText: {
    fontSize: 11,
    fontFamily: FONT.regular,
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
