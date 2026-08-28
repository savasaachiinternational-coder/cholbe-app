import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
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
import {isPdfFile} from '../../utils/fileAsset';
import {formatLongReportDate} from '../../utils/reportFormat';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportUploadedSuccess'>;

const {width} = Dimensions.get('window');

const REPORT_TYPE_LABELS: Record<string, string> = {
  LAB: 'Lab Report',
  PRESCRIPTION: 'Prescription',
  IMAGING: 'Imaging',
  OTHER: 'Other',
};

export function ReportUploadedSuccessScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const params = route.params;

  const title = params?.reportTitle ?? 'Blood Test Results';
  const provider = params?.provider ?? 'Devcare Lab';
  const patientName = params?.patientName ?? '—';
  const referredDoctorName = params?.referredDoctorName ?? '—';
  const referredDoctorSpecialty = params?.referredDoctorSpecialty ?? '';
  const reportId = params?.reportId;
  const fileName = params?.fileName;
  const typeLabel = REPORT_TYPE_LABELS[params?.reportType ?? 'LAB'] ?? 'Report';
  const isPdf = isPdfFile(params?.mimeType, params?.fileUrl, fileName);

  // The tip is free text; each line becomes its own bulleted row.
  const tipLines = (params?.tip ?? '')
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
          styles.scrollCanvasContent,
          {paddingBottom: 74 + insets.bottom + 96},
        ]}>
        <WaveTitleBand title="" color="#F5F2FD" style={styles.waveText} />

        <View style={styles.successBadgeContainer}>
          <View style={styles.circularSuccessRing}>
            <Feather name="check" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.successHeadlineText}>Report Saved</Text>
          <Text style={styles.successSubheadText}>
            {`${title} has been added successfully`}
          </Text>
        </View>

        <View style={styles.reportCard}>
          <View style={styles.topPillRow}>
            <View style={styles.miniPill}>
              <MaterialCommunityIcons
                name={isPdf ? 'file-pdf-box' : 'file-image-outline'}
                size={16}
                color={isPdf ? '#E53935' : '#2F80ED'}
                style={styles.pillIcon}
              />
              <Text style={styles.pillText}>{isPdf ? 'PDF' : 'Image'}</Text>
            </View>

            <View style={styles.miniPill}>
              <Feather
                name="folder"
                size={15}
                color="#45A096"
                style={styles.pillIcon}
              />
              <Text style={styles.pillText}>{typeLabel}</Text>
            </View>
          </View>

          <View style={styles.metaTitleBlock}>
            <Text style={styles.reportTitleText}>{title}</Text>
            <Text style={styles.reportSubtext}>
              {reportId ? `Report ID : ${reportId}` : `${typeLabel} details`}
            </Text>
          </View>

          <View style={styles.infoBlockRow}>
            <View style={styles.iconColumn}>
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={20}
                color="#AED8D7"
              />
            </View>
            <View style={styles.detailsColumn}>
              <Text style={styles.inlineInfoValueText}>
                Date :{' '}
                <Text style={styles.boldSpan}>
                  {formatLongReportDate(params?.reportDate)}
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <View style={styles.infoBlockRow}>
            <View style={styles.iconColumn}>
              <MaterialCommunityIcons
                name="storefront-outline"
                size={20}
                color="#AED8D7"
              />
            </View>
            <View style={styles.detailsColumn}>
              <Text style={styles.inlineInfoValueText}>
                Provider : <Text style={styles.boldSpan}>{provider}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <View style={styles.infoBlockRow}>
            <View style={styles.iconColumn}>
              <Feather name="user" size={20} color="#AED8D7" />
            </View>
            <View style={styles.detailsColumn}>
              <Text style={styles.inlineInfoValueText}>
                Patient : <Text style={styles.boldSpan}>{patientName}</Text>
              </Text>
            </View>
          </View>

          {referredDoctorName !== '—' ? (
            <>
              <View style={styles.dividerLine} />
              <View style={styles.infoBlockRow}>
                <View style={styles.iconColumn}>
                  <MaterialCommunityIcons
                    name="stethoscope"
                    size={20}
                    color="#AED8D7"
                  />
                </View>
                <View style={styles.detailsColumn}>
                  <Text style={styles.inlineInfoValueText}>
                    Doctor :{' '}
                    <Text style={styles.boldSpan}>
                      {referredDoctorName}
                      {referredDoctorSpecialty
                        ? ` (${referredDoctorSpecialty})`
                        : ''}
                    </Text>
                  </Text>
                </View>
              </View>
            </>
          ) : null}

          {params?.comments?.trim() ? (
            <>
              <View style={styles.dividerLine} />
              <View style={styles.infoBlockRow}>
                <View style={styles.iconColumn}>
                  <MaterialCommunityIcons
                    name="comment-text-outline"
                    size={20}
                    color="#AED8D7"
                  />
                </View>
                <View style={styles.detailsColumn}>
                  <Text style={styles.sectionLabelText}>Comments</Text>
                  <Text style={styles.timelineContentText}>{params.comments}</Text>
                </View>
              </View>
            </>
          ) : null}

          {fileName ? (
            <>
              <View style={styles.dividerLine} />
              <View style={styles.infoBlockRow}>
                <View style={styles.iconColumn}>
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={20}
                    color="#AED8D7"
                  />
                </View>
                <View style={styles.detailsColumn}>
                  <Text style={styles.inlineInfoValueText} numberOfLines={1}>
                    File : <Text style={styles.boldSpan}>{fileName}</Text>
                  </Text>
                </View>
              </View>
            </>
          ) : null}

          {tipLines.length ? (
            <>
              <View style={styles.dividerLine} />
              <View style={[styles.infoBlockRow, styles.tipRow]}>
                <View style={styles.iconColumn}>
                  <MaterialCommunityIcons
                    name="lightbulb-on-outline"
                    size={20}
                    color="#AED8D7"
                  />
                </View>
                <View style={styles.detailsColumn}>
                  <Text style={styles.sectionLabelText}>Tip :</Text>
                  {tipLines.map(line => (
                    <View key={line} style={styles.timelineItem}>
                      <View style={styles.orangeDot} />
                      <Text style={styles.timelineContentText}>{line}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : null}

          <TouchableOpacity
            style={styles.outlinedEditButton}
            activeOpacity={0.8}
            onPress={() =>
              reportId
                ? navigation.navigate('ViewReportDetails', {reportId})
                : navigation.goBack()
            }>
            <Text style={styles.outlinedEditButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.footerActionContainer, {bottom: 74 + insets.bottom}]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2FD',
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
    width: 32,
  },
  iconImage: {
    height: 48,
    width: 150,
    resizeMode: 'cover',
  },
  headerIconButton: {
    padding: 4,
    width: 32,
    alignItems: 'flex-end',
  },
  waveText: {
    height: 0,
  },
  // 16 matches the wave band's negative margin so the art sits edge to edge.
  scrollCanvasContent: {
    paddingTop: 0,
    paddingHorizontal: 16,
  },
  // Pulled up so the badge sits on the bottom edge of the wave art.
  successBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -36,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  circularSuccessRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4DA69F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#45A096',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  successHeadlineText: {
    fontSize: 20,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 6,
    textAlign: 'center',
  },
  successSubheadText: {
    fontSize: 13,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  reportCard: {
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
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
  topPillRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  miniPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF1F6',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  pillIcon: {marginRight: 6},
  pillText: {
    fontSize: 12,
    color: '#5A6578',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  metaTitleBlock: {
    marginBottom: 20,
    paddingLeft: 8,
  },
  reportTitleText: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  reportSubtext: {
    fontSize: 12,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  infoBlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingLeft: 8,
  },
  iconColumn: {
    width: 36,
    alignItems: 'center',
  },
  detailsColumn: {
    flex: 1,
    paddingLeft: 4,
  },
  sectionLabelText: {
    fontSize: 12,
    color: '#616161',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginBottom: 10,
  },
  inlineInfoValueText: {
    fontSize: 12,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
    lineHeight: 22,
  },
  boldSpan: {
    color: '#212121',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  orangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9F43',
    marginRight: 12,
  },
  timelineContentText: {
    fontSize: 12,
    color: '#212121',
    fontFamily: FONT.regular,
    fontWeight: '400',
    flex: 1,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#EDEAF6',
    marginVertical: 8,
  },
  // Multi-line block: the icon stays pinned to the first line.
  tipRow: {alignItems: 'flex-start', marginBottom: 8},
  outlinedEditButton: {
    backgroundColor: 'transparent',
    width: '100%',
    height: 44,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: '#72C1B6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
    backgroundColor: '#F5F2FD',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  continueButton: {
    backgroundColor: '#4DA69F',
    width: '100%',
    height: 48,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#45A096',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
