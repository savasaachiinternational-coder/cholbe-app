import {useCallback, useState} from 'react';
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
import {WaveTitleBand} from '../../components/WaveTitleBand';
import {API_ORIGIN} from '../../config/api';
import {imageUri, isImageFile, isPdfFile} from '../../utils/fileAsset';
import {reportsApi, type HealthReport} from '../../api/reports';
import {ApiError} from '../../api/client';
import {formatPassportListTime} from '../../components/PassportTimelineCard';
import {formatLongReportDate} from '../../utils/reportFormat';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportDetailsView'>;

const {width} = Dimensions.get('window');

const ZOOM_STEPS = [50, 75, 100, 125, 150, 200];

const REPORT_TYPE_LABELS: Record<string, string> = {
  LAB: 'Blood Test Result',
  PRESCRIPTION: 'Prescription',
  IMAGING: 'Imaging Result',
  OTHER: 'Report',
};

// "Today: 2.45 PM" while the report is fresh, the plain clock time after that.
function summaryTimeLabel(value?: string | null) {
  if (!value) {
    return '—';
  }
  const stamp = new Date(value);
  if (Number.isNaN(stamp.getTime())) {
    return '—';
  }
  const time = formatPassportListTime(value);
  const today = new Date();
  const sameDay =
    stamp.getFullYear() === today.getFullYear() &&
    stamp.getMonth() === today.getMonth() &&
    stamp.getDate() === today.getDate();
  return sameDay ? `Today: ${time}` : time;
}

export function ReportDetailsViewScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const params = route.params;
  const reportId = params.reportId;

  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [zoomIndex, setZoomIndex] = useState(2);
  const [fullscreen, setFullscreen] = useState(false);
  const zoom = ZOOM_STEPS[zoomIndex];

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportsApi.get(reportId);
      setReport(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not load report';
      Alert.alert('Reports Details', message);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [loadReport]),
  );

  const title = report?.title ?? '';
  const fileName = report?.fileName;
  const mimeType = report?.mimeType;
  const fileUrl = report?.fileUrl;
  const typeLabel = REPORT_TYPE_LABELS[report?.reportType ?? 'LAB'] ?? 'Report';

  const sourceUri = fileUrl ? imageUri(fileUrl, API_ORIGIN) : null;
  const isPdf = isPdfFile(mimeType, fileUrl, fileName);
  const isImage = !isPdf && isImageFile(mimeType, fileUrl, fileName);
  const totalPages = isPdf ? params.totalPages ?? 2 : 1;

  // The report model carries patient and doctor fields from the API; route
  // params are only used as a fallback for older navigation paths.
  const patientName = report?.patientName ?? params.patientName ?? '—';
  const doctorName = report?.referredDoctorName ?? params.doctorName ?? '—';
  const doctorSpecialty =
    report?.referredDoctorSpecialty ?? params.doctorSpecialty ?? '';
  const comment = report?.comments ?? '';

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
          title="Reports Details"
          color="#F4F1FD"
          style={styles.waveText}
        />
        <Text style={styles.waveSubtitle}>{typeLabel}</Text>

        {loading ? (
          <ActivityIndicator color="#45A096" style={styles.loader} />
        ) : !report ? (
          <Text style={styles.emptyText}>Report not found.</Text>
        ) : (
          <View style={styles.bodyWrapper}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconBox}>
                <MaterialCommunityIcons
                  name="flask-outline"
                  size={22}
                  color="#45A096"
                />
              </View>

              <View style={styles.summaryTextCol}>
                <Text style={styles.summaryTitle} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.summaryProvider} numberOfLines={1}>
                  {report.provider ?? '—'}
                </Text>
              </View>

              <View style={styles.summaryTimeCol}>
                <View style={styles.timePill}>
                  <View style={styles.greenDot} />
                  <Text style={styles.timePillText}>
                    {summaryTimeLabel(report.createdAt ?? report.reportDate)}
                  </Text>
                </View>
                <Text style={styles.summaryDate}>
                  {formatLongReportDate(report.reportDate)}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoCol}>
                <View style={styles.infoLabelRow}>
                  <Feather name="user" size={13} color="#AED8D7" />
                  <Text style={styles.infoLabel}>Patient</Text>
                </View>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {patientName}
                </Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoCol}>
                <View style={styles.infoLabelRow}>
                  <MaterialCommunityIcons
                    name="stethoscope"
                    size={13}
                    color="#AED8D7"
                  />
                  <Text style={styles.infoLabel}>Requested by</Text>
                </View>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {doctorName}
                </Text>
                {doctorSpecialty ? (
                  <Text style={styles.infoSubValue} numberOfLines={1}>
                    ({doctorSpecialty})
                  </Text>
                ) : null}
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoCol}>
                <View style={styles.infoLabelRow}>
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={13}
                    color="#AED8D7"
                  />
                  <Text style={styles.infoLabel}>Report ID</Text>
                </View>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {report.id}
                </Text>
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

                {/* Tapping the counter advances to the next page. */}
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
                        zoomIndex >= ZOOM_STEPS.length - 1
                          ? '#7A8794'
                          : '#FFFFFF'
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
                    style={[
                      styles.documentImage,
                      {transform: [{scale: zoom / 100}]},
                    ]}
                    resizeMode="contain"
                  />
                ) : isPdf ? (
                  // No native PDF renderer is bundled, so the page is handed to
                  // the device viewer instead of being drawn inline.
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
                    <Text style={styles.emptySheetText}>
                      No document attached
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.commentsSection}>
              <Text style={styles.commentsHeading}>Doctor's Comments</Text>

              <View style={styles.commentCard}>
                <Image
                  source={require('../../assets/profile.png')}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentBody}>
                  <View style={styles.commentTopRow}>
                    <View style={styles.commentNameCol}>
                      <Text style={styles.commentName} numberOfLines={1}>
                        {doctorName}
                      </Text>
                      {doctorSpecialty ? (
                        <Text style={styles.commentRole} numberOfLines={1}>
                          {doctorSpecialty}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.commentTime}>
                      {formatPassportListTime(
                        report.createdAt ?? report.reportDate,
                      )}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>
                    {comment || 'No comments added for this report.'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionChip, styles.actionChipPrimary]}
                activeOpacity={0.85}
                onPress={handleShare}>
                <Feather name="share-2" size={15} color="#FFFFFF" />
                <Text
                  style={[styles.actionChipText, styles.actionChipTextPrimary]}>
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
                onPress={() =>
                  navigation.navigate('UploadReportDetails', {
                    existingFileUrl: fileUrl,
                    existingFileName: fileName ?? undefined,
                    mimeType: mimeType ?? undefined,
                    reportTitle: title,
                    reportType: report.reportType,
                    provider: report.provider ?? undefined,
                  })
                }>
                <Feather name="plus" size={15} color="#5A6E85" />
                <Text style={styles.actionChipText}>Add to Records</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ReportsList')}>
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
        <View style={styles.fullscreenBackdrop}>
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
    paddingBottom:30,
  },
  // Sits inside the wave art, just under the band title.
  waveSubtitle: {
    marginTop: -38,
    textAlign: 'center',
    fontSize: 10,
    fontFamily: FONT.regular,
    color: '#616161',
    marginBottom:24
  },
  scrollContent: {
    paddingTop: 0,
  },
  bodyWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loader: {marginVertical: 32},
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: FONT.regular,
    color: '#8A94A6',
    marginTop: 32,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4FD',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ECEFF7',
    marginBottom: 12,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EDF7F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryTextCol: {
    flex: 1,
    minWidth: 0,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 2,
  },
  summaryProvider: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#616161',
  },
  summaryTimeCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF7F6',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  timePillText: {
    fontSize: 10,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#424242',
  },
  summaryDate: {
    fontSize: 10,
    fontFamily: FONT.regular,
    color: '#616161',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4FD',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ECEFF7',
    marginBottom: 12,
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 6,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 10,
    fontFamily: FONT.regular,
    color: '#616161',
  },
  infoValue: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  infoSubValue: {
    fontSize: 10,
    fontFamily: FONT.regular,
    color: '#616161',
  },
  infoDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#EDEAF6',
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
    backgroundColor: '#F5F4FD',
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
  commentsSection: {
    marginBottom: 16,
  },
  commentsHeading: {
    fontSize: 13,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
    paddingLeft: 2,
  },
  commentCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F4FD',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEFF7',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#EBEFF5',
  },
  commentBody: {
    flex: 1,
    minWidth: 0,
  },
  commentTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  commentNameCol: {
    flex: 1,
    minWidth: 0,
  },
  commentName: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  commentRole: {
    fontSize: 10,
    fontFamily: FONT.regular,
    color: '#616161',
  },
  commentTime: {
    fontSize: 10,
    fontFamily: FONT.regular,
    color: '#616161',
    marginLeft: 8,
  },
  commentText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#616161',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
