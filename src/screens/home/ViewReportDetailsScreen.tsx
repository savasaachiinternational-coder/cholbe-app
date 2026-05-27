import {useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
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

type Props = NativeStackScreenProps<RootStackParamList, 'ViewReportDetails'>;

const {width} = Dimensions.get('window');

export function ViewReportDetailsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [morningReminder, setMorningReminder] = useState(true);
  const [nightReminder, setNightReminder] = useState(true);

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollCanvasContent}>
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
            <Text style={styles.reportNameText}>Hemoglobin</Text>
            <Text style={styles.reportSubtext}>Blood test metrics report details</Text>
          </View>

          <View style={styles.embeddedDocumentCard}>
            <MaterialCommunityIcons name="file-document-outline" size={32} color="#A0A5BA" />
            <Text style={styles.documentCardLabelText}>Report Document File</Text>
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
              <Text style={styles.inlineInfoValueText}>
                Date : <Text style={styles.boldSpan}>April 24 2024</Text>
              </Text>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <View style={styles.infoBlockRow}>
            <View style={styles.iconColumn}>
              <MaterialCommunityIcons name="storefront-outline" size={20} color="#45A096" />
            </View>
            <View style={styles.detailsColumn}>
              <Text style={styles.inlineInfoValueText}>
                Provider : <Text style={styles.boldSpan}>Devcare Lab</Text>
              </Text>
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

              <View style={styles.timelineItem}>
                <View style={styles.orangeDot} />
                <Text style={styles.timelineContentText}>
                  Blood Sugar is slightly high. Please maintain diet
                </Text>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.orangeDot} />
                <Text style={styles.timelineContentText}>and continue medication.</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.outlinedEditButton} activeOpacity={0.7}>
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
  scrollCanvasContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 160,
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
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  reportSubtext: {
    fontSize: 14,
    color: '#8A94A6',
    fontWeight: '400',
  },
  embeddedDocumentCard: {
    width: '100%',
    height: 100,
    backgroundColor: '#FCFCFE',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E6EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  documentCardLabelText: {
    fontSize: 14,
    color: '#7D8797',
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
    fontWeight: '500',
    marginBottom: 10,
  },
  inlineInfoValueText: {
    fontSize: 15,
    color: '#7D8797',
    fontWeight: '400',
  },
  boldSpan: {
    color: '#5A6578',
    fontWeight: '500',
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
    fontWeight: '500',
    lineHeight: 20,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#F0F2F7',
    marginVertical: 12,
  },
  tipRow: {marginBottom: 28},
  outlinedEditButton: {
    backgroundColor: 'transparent',
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#72C1B6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlinedEditButtonText: {
    color: '#45A096',
    fontSize: 16,
    fontWeight: '600',
  },
  footerActionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F9F9FE',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
