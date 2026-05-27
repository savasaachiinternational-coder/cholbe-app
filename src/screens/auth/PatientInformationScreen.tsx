import {useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';

const AUTH_GRADIENT = ['#F5F8FC', '#E3F2F9', '#DDF0F7'] as const;

const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const;
const USAGE_OPTIONS = [
  'For Myself (As a patient)',
  'For a Family Member',
  'For Someone I Care For',
] as const;

type Gender = (typeof GENDER_OPTIONS)[number];
type UsagePurpose = (typeof USAGE_OPTIONS)[number];

type Props = {
  initialName?: string;
  onContinue: () => void;
};

export function PatientInformationScreen({initialName = '', onContinue}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(initialName);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [usagePurpose, setUsagePurpose] = useState<UsagePurpose>(
    'For Myself (As a patient)',
  );
  const [genderPickerVisible, setGenderPickerVisible] = useState(false);
  const [usagePickerVisible, setUsagePickerVisible] = useState(false);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...AUTH_GRADIENT]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.screen, {paddingTop: insets.top}]}>
        <View style={styles.headerBar}>
          <View style={styles.headerPlaceholder} />
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={styles.headerPlaceholder} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {paddingBottom: insets.bottom + 24},
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.headerSection}>
              <Text style={styles.title}>Let&apos;s Start</Text>
              <Text style={styles.subtitle}>
                Please give the patient information for better health.
              </Text>

              <View style={styles.progressBarTrack}>
                <View style={styles.progressBarActiveFiller} />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Whats your Name?</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="user"
                  size={20}
                  color="#4A8B95"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter name"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <Text style={styles.inputLabel}>Whats your Age?</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.ageInput]}
                  value={age}
                  onChangeText={setAge}
                  placeholder="0"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <Text style={styles.suffixText}>Years</Text>
              </View>

              <Text style={styles.inputLabel}>Gender</Text>
              <TouchableOpacity
                style={styles.dropdownContainer}
                activeOpacity={0.75}
                onPress={() => setGenderPickerVisible(true)}>
                <Text style={styles.dropdownSelectedText}>{gender}</Text>
                <Feather
                  name="triangle"
                  size={10}
                  color="#4A8B95"
                  style={styles.dropdownArrowIcon}
                />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>
                Who are you using this app for?
              </Text>
              <TouchableOpacity
                style={styles.dropdownContainer}
                activeOpacity={0.75}
                onPress={() => setUsagePickerVisible(true)}>
                <Text style={styles.dropdownSelectedText}>{usagePurpose}</Text>
                <Feather
                  name="triangle"
                  size={10}
                  color="#4A8B95"
                  style={styles.dropdownArrowIcon}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.footerSection}>
              <TouchableOpacity
                style={styles.continueButton}
                activeOpacity={0.85}
                onPress={onContinue}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <OptionPickerModal
        visible={genderPickerVisible}
        title="Gender"
        options={GENDER_OPTIONS}
        selected={gender}
        onSelect={value => {
          setGender(value);
          setGenderPickerVisible(false);
        }}
        onClose={() => setGenderPickerVisible(false)}
      />

      <OptionPickerModal
        visible={usagePickerVisible}
        title="Who are you using this app for?"
        options={USAGE_OPTIONS}
        selected={usagePurpose}
        onSelect={value => {
          setUsagePurpose(value);
          setUsagePickerVisible(false);
        }}
        onClose={() => setUsagePickerVisible(false)}
      />
    </View>
  );
}

type PickerModalProps<T extends string> = {
  visible: boolean;
  title: string;
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

function OptionPickerModal<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: PickerModalProps<T>) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={styles.pickerOverlay} onPress={onClose}>
        <Pressable style={styles.pickerCard} onPress={e => e.stopPropagation()}>
          <Text style={styles.pickerTitle}>{title}</Text>
          {options.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pickerOption,
                selected === option && styles.pickerOptionSelected,
              ]}
              activeOpacity={0.7}
              onPress={() => onSelect(option)}>
              <Text
                style={[
                  styles.pickerOptionText,
                  selected === option && styles.pickerOptionTextSelected,
                ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH_GRADIENT[0],
  },
  screen: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  headerLogo: {
    width: 120,
    height: 40,
  },
  headerPlaceholder: {
    width: 36,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerSection: {
    marginBottom: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3B3B3B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#707070',
    lineHeight: 22,
    marginBottom: 16,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#E6EEF4',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarActiveFiller: {
    width: '50%',
    height: '100%',
    backgroundColor: '#4A8B95',
  },
  formSection: {
    flex: 1,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 10,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1.2,
    borderColor: '#82C3D1',
    borderRadius: 28,
    paddingHorizontal: 18,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#333333',
    fontSize: 15,
    fontWeight: '500',
  },
  ageInput: {
    paddingLeft: 4,
  },
  suffixText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
    marginLeft: 8,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1.2,
    borderColor: '#82C3D1',
    borderRadius: 28,
    paddingHorizontal: 20,
    height: 56,
  },
  dropdownSelectedText: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
    marginRight: 8,
  },
  dropdownArrowIcon: {
    transform: [{rotate: '180deg'}],
    opacity: 0.8,
  },
  footerSection: {
    width: '100%',
    marginTop: 'auto',
  },
  continueButton: {
    backgroundColor: '#4A8B95',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A8B95',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    justifyContent: 'flex-end',
  },
  pickerCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B3B3B',
    marginBottom: 12,
  },
  pickerOption: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6EEF4',
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(74, 139, 149, 0.08)',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  pickerOptionText: {
    fontSize: 15,
    color: '#333333',
  },
  pickerOptionTextSelected: {
    color: '#4A8B95',
    fontWeight: '600',
  },
});
