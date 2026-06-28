import {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
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
import {MedicationFormFields} from '../../components/MedicationFormFields';
import {useMedicationDraft} from '../../context/MedicationDraftContext';
import {ApiError} from '../../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMedicationForm'>;

export function AddMedicationFormScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const {draft, saveSchedule} = useMedicationDraft();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!draft.medicineName.trim()) {
      Alert.alert('Medication', 'Please enter a medicine name.');
      return;
    }
    setSaving(true);
    try {
      await saveSchedule();
      navigation.navigate('MedicineList');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save medication';
      Alert.alert('Save failed', message);
    } finally {
      setSaving(false);
    }
  };

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
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <MaterialCommunityIcons name="medical-bag" size={20} color="#00A896" />
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

      <ScrollView
        style={styles.contentCard}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 110},
        ]}>
        <MedicationFormFields />

        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.9}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Medication</Text>
          )}
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
  saveButton: {
    backgroundColor: '#E57373',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
