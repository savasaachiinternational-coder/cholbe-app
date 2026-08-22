import { ReactNode } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabKey } from '../screens/home/homeData';
import { WaveTitleBand } from './WaveTitleBand';
import { navigateCustomerTab } from '../screens/home/customerTabNavigation';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
const { width } = Dimensions.get('window');

type Navigation = NativeStackNavigationProp<RootStackParamList>;

// Android resolves a weight by the exact font file name, so each weight is
// referenced by its own family name.
const FONT = {
  regular: 'ProximaNova-Regular',
  medium: 'ProximaNova-Medium',
  semibold: 'ProximaNova-Semibold',
  bold: 'ProximaNova-Bold',
} as const;

type Props = {
  title: string;
  subtitle?: string;
  uploadLabel: string;
  onUpload: () => void;
  activeTab: BottomTabKey;
  onTabPress: (tab: BottomTabKey) => void;
  onBack: () => void;
  onNotifications?: () => void;
  children: ReactNode;
};

export function PassportListScreenLayout({
  title,
  subtitle,
  uploadLabel,
  onUpload,
  activeTab,
  onTabPress,
  onBack,
  onNotifications,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={onBack}
        >
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>
        <Image
          source={require('../assets/logoImage.png')}
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
          onPress={onNotifications}
        >
          <Feather name="bell" size={24} color="#333333" />
        </TouchableOpacity>
      </View>
      <View
        style={{ marginTop: -16, justifyContent: 'center', marginBottom: 12 }}
      >
        <WaveTitleBand
          title={title}
          color="#F9F9FE"
          style={styles.screenTitle}
        />
      </View>
      {/*      

      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
      </View> */}

      <View style={[styles.body, { paddingBottom: insets.bottom + 96 }]}>
        <TouchableOpacity
          style={passportListLayoutStyles.uploadBar}
          activeOpacity={0.85}
          onPress={onUpload}
        >
          <MaterialCommunityIcons
            name="cloud-upload-outline"
            size={24}
            color="#FFFFFF"
            style={passportListLayoutStyles.uploadIcon}
          />
          <Text style={passportListLayoutStyles.uploadText}>{uploadLabel}</Text>
        </TouchableOpacity>
        {children}
      </View>

      <TouchableOpacity
        style={[styles.floatingGradientFab, { bottom: insets.bottom + 94 }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AiSymptomHome')}
      >
        <Image source={require('../assets/syaiicon.png')} />
        {/* <View style={styles.fabInnerContent}>
          <MaterialCommunityIcons
            name="face-recognition"
            size={26}
            color="#203E5F"
          />
        </View> */}
      </TouchableOpacity>

      <View
        style={[styles.bottomTabBar, { paddingBottom: 12 + insets.bottom }]}
      >
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => onTabPress('home')}
        >
          <Feather
            name="home"
            size={24}
            color={activeTab === 'home' ? '#45A096' : '#A0A5BA'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'home' && styles.activeTabLabel,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => onTabPress('pharmacy')}
        >
          <MaterialCommunityIcons
            name="clippy"
            size={24}
            color={activeTab === 'pharmacy' ? '#45A096' : '#A0A5BA'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'pharmacy' && styles.activeTabLabel,
            ]}
          >
            Pharmacy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => onTabPress('medication')}
        >
          <MaterialCommunityIcons
            name="heart-pulse"
            size={24}
            color={activeTab === 'medication' ? '#45A096' : '#A0A5BA'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'medication' && styles.activeTabLabel,
            ]}
          >
            Medication
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => onTabPress('report')}
        >
          <MaterialCommunityIcons
            name="file-document-outline"
            size={24}
            color={activeTab === 'report' ? '#45A096' : '#A0A5BA'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'report' && styles.activeTabLabel,
            ]}
          >
            Report
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => onTabPress('profile')}
        >
          <Feather
            name="user"
            size={24}
            color={activeTab === 'profile' ? '#45A096' : '#A0A5BA'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'profile' && styles.activeTabLabel,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const passportListLayoutStyles = StyleSheet.create({
  uploadBar: {
    backgroundColor: '#45A096',
    width: '100%',
    height: 50,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#45A096',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadIcon: { marginRight: 10 },
  uploadText: {
    color: '#EDF7F6',
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9FE',
  },
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
    fontFamily: FONT.bold,
    fontWeight: '700',
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
    marginTop: 20,
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 18,
    fontFamily: FONT.bold,
    fontWeight: '600',
    color: '#424242',
  },
  screenSubtitle: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: '#8A94A6',
    marginTop: 4,
    fontWeight: '500',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
  },
  floatingGradientFab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8CE79B',
    shadowColor: '#203E5F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  fabInnerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6DBAE7',
    opacity: 0.9,
  },
  bottomTabBar: {
    flexDirection: 'row',
    minHeight: 74,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F7',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
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
    width: width / 5,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: '#9CA3AF',
    marginTop: 5,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#45A096',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
