import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import {
  medicationSchedulesApi,
  type MedicationSchedule,
} from '../../api/medications';
import {ApiError} from '../../api/client';
import {PassportListScreenLayout} from '../../components/PassportListScreenLayout';
import {MedicineScheduleCard} from '../../components/MedicineScheduleCard';
import {navigateCustomerTab} from './customerTabNavigation';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'MedicineList'>;

function formatMealTiming(value: string | null) {
  if (!value) return '—';
  const normalized = value.toLowerCase();
  if (normalized.includes('before')) return 'Before Eating';
  if (normalized.includes('after')) return 'After Eating';
  return value;
}

function formatScheduleTime(value?: string | null) {
  if (!value) return '—';
  const match = value.match(/^(\d{1,2})[.:](\d{2})\s*(AM|PM)$/i);
  if (match) {
    return `${parseInt(match[1], 10)}.${match[2]} ${match[3].toUpperCase()}`;
  }
  return value;
}

export function MedicineListScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const [items, setItems] = useState<MedicationSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMedications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await medicationSchedulesApi.list();
      setItems(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not load medications';
      Alert.alert('Medications', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [loadMedications]),
  );

  return (
    <PassportListScreenLayout
      title="Medicine List"
      uploadLabel="Upload Medicine"
      onUpload={() => navigation.navigate('AddMedication')}
      activeTab="medication"
      onTabPress={tab => navigateCustomerTab(navigation, tab)}
      onBack={() => navigation.goBack()}
      onNotifications={() => navigation.navigate('Notifications')}>
      <View style={styles.listContent}>
        {loading ? (
          <ActivityIndicator color="#45A096" style={styles.loader} />
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>No medications yet. Tap Upload Medicine.</Text>
        ) : (
          items.map(item => (
            <MedicineScheduleCard
              key={item.id}
              title={item.medicineName}
              time={formatScheduleTime(item.times[0])}
              actionLabel='View Medicine'
              meta={[
                {label: item.dose ?? '—'},
                {label: formatMealTiming(item.mealTiming)},
              ]}
              icon={
                <MaterialCommunityIcons
                  name="pill"
                  size={30}
                  color="#7D8797"
                  style={styles.rotatedPillIcon}
                />
              }
              onPressAction={() =>
                navigation.navigate('MedicineOverview', {schedule: item})
              }
            />
          ))
        )}
      </View>
    </PassportListScreenLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  loader: {marginVertical: 24},
  emptyText: {
    textAlign: 'center',
    color: '#8A94A6',
    fontSize: 14,
    fontFamily: FONT.regular,
    marginTop: 8,
  },
  rotatedPillIcon: {
    transform: [{rotate: '-90deg'}],
  },
});
