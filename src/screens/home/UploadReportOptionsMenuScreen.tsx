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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import type { RootStackParamList } from '../../navigation/types';
import { WaveTitleBand } from '../../components/WaveTitleBand';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'UploadReportOptionsMenu'
>;
type UploadOption = 'camera' | 'gallery' | 'saved';

const { width } = Dimensions.get('window');
const CARD_SPACING = 16;
const CARD_WIDTH = (width - 40 - CARD_SPACING) / 2;

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
        size={32}
        color="#45A096"
      />
    ),
  },
  {
    key: 'gallery',
    label: 'Gallery',
    icon: () => <Feather name="image" size={30} color="#45A096" />,
  },
  {
    key: 'saved',
    label: 'Saved Report',
    icon: () => <Feather name="save" size={30} color="#45A096" />,
  },
];

export function UploadReportOptionsMenuScreen({ navigation }: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState<UploadOption>('camera');
  const bottomNavHeight = 74 + insets.bottom;

  const handleContinue = () => {
    if (selectedOption === 'camera') {
      navigation.navigate('CameraReport');
      return;
    }
    if (selectedOption === 'gallery') {
      navigation.navigate('ChooseFromReportGallery');
      return;
    }
    if (selectedOption === 'saved') {
      navigation.navigate('SavedReport');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>

        {/* <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <MaterialCommunityIcons name="medical-bag" size={20} color="#00A896" />
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
      <WaveTitleBand
        title="Add Report"
        color="#F4F1FD"
        style={styles.waveText}
      />

      {/* <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Upload Report</Text>
      </View> */}

      <View
        style={[styles.contentCard, { paddingBottom: bottomNavHeight + 88 }]}
      >
        <View style={styles.gridWrapper}>
          {UPLOAD_OPTIONS.map(opt => {
            const active = selectedOption === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.optionCard,
                  active ? styles.activeCardBorder : styles.inactiveCardBorder,
                  active && styles.activeCardBackground,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedOption(opt.key)}
              >
                <View style={styles.iconBox}>{opt.icon()}</View>
                <Text style={styles.cardLabelText}>{opt.label}</Text>
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

      <View
        style={[styles.bottomTabBar, { paddingBottom: 12 + insets.bottom }]}
      >
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}
        >
          <Feather name="home" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('PharmacyShop')}
        >
          <MaterialCommunityIcons name="clippy" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Pharmacy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MedicineList')}
        >
          <MaterialCommunityIcons
            name="heart-pulse"
            size={24}
            color="#A0A5BA"
          />
          <Text style={styles.tabLabel}>Medication</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={24}
            color="#45A096"
          />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MyProfile')}
        >
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
    backgroundColor: '#F4F1FD',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  iconImage: {
    height: 48,
    width: 150,
    resizeMode: 'cover',
  },
  headerIconButton: {
    padding: 4,
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
    fontSize: 20,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#333333',
  },
  waveText: {
    color: '#424242',
    fontSize: 18,
    paddingBottom:30,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#F4F1FD',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 20,
    marginTop:-20,
    paddingTop: 40,
    shadowColor: '#E0E4F0',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 4,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_SPACING,
    justifyContent: 'flex-start',
  },
  optionCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.05,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F2FE',
    elevation:0.1,
  },
  activeCardBorder: {
    borderWidth: 1.5,
    borderColor: '#45A096',
    borderStyle: 'dashed',
  },
  inactiveCardBorder: {
    borderWidth: 1,
    borderColor: '#E2E6EE',
    borderStyle: 'dashed',
  },
  activeCardBackground: {
    backgroundColor: '#F5F2FE',
  },
  iconBox: {
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  cardLabelText: {
    fontSize: 16,
    color: '#7D8797',
    fontFamily: FONT.medium,
    fontWeight: '500',
    textAlign: 'center',
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
  footerActionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F7',
    zIndex: 20,
    elevation: 20,
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
    zIndex: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width / 5,
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
