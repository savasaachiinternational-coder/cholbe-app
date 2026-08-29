import {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {MedicationReviewContent} from '../../components/MedicationReviewContent';
import {useMedicationDraft} from '../../context/MedicationDraftContext';
import {ApiError} from '../../api/client';
import { WaveTitleBand } from '../../components/WaveTitleBand';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewMedication'>;

export function ReviewMedicationScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  // Live width. Reading the window size once at module load freezes it at the
  // launch orientation, so the tab bar kept portrait widths after a rotate.
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {saveSchedule} = useMedicationDraft();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSchedule();
      navigation.navigate('MedicineList');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not save medication';
      Alert.alert('Save failed', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>
        <Image source ={require('../../assets/logoImage.png')} style={styles.iconImage}/>
        <TouchableOpacity
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollCanvasContent}>
          <WaveTitleBand title={'Review Medication'} color="#F5F2FD" style={[styles.waveDesign,styles.screenTitle]}/>
        <View style={styles.reviewDetailsCard}>
          <MedicationReviewContent styles={styles} />
          <View style={{height:100}}/>
        </View>
        
      </ScrollView>

     

      <View style={[styles.dualActionFooterContainer, {bottom: 64 + insets.bottom}]}>
        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.8}
          disabled={saving}
          onPress={handleSave}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Medication</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.bottomTabBar, {paddingBottom: 12 + insets.bottom}]}>
        <TouchableOpacity
          style={[styles.tabItem, {width: width / 5}]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, {width: width / 5}]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('PharmacyShop')}>
          <MaterialCommunityIcons name="clippy" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Pharmacy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, {width: width / 5}]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MedicineList')}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color="#45A096" />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Medication</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, {width: width / 5}]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ReportsList')}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={24}
            color="#A0A5BA"
          />
          <Text style={styles.tabLabel}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, {width: width / 5}]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MyProfile')}>
          <Feather name="user" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2FD',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerIconButton: {
    padding: 4,
    width: 32,
    alignItems: 'flex-end',
  }, iconImage: {
    height: 48,
    width: 150,
    resizeMode: 'cover',
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  titleContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  scrollCanvasContent: {
    paddingHorizontal: 20,
    paddingBottom: 160,
  },
  waveDesign:{
    paddingTop:5,
    marginTop:-10,
    paddingBottom:10
  },
  reviewDetailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    padding: 16,
    shadowColor: '#E0E4F0',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#ECEFF7',
  },
  metaTitleBlock: {
    marginBottom: 20,
    paddingLeft: 8,
    paddingTop: 8,
  },
  medicineNameText: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  medicineSubtext: {
    fontSize: 12,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  // Centred so the icon lines up with the text's midline. lineHeight 22 makes the
  // text box taller than the 20px icon, so flex-start left the icon riding high.
  infoBlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    paddingLeft: 8,
  },
  iconColumn: {
    width: 36,
    alignItems: 'center',
  },
  detailsColumn: {
    flex: 1,
    paddingLeft: 4,
  },
  sectionLabelText: {
    fontSize: 15,
    color: '#8A94A6',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginBottom: 12,
  },
  inlineInfoValueText: {
    fontSize: 12,
    color: '#616161',
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 22,
    verticalAlign:'middle'
  },
  boldSpan: {
    color: '#212121',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  orangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9F43',
    marginRight: 12,
  },
  timelineContentText: {
    fontSize: 12,
    color: '#212121',
    fontFamily: FONT.regular,
    fontWeight: '400',
    flex: 1,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#F0F2F7',
    marginVertical: 8,
  },
  // Multi-line block: centring here would drop the icon to the middle of the
  // whole list, so it stays pinned to the first line.
  refillBlock: {marginBottom: 8, alignItems: 'flex-start'},
  dualActionFooterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#F9F9FE',
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E6E3EE',
    height: 48,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4DA69F',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1.3,
    backgroundColor: '#45A096',
    height: 48,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#45A096',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  bottomTabBar: {
    flexDirection: 'row',
    minHeight: 74,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F7',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 5,
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#45A096',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
