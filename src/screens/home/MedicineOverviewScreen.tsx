import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {MedicationReviewContent} from '../../components/MedicationReviewContent';
import {useMedicationDraft} from '../../context/MedicationDraftContext';
import {scheduleToDraft} from '../../utils/medicationDraft';
import {WaveTitleBand} from '../../components/WaveTitleBand';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'MedicineOverview'>;

export function MedicineOverviewScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const {schedule} = route.params;
  const {setDraft} = useMedicationDraft();

  // MedicationReviewContent reads the shared draft, so the schedule is loaded
  // into it here. That doubles as the hand-off to the edit form, which is then
  // already filled by the time it mounts.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setDraft(scheduleToDraft(schedule));
    setHydrated(true);
  }, [schedule, setDraft]);

  // Replacing rather than pushing keeps Overview out of the stack, so saving an
  // edit goes straight back to the list.
  const handleEdit = () => {
    navigation.replace('AddMedicationForm', {scheduleId: schedule.id});
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
        <Image
          source={require('../../assets/logoImage.png')}
          style={styles.iconImage}
        />
        <TouchableOpacity
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <WaveTitleBand
        title={'Medicine Overview'}
        color="#F5F2FD"
        style={[styles.waveDesign, styles.screenTitle]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollCanvasContent}>
        <View style={styles.reviewDetailsCard}>
          {hydrated ? (
            <MedicationReviewContent styles={styles} />
          ) : (
            <ActivityIndicator color="#45A096" style={styles.loader} />
          )}
        </View>
      </ScrollView>

      <View style={[styles.footerContainer, {paddingBottom: insets.bottom + 14}]}>
        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.8}
          onPress={handleEdit}>
          <Feather name="edit-2" size={18} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit</Text>
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
  },
  iconImage: {
    height: 48,
    width: 150,
    resizeMode: 'cover',
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  screenTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  waveDesign: {
    paddingTop: 5,
    marginTop: -10,
    paddingBottom: 10,
  },
  scrollCanvasContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  loader: {
    marginVertical: 48,
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
  // Centred so the icon lines up with the text's midline. lineHeight 22 makes
  // the text box taller than the 20px icon, so flex-start left the icon riding
  // high.
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
    verticalAlign: 'middle',
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
  footerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F9F9FE',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#45A096',
    height: 48,
    borderRadius: 100,
    shadowColor: '#45A096',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
