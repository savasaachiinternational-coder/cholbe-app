import {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMedicationForm'>;

type InstructionSegment = 'morning' | 'noon' | 'night' | 'custom';
type MealSegment = 'before' | 'after';

const INSTRUCTION_SEGMENTS: {key: InstructionSegment; label: string}[] = [
  {key: 'morning', label: 'Morning'},
  {key: 'noon', label: 'Noon'},
  {key: 'night', label: 'Night'},
  {key: 'custom', label: 'Custom'},
];

export function AddMedicationFormScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const [instructionSegment, setInstructionSegment] =
    useState<InstructionSegment>('custom');
  const [mealSegment, setMealSegment] = useState<MealSegment>('before');
  const [reminderBeforeEating, setReminderBeforeEating] = useState(true);
  const [followUpCheck, setFollowUpCheck] = useState(true);
  const [refillInventory, setRefillInventory] = useState(true);

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
      navigation.navigate('MyProfile');
      return;
    }
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <MaterialCommunityIcons
              name="medical-bag"
              size={20}
              color="#00A896"
            />
            <Text style={styles.logoTextMain}>Cholbe</Text>
          </View>
          <Text style={styles.logoTextSub}>PHARMACY</Text>
        </View>

        <TouchableOpacity
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Add Medication</Text>
      </View>

      {/* Scrollable form */}
      <ScrollView
        style={styles.contentCard}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 110},
        ]}>
        {/* Medicine name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Medicine name</Text>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              defaultValue="Amlodipine"
              placeholderTextColor="#A0A5BA"
            />
            <Feather
              name="search"
              size={20}
              color="#E2E6EE"
              style={styles.searchIcon}
            />
          </View>
        </View>

        {/* Strength */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Strength</Text>
          <TouchableOpacity style={styles.dropdownTrigger} activeOpacity={0.8}>
            <Text style={styles.dropdownValue}>5mg</Text>
            <Feather name="chevron-down" size={20} color="#7D8797" />
          </TouchableOpacity>
        </View>

        {/* Frequency */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Frequency</Text>
          <TouchableOpacity style={styles.dropdownTrigger} activeOpacity={0.8}>
            <Text style={styles.dropdownValue}>Once daily</Text>
            <Feather name="chevron-down" size={20} color="#7D8797" />
          </TouchableOpacity>
        </View>

        {/* Instruction — time of day */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Instruction</Text>
          <View style={styles.segmentContainer}>
            {INSTRUCTION_SEGMENTS.map(seg => {
              const active = instructionSegment === seg.key;
              return (
                <TouchableOpacity
                  key={seg.key}
                  style={[
                    styles.segmentButton,
                    active && styles.activeSegmentButton,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setInstructionSegment(seg.key)}>
                  <Text
                    style={[
                      styles.segmentButtonText,
                      active && styles.activeSegmentText,
                    ]}>
                    {seg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time selector */}
        <View style={styles.timeSelectorRow}>
          <Feather
            name="clock"
            size={18}
            color="#7D8797"
            style={styles.timeIcon}
          />
          <Text style={styles.timeText}>08:30 AM</Text>
          <Feather name="plus" size={18} color="#7D8797" />
        </View>

        {/* Meal instruction */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Instruction</Text>
          <View style={styles.mealSegmentContainer}>
            {(['before', 'after'] as MealSegment[]).map(seg => {
              const active = mealSegment === seg;
              return (
                <TouchableOpacity
                  key={seg}
                  style={[
                    styles.mealButton,
                    active && styles.activeMealButton,
                    seg === 'after' && {marginRight: 0},
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setMealSegment(seg)}>
                  <Text
                    style={[
                      styles.mealButtonText,
                      active && styles.activeMealButtonText,
                    ]}>
                    {seg === 'before' ? 'Before Meal' : 'After Meal'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Start / End date */}
        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfWidth, styles.halfLeft]}>
            <Text style={styles.inputLabel}>Start Date</Text>
            <TouchableOpacity style={styles.dateSelector} activeOpacity={0.8}>
              <Text style={styles.dateText}>25-10-2025</Text>
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={18}
                color="#333333"
              />
            </TouchableOpacity>
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>End Date</Text>
            <TouchableOpacity style={styles.dateSelector} activeOpacity={0.8}>
              <Text style={styles.dateText}>25-10-2025</Text>
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={18}
                color="#333333"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reminder before eating */}
        <View style={styles.subCardSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTitleGroup}>
              <MaterialCommunityIcons
                name="bell-ring-outline"
                size={22}
                color="#333333"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitleText}>
                Show reminder before eating
              </Text>
            </View>
            <Switch
              trackColor={{false: '#E2E6EE', true: '#45A096'}}
              thumbColor="#FFFFFF"
              value={reminderBeforeEating}
              onValueChange={setReminderBeforeEating}
              ios_backgroundColor="#E2E6EE"
            />
          </View>
          {reminderBeforeEating && (
            <View style={styles.chipsSectionWrap}>
              <View style={styles.chipsRow}>
                <ChipLabel label="30 min before" />
                <ChipLabel label="1 Hour Before" />
                <ChipLabel label="10 min before" />
              </View>
              <TouchableOpacity style={styles.fullWidthCustomButton} activeOpacity={0.9}>
                <Text style={styles.fullWidthCustomButtonText}>Custom</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Follow-up check */}
        <View style={styles.subCardSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTitleGroup}>
              <Feather
                name="eye"
                size={20}
                color="#333333"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitleText}>Follow-up Check</Text>
            </View>
            <Switch
              trackColor={{false: '#E2E6EE', true: '#45A096'}}
              thumbColor="#FFFFFF"
              value={followUpCheck}
              onValueChange={setFollowUpCheck}
              ios_backgroundColor="#E2E6EE"
            />
          </View>
          {followUpCheck && (
            <View style={styles.chipsSectionWrap}>
              <View style={styles.chipsRowWithCustom}>
                <View style={styles.chipFlex}>
                  <ChipLabel label="30 min before" />
                </View>
                <View style={styles.chipFlex}>
                  <ChipLabel label="1 Hour Before" />
                </View>
                <View style={styles.chipFlex}>
                  <ChipLabel label="10 min before" />
                </View>
                <TouchableOpacity
                  style={styles.inlineCustomButton}
                  activeOpacity={0.9}>
                  <Text style={styles.inlineCustomButtonText}>Custom</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.timeSelectorRow, styles.timeSelectorMt]}>
                <Feather
                  name="clock"
                  size={18}
                  color="#7D8797"
                  style={styles.timeIcon}
                />
                <Text style={styles.timeText}>08:30 AM</Text>
                <Feather name="plus" size={18} color="#7D8797" />
              </View>
            </View>
          )}
        </View>

        {/* Refill inventory */}
        <View style={styles.subCardSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTitleGroup}>
              <MaterialCommunityIcons
                name="pill"
                size={22}
                color="#333333"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitleText}>
                Reminder to refill Inventory
              </Text>
            </View>
            <Switch
              trackColor={{false: '#E2E6EE', true: '#45A096'}}
              thumbColor="#FFFFFF"
              value={refillInventory}
              onValueChange={setRefillInventory}
              ios_backgroundColor="#E2E6EE"
            />
          </View>
          {refillInventory && (
            <View style={[styles.rowContainer, styles.refillWrap]}>
              <View style={styles.refillLeft}>
                <Text style={styles.subInputLabel}>Current inventory</Text>
                <TouchableOpacity
                  style={styles.dropdownTriggerSmall}
                  activeOpacity={0.8}>
                  <Text style={styles.dropdownValue}>10 pc</Text>
                  <Feather name="chevron-down" size={18} color="#7D8797" />
                </TouchableOpacity>
              </View>
              <View style={styles.refillRight}>
                <Text style={styles.subInputLabel}>Remind Me when</Text>
                <View style={styles.rowContainer}>
                  <View style={[styles.dateSelectorSmall, styles.dateSelectorSmallLeft]}>
                    <MaterialCommunityIcons
                      name="calendar-month-outline"
                      size={15}
                      color="#333333"
                      style={styles.smallIcon}
                    />
                    <Text style={styles.smallDateTimeText}>25-10-2025</Text>
                  </View>
                  <View style={styles.dateSelectorSmall}>
                    <Feather
                      name="clock"
                      size={14}
                      color="#333333"
                      style={styles.smallIcon}
                    />
                    <Text style={styles.smallDateTimeText}>08:30 AM</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Share with caregiver */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Share with Caregiver</Text>
          <TouchableOpacity style={styles.caregiverCustomBox} activeOpacity={0.8}>
            <Feather
              name="plus"
              size={18}
              color="#333333"
              style={styles.caregiverPlusIcon}
            />
            <Text style={styles.caregiverCustomText}>Custom</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('UploadReport')}>
          <Text style={styles.saveButtonText}>Save Medication</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab="medication"
          bottomInset={insets.bottom}
          onTabPress={handleTabPress}
        />
      </View>
    </View>
  );
}

function ChipLabel({label}: {label: string}) {
  return (
    <View style={styles.inactiveChip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F9F9FE'},
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerIconButton: {padding: 4, width: 32},
  logoContainer: {alignItems: 'center', justifyContent: 'center'},
  logoPlaceholder: {flexDirection: 'row', alignItems: 'center'},
  logoTextMain: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E3A60',
    marginLeft: 4,
  },
  logoTextSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#49739B',
    letterSpacing: 2,
    marginTop: -2,
  },
  titleContainer: {alignItems: 'center', marginTop: 24, marginBottom: 16},
  screenTitle: {fontSize: 20, fontWeight: '600', color: '#333333'},
  contentCard: {
    flex: 1,
    backgroundColor: '#F9F9FE',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    shadowColor: '#E0E4F0',
    shadowOffset: {width: 0, height: -10},
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  scrollContent: {paddingHorizontal: 20, paddingTop: 32},
  inputGroup: {marginBottom: 16},
  halfWidth: {flex: 1},
  halfLeft: {marginRight: 12},
  inputLabel: {
    fontSize: 14,
    color: '#8A94A6',
    fontWeight: '500',
    marginBottom: 8,
  },
  subInputLabel: {
    fontSize: 13,
    color: '#8A94A6',
    fontWeight: '400',
    marginBottom: 6,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2F7',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  textInput: {flex: 1, fontSize: 15, color: '#495057', fontWeight: '500'},
  searchIcon: {paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#E2E6EE'},
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  dropdownTriggerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  dropdownValue: {fontSize: 15, color: '#495057', fontWeight: '500'},
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F2F7',
    borderRadius: 10,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeSegmentButton: {backgroundColor: '#45A096'},
  segmentButtonText: {fontSize: 13, color: '#7D8797', fontWeight: '500'},
  activeSegmentText: {color: '#FFFFFF', fontWeight: '600'},
  timeSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2F7',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  timeSelectorMt: {marginTop: 12, marginBottom: 0},
  timeIcon: {marginRight: 10},
  timeText: {flex: 1, fontSize: 15, color: '#495057', fontWeight: '500'},
  mealSegmentContainer: {flexDirection: 'row'},
  mealButton: {
    flex: 1,
    height: 46,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E6E9F0',
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  activeMealButton: {backgroundColor: '#45A096', borderColor: '#45A096'},
  mealButtonText: {fontSize: 14, color: '#7D8797', fontWeight: '500'},
  activeMealButtonText: {color: '#FFFFFF', fontWeight: '600'},
  rowContainer: {flexDirection: 'row', alignItems: 'center'},
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F2F7',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  dateSelectorSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F2F7',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 6,
  },
  dateSelectorSmallLeft: {marginRight: 6},
  dateText: {fontSize: 14, color: '#495057', fontWeight: '500'},
  smallDateTimeText: {fontSize: 12, color: '#495057', fontWeight: '500'},
  smallIcon: {marginRight: 4},
  subCardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F2F7',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderTitleGroup: {flexDirection: 'row', alignItems: 'center'},
  sectionIcon: {marginRight: 8},
  sectionTitleText: {fontSize: 14, fontWeight: '600', color: '#495057', flex: 1, flexWrap: 'wrap'},
  chipsSectionWrap: {marginTop: 12},
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  chipsRowWithCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipFlex: {flex: 1},
  inactiveChip: {
    backgroundColor: '#F1F2F7',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {fontSize: 12, color: '#7D8797', fontWeight: '500'},
  fullWidthCustomButton: {
    backgroundColor: '#45A096',
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  fullWidthCustomButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  inlineCustomButton: {
    backgroundColor: '#45A096',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineCustomButtonText: {color: '#FFFFFF', fontSize: 12, fontWeight: '600'},
  refillWrap: {marginTop: 12, alignItems: 'flex-start'},
  refillLeft: {flex: 1, marginRight: 12},
  refillRight: {flex: 2},
  caregiverCustomBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E9F0',
    backgroundColor: '#F1F2F7',
    height: 48,
    borderRadius: 24,
  },
  caregiverPlusIcon: {marginRight: 6},
  caregiverCustomText: {fontSize: 14, color: '#495057', fontWeight: '500'},
  saveButton: {
    backgroundColor: '#DC6468',
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  saveButtonText: {color: '#FFFFFF', fontSize: 18, fontWeight: '600'},
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
