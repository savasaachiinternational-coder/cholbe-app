import {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import {authApi} from '../../api/auth';
import {ApiError} from '../../api/client';
import { FONT } from '../../theme/typography';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const AUTH_GRADIENT = ['#F5F8FC', '#EFF7FA', '#E8F2F6'] as const;

const DISEASE_OPTIONS = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Asthma',
  'Cancer',
  'Chronic Kidney Disease',
  'Chronic Liver Disease',
  'PCOS / PCOD',
  'Chronic Obstructive Pulmonary Disease',
  'Epilepsy',
  'Depression',
  'Chronic Migraine',
  'Osteoarthritis',
  'Other',
] as const;

const BREAKFAST_TIMES = [
  '7:00 AM',
  '8:00 AM',
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
] as const;

const LUNCH_TIMES = [
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
] as const;

const DINNER_TIMES = [
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM',
  '9:00 PM',
] as const;

type MealPicker = 'breakfast' | 'lunch' | 'dinner' | null;

type Props = {
  onBack: () => void;
  onComplete: () => void;
};

function CheckeredBackground() {
  const cells = useMemo(() => {
    const cellSize = 32;
    const cols = Math.ceil(SCREEN_WIDTH / cellSize) + 1;
    const rows = 14;
    return Array.from({length: rows * cols}, (_, i) => ({
      key: i,
      row: Math.floor(i / cols),
      col: i % cols,
    }));
  }, []);

  return (
    <View style={styles.checkerLayer} pointerEvents="none">
      {cells.map(({key, row, col}) => (
        <View
          key={key}
          style={[
            styles.checkerCell,
            {
              left: col * 32,
              top: row * 32,
              backgroundColor:
                (row + col) % 2 === 0
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(220, 238, 245, 0.4)',
            },
          ]}
        />
      ))}
    </View>
  );
}

export function MedicalHistoryScreen({onBack, onComplete}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const [selectedDiseases, setSelectedDiseases] = useState<Set<string>>(
    new Set(),
  );
  const [breakfastTime, setBreakfastTime] = useState('9:30 AM');
  const [lunchTime, setLunchTime] = useState('');
  const [dinnerTime, setDinnerTime] = useState('');
  const [mealPicker, setMealPicker] = useState<MealPicker>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authApi.medicalHistory({
        conditions: Array.from(selectedDiseases),
        mealBreakfast: breakfastTime || undefined,
        mealLunch: lunchTime || undefined,
        mealDinner: dinnerTime || undefined,
      });
      onComplete();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save medical history';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDisease = (label: string) => {
    setSelectedDiseases(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const pickerConfig = useMemo(() => {
    switch (mealPicker) {
      case 'breakfast':
        return {
          title: 'Breakfast time',
          options: BREAKFAST_TIMES,
          selected: breakfastTime,
          onSelect: setBreakfastTime,
        };
      case 'lunch':
        return {
          title: 'Lunch time',
          options: LUNCH_TIMES,
          selected: lunchTime,
          onSelect: setLunchTime,
        };
      case 'dinner':
        return {
          title: 'Dinner time',
          options: DINNER_TIMES,
          selected: dinnerTime,
          onSelect: setDinnerTime,
        };
      default:
        return null;
    }
  }, [mealPicker, breakfastTime, lunchTime, dinnerTime]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...AUTH_GRADIENT]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      <CheckeredBackground />

      <View style={[styles.screen, {paddingTop: insets.top}]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.6}
            onPress={onBack}
            accessibilityLabel="Go back">
            <Feather name="chevron-left" size={28} color="#333333" />
          </TouchableOpacity>
          <Image
            source={require('../../assets/logoImage.png')}
            style={styles.headerLogo}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.6}
            accessibilityLabel="Notifications">
            <Feather name="bell" size={24} color="rgba(0,0,0,0.06)" />
          </TouchableOpacity>
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
              <Text style={styles.title}>Almost Finished</Text>
              <Text style={styles.subtitle}>
                Please give the patient information for better health.
              </Text>
              <View style={styles.titleDivider} />
            </View>

            <Text style={styles.sectionHeading}>
              Are you suffering from any disease?
            </Text>

            <View style={styles.chipWrap}>
              {DISEASE_OPTIONS.map(label => {
                const selected = selectedDiseases.has(label);
                return (
                  <TouchableOpacity
                    key={label}
                    style={[styles.chip, selected && styles.chipSelected]}
                    activeOpacity={0.8}
                    onPress={() => toggleDisease(label)}>
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.chipTextSelected,
                      ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.mealSectionHeading}>
              Please mention your typical meal times{' '}
              <Text style={styles.requiredMark}>*</Text>
            </Text>

            <MealTimeField
              value={breakfastTime}
              placeholder="Breakfast"
              onPress={() => setMealPicker('breakfast')}
            />
            <MealTimeField
              value={lunchTime}
              placeholder="Lunch"
              onPress={() => setMealPicker('lunch')}
            />
            <MealTimeField
              value={dinnerTime}
              placeholder="Dinner"
              onPress={() => setMealPicker('dinner')}
            />

            <TouchableOpacity
              activeOpacity={0.9}
              disabled={loading}
              onPress={handleSubmit}
              style={styles.submitTouchable}>
              <LinearGradient
                colors={['#5BAEA8', '#4A8B95', '#3D7A84']}
                start={{x: 0.5, y: 0}}
                end={{x: 0.5, y: 1}}
                style={[styles.submitButton, loading && styles.buttonDisabled]}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {pickerConfig && (
        <MealTimePickerModal
          visible={mealPicker !== null}
          title={pickerConfig.title}
          options={pickerConfig.options}
          selected={pickerConfig.selected}
          onSelect={value => {
            pickerConfig.onSelect(value);
            setMealPicker(null);
          }}
          onClose={() => setMealPicker(null)}
        />
      )}
    </View>
  );
}

type MealTimeFieldProps = {
  value: string;
  placeholder: string;
  onPress: () => void;
};

function MealTimeField({value, placeholder, onPress}: MealTimeFieldProps) {
  const hasValue = value.length > 0;

  return (
    <TouchableOpacity
      style={styles.mealField}
      activeOpacity={0.75}
      onPress={onPress}>
      <Text
        style={[
          styles.mealFieldText,
          !hasValue && styles.mealFieldPlaceholder,
        ]}>
        {hasValue ? value : placeholder}
      </Text>
      <Feather
        name="triangle"
        size={10}
        color="#4A8B95"
        style={styles.mealFieldArrow}
      />
    </TouchableOpacity>
  );
}

type MealPickerModalProps = {
  visible: boolean;
  title: string;
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

function MealTimePickerModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: MealPickerModalProps) {
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
  checkerLayer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  checkerCell: {
    position: 'absolute',
    width: 32,
    height: 32,
  },
  screen: {
    flex: 1,
    zIndex: 2,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    padding: 4,
    width: 36,
  },
  headerLogo: {
    width: 120,
    height: 50,
  },
  notificationButton: {
    padding: 4,
    width: 36,
    alignItems: 'flex-end',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerSection: {
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#3B3B3B',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#707070',
    lineHeight: 22,
    marginBottom: 14,
  },
  titleDivider: {
    width: '100%',
    height: 2,
    backgroundColor: '#4A8B95',
    borderRadius: 1,
  },
  sectionHeading: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#3B3B3B',
    lineHeight: 22,
    marginBottom: 16,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#4A8B95',
  },
  chipSelected: {
    backgroundColor: '#4A8B95',
    borderColor: '#4A8B95',
  },
  chipText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#555555',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  mealSectionHeading: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#3B3B3B',
    lineHeight: 22,
    marginBottom: 14,
  },
  requiredMark: {
    color: '#E06D6D',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  mealField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1.2,
    borderColor: '#82C3D1',
    borderRadius: 28,
    paddingHorizontal: 22,
    height: 56,
    marginBottom: 12,
  },
  mealFieldText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#333333',
  },
  mealFieldPlaceholder: {
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#A0A0A0',
  },
  mealFieldArrow: {
    transform: [{rotate: '180deg'}],
    opacity: 0.85,
    marginLeft: 8,
  },
  submitTouchable: {
    marginTop: 28,
    marginBottom: 8,
  },
  submitButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A8B95',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.7,
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
    maxHeight: '50%',
  },
  pickerTitle: {
    fontSize: 16,
    fontFamily: FONT.semibold,
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
