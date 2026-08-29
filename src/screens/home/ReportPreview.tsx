import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {WaveTitleBand} from '../../components/WaveTitleBand';
import {API_ORIGIN} from '../../config/api';
import {imageUri, isImageFile, isPdfFile} from '../../utils/fileAsset';
import {reportsApi} from '../../api/reports';
import {profileApi} from '../../api/profile';
import {uploadFile} from '../../api/uploads';
import {ApiError} from '../../api/client';
import { FONT } from '../../theme/typography';
import {useKeyboardHeight} from '../../hooks/useKeyboardHeight';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportPreview'>;

const {width} = Dimensions.get('window');

const ZOOM_STEPS = [50, 75, 100, 125, 150, 200];

export function ReportPreviewScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const params = route.params;

  // Editable on this screen: the values start from the route params and are
  // what handleUpload sends, so an edit here needs no round trip.
  const [title, setTitle] = useState(params?.reportTitle ?? 'Blood Test Results');
  const [provider, setProvider] = useState(params?.provider ?? 'Devcare Lab');
  const [startDate, setStartDate] = useState(params?.startDate ?? 'April 24 2024');
  const [endDate, setEndDate] = useState(params?.endDate ?? 'May 24 2024');
  const [reportId, setReportId] = useState(params?.reportId ?? '#BTR -545454');
  const [patientName, setPatientName] = useState(
    params?.patientName ?? '',
  );
  const [referredDoctorName, setReferredDoctorName] = useState('');
  const [referredDoctorSpecialty, setReferredDoctorSpecialty] = useState('');
  const [comments, setComments] = useState('');
  const [editing, setEditing] = useState(false);
  const fileName = params?.fileName;
  const mimeType = params?.mimeType;
  const reportType = params?.reportType ?? 'LAB';
  // The API expects an ISO date; startDate/endDate are display-only strings.
  const reportDate = params?.reportDate ?? new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    profileApi
      .overview()
      .then(overview => {
        if (cancelled) return;
        if (!params?.patientName) {
          setPatientName(overview.user.fullName ?? '');
        }
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
  }, [params?.patientName]);

  // A local pick (fileUri) is shown as-is; a stored report is resolved against
  // the API origin so Android emulators reach the host correctly.
  const sourceUri = params?.fileUri
    ? params.fileUri
    : params?.fileUrl
    ? imageUri(params.fileUrl, API_ORIGIN)
    : null;

  const isPdf = isPdfFile(mimeType, params?.fileUrl, fileName);
  const isImage = !isPdf && isImageFile(mimeType, params?.fileUrl, fileName);
  const totalPages = isPdf ? params?.totalPages ?? 2 : 1;

  const [page, setPage] = useState(1);
  const [zoomIndex, setZoomIndex] = useState(2);
  const [fullscreen, setFullscreen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const zoom = ZOOM_STEPS[zoomIndex];

  const prefill = {
    fileUri: params?.fileUri,
    fileName,
    mimeType,
    existingFileUrl: params?.fileUrl,
    existingFileName: fileName,
    reportTitle: title,
    provider,
  };

  const handleOpenExternally = () => {
    if (!sourceUri) {
      return;
    }
    Linking.openURL(sourceUri).catch(() => {});
  };

  const handleShare = () => {
    Share.share({
      title,
      message: sourceUri ? `${title}\n${sourceUri}` : title,
    }).catch(() => {});
  };

  const handleUpload = async () => {
    if (!params?.fileUri && !params?.fileUrl) {
      Alert.alert('Upload report', 'Please select a file first.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Upload report', 'Please enter a report title.');
      return;
    }
    setUploading(true);
    try {
      // A local pick has to be sent to the server first; a report opened from
      // storage already has a hosted file, so its URL is reused as-is.
      const uploaded = params.fileUri
        ? await uploadFile(
            '/uploads/report',
            params.fileUri,
            fileName ?? (isPdf ? 'report.pdf' : 'report.jpg'),
            mimeType ?? (isPdf ? 'application/pdf' : 'image/jpeg'),
          )
        : {
            fileUrl: params.fileUrl!,
            fileName: fileName ?? title.trim(),
            mimeType: mimeType ?? 'image/jpeg',
            size: 0,
          };
      const created = await reportsApi.create({
        title: title.trim(),
        reportType,
        provider: provider.trim() || undefined,
        reportDate,
        fileUrl: uploaded.fileUrl,
        fileName: uploaded.fileName,
        mimeType: uploaded.mimeType,
        tip: params.tip?.trim() || undefined,
        patientName: patientName.trim() || undefined,
        referredDoctorName: referredDoctorName.trim() || undefined,
        referredDoctorSpecialty: referredDoctorSpecialty.trim() || undefined,
        comments: comments.trim() || undefined,
      });

      navigation.navigate('ReportUploadedSuccess', {
        reportId: created?.id ?? params.reportId,
        reportTitle: created?.title ?? title.trim(),
        reportType,
        provider: provider.trim() || undefined,
        reportDate: created?.reportDate ?? reportDate,
        patientName: created?.patientName ?? patientName,
        referredDoctorName: created?.referredDoctorName ?? referredDoctorName,
        referredDoctorSpecialty:
          created?.referredDoctorSpecialty ?? referredDoctorSpecialty,
        fileName: uploaded.fileName,
        mimeType: uploaded.mimeType,
        fileUrl: uploaded.fileUrl,
        tip: created?.tip ?? params.tip,
        comments: created?.comments ?? comments,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Upload failed';
      Alert.alert('Upload failed', message);
    } finally {
      setUploading(false);
    }
  };

  const keyboardHeight = useKeyboardHeight();
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


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: 74 + insets.bottom + 24},
        ]}>
                <WaveTitleBand
        title="View Report"
        color="#F4F1FD"
        style={styles.waveText}
      />
              <View style={styles.fileTitleRow}>
          <View style={[styles.fileBadge, isImage && styles.fileBadgeImage]}>
            <Text
              style={[
                styles.fileBadgeText,
                isImage && styles.fileBadgeTextImage,
              ]}>
              {isImage ? 'IMG' : 'PDF'}
            </Text>
          </View>
          {editing ? (
            <TextInput
              style={[styles.fileTitleText, styles.editableField]}
              value={title}
              onChangeText={setTitle}
              placeholder="Report title"
              placeholderTextColor="#A0A5BA"
            />
          ) : (
            <Text style={styles.fileTitleText} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>
       <View style={{flex:1, paddingHorizontal:16,paddingVertical:8}}>


        <View style={styles.metaList}>
          <View style={styles.metaRow}>
            <Feather name="clock" size={20} color="#AED8D7" />
            {editing ? (
              <TextInput
                style={[styles.metaText, styles.editableField]}
                value={provider}
                onChangeText={setProvider}
                placeholder="Provider"
                placeholderTextColor="#A0A5BA"
              />
            ) : (
              <Text style={styles.metaText}>{provider}</Text>
            )}
          </View>
          <View style={styles.metaRow}>
            <Feather name="calendar" size={20} color="#AED8D7" />
            {editing ? (
              <View style={styles.dateEditRow}>
                <TextInput
                  style={[styles.metaText, styles.editableField]}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="Starts"
                  placeholderTextColor="#A0A5BA"
                />
                <TextInput
                  style={[styles.metaText, styles.editableField]}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="Ends"
                  placeholderTextColor="#A0A5BA"
                />
              </View>
            ) : (
              <Text style={styles.metaText}>
                {`Starts : ${startDate}   Ends : ${endDate}`}
              </Text>
            )}
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={20}
              color="#AED8D7"
            />
            {editing ? (
              <TextInput
                style={[styles.metaText, styles.editableField]}
                value={reportId}
                onChangeText={setReportId}
                placeholder="Report ID"
                placeholderTextColor="#A0A5BA"
              />
            ) : (
              <Text style={styles.metaText}>Report ID: {reportId}</Text>
            )}
          </View>
          <View style={styles.metaRow}>
            <Feather name="user" size={20} color="#AED8D7" />
            {editing ? (
              <TextInput
                style={[styles.metaText, styles.editableField]}
                value={patientName}
                onChangeText={setPatientName}
                placeholder="Patient"
                placeholderTextColor="#A0A5BA"
              />
            ) : (
              <Text style={styles.metaText}>Patient: {patientName}</Text>
            )}
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons
              name="stethoscope"
              size={20}
              color="#AED8D7"
            />
            {editing ? (
              <View style={styles.dateEditRow}>
                <TextInput
                  style={[styles.metaText, styles.editableField]}
                  value={referredDoctorName}
                  onChangeText={setReferredDoctorName}
                  placeholder="Doctor"
                  placeholderTextColor="#A0A5BA"
                />
                <TextInput
                  style={[styles.metaText, styles.editableField]}
                  value={referredDoctorSpecialty}
                  onChangeText={setReferredDoctorSpecialty}
                  placeholder="Specialty"
                  placeholderTextColor="#A0A5BA"
                />
              </View>
            ) : (
              <Text style={styles.metaText}>
                Doctor: {referredDoctorName || '—'}
                {referredDoctorSpecialty ? ` (${referredDoctorSpecialty})` : ''}
              </Text>
            )}
          </View>
          <View style={[styles.metaRow, styles.metaRowLast]}>
            <MaterialCommunityIcons
              name="comment-text-outline"
              size={20}
              color="#AED8D7"
            />
            {editing ? (
              <TextInput
                style={[styles.metaText, styles.editableField]}
                value={comments}
                onChangeText={setComments}
                placeholder="Comments"
                placeholderTextColor="#A0A5BA"
                multiline
              />
            ) : (
              <Text style={styles.metaText}>
                Comments: {comments.trim() || '—'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.viewerCard}>
          <View style={styles.viewerToolbar}>
            <TouchableOpacity
              style={styles.toolbarIconButton}
              activeOpacity={0.7}
              disabled={page <= 1}
              onPress={() => setPage(prev => Math.max(1, prev - 1))}>
              <Feather
                name="chevron-left"
                size={20}
                color={page <= 1 ? '#7A8794' : '#FFFFFF'}
              />
            </TouchableOpacity>

        
            <TouchableOpacity
              style={styles.pageBox}
              activeOpacity={0.8}
              onPress={() => setPage(prev => Math.min(totalPages, prev + 1))}>
              <Text style={styles.pageBoxText}>{page}</Text>
              <Text style={styles.pageTotalText}>/ {totalPages}</Text>
            </TouchableOpacity>

            <View style={styles.zoomGroup}>
              <TouchableOpacity
                style={styles.toolbarIconButton}
                activeOpacity={0.7}
                disabled={zoomIndex <= 0}
                onPress={() => setZoomIndex(prev => Math.max(0, prev - 1))}>
                <Feather
                  name="minus"
                  size={18}
                  color={zoomIndex <= 0 ? '#7A8794' : '#FFFFFF'}
                />
              </TouchableOpacity>
              <Text style={styles.zoomText}>{zoom}%</Text>
              <TouchableOpacity
                style={styles.toolbarIconButton}
                activeOpacity={0.7}
                disabled={zoomIndex >= ZOOM_STEPS.length - 1}
                onPress={() =>
                  setZoomIndex(prev =>
                    Math.min(ZOOM_STEPS.length - 1, prev + 1),
                  )
                }>
                <Feather
                  name="plus"
                  size={18}
                  color={
                    zoomIndex >= ZOOM_STEPS.length - 1 ? '#7A8794' : '#FFFFFF'
                  }
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.toolbarIconButton}
              activeOpacity={0.7}
              onPress={handleOpenExternally}>
              <Feather name="download" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarIconButton}
              activeOpacity={0.7}
              onPress={() => setFullscreen(true)}>
              <Feather name="maximize" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.documentSheet}>
            {isImage && sourceUri ? (
              <Image
                source={{uri: sourceUri}}
                style={[styles.documentImage, {transform: [{scale: zoom / 100}]}]}
                resizeMode="contain"
              />
            ) : isPdf ? (
              // No native PDF renderer is bundled, so the page is represented by
              // a document sheet that hands the file to the device viewer.
              <TouchableOpacity
                style={styles.pdfSheet}
                activeOpacity={0.85}
                onPress={handleOpenExternally}>
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={64}
                  color="#E53935"
                />
                <Text style={styles.pdfSheetName} numberOfLines={1}>
                  {fileName ?? `${title}.pdf`}
                </Text>
                <Text style={styles.pdfSheetPage}>
                  Page {page} of {totalPages}
                </Text>
                <Text style={styles.pdfSheetAction}>Open PDF</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptySheet}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={48}
                  color="#A0A5BA"
                />
                <Text style={styles.emptySheetText}>No document attached</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionChip, styles.actionChipPrimary]}
            activeOpacity={0.85}
            onPress={handleShare}>
            <Feather name="share-2" size={15} color="#FFFFFF" />
            <Text style={[styles.actionChipText, styles.actionChipTextPrimary]}>
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            activeOpacity={0.85}
            onPress={handleOpenExternally}>
            <Feather name="download" size={15} color="#5A6E85" />
            <Text style={styles.actionChipText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('UploadReportDetails', prefill)}>
            <Feather name="plus" size={15} color="#5A6E85" />
            <Text style={styles.actionChipText}>Add to Records</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.85}
            onPress={() => setEditing(prev => !prev)}>
            <Text style={styles.editButtonText}>
              {editing ? 'Done' : 'Edit'}
            </Text>
            <Feather
              name={editing ? 'check' : 'edit-2'}
              size={16}
              color="#5A6E85"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.buttonDisabled]}
            activeOpacity={0.9}
            disabled={uploading}
            onPress={handleUpload}>
            {uploading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.uploadButtonText}>Upload Report</Text>
                <Feather name="chevron-right" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>

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
          onPress={() => navigation.navigate('MyProfile')}>
          <Feather name="user" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={fullscreen}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setFullscreen(false)}>
        <View style={[styles.fullscreenBackdrop, {paddingBottom: keyboardHeight}]}>
          <TouchableOpacity
            style={[styles.fullscreenClose, {top: insets.top + 12}]}
            activeOpacity={0.7}
            onPress={() => setFullscreen(false)}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {isImage && sourceUri ? (
            <Image
              source={{uri: sourceUri}}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          ) : (
            <TouchableOpacity
              style={styles.fullscreenPdf}
              activeOpacity={0.85}
              onPress={handleOpenExternally}>
              <MaterialCommunityIcons
                name="file-pdf-box"
                size={96}
                color="#E53935"
              />
              <Text style={styles.fullscreenPdfName} numberOfLines={1}>
                {fileName ?? `${title}.pdf`}
              </Text>
              <Text style={styles.pdfSheetAction}>Open PDF</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
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
  },
  backButton: {
    padding: 4,
    backgroundColor: '#F4F1FD',
  },
  iconImage: {
    height: 48,
    width: 150,
    resizeMode: 'cover',
  },
  headerIconButton: {
    padding: 4,
  },
  waveText: {
    color: '#424242',
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  scrollContent: {
    
  },
  fileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:-10,
    width:'100%',
    backgroundColor: '#EDF7F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  fileBadge: {
    backgroundColor: '#FFF0F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FAD4D4',
    marginRight: 10,
  },
  fileBadgeImage: {
    backgroundColor: '#EDF6FF',
    borderColor: '#CFE4FA',
  },
  fileBadgeText: {
    fontSize: 10,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#EDF7F6',
    letterSpacing: 0.5,
  },
  fileBadgeTextImage: {
    color: '#2F80ED',
  },
  fileTitleText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  metaList: {
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1F2',
    gap: 12,
  },
  metaRowLast: {
    borderBottomWidth: 0,
  },
  // Keeps the row's type scale while marking the value as editable.
  editableField: {
    paddingVertical: 0,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E7E5',
    borderRadius: 8,
    minHeight: 34,
  },
  dateEditRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  metaText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#616161',
  },
  viewerCard: {
    backgroundColor: '#2F3B47',
    borderRadius: 18,
    padding: 8,
    marginBottom: 16,
  },
  viewerToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
    gap: 6,
  },
  toolbarIconButton: {
    padding: 4,
  },
  pageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F3B47',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 26,
    gap: 4,
  },
  pageBoxText: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pageTotalText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#FFFFFF',
  },
  zoomGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  zoomText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#FFFFFF',
    minWidth: 42,
    textAlign: 'center',
  },
  documentSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    height: 260,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentImage: {
    width: '100%',
    height: '100%',
  },
  pdfSheet: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pdfSheetName: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#333333',
    marginTop: 10,
  },
  pdfSheetPage: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#7D8797',
    marginTop: 4,
  },
  pdfSheetAction: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#45A096',
    marginTop: 12,
  },
  emptySheet: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySheetText: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: '#A0A5BA',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  actionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6E3EE',
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E6E9F0',
    gap: 6,
  },
  actionChipPrimary: {
    backgroundColor: '#45A096',
    borderColor: '#45A096',
  },
  actionChipText: {
    fontSize: 10,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#424242',
  },
  actionChipTextPrimary: {
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6E3EE',
    height: 52,
    borderRadius: 26,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  uploadButton: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#418B93',
    height: 52,
    borderRadius: 26,
    gap: 6,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#FFF',
  },
  buttonDisabled: {
    opacity: 0.7,
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
  fullscreenBackdrop: {
    flex: 1,
    backgroundColor: '#0F1419',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenClose: {
    position: 'absolute',
    right: 16,
    zIndex: 2,
    padding: 8,
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
  },
  fullscreenPdf: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  fullscreenPdfName: {
    fontSize: 15,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
  },
});
