import { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import type { RootStackParamList } from '../../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeBottomNav } from './HomeBottomNav';
import type { BottomTabKey } from './homeData';
import { WaveTitleBand } from '../../components/WaveTitleBand';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'UploadReport'>;
type UploadOption = 'camera' | 'gallery' | 'saved';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40 - 16) / 2;

const UPLOAD_OPTIONS: {
  key: UploadOption;
  label: string;
  icon: () => React.ReactElement;
}[] = [
  {
    key: 'camera',
    label: 'Camera',
    icon: () => (
      <MaterialCommunityIcons
        name="camera-plus-outline"
        size={36}
        color="#45A096"
      />
    ),
  },
  {
    key: 'gallery',
    label: 'Gallery',
    icon: () => <Feather name="image" size={34} color="#45A096" />,
  },
  {
    key: 'saved',
    label: 'Saved Report',
    icon: () => <Feather name="save" size={34} color="#45A096" />,
  },
];

export function UploadReportScreen({ navigation }: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState<UploadOption>('camera');
  const bottomNavHeight = 74 + insets.bottom;

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

  const handleContinue = () => {
    if (selectedOption === 'camera') {
      navigation.navigate('AddFromCamera');
      return;
    }
    if (selectedOption === 'gallery') {
      navigation.navigate('ChooseFromGallery');
      return;
    }
    if (selectedOption === 'saved') {
      navigation.navigate('SavedPrescription');
      return;
    }
    navigation.navigate('ReportsList');
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

        {/* <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <MaterialCommunityIcons
              name="medical-bag"
              size={20}
              color="#00A896"
            />
            <Text style={styles.logoTextMain}>Cholbe</Text>
          </View>
          <Text style={styles.logoTextSub}>PHARMACY</Text>
        </View> */}
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

      {/* <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Upload Report</Text>
      </View> */}

      <View
        style={{ marginTop: -16, justifyContent: 'center', marginBottom: 12 }}
      >
        <WaveTitleBand title={'Upload Documents'} color="#F4F1FD" />
      </View>


      <View
        style={[styles.contentCard, { paddingBottom: bottomNavHeight + 88 }]}
      >
        <View style={styles.gridContainer}>
          {UPLOAD_OPTIONS.map((opt, index) => {
            const active = selectedOption === opt.key;
            const isLastInRow = index % 2 === 1;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.gridCard,
                  active ? styles.activeBorder : styles.inactiveBorder,
                  active && styles.activeBackground,
                  isLastInRow && styles.gridCardNoRight,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedOption(opt.key)}
              >
                {opt.icon()}
                <Text
                  style={[styles.cardText, active && styles.activeCardText]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.footerActionContainer, { bottom: bottomNavHeight }]}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.9}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
  container: { flex: 1, backgroundColor: '#F4F1FD' },
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
  contentCard: {
    flex: 1,
    backgroundColor: '#F4F1FD',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 20,
    paddingTop: 36,
    shadowColor: '#E0E4F0',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.05,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCFCFE',
    marginBottom: 16,
    marginRight: 16,
  },
  gridCardNoRight: { marginRight: 0 },
  activeBorder: {
    borderWidth: 1.5,
    borderColor: '#45A096',
    borderStyle: 'dashed',
  },
  inactiveBorder: {
    borderWidth: 1,
    borderColor: '#E2E6EE',
    borderStyle: 'dashed',
  },
  activeBackground: { backgroundColor: '#F2FAF9' },
  cardText: {
    fontSize: 16,
    color: '#5A6578',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginTop: 14,
  },
  activeCardText: { color: '#3B4859', fontFamily: FONT.semibold, fontWeight: '600' },
  continueButton: {
    backgroundColor: '#418B93',
    width: '100%',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: { color: '#FFFFFF', fontSize: 18, fontFamily: FONT.semibold, fontWeight: '600' },
  footerActionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F4F1FD',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F7',
    zIndex: 20,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
