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
import { HomeBottomNav } from './HomeBottomNav';
import type { BottomTabKey } from './homeData';
import { navigateCustomerTab } from './customerTabNavigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddReportMenu'>;

const { width } = Dimensions.get('window');

export function AddReportMenuScreen({ navigation }: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState<
    'manual' | 'upload' | null
  >(null);

  const handleContinue = () => {
    if (!selectedOption) {
      return;
    }
    if (selectedOption === 'manual') {
      navigation.navigate('UploadReportDetails');
      return;
    }
    navigation.navigate('UploadReportOptionsMenu');
  };

  const handleTabPress = (tab: BottomTabKey) => {
    navigateCustomerTab(navigation, tab);
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

      <WaveTitleBand title='Add Report' color='#F4F1FD' style={styles.waveText}/>

      {/* <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Add Report</Text>
      </View> */}

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
            styles.uploadOuterBox,
            styles.uploadBoxBorder,
            selectedOption === 'upload' && styles.activeSelection,
          ]}
          activeOpacity={0.8}
          onPress={() => setSelectedOption('upload')}
        >
          <View style={styles.uploadIconWrapper}>
            <Feather name="download" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.uploadTitleText}>Upload your Report here</Text>
          <Text style={styles.browseHereText}>Browse Here</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedOption && styles.continueButtonDisabled,
          ]}
          activeOpacity={0.9}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* <View
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
      </View> */}

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab={'report'}
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
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backButton: {
    padding: 4,
    backgroundColor:'#F4F1FD'
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
  waveText:{
    color:'#424242',
    fontSize:18,
    fontFamily: FONT.semibold,
    fontWeight: '600'
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
  contentCard: {
    flex: 1,
    backgroundColor: '#F4F1FD',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 48,
    shadowColor: '#E0E4F0',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  selectionBox: {
    flexDirection:'row',
    gap:5,
    width: '100%',
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F2FE',
    elevation:1,
  },
    uploadOuterBox: {
    gap:5,
    width: '100%',
    height: 140,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F2FE',
    elevation:1,
  },
  manualBoxBorder: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    flexDirection:'row',
    gap:5,
    marginBottom: 8,
  },
  uploadIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#45A096',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectionText: {
    fontSize: 14,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
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
    color: '#4DA69F',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  dividerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#7D8797',
    fontFamily: FONT.regular,
    fontWeight: '400',
    marginVertical: 24,
  },
  continueButton: {
    backgroundColor: '#418B93',
    width: '100%',
    height: 50,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 30,
  },
  continueButtonDisabled: {
    opacity: 0.85,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomTabBar: {
    flexDirection: 'row',
    minHeight: 74,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F7',
    justifyContent: 'space-around',
    alignItems: 'center',
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

