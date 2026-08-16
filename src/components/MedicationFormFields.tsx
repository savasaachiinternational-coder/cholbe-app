import {StyleSheet, Switch, Text, TextInput, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  DatePickerField,
  FrequencyPicker,
  InventoryPicker,
  MinuteChipRow,
  TimePickerField,
  formatTimeLabel,
} from './MedicationPickers';
import {useMedicationDraft} from '../context/MedicationDraftContext';

const INSTRUCTION_SEGMENTS = [
  {key: 'morning', label: 'Morning'},
  {key: 'noon', label: 'Noon'},
  {key: 'night', label: 'Night'},
  {key: 'custom', label: 'Custom'},
] as const;

export function MedicationFormFields() {
  const {draft, patchDraft} = useMedicationDraft();

  const addTime = () => {
    patchDraft({
      times: [...(draft.times ?? []), formatTimeLabel(8, 0, 'PM')],
    });
  };

  const updateTimeAt = (index: number, value: string) => {
    const times = [...(draft.times ?? [])];
    times[index] = value;
    patchDraft({times});
  };

  return (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Medicine name</Text>
        <View style={styles.textInputWrapper}>
          <TextInput
            style={styles.textInput}
            value={draft.medicineName}
            onChangeText={medicineName => patchDraft({medicineName})}
            placeholder="Medicine name"
            placeholderTextColor="#A0A5BA"
          />
          <Feather name="search" size={20} color="#E2E6EE" style={styles.searchIcon} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Dose</Text>
        <View style={styles.textInputWrapper}>
          <TextInput
            style={styles.textInput}
            value={draft.dose}
            onChangeText={dose => patchDraft({dose})}
            placeholder="e.g. 1 tablet"
            placeholderTextColor="#A0A5BA"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Frequency</Text>
        <FrequencyPicker
          value={draft.frequency}
          onChange={frequency => patchDraft({frequency})}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Instruction</Text>
        <View style={styles.segmentContainer}>
          {INSTRUCTION_SEGMENTS.map(seg => {
            const active = draft.instruction === seg.key;
            return (
              <TouchableOpacity
                key={seg.key}
                style={[styles.segmentButton, active && styles.activeSegmentButton]}
                activeOpacity={0.85}
                onPress={() => patchDraft({instruction: seg.key})}>
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

      {(draft.times ?? ['08:30 AM']).map((time, index) => (
        <TimePickerField
          key={`${time}-${index}`}
          value={time}
          onChange={value => updateTimeAt(index, value)}
          showAdd={index === draft.times.length - 1}
          onAdd={addTime}
        />
      ))}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Instruction</Text>
        <View style={styles.mealSegmentContainer}>
          {(['before', 'after'] as const).map(seg => {
            const active = draft.mealTiming === seg;
            return (
              <TouchableOpacity
                key={seg}
                style={[
                  styles.mealButton,
                  active && styles.activeMealButton,
                  seg === 'after' && {marginRight: 0},
                ]}
                activeOpacity={0.85}
                onPress={() => patchDraft({mealTiming: seg})}>
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

      <View style={styles.rowContainer}>
        <View style={[styles.inputGroup, styles.halfWidth, styles.halfLeft]}>
          <Text style={styles.inputLabel}>Start Date</Text>
          <DatePickerField
            value={draft.startDate}
            onChange={startDate => patchDraft({startDate})}
          />
        </View>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.inputLabel}>End Date</Text>
          <DatePickerField
            value={draft.endDate}
            onChange={endDate => patchDraft({endDate})}
          />
        </View>
      </View>

      <View style={styles.subCardSection}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderTitleGroup}>
            <MaterialCommunityIcons
              name="bell-ring-outline"
              size={22}
              color="#333333"
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitleText}>Show reminder before eating</Text>
          </View>
          <Switch
            trackColor={{false: '#E2E6EE', true: '#45A096'}}
            thumbColor="#FFFFFF"
            value={draft.reminderEnabled}
            onValueChange={reminderEnabled => patchDraft({reminderEnabled})}
          />
        </View>
        {draft.reminderEnabled ? (
          <MinuteChipRow
            value={draft.reminderBeforeMinutes}
            onChange={reminderBeforeMinutes => patchDraft({reminderBeforeMinutes})}
            allowCustom
          />
        ) : null}
      </View>

      <View style={styles.subCardSection}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderTitleGroup}>
            <Feather name="eye" size={20} color="#333333" style={styles.sectionIcon} />
            <Text style={styles.sectionTitleText}>Follow-up Check</Text>
          </View>
          <Switch
            trackColor={{false: '#E2E6EE', true: '#45A096'}}
            thumbColor="#FFFFFF"
            value={draft.followUpEnabled}
            onValueChange={followUpEnabled => patchDraft({followUpEnabled})}
          />
        </View>
        {draft.followUpEnabled ? (
          <View style={styles.chipsSectionWrap}>
            <MinuteChipRow
              value={draft.followUpMinutes}
              onChange={followUpMinutes => patchDraft({followUpMinutes})}
              allowCustom
            />
            <TimePickerField
              value={draft.followUpTime}
              onChange={followUpTime => patchDraft({followUpTime})}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.subCardSection}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderTitleGroup}>
            <MaterialCommunityIcons
              name="pill"
              size={22}
              color="#333333"
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitleText}>Reminder to refill Inventory</Text>
          </View>
          <Switch
            trackColor={{false: '#E2E6EE', true: '#45A096'}}
            thumbColor="#FFFFFF"
            value={draft.refillEnabled}
            onValueChange={refillEnabled => patchDraft({refillEnabled})}
          />
        </View>
        {draft.refillEnabled ? (
          <View style={[styles.rowContainer, styles.refillWrap]}>
            <View style={styles.refillLeft}>
              <Text style={styles.subInputLabel}>Current inventory</Text>
              <InventoryPicker
                value={draft.inventoryCount}
                onChange={inventoryCount => patchDraft({inventoryCount})}
              />
            </View>
            <View style={styles.refillRight}>
              <Text style={styles.subInputLabel}>Remind Me when</Text>
              <View style={styles.rowContainer}>
                <DatePickerField
                  compact
                  value={draft.refillDate}
                  onChange={refillDate => patchDraft({refillDate})}
                  style={styles.dateSelectorSmallLeft}
                />
                <TimePickerField
                  compact
                  value={draft.refillTime}
                  onChange={refillTime => patchDraft({refillTime})}
                />
              </View>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Share with Caregiver</Text>
        <View style={styles.textInputWrapper}>
          <TextInput
            style={styles.textInput}
            value={draft.caregiverName}
            onChangeText={caregiverName => patchDraft({caregiverName})}
            placeholder="Caregiver name"
            placeholderTextColor="#A0A5BA"
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
  dateSelectorSmallLeft: {marginRight: 6, flex: 1},
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
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
    flexWrap: 'wrap',
  },
  chipsSectionWrap: {marginTop: 12},
  refillWrap: {marginTop: 12, alignItems: 'flex-start'},
  refillLeft: {flex: 1, marginRight: 10},
  refillRight: {flex: 1.2},
  caregiverCustomBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F2F7',
    borderRadius: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  caregiverPlusIcon: {marginRight: 8},
  caregiverCustomText: {fontSize: 15, color: '#495057', fontWeight: '500'},
});
