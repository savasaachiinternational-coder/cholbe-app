import {useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
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
import LinearGradient from 'react-native-linear-gradient';
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
import {AvatarImage} from '../../components/AvatarImage';
import { FONT } from '../../theme/typography';
import {useKeyboardHeight} from '../../hooks/useKeyboardHeight';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - 44) / 2;
const SUMMARY_CARD_GAP = 12;
const SUMMARY_CARD_WIDTH = SCREEN_WIDTH * 0.42;
const SUMMARY_SNAP_INTERVAL = SUMMARY_CARD_WIDTH + SUMMARY_CARD_GAP;
const SUB_TAB_SCROLL_STEP = 160;
// Single source for the page tint so the header, sub-tab bar and body stay aligned.
const PAGE_BG = '#F4F1FD';
// Shared geometry for the design system's 286deg gradients: the run goes from
// the right edge, just below centre, to the left edge, just above it.
const GRADIENT_286 = {
  start: {x: 0.98, y: 0.64},
  end: {x: 0.02, y: 0.36},
};
// Gradients/Gradient-Green: linear-gradient(286deg, #307887 0%, #74ACB3 100%)
const GRADIENT_GREEN = ['#307887', '#74ACB3'];
// Gradients/Gradient-Red: linear-gradient(286deg, #CB5D67 0%, #F66D74 100%)
const GRADIENT_RED = ['#CB5D67', '#F66D74'];

type SummaryCarouselItem =
  | {id: 'conditions'; type: 'conditions'}
  | {id: 'medications'; type: 'medications'}
  | {id: 'vitals'; type: 'vitals'};

type Props = NativeStackScreenProps<RootStackParamList, 'MyProfile'>;

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
  const doctorAvatarUrl =
    overview?.assignedDoctor?.user.avatarUrl ??
    overview?.nextAppointment?.doctor.user.avatarUrl ??
    null;
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
        <ActivityIndicator size="large" color="#4DA69F" />
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
          <Feather name="chevron-left" size={24} color="#424242" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.editProfileTopButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('EditProfile')}>
          <Feather
            name="edit-2"
            size={14}
            color="#424242"
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
              color={canScrollSubTabsLeft ? '#424242' : '#E6E3EE'}
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
              color={canScrollSubTabsRight ? '#424242' : '#E6E3EE'}
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
            <AvatarImage uri={user?.avatarUrl} style={styles.profileAvatar} />
            <TouchableOpacity
              style={styles.avatarCameraBadge}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EditProfile')}>
              <Feather name="camera" size={12} color="#4DA69F" />
            </TouchableOpacity>
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
              <Feather name="map-pin" size={11} color="#4DA69F" />
              <Text style={styles.userMetaRow}>{location}</Text>
            </View>
            <View style={styles.userMetaLine}>
              <Feather name="phone" size={11} color="#4DA69F" />
              <Text style={styles.userMetaRow}>{user?.phone ?? '—'}</Text>
            </View>
            <View style={styles.userMetaLine}>
              <Feather name="mail" size={11} color="#4DA69F" />
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
                    <Feather name="heart" size={16} color="#E16160" />
                    <Text style={styles.summaryCardTitle}>Medical Conditions</Text>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color="#757575"
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
                    <FontAwesome name="medkit" size={16} color="#4DA69F" />
                    <Text style={styles.summaryCardTitle}>Current Medications</Text>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color="#757575"
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
                  <Feather name="activity" size={16} color="#4DA69F" />
                  <Text style={styles.summaryCardTitle}>Health Vitals</Text>
                  <Feather
                    name="chevron-right"
                    size={16}
                    color="#757575"
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
          <AvatarImage uri={doctorAvatarUrl} style={styles.doctorAvatarThumb} />
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
              style={styles.doctorInlineBookButtonWrap}
              activeOpacity={0.8}
              onPress={bookAppointment}>
              <LinearGradient
                colors={GRADIENT_GREEN}
                start={GRADIENT_286.start}
                end={GRADIENT_286.end}
                style={styles.doctorInlineBookButton}>
                <Text style={styles.doctorInlineBookText}>Book Appointment</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionTitleHeaderRow}>
          <Text style={styles.sectionTitleLabelNoMargin}>Emergency Contact</Text>
          <TouchableOpacity
            style={styles.sectionInlineEditRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EditProfile')}>
            <Feather name="edit-2" size={12} color="#616161" />
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
                  <Feather name="phone" size={12} color="#424242" />
                  <Text style={styles.contactActionText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.contactCallButton}
                  activeOpacity={0.8}
                  onPress={() => smsPhone(contact.phone)}>
                  <Feather name="message-square" size={12} color="#424242" />
                  <Text style={styles.contactActionText}>SMS</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addContractButtonWrap}
            activeOpacity={0.9}
            onPress={openEmergencyModal}>
            <LinearGradient
              colors={GRADIENT_RED}
              start={GRADIENT_286.start}
              end={GRADIENT_286.end}
              style={styles.addContractButton}>
              <Feather
                name="plus"
                size={16}
                color="#FFFFFF"
                style={styles.plusIconMargin}
              />
              <Text style={styles.addContractButtonText}>
                Add Emergency Contact
              </Text>
            </LinearGradient>
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
                <Feather name="edit-2" size={12} color="#616161" />
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
                    <Feather name="plus" size={20} color="#4DA69F" />
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
                      {member.avatarUrl || member.memberUser?.avatarUrl ? (
                        <AvatarImage
                          uri={member.avatarUrl ?? member.memberUser?.avatarUrl}
                          style={styles.familyAvatarImage}
                        />
                      ) : (
                        <View style={styles.familyAvatarPlaceholder}>
                          <Text style={styles.familyAvatarInitial}>
                            {member.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
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
            <Feather name="file-text" size={18} color="#4DA69F" />
            <Text style={styles.profileActionButtonText}>
              Consultation Summary
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileActionButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MyAppointment')}>
            <Feather name="calendar" size={18} color="#4DA69F" />
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
            <Feather name="chevron-right" size={14} color="#616161" />
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
                color="#616161"
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
              <Feather name="bell" size={20} color="#4DA69F" />
            </View>
            <View style={styles.settingsTextContent}>
              <Text style={styles.settingsTitleText}>Notifications</Text>
              <Text style={styles.settingsSubText}>
                Manage reminders and alerts
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#757575" />
          </TouchableOpacity>

          <View style={styles.settingsInnerSeparatorLine} />

          <TouchableOpacity style={styles.settingsRowItem} activeOpacity={0.8}>
            <View style={[styles.settingsIconWrapper, styles.langIconBg]}>
              <Feather name="globe" size={20} color="#424242" />
            </View>
            <View style={styles.settingsTextContent}>
              <Text style={styles.settingsTitleText}>Language</Text>
              <Text style={styles.settingsSubText}>English</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#757575" />
          </TouchableOpacity>

          <View style={styles.settingsInnerSeparatorLine} />

          <TouchableOpacity
            style={styles.settingsRowItem}
            activeOpacity={0.8}
            onPress={() => setChangePwVisible(true)}>
            <View style={[styles.settingsIconWrapper, {backgroundColor: '#EDF7F6'}]}>
              <Feather name="lock" size={20} color="#4DA69F" />
            </View>
            <View style={styles.settingsTextContent}>
              <Text style={styles.settingsTitleText}>Change Password</Text>
              <Text style={styles.settingsSubText}>Update your account password</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#757575" />
          </TouchableOpacity>

          <View style={styles.settingsInnerSeparatorLine} />

          <TouchableOpacity
            style={styles.settingsRowItem}
            activeOpacity={0.8}
            onPress={handleLogout}>
            <View style={[styles.settingsIconWrapper, styles.logoutIconBg]}>
              <Feather name="log-out" size={20} color="#E16160" />
            </View>
            <View style={styles.settingsTextContent}>
              <Text style={styles.settingsTitleTextLogout}>Logout</Text>
              <Text style={styles.settingsSubText}>Sign out of your account</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#757575" />
          </TouchableOpacity>

          <View style={styles.settingsInnerSeparatorLine} />

          <TouchableOpacity
            style={styles.settingsRowItem}
            activeOpacity={0.8}
            onPress={handleDeleteAccount}>
            <View style={[styles.settingsIconWrapper, styles.logoutIconBg]}>
              <Feather name="trash-2" size={20} color="#E16160" />
            </View>
            <View style={styles.settingsTextContent}>
              <Text style={styles.settingsTitleTextLogout}>Delete account</Text>
              <Text style={styles.settingsSubText}>
                Permanently remove your data from Cholbe
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#757575" />
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

  const keyboardHeight = useKeyboardHeight();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={[cpStyles.overlay, {paddingBottom: keyboardHeight}]}>
        <View style={cpStyles.modal}>
          <View style={cpStyles.header}>
            <Text style={cpStyles.title}>Change Password</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={22} color="#424242" />
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
                placeholderTextColor="#757575"
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
      </View>
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
  title: {
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  field: {marginBottom: 14},
  label: {
    fontSize: 12,
    lineHeight: 14.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#616161',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F3F2FB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E3EE',
    paddingHorizontal: 14,
    height: 46,
    fontSize: 12,
    letterSpacing: 0.2,
    fontFamily: FONT.regular,
    color: '#424242',
  },
  btn: {
    backgroundColor: '#4DA69F',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {opacity: 0.6},
  btnText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 14.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});

function QuickActionIcon({type}: {type: QuickAction['icon']}) {
  if (type === 'medications') {
    return <FontAwesome name="medkit" size={20} color="#4DA69F" />;
  }
  if (type === 'upload') {
    return <Feather name="upload-cloud" size={20} color="#424242" />;
  }
  if (type === 'passport') {
    return <Feather name="activity" size={20} color="#4DA69F" />;
  }
  return <Feather name="shield" size={20} color="#4DA69F" />;
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
    borderColor: '#E6E3EE',
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
    backgroundColor: '#4DA69F',
  },
  profileSubTabText: {
    fontSize: 12,
    letterSpacing: 0.2,
    lineHeight: Platform.OS === 'android' ? 18 : undefined,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#616161',
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
    lineHeight: 21.6,
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
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E6E3EE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  editIconMargin: {
    marginRight: 4,
  },
  editProfileTopText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#424242',
  },
  profileBioSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E6E3EE',
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
    backgroundColor: '#E6E3EE',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
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
    lineHeight: 21.6,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  userDemographicsText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#424242',
    fontFamily: FONT.regular,
    fontWeight: '400',
    marginTop: 2,
    marginBottom: 4,
  },
  guardianHintText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#4DA69F',
    fontFamily: FONT.semibold,
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
    letterSpacing: 0.2,
    fontFamily: FONT.regular,
    color: '#424242',
    lineHeight: 11,
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
    backgroundColor: '#F5F4FD',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E3EE',
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
    backgroundColor: '#E6E3EE',
  },
  summaryDotActive: {
    width: 18,
    backgroundColor: '#4DA69F',
  },
  summaryEmptyText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#757575',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  vitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  vitalLabel: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  vitalValue: {
    fontSize: 12,
    lineHeight: 14.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  summaryCardTitle: {
    fontSize: 12,
    lineHeight: 14.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
    marginLeft: 6,
    paddingRight: 18,
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
    backgroundColor: '#FBE9E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagChipText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#424242',
  },
  medicationQuantityText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#424242',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  viewDetailsChipLink: {
    backgroundColor: '#EDF7F6',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  viewDetailsChipText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#4DA69F',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  sectionTitleLabel: {
    fontSize: 12,
    lineHeight: 14.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#616161',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitleLabelNoMargin: {
    fontSize: 12,
    lineHeight: 14.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#616161',
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
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  assignedDoctorCard: {
    backgroundColor: '#F5F4FD',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E3EE',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatarThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6E3EE',
  },
  doctorCardMeta: {
    marginLeft: 12,
    flex: 1,
    minWidth: 0,
  },
  doctorCardNameText: {
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  doctorCardSpecText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  doctorActionButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 0,
  },
  doctorInlineChatButton: {
    backgroundColor: '#E6E3EE',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 40,
  },
  doctorInlineChatText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#424242',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  // Gradient fill lives on the inner LinearGradient; the wrapper clips it to
  // the pill radius and carries the layout.
  doctorInlineBookButtonWrap: {
    borderRadius: 40,
    overflow: 'hidden',
    flexShrink: 0,
  },
  doctorInlineBookButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 40,
  },
  doctorInlineBookText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#FFFFFF',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  emergencyContractsContainer: {
    backgroundColor: '#F5F4FD',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6E3EE',
    padding: 14,
    gap: 12,
  },
  emergencyContactCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E3EE',
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
    backgroundColor: '#E6E3EE',
  },
  contactAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6E3EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarInitial: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  contactBaseMeta: {
    marginLeft: 10,
    width: SCREEN_WIDTH * 0.18,
  },
  contactNameTitle: {
    fontSize: 12,
    lineHeight: 14.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  contactRelationLabel: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  contactPhoneText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#424242',
    fontFamily: FONT.regular,
    fontWeight: '400',
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
    backgroundColor: '#E6E3EE',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  contactActionText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#424242',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  addContractButtonWrap: {
    borderRadius: 40,
    overflow: 'hidden',
    marginTop: 4,
  },
  addContractButton: {
    borderRadius: 40,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIconMargin: {
    marginRight: 4,
  },
  addContractButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 14.6,
    letterSpacing: 0.2,
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  familyCarouselScroll: {
    marginHorizontal: -16,
  },
  familyScrollContent: {
    paddingHorizontal: 16,
  },
  familyAvatarCard: {
    backgroundColor: '#F5F4FD',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E3EE',
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
    backgroundColor: '#E6E3EE',
  },
  familyAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6E3EE',
  },
  familyAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6E3EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyAvatarInitial: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  emptySummaryText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    fontFamily: FONT.regular,
    color: '#616161',
    paddingVertical: 8,
  },
  familyMemberMeta: {
    marginLeft: 8,
    flex: 1,
  },
  familyMemberName: {
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  familyMemberRelation: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  familyMemberLogin: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    fontFamily: FONT.regular,
    color: '#757575',
    marginTop: 2,
  },
  familyTapHint: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#4DA69F',
    marginTop: 4,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  familyAddPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDF7F6',
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
    borderColor: '#E6E3EE',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  profileActionButtonText: {
    fontSize: 12,
    lineHeight: 14.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
    textAlign: 'center',
  },
  viewAllRowLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllTextLink: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
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
    borderColor: '#E6E3EE',
    padding: 12,
    width: GRID_ITEM_WIDTH,
  },
  gridSummaryLabel: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    color: '#424242',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  gridSummaryValue: {
    fontSize: 12,
    lineHeight: 14.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
    marginTop: 2,
  },
  gridSummarySub: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    fontFamily: FONT.regular,
    color: '#424242',
    marginTop: 4,
  },
  actionGridRowButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E3EE',
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
    backgroundColor: '#EDF7F6',
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
    lineHeight: 14.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  actionButtonSubText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    fontFamily: FONT.regular,
    color: '#424242',
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
    borderColor: '#E6E3EE',
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
    backgroundColor: '#EDF7F6',
  },
  langIconBg: {
    backgroundColor: '#F3F2FB',
  },
  logoutIconBg: {
    backgroundColor: '#FBE9E9',
  },
  settingsTextContent: {
    marginLeft: 12,
    flex: 1,
  },
  settingsTitleText: {
    fontSize: 12,
    lineHeight: 14.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  settingsTitleTextLogout: {
    fontSize: 12,
    lineHeight: 14.6,
    letterSpacing: 0.2,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#E16160',
  },
  settingsSubText: {
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.2,
    fontFamily: FONT.regular,
    color: '#424242',
    marginTop: 2,
  },
  settingsInnerSeparatorLine: {
    height: 1,
    backgroundColor: '#E6E3EE',
    marginHorizontal: 14,
  },
  floatingScanButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EDF7F6',
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
