import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import type { RootStackParamList } from '../../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeBottomNav } from './HomeBottomNav';
import type { BottomTabKey } from './homeData';
import { MedicationFormFields } from '../../components/MedicationFormFields';
import { useMedicationDraft } from '../../context/MedicationDraftContext';
import { ApiError } from '../../api/client';
import { WaveTitleBand } from '../../components/WaveTitleBand';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMedicationForm'>;

const SAVE_GRADIENT = ['#EE8E8C', '#E06B6A'];

export function AddMedicationFormScreen({ navigation, route }: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const { draft, saveSchedule, updateSchedule } = useMedicationDraft();
  const [saving, setSaving] = useState(false);

  // Set by MedicineOverview. Its absence means this is the create flow, where
  // the draft was already filled by AddMedicationScreen.
  const scheduleId = route.params?.scheduleId;
  const isEditing = Boolean(scheduleId);

  const handleSave = async () => {
    if (!draft.medicineName.trim()) {
      Alert.alert('Medication', 'Please enter a medicine name.');
      return;
    }
    setSaving(true);
    try {
      if (scheduleId) {
        await updateSchedule(scheduleId);
        // Overview replaced itself with this screen, so back is the list.
        navigation.goBack();
      } else {
        await saveSchedule();
        navigation.navigate('MedicineList');
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not save medication';
      Alert.alert(isEditing ? 'Update failed' : 'Save failed', message);
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
      <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>

        <Image
          source={require('../../assets/logoImage.png')}
          style={styles.iconImage}
        />

        <TouchableOpacity
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Feather name="bell" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <View
        style={{ marginTop: -16, justifyContent: 'center', marginBottom: 12 }}
      >
        <WaveTitleBand title={isEditing ? 'Edit Medication' : 'Add Medication'} color="#F5F2FE"  style={styles.paddingInWave}/>
      </View>

      <ScrollView
        style={styles.contentCard}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 110 },
        ]}
      >
        <MedicationFormFields />

        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.9}
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={SAVE_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Update Medication' : 'Save Medication'}
            </Text>
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
  container: { flex: 1, backgroundColor: '#F5F2FE' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  iconImage: {
    height: 48,
    width: 150,
    resizeMode: 'cover',
  },
  headerIconButton: { padding: 4, width: 32 },
  logoContainer: { alignItems: 'center', justifyContent: 'center' },
  logoPlaceholder: { flexDirection: 'row', alignItems: 'center' },
  logoTextMain: {
    fontSize: 22,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E3A60',
    marginLeft: 4,
  },
  logoTextSub: {
    fontSize: 9,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#49739B',
    letterSpacing: 2,
    marginTop: -2,
  },
  titleContainer: { alignItems: 'center', marginTop: 24, marginBottom: 16 },
  screenTitle: { fontSize: 20, fontFamily: FONT.semibold, fontWeight: '600', color: '#333333' },
  paddingInWave:{
    paddingBottom:40,
    color:'#424242',
    fontSize:18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#F5F2FE',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop:-50,
    shadowColor: '#E0E4F0',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 5,
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 32 },
  saveButton: {
    backgroundColor: '#E57373',
    height: 48,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontFamily: FONT.semibold, fontWeight: '600' },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
