import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'UploadReportDetails'>;

const {width} = Dimensions.get('window');

export function UploadReportDetailsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const handleBrowse = async () => {
    await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      includeBase64: false,
    });
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
        <Text style={styles.headerTitleText}>Review Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Upload Report</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollCanvasContent}>
        <View style={styles.mainFormCard}>
          <View style={styles.uploadBoxBorder}>
            <View style={styles.uploadIconWrapper}>
              <Feather name="download" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.uploadTitleText}>Upload your Prescription here</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleBrowse}>
              <Text style={styles.browseHereText}>Browse Here</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Type of Report</Text>
            <TouchableOpacity style={styles.dropdownTrigger} activeOpacity={0.8}>
              <Text style={styles.dropdownValue}>Amlodipine</Text>
              <Feather name="chevron-down" size={20} color="#7D8797" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Report Title</Text>
            <View style={styles.textInputWrapper}>
              <TextInput
                style={styles.textInput}
                defaultValue="Hemoglobin"
                placeholderTextColor="#A0A5BA"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Report</Text>
            <View style={styles.dateSelectorBox}>
              <Text style={styles.dateText}>25-10-2025</Text>
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={20}
                color="#333333"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Report Provider</Text>
            <View style={styles.textInputWrapper}>
              <TextInput
                style={styles.textInput}
                defaultValue="Devcare Lab"
                placeholderTextColor="#A0A5BA"
              />
              <Feather name="search" size={20} color="#7D8797" style={styles.searchIcon} />
            </View>
          </View>

          <View style={styles.tipCardContainer}>
            <View style={styles.tipHeaderRow}>
              <MaterialCommunityIcons
                name="lightbulb-on"
                size={20}
                color="#FF9F43"
                style={styles.tipIcon}
              />
              <Text style={styles.tipTitleText}>Tip</Text>
            </View>
            <Text style={styles.tipBodyText}>
              Blood Sugar is slightly high. Please maintain diet and continue
              medication.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.dualActionFooterContainer, {bottom: 74 + insets.bottom}]}>
        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.uploadButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ReportUploadedSuccess')}>
          <Text style={styles.uploadButtonText}>Upload Reports</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.bottomTabBar, {paddingBottom: 12 + insets.bottom}]}>
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('PharmacyShop')}>
          <MaterialCommunityIcons name="clippy" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Pharmacy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MedicineList')}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Medication</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#45A096" />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
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
    backgroundColor: '#F9F9FE',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F9F9FE',
  },
  backButton: {
    padding: 2,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  headerSpacer: {width: 28},
  titleContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  scrollCanvasContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 160,
  },
  mainFormCard: {
    backgroundColor: '#FFFFFF',
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
  uploadBoxBorder: {
    width: '100%',
    height: 130,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCFCFE',
    borderWidth: 1.5,
    borderColor: '#45A096',
    borderStyle: 'dashed',
    marginBottom: 20,
    marginTop: 4,
  },
  uploadIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#45A096',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadTitleText: {
    fontSize: 14,
    color: '#7D8797',
    fontWeight: '400',
    marginBottom: 2,
  },
  browseHereText: {
    fontSize: 16,
    color: '#45A096',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    color: '#8A94A6',
    fontWeight: '500',
    marginBottom: 6,
    paddingLeft: 2,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2F7',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
    padding: 0,
  },
  searchIcon: {
    marginLeft: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F2F7',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  dropdownValue: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  dateSelectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F2F7',
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  dateText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  tipCardContainer: {
    backgroundColor: '#F2FAF9',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E1F2F0',
  },
  tipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tipIcon: {marginRight: 8},
  tipTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },
  tipBodyText: {
    fontSize: 13,
    color: '#5A6578',
    lineHeight: 18,
    fontWeight: '400',
  },
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
    backgroundColor: '#EBEFF5',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#5A6E85',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    flex: 1.4,
    backgroundColor: '#45A096',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#45A096',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    width: width / 5,
  },
  tabLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 5,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#45A096',
    fontWeight: '600',
  },
});
