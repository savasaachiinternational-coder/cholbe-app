import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {prescriptionsApi, type Prescription} from '../../api/prescriptions';
import {useMedicationDraft} from '../../context/MedicationDraftContext';
import {API_ORIGIN} from '../../config/api';
import {ApiError} from '../../api/client';
import {imageUri} from '../../utils/fileAsset';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedPrescription'>;

const {width} = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const GRID_GAP = 8;
const AVAILABLE_WIDTH = width - HORIZONTAL_PADDING * 2;
const WIDTH_THREE_COLUMNS = (AVAILABLE_WIDTH - GRID_GAP * 2) / 3;
const WIDTH_FOUR_COLUMNS = (AVAILABLE_WIDTH - GRID_GAP * 3) / 4;

function prescriptionImage(fileUrl: string) {
  return imageUri(fileUrl, API_ORIGIN);
}

export function SavedPrescriptionScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const {loadPrescriptionDraft} = useMedicationDraft();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [continuing, setContinuing] = useState(false);

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await prescriptionsApi.list();
      setPrescriptions(data);
      setSelectedId(data[0]?.id ?? null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not load prescriptions';
      Alert.alert('Saved Prescription', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPrescriptions();
    }, [loadPrescriptions]),
  );

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

  const handleContinue = async () => {
    if (!selectedId) {
      Alert.alert('Saved Prescription', 'Please select a prescription.');
      return;
    }
    setContinuing(true);
    try {
      await loadPrescriptionDraft(selectedId);
      navigation.navigate('ReviewDetails');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not load prescription';
      Alert.alert('Saved Prescription', message);
    } finally {
      setContinuing(false);
    }
  };

  const renderItemBox = (item: Prescription, boxWidth: number) => {
    const isSelected = selectedId === item.id;
    const label = item.medicines[0]?.name ?? item.fileName ?? 'Prescription';

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.gridItem, {width: boxWidth, height: boxWidth * 0.9}]}
        activeOpacity={0.8}
        onPress={() => setSelectedId(item.id)}>
        <View style={styles.imageMockPlaceholder}>
          <Image source={{uri: prescriptionImage(item.fileUrl)}} style={styles.thumbImage} />
          <Text style={styles.thumbLabel} numberOfLines={2}>
            {label}
          </Text>
        </View>
        {isSelected && <View style={styles.selectedIndicatorBorder} />}
      </TouchableOpacity>
    );
  };

  const row1 = prescriptions.slice(0, 3);
  const rest = prescriptions.slice(3);

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Saved Prescription</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <ActivityIndicator color="#45A096" style={styles.loader} />
      ) : prescriptions.length === 0 ? (
        <Text style={styles.emptyText}>
          No saved prescriptions yet. Scan one from Camera or Gallery.
        </Text>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollCanvasContent}>
          {row1.length > 0 ? (
            <View style={styles.threeColumnGridRow}>
              {row1.map(item => renderItemBox(item, WIDTH_THREE_COLUMNS))}
            </View>
          ) : null}

          <View style={styles.fourColumnGridWrapper}>
            {rest.map(item => renderItemBox(item, WIDTH_FOUR_COLUMNS))}
          </View>
        </ScrollView>
      )}

      <View style={[styles.footerActionContainer, {bottom: 74 + insets.bottom}]}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.9}
          disabled={continuing || !selectedId}
          onPress={handleContinue}>
          {continuing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F9F9FE',
  },
  backButton: {padding: 2},
  headerTitleText: {
    fontSize: 20,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#333333',
  },
  headerSpacer: {width: 28},
  loader: {marginTop: 40},
  emptyText: {
    textAlign: 'center',
    color: '#7D8797',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  scrollCanvasContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 140,
  },
  threeColumnGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
  },
  fourColumnGridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  gridItem: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EBEFF5',
  },
  imageMockPlaceholder: {
    flex: 1,
    backgroundColor: '#EBEFF5',
  },
  thumbImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  thumbLabel: {
    fontSize: 10,
    color: '#5A6578',
    paddingHorizontal: 4,
    paddingVertical: 4,
    textAlign: 'center',
  },
  selectedIndicatorBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: '#45A096',
    borderRadius: 8,
  },
  footerActionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F9F9FE',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  continueButton: {
    backgroundColor: '#418B93',
    width: '100%',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
