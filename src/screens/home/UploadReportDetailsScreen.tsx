import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary, type Asset} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {reportsApi, type ReportType} from '../../api/reports';
import {profileApi} from '../../api/profile';
import {uploadFile} from '../../api/uploads';
import {ApiError} from '../../api/client';
import {DatePickerField} from '../../components/MedicationPickers';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'UploadReportDetails'>;

const {width} = Dimensions.get('window');

const REPORT_TYPES: {label: string; value: ReportType}[] = [
  {label: 'Lab Report', value: 'LAB'},
  {label: 'Prescription', value: 'PRESCRIPTION'},
  {label: 'Imaging', value: 'IMAGING'},
  {label: 'Other', value: 'OTHER'},
];

export function UploadReportDetailsScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const initial = route.params;

  const [fileAsset, setFileAsset] = useState<Asset | null>(
    initial?.fileUri
      ? {
          uri: initial.fileUri,
          fileName: initial.fileName,
          type: initial.mimeType,
        }
      : null,
  );
  const [existingFileUrl, setExistingFileUrl] = useState(initial?.existingFileUrl);
  const [reportType, setReportType] = useState<ReportType>(
    initial?.reportType ?? 'LAB',
  );
  const [title, setTitle] = useState(initial?.reportTitle ?? '');
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [provider, setProvider] = useState(initial?.provider ?? '');
  const [patientName, setPatientName] = useState('');
  const [referredDoctorName, setReferredDoctorName] = useState('');
  const [referredDoctorSpecialty, setReferredDoctorSpecialty] = useState('');
  const [tip, setTip] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [typePickerOpen, setTypePickerOpen] = useState(false);

  useEffect(() => {
    if (!title && (fileAsset?.fileName || initial?.existingFileName)) {
      const sourceName = fileAsset?.fileName ?? initial?.existingFileName ?? '';
      setTitle(sourceName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
    }
  }, [fileAsset?.fileName, initial?.existingFileName, title]);

  useEffect(() => {
    let cancelled = false;
    profileApi
      .overview()
      .then(overview => {
        if (cancelled) return;
        setPatientName(overview.user.fullName ?? '');
        const doctor = overview.assignedDoctor;
        if (doctor) {
          setReferredDoctorName(doctor.user.fullName ?? '');
          setReferredDoctorSpecialty(doctor.specialty ?? '');
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleBrowse = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });
    if (result.assets?.[0]) {
      setFileAsset(result.assets[0]);
      setExistingFileUrl(undefined);
    }
  };

  const handleUpload = async () => {
    if (!fileAsset?.uri && !existingFileUrl) {
      Alert.alert('Upload report', 'Please select a file first.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Upload report', 'Please enter a report title.');
      return;
    }
    setLoading(true);
    try {
      const uploaded = fileAsset?.uri
        ? await uploadFile(
            '/uploads/report',
            fileAsset.uri,
            fileAsset.fileName ?? 'report.jpg',
            fileAsset.type ?? 'image/jpeg',
          )
        : {
            fileUrl: existingFileUrl!,
            fileName: initial?.existingFileName ?? title.trim(),
            mimeType: initial?.mimeType ?? 'image/jpeg',
            size: 0,
          };

      await reportsApi.create({
        title: title.trim(),
        reportType,
        provider: provider.trim() || undefined,
        reportDate,
        fileUrl: uploaded.fileUrl,
        fileName: uploaded.fileName,
        mimeType: uploaded.mimeType,
        tip: tip.trim() || undefined,
        patientName: patientName.trim() || undefined,
        referredDoctorName: referredDoctorName.trim() || undefined,
        referredDoctorSpecialty: referredDoctorSpecialty.trim() || undefined,
        comments: comments.trim() || undefined,
      });
      navigation.navigate('ReportUploadedSuccess');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Upload failed';
      Alert.alert('Upload failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={20} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Review Details</Text>
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
            {fileAsset?.uri ? (
              <Image source={{uri: fileAsset.uri}} style={styles.selectedPreview} />
            ) : null}
            <Text style={styles.uploadTitleText}>
              {fileAsset?.fileName ??
                initial?.existingFileName ??
                'Upload your Report here'}
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleBrowse}>
              <Text style={styles.browseHereText}>
                {existingFileUrl && !fileAsset?.uri ? 'Replace file' : 'Browse Here'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Type of Report</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              activeOpacity={0.8}
              onPress={() => setTypePickerOpen(prev => !prev)}>
              <Text style={styles.dropdownValue}>
                {REPORT_TYPES.find(t => t.value === reportType)?.label ?? reportType}
              </Text>
              <Feather name="chevron-down" size={20} color="#7D8797" />
            </TouchableOpacity>
            {typePickerOpen &&
              REPORT_TYPES.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.typeOption}
                  onPress={() => {
                    setReportType(opt.value);
                    setTypePickerOpen(false);
                  }}>
                  <Text style={styles.typeOptionText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Report Title</Text>
            <View style={styles.textInputWrapper}>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#A0A5BA"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Report</Text>
            <DatePickerField
              label="Date of Report"
              value={reportDate}
              onChange={setReportDate}
              style={styles.dateSelectorBox}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Report Provider</Text>
            <View style={styles.textInputWrapper}>
              <TextInput
                style={styles.textInput}
                value={provider}
                onChangeText={setProvider}
                placeholderTextColor="#A0A5BA"
              />
              <Feather name="search" size={20} color="#7D8797" style={styles.searchIcon} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Patient Name</Text>
            <View style={styles.textInputWrapper}>
              <TextInput
                style={styles.textInput}
                value={patientName}
                onChangeText={setPatientName}
                placeholderTextColor="#A0A5BA"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Referred Doctor</Text>
            <View style={styles.textInputWrapper}>
              <TextInput
                style={styles.textInput}
                value={referredDoctorName}
                onChangeText={setReferredDoctorName}
                placeholder="Doctor name"
                placeholderTextColor="#A0A5BA"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Doctor Specialty</Text>
            <View style={styles.textInputWrapper}>
              <TextInput
                style={styles.textInput}
                value={referredDoctorSpecialty}
                onChangeText={setReferredDoctorSpecialty}
                placeholder="Specialty"
                placeholderTextColor="#A0A5BA"
              />
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
            <TextInput
              style={styles.tipInput}
              value={tip}
              onChangeText={setTip}
              placeholder="Add notes about this report (optional)"
              placeholderTextColor="#8A94A6"
              multiline
            />
          </View>

          <View style={styles.tipCardContainer}>
            <View style={styles.tipHeaderRow}>
              <MaterialCommunityIcons
                name="comment-text-outline"
                size={20}
                color="#45A096"
                style={styles.tipIcon}
              />
              <Text style={styles.tipTitleText}>Comments</Text>
            </View>
            <TextInput
              style={styles.tipInput}
              value={comments}
              onChangeText={setComments}
              placeholder="Doctor comments or follow-up notes (optional)"
              placeholderTextColor="#8A94A6"
              multiline
            />
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
          style={[styles.uploadButton, loading && styles.buttonDisabled]}
          activeOpacity={0.8}
          disabled={loading}
          onPress={handleUpload}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload Reports</Text>
          )}
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
    backgroundColor: '#F5F2FE',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:10,
    paddingHorizontal: 16,
    marginBottom:24,
    backgroundColor: '#F5F2FE',
  },
  backButton: {
    padding: 2,
  },
  headerTitleText: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  headerSpacer: {width: 24},
  titleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  scrollCanvasContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 160,
  },
  mainFormCard: {
    backgroundColor: '#F5F4FD',
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
    height: 190,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F4FD',
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
    fontFamily: FONT.regular,
    fontWeight: '400',
    marginBottom: 2,
    marginTop: 8,
  },
  selectedPreview: {
    width: '88%',
    height: 120,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  browseHereText: {
    fontSize: 16,
    color: '#45A096',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
    marginBottom: 6,
    paddingLeft: 2,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4FD',
    borderRadius: 12,
    height: 40,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
    padding: 0,
  },
  searchIcon: {
    marginLeft: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F4FD',
    borderRadius: 12,
    height: 40,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  dropdownValue: {
    fontSize: 12,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  dateSelectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F4FD',
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  dateText: {
    fontSize: 14,
    color: '#495057',
    fontFamily: FONT.medium,
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
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#616161',
  },
  tipBodyText: {
    fontSize: 12,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  tipInput: {
    fontSize: 12,
    color: '#616161',
    lineHeight: 18,
    minHeight: 56,
    fontFamily: FONT.regular,
    fontWeight: '400',
    textAlignVertical: 'top',
    padding: 0,
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
    backgroundColor: '#E6E3EE',
    height: 44,
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
  uploadButton: {
    flex: 1.4,
    backgroundColor: '#4DA69F',
    height: 44,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#45A096',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  typeOption: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF3',
  },
  typeOptionText: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: '#333D47',
  },
  dateInput: {
    flex: 1,
    padding: 0,
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
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#45A096',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
