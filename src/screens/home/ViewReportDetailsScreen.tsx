import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {reportsApi, type HealthReport} from '../../api/reports';
import {ApiError} from '../../api/client';
import {DatePickerField} from '../../components/MedicationPickers';
import {ReportFilePreview} from '../../components/ReportFilePreview';
import {isImageFile, isPdfFile} from '../../utils/fileAsset';
import {formatLongReportDate, toIsoDateString} from '../../utils/reportFormat';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ViewReportDetails'>;

const {width} = Dimensions.get('window');

export function ViewReportDetailsScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const reportId = route.params?.reportId;
  const bottomNavHeight = 74 + insets.bottom;
  const footerHeight = 88;
  const footerGap = 24;

  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [morningReminder, setMorningReminder] = useState(true);
  const [nightReminder, setNightReminder] = useState(true);

  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [tip, setTip] = useState('');
  const [patientName, setPatientName] = useState('');
  const [referredDoctorName, setReferredDoctorName] = useState('');
  const [referredDoctorSpecialty, setReferredDoctorSpecialty] = useState('');
  const [comments, setComments] = useState('');

  const loadReport = useCallback(async () => {
    if (!reportId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await reportsApi.get(reportId);
      setReport(data);
      setTitle(data.title);
      setProvider(data.provider ?? '');
      setReportDate(toIsoDateString(data.reportDate));
      setTip(data.tip ?? '');
      setPatientName(data.patientName ?? '');
      setReferredDoctorName(data.referredDoctorName ?? '');
      setReferredDoctorSpecialty(data.referredDoctorSpecialty ?? '');
      setComments(data.comments ?? '');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load report';
      Alert.alert('View Report', message);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [loadReport]),
  );

  const handleEditPress = async () => {
    if (!editing) {
      setEditing(true);
      return;
    }
    if (!reportId) return;
    setSaving(true);
    try {
      const updated = await reportsApi.update(reportId, {
        title: title.trim(),
        provider: provider.trim() || undefined,
        reportDate,
        tip: tip.trim() || undefined,
        patientName: patientName.trim() || undefined,
        referredDoctorName: referredDoctorName.trim() || undefined,
        referredDoctorSpecialty: referredDoctorSpecialty.trim() || undefined,
        comments: comments.trim() || undefined,
      });
      setReport(updated);
      setTitle(updated.title);
      setProvider(updated.provider ?? '');
      setReportDate(toIsoDateString(updated.reportDate));
      setTip(updated.tip ?? '');
      setPatientName(updated.patientName ?? '');
      setReferredDoctorName(updated.referredDoctorName ?? '');
      setReferredDoctorSpecialty(updated.referredDoctorSpecialty ?? '');
      setComments(updated.comments ?? '');
      setEditing(false);
      Alert.alert('Report', 'Report updated successfully.');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save report';
      Alert.alert('Save failed', message);
    } finally {
      setSaving(false);
    }
  };

  const tipLines = (editing ? tip : report?.tip ?? '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>View Report</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <ActivityIndicator color="#45A096" style={styles.loader} />
      ) : !report ? (
        <Text style={styles.emptyText}>Report not found.</Text>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollCanvasContent,
            {paddingBottom: bottomNavHeight + footerHeight + footerGap},
          ]}>
          <View style={styles.reportMainCard}>
            <View style={styles.topPillRow}>
              <View style={styles.alertMiniPill}>
                <Feather name="bell" size={16} color="#7D8797" style={styles.bellIcon} />
                <Text style={styles.alertPillText}>8:00 am</Text>
                <Switch
                  trackColor={{false: '#E2E6EE', true: '#45A096'}}
                  thumbColor="#FFFFFF"
                  value={morningReminder}
                  onValueChange={setMorningReminder}
                  style={styles.pillSwitchScale}
                />
              </View>

              <View style={styles.alertMiniPill}>
                <Feather name="bell" size={16} color="#7D8797" style={styles.bellIcon} />
                <Text style={styles.alertPillText}>8:00 pm</Text>
                <Switch
                  trackColor={{false: '#E2E6EE', true: '#45A096'}}
                  thumbColor="#FFFFFF"
                  value={nightReminder}
                  onValueChange={setNightReminder}
                  style={styles.pillSwitchScale}
                />
              </View>
            </View>

            <View style={styles.metaTitleBlock}>
              {editing ? (
                <TextInput
                  style={styles.editTitleInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Report title"
                  placeholderTextColor="#A0A5BA"
                />
              ) : (
                <Text style={styles.reportNameText}>{report.title}</Text>
              )}
              <Text style={styles.reportSubtext}>Blood test metrics report details</Text>
            </View>

            <View style={styles.embeddedDocumentCard}>
              <ReportFilePreview
                fileUrl={report.fileUrl}
                mimeType={report.mimeType}
                fileName={report.fileName}
                variant="hero"
                rounded={false}
                size={88}
              />
              <Text style={styles.documentCardLabelText}>
                {isPdfFile(report.mimeType, report.fileUrl, report.fileName)
                  ? 'PDF Report File'
                  : isImageFile(report.mimeType, report.fileUrl, report.fileName)
                    ? 'Image Report File'
                    : 'Report Document File'}
              </Text>
            </View>

            <View style={styles.infoBlockRow}>
              <View style={styles.iconColumn}>
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={20}
                  color="#45A096"
                />
              </View>
              <View style={styles.detailsColumn}>
                <Text style={styles.sectionLabelText}>Date</Text>
                {editing ? (
                  <DatePickerField
                    label="Date of Report"
                    value={reportDate}
                    onChange={setReportDate}
                    style={styles.editDatePicker}
                  />
                ) : (
                  <Text style={styles.inlineInfoValueText}>
                    Date :{' '}
                    <Text style={styles.boldSpan}>
                      {formatLongReportDate(report.reportDate)}
                    </Text>
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.dividerLine} />

            <View style={styles.infoBlockRow}>
              <View style={styles.iconColumn}>
                <MaterialCommunityIcons name="storefront-outline" size={20} color="#45A096" />
              </View>
              <View style={styles.detailsColumn}>
                <Text style={styles.sectionLabelText}>Provider</Text>
                {editing ? (
                  <TextInput
                    style={styles.editFieldInput}
                    value={provider}
                    onChangeText={setProvider}
                    placeholder="Report provider"
                    placeholderTextColor="#A0A5BA"
                  />
                ) : (
                  <Text style={styles.inlineInfoValueText}>
                    Provider :{' '}
                    <Text style={styles.boldSpan}>{report.provider ?? '—'}</Text>
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.dividerLine} />

            <View style={styles.infoBlockRow}>
              <View style={styles.iconColumn}>
                <Feather name="user" size={20} color="#45A096" />
              </View>
              <View style={styles.detailsColumn}>
                <Text style={styles.sectionLabelText}>Patient</Text>
                {editing ? (
                  <TextInput
                    style={styles.editFieldInput}
                    value={patientName}
                    onChangeText={setPatientName}
                    placeholder="Patient name"
                    placeholderTextColor="#A0A5BA"
                  />
                ) : (
                  <Text style={styles.inlineInfoValueText}>
                    Patient :{' '}
                    <Text style={styles.boldSpan}>{report.patientName ?? '—'}</Text>
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.dividerLine} />

            <View style={styles.infoBlockRow}>
              <View style={styles.iconColumn}>
                <MaterialCommunityIcons name="stethoscope" size={20} color="#45A096" />
              </View>
              <View style={styles.detailsColumn}>
                <Text style={styles.sectionLabelText}>Referred Doctor</Text>
                {editing ? (
                  <>
                    <TextInput
                      style={styles.editFieldInput}
                      value={referredDoctorName}
                      onChangeText={setReferredDoctorName}
                      placeholder="Doctor name"
                      placeholderTextColor="#A0A5BA"
                    />
                    <TextInput
                      style={[styles.editFieldInput, styles.editFieldInputSpaced]}
                      value={referredDoctorSpecialty}
                      onChangeText={setReferredDoctorSpecialty}
                      placeholder="Specialty"
                      placeholderTextColor="#A0A5BA"
                    />
                  </>
                ) : (
                  <Text style={styles.inlineInfoValueText}>
                    Doctor :{' '}
                    <Text style={styles.boldSpan}>
                      {report.referredDoctorName ?? '—'}
                      {report.referredDoctorSpecialty
                        ? ` (${report.referredDoctorSpecialty})`
                        : ''}
                    </Text>
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.dividerLine} />

            <View style={[styles.infoBlockRow, styles.tipRow]}>
              <View style={styles.iconColumn}>
                <MaterialCommunityIcons
                  name="lightbulb-on-outline"
                  size={20}
                  color="#45A096"
                />
              </View>
              <View style={styles.detailsColumn}>
                <Text style={styles.sectionLabelText}>Tip :</Text>
                {editing ? (
                  <TextInput
                    style={styles.editTipInput}
                    value={tip}
                    onChangeText={setTip}
                    placeholder="Add notes about this report"
                    placeholderTextColor="#A0A5BA"
                    multiline
                  />
                ) : tipLines.length ? (
                  tipLines.map((line, index) => (
                    <View key={`${line}-${index}`} style={styles.timelineItem}>
                      <View style={styles.orangeDot} />
                      <Text style={styles.timelineContentText}>{line}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.timelineContentText}>—</Text>
                )}
              </View>
            </View>

            <View style={styles.dividerLine} />

            <View style={[styles.infoBlockRow, styles.tipRow]}>
              <View style={styles.iconColumn}>
                <MaterialCommunityIcons
                  name="comment-text-outline"
                  size={20}
                  color="#45A096"
                />
              </View>
              <View style={styles.detailsColumn}>
                <Text style={styles.sectionLabelText}>Comments</Text>
                {editing ? (
                  <TextInput
                    style={styles.editTipInput}
                    value={comments}
                    onChangeText={setComments}
                    placeholder="Doctor comments or follow-up notes"
                    placeholderTextColor="#A0A5BA"
                    multiline
                  />
                ) : (
                  <Text style={styles.timelineContentText}>
                    {report.comments?.trim() || '—'}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.outlinedEditButton}
              activeOpacity={0.7}
              disabled={saving}
              onPress={handleEditPress}>
              {saving ? (
                <ActivityIndicator color="#45A096" />
              ) : (
                <Text style={styles.outlinedEditButtonText}>
                  {editing ? 'Save' : 'Edit'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <View style={[styles.footerActionContainer, {bottom: bottomNavHeight}]}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ReportsList')}>
          <Text style={styles.continueButtonText}>Continue</Text>
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
  },
  scrollCanvasContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  reportMainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#E0E4F0',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F2F7',
  },
  topPillRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  alertMiniPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF1F6',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: 10,
  },
  bellIcon: {marginRight: 6},
  alertPillText: {
    fontSize: 14,
    color: '#5A6578',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginRight: 6,
  },
  pillSwitchScale: {
    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
  },
  metaTitleBlock: {
    marginBottom: 20,
    paddingLeft: 4,
  },
  reportNameText: {
    fontSize: 20,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  editTitleInput: {
    fontSize: 20,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
    backgroundColor: '#F1F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  reportSubtext: {
    fontSize: 14,
    color: '#8A94A6',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  embeddedDocumentCard: {
    width: '100%',
    minHeight: 100,
    backgroundColor: '#FCFCFE',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E6EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    paddingVertical: 8,
  },
  documentPreview: {
    width: '92%',
    height: 120,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  documentCardLabelText: {
    fontSize: 14,
    color: '#7D8797',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginTop: 8,
  },
  infoBlockRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    paddingLeft: 4,
  },
  iconColumn: {
    width: 32,
    paddingTop: 2,
  },
  detailsColumn: {
    flex: 1,
  },
  sectionLabelText: {
    fontSize: 15,
    color: '#7D8797',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginBottom: 8,
  },
  inlineInfoValueText: {
    fontSize: 15,
    color: '#7D8797',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  boldSpan: {
    color: '#5A6578',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  editDatePicker: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  editFieldInput: {
    backgroundColor: '#F1F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#5A6578',
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  editFieldInputSpaced: {
    marginTop: 8,
  },
  editTipInput: {
    backgroundColor: '#F1F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#5A6578',
    minHeight: 72,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  orangeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF9F43',
    marginRight: 10,
  },
  timelineContentText: {
    fontSize: 14,
    color: '#5A6578',
    fontFamily: FONT.medium,
    fontWeight: '500',
    lineHeight: 20,
    flex: 1,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#F0F2F7',
    marginVertical: 12,
  },
  tipRow: {marginBottom: 20},
  outlinedEditButton: {
    backgroundColor: 'transparent',
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#72C1B6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  outlinedEditButtonText: {
    color: '#45A096',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  footerActionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F9F9FE',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF2',
    zIndex: 20,
    elevation: 20,
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
