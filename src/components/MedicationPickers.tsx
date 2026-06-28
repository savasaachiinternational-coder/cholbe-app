import {useEffect, useState} from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Feather from 'react-native-vector-icons/Feather';
import {
  FREQUENCY_OPTIONS,
  INVENTORY_OPTIONS,
  REMINDER_MINUTE_OPTIONS,
  formatDisplayDate,
  type MedicationFrequency,
} from '../utils/medicationDraft';

function parseIsoDate(iso: string) {
  if (!iso) return new Date();
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseTime24ToDate(time: string) {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  const date = new Date();
  if (!match) {
    date.setHours(9, 0, 0, 0);
    return date;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatTime24FromDate(date: Date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function parseTimeLabel(label: string) {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return {hour: 8, minute: 30, meridiem: 'AM' as const};
  }
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase() === 'PM' ? 'PM' : 'AM';
  if (hour < 1 || hour > 12) hour = 8;
  return {hour, minute, meridiem: meridiem as 'AM' | 'PM'};
}

export function formatTimeLabel(hour: number, minute: number, meridiem: 'AM' | 'PM') {
  return `${hour}:${`${minute}`.padStart(2, '0')} ${meridiem}`;
}

function formatTimeFromDate(date: Date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return formatTimeLabel(hours, minutes, meridiem as 'AM' | 'PM');
}

function parseTimeLabelToDate(label: string) {
  const {hour, minute, meridiem} = parseTimeLabel(label);
  const date = new Date();
  let hours = hour % 12;
  if (meridiem === 'PM') hours += 12;
  if (meridiem === 'AM' && hour === 12) hours = 0;
  date.setHours(hours, minute, 0, 0);
  return date;
}

type NativePickerSheetProps = {
  visible: boolean;
  title: string;
  mode: 'date' | 'time';
  value: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  use24Hour?: boolean;
};

function NativePickerSheet({
  visible,
  title,
  mode,
  value,
  onClose,
  onConfirm,
  minimumDate,
  maximumDate,
  use24Hour = false,
}: NativePickerSheetProps) {
  const [tempDate, setTempDate] = useState(value);

  useEffect(() => {
    if (visible) {
      setTempDate(value);
    }
  }, [visible, value]);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && date) {
        onConfirm(date);
      }
      onClose();
      return;
    }
    if (date) {
      setTempDate(date);
    }
  };

  if (!visible) {
    return null;
  }

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={value}
        mode={mode}
        display="default"
        onChange={handleChange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        is24Hour={use24Hour}
      />
    );
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.modalSheet}>
        <Text style={styles.modalTitle}>{title}</Text>
        <DateTimePicker
          value={tempDate}
          mode={mode}
          display="spinner"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          themeVariant="light"
          style={styles.iosPicker}
          is24Hour={use24Hour}
        />
        <TouchableOpacity
          style={styles.modalDoneButton}
          onPress={() => onConfirm(tempDate)}>
          <Text style={styles.modalDoneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

type DatePickerFieldProps = {
  label?: string;
  value: string;
  onChange: (iso: string) => void;
  style?: object;
  compact?: boolean;
  placeholder?: string;
};

export function DatePickerField({
  label,
  value,
  onChange,
  style,
  compact,
  placeholder = 'Select date',
}: DatePickerFieldProps) {
  const [visible, setVisible] = useState(false);
  const pickerDate = parseIsoDate(value);
  const displayText = value ? formatDisplayDate(value) : placeholder;

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  return (
    <>
      <TouchableOpacity
        style={[compact ? styles.dateSelectorSmall : styles.dateSelector, style]}
        activeOpacity={0.8}
        onPress={open}>
        {compact ? (
          <>
            <Feather name="calendar" size={14} color="#333333" style={styles.smallIcon} />
            <Text
              style={[
                styles.smallDateTimeText,
                !value && styles.datePlaceholderText,
              ]}>
              {displayText}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.dateText, !value && styles.datePlaceholderText]}>
              {displayText}
            </Text>
            <Feather name="calendar" size={18} color="#333333" />
          </>
        )}
      </TouchableOpacity>

      <NativePickerSheet
        visible={visible}
        title={label ?? 'Select date'}
        mode="date"
        value={pickerDate}
        onClose={close}
        onConfirm={date => {
          onChange(toIsoDate(date));
          close();
        }}
        minimumDate={new Date(2020, 0, 1)}
        maximumDate={new Date(2035, 11, 31)}
      />
    </>
  );
}

type TimePickerFieldProps = {
  value: string;
  onChange: (label: string) => void;
  compact?: boolean;
  showAdd?: boolean;
  onAdd?: () => void;
  use24Hour?: boolean;
  style?: object;
  pickerTitle?: string;
};

export function TimePickerField({
  value,
  onChange,
  compact,
  showAdd,
  onAdd,
  use24Hour = false,
  style,
  pickerTitle = 'Select time',
}: TimePickerFieldProps) {
  const [visible, setVisible] = useState(false);
  const pickerDate = use24Hour ? parseTime24ToDate(value) : parseTimeLabelToDate(value);

  return (
    <>
      <View style={[styles.timeSelectorRow, compact && styles.timeSelectorCompact, style]}>
        <TouchableOpacity
          style={styles.timeTapArea}
          activeOpacity={0.8}
          onPress={() => setVisible(true)}>
          <Feather
            name="clock"
            size={compact ? 14 : 18}
            color="#7D8797"
            style={styles.timeIcon}
          />
          <Text style={[styles.timeText, compact && styles.smallDateTimeText]}>{value}</Text>
        </TouchableOpacity>
        {showAdd ? (
          <Pressable onPress={onAdd} hitSlop={8}>
            <Feather name="plus" size={18} color="#7D8797" />
          </Pressable>
        ) : null}
      </View>

      <NativePickerSheet
        visible={visible}
        title={pickerTitle}
        mode="time"
        value={pickerDate}
        onClose={() => setVisible(false)}
        onConfirm={date => {
          onChange(use24Hour ? formatTime24FromDate(date) : formatTimeFromDate(date));
          setVisible(false);
        }}
        use24Hour={use24Hour}
      />
    </>
  );
}

type FrequencyPickerProps = {
  value: MedicationFrequency;
  onChange: (value: MedicationFrequency) => void;
};

export function FrequencyPicker({value, onChange}: FrequencyPickerProps) {
  const [visible, setVisible] = useState(false);
  const label =
    FREQUENCY_OPTIONS.find(option => option.value === value)?.label ?? 'Once daily';

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownTrigger}
        activeOpacity={0.8}
        onPress={() => setVisible(true)}>
        <Text style={styles.dropdownValue}>{label}</Text>
        <Feather name="chevron-down" size={20} color="#7D8797" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setVisible(false)} />
        <View style={styles.optionSheet}>
          {FREQUENCY_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              style={styles.optionRow}
              onPress={() => {
                onChange(option.value);
                setVisible(false);
              }}>
              <Text
                style={[
                  styles.optionText,
                  option.value === value && styles.optionTextActive,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </>
  );
}

type MinuteChipRowProps = {
  value: number;
  onChange: (minutes: number) => void;
  allowCustom?: boolean;
};

export function MinuteChipRow({value, onChange, allowCustom}: MinuteChipRowProps) {
  const [customVisible, setCustomVisible] = useState(false);
  const [customValue, setCustomValue] = useState(String(value));

  const isPreset = REMINDER_MINUTE_OPTIONS.some(option => option.value === value);

  return (
    <View style={styles.chipsSectionWrap}>
      <View style={styles.chipsRowWithCustom}>
        {REMINDER_MINUTE_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.chipButton,
              value === option.value && styles.chipButtonActive,
            ]}
            onPress={() => onChange(option.value)}>
            <Text
              style={[
                styles.chipButtonText,
                value === option.value && styles.chipButtonTextActive,
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
        {allowCustom ? (
          <TouchableOpacity
            style={[styles.inlineCustomButton, !isPreset && styles.chipButtonActive]}
            onPress={() => {
              setCustomValue(String(value));
              setCustomVisible(true);
            }}>
            <Text
              style={[
                styles.inlineCustomButtonText,
                !isPreset && styles.chipButtonTextActive,
              ]}>
              Custom
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Modal visible={customVisible} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setCustomVisible(false)} />
        <View style={styles.optionSheet}>
          <Text style={styles.modalTitle}>Custom minutes before</Text>
          <TextInput
            style={styles.customInput}
            keyboardType="number-pad"
            value={customValue}
            onChangeText={setCustomValue}
          />
          <TouchableOpacity
            style={styles.modalDoneButton}
            onPress={() => {
              const minutes = Number(customValue);
              if (Number.isFinite(minutes) && minutes > 0) {
                onChange(minutes);
              }
              setCustomVisible(false);
            }}>
            <Text style={styles.modalDoneText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

type InventoryPickerProps = {
  value: number;
  onChange: (count: number) => void;
};

export function InventoryPicker({value, onChange}: InventoryPickerProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownTriggerSmall}
        activeOpacity={0.8}
        onPress={() => setVisible(true)}>
        <Text style={styles.dropdownValue}>{value} pc</Text>
        <Feather name="chevron-down" size={18} color="#7D8797" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setVisible(false)} />
        <View style={styles.optionSheet}>
          {INVENTORY_OPTIONS.map(count => (
            <TouchableOpacity
              key={count}
              style={styles.optionRow}
              onPress={() => {
                onChange(count);
                setVisible(false);
              }}>
              <Text
                style={[
                  styles.optionText,
                  count === value && styles.optionTextActive,
                ]}>
                {count} pc
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F2F7',
    borderRadius: 12,
    height: 48,
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
  dateText: {fontSize: 15, color: '#333333', fontWeight: '500'},
  datePlaceholderText: {color: '#94A3B8', fontWeight: '400'},
  smallIcon: {marginRight: 6},
  smallDateTimeText: {fontSize: 13, color: '#333333', fontWeight: '500'},
  timeSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2F7',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  timeSelectorCompact: {
    flex: 1,
    marginBottom: 0,
    paddingVertical: 10,
  },
  timeTapArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {marginRight: 10},
  timeText: {fontSize: 15, color: '#333333', fontWeight: '500'},
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  dropdownValue: {fontSize: 15, color: '#333333', fontWeight: '500'},
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  optionSheet: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDoneButton: {
    backgroundColor: '#45A096',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalDoneText: {color: '#FFFFFF', fontSize: 16, fontWeight: '600'},
  optionRow: {paddingHorizontal: 18, paddingVertical: 14},
  optionText: {fontSize: 16, color: '#5A6578'},
  optionTextActive: {color: '#45A096', fontWeight: '600'},
  chipsSectionWrap: {marginTop: 12},
  chipsRowWithCustom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipButton: {
    backgroundColor: '#EEF1F6',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipButtonActive: {backgroundColor: '#45A096'},
  chipButtonText: {fontSize: 13, color: '#5A6578', fontWeight: '500'},
  chipButtonTextActive: {color: '#FFFFFF'},
  inlineCustomButton: {
    backgroundColor: '#45A096',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 8,
  },
  inlineCustomButtonText: {fontSize: 13, color: '#FFFFFF', fontWeight: '600'},
  customInput: {
    backgroundColor: '#F4F6FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  iosPicker: {
    alignSelf: 'center',
  },
});
