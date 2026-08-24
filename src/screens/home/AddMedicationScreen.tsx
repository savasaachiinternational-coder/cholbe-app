import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import type { RootStackParamList } from '../../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeBottomNav } from './HomeBottomNav';
import type { BottomTabKey } from './homeData';
import { useMedicationDraft } from '../../context/MedicationDraftContext';
import { ApiError } from '../../api/client';
import { pickedFileFromAsset } from '../../utils/fileAsset';
import { WaveTitleBand } from '../../components/WaveTitleBand';
import { GradientWaveBand } from '../../components/GradientWaveBand';
import { FONT } from '../../theme/typography';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'AddMedication'>;

export function AddMedicationScreen({ navigation }: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const { resetDraft, uploadAndScan } = useMedicationDraft();
  const [selectedOption, setSelectedOption] = useState<
    'manual' | 'upload' | null
  >(null);
  const [uploading, setUploading] = useState(false);

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

  const browsePrescription = async () => {
    setSelectedOption('upload');
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });
    const asset = result.assets?.[0];
    if (!asset) return;
    const picked = pickedFileFromAsset(asset, 'prescription');
    if (!picked) return;

    setUploading(true);
    try {
      resetDraft({ source: 'gallery' });
      await uploadAndScan(
        picked.uri,
        picked.fileName,
        picked.mimeType,
        'gallery',
      );
      navigation.navigate('ReviewDetails');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not upload prescription';
      Alert.alert('Upload prescription', message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9FE" />

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

        {/* <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <MaterialCommunityIcons name="medical-bag" size={20} color="#00A896" />
            <Text style={styles.logoTextMain}>Cholbe</Text>
          </View>
          <Text style={styles.logoTextSub}>PHARMACY</Text>
        </View> */}

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
        <WaveTitleBand title={'Add Medication'} color="#F4F1FD" />
      </View>

      {/* <GradientWaveBand>
        <Text style={styles.gradientBandTitle}>Add Medication</Text>
      </GradientWaveBand> */}

      <View style={styles.titleContainer}>
        
        {/* <Text style={styles.screenTitle}>Add Medication</Text> */}
      </View>

      <View style={styles.contentCard}>
        <TouchableOpacity
          style={[
            styles.selectionBox,
            styles.manualBoxBorder,
            selectedOption === 'manual' && styles.activeSelection,
          ]}
          activeOpacity={0.8}
          onPress={() => setSelectedOption('manual')}
        >
          <View style={styles.manualIconWrapper}>
            <MaterialCommunityIcons
              name="file-document-edit-outline"
              size={32}
              color="#45A096"
            />
          </View>
          <Text style={styles.selectionText}>Manual Entry</Text>
        </TouchableOpacity>

        <Text style={styles.dividerText}>or</Text>

        <TouchableOpacity
          style={[
            styles.selectionBox,
            styles.uploadBoxBorder,
            selectedOption === 'upload' && styles.activeSelection
          ]}
          activeOpacity={0.8}
          onPress={() => setSelectedOption('upload')}
        >
          <View style={styles.uploadIconWrapper}>
            <Feather name="download" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.uploadTitleText}>
            Upload your Prescription here
          </Text>
          <TouchableOpacity activeOpacity={0.8} onPress={browsePrescription}>
            <Text style={styles.browseHereText}>
              {uploading ? 'Uploading...' : 'Browse Here'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <View
        style={[styles.footerActionContainer, { bottom: 74 + insets.bottom }]}
      >
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedOption || uploading) && styles.continueButtonDisabled,
          ]}
          activeOpacity={0.9}
          disabled={!selectedOption || uploading}
          onPress={() => {
            if (selectedOption === 'manual') {
              resetDraft({ source: 'manual' });
              navigation.navigate('AddMedicationForm');
              return;
            }
            if (selectedOption === 'upload') {
              resetDraft({ source: 'camera' });
              navigation.navigate('UploadReport');
            }
          }}
        >
          <Text style={styles.continueButtonText}>
            {uploading ? 'Uploading...' : 'Continue'}
          </Text>
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
  container: {
    flex: 1,
    backgroundColor: '#F4F1FD',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor:'#F4F1FD',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  iconImage: {
    height: 48,
    width: 150,
    resizeMode: 'cover',
  },
  headerIconButton: {
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
  gradientBandTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
    textAlign: 'center',
    includeFontPadding: false,
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
  contentCard: {
    flex: 1,
    backgroundColor: '#F4F1FD',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    shadowColor: '#E0E4F0',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  selectionBox: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F2FE',
    elevation:.01,
  },
  manualBoxBorder: {
    borderWidth: 1,
    borderColor: '#E2E6EE',
    borderStyle: 'dashed',
  },
  uploadBoxBorder: {
    borderWidth: 1.5,
    borderColor: '#45A096',
    borderStyle: 'dashed',
  },
  activeSelection: {
    backgroundColor: '#F2FAF9',
    borderColor: '#45A096',
  },
  manualIconWrapper: {
    marginBottom: 8,
  },
  uploadIconWrapper: {
    width: 40,
    height: 40,
     marginTop:24,
    borderRadius: 12,
    backgroundColor: '#45A096',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectionText: {
    fontSize: 16,
    color: '#8A94A6',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  uploadTitleText: {
    fontSize: 14,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
    marginBottom: 4,
  },
  browseHereText: {
    fontSize: 16,
    marginBottom:24,
    color: '#4DA69F',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  dividerText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#7D8797',
    marginVertical: 24,
  },
  continueButton: {
    backgroundColor: '#418B93',
    width: '100%',
    borderRadius: 100,
    paddingVertical:12,
    paddingHorizontal:16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  footerActionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F5F2FE',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F7',
    zIndex: 9,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width / 5,
  },
});
