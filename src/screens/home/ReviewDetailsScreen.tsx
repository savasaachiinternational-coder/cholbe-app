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
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewDetails'>;

const {width} = Dimensions.get('window');

export function ReviewDetailsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [morningReminder, setMorningReminder] = useState(true);
  const [nightReminder, setNightReminder] = useState(true);

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === 'home') {
      navigation.navigate('Home');
      return;
    }
    if (tab === 'medication') {
      navigation.navigate('MedicineList');
      return;
    }
    if (tab === 'report') {
      navigation.navigate('ReportsList');
      return;
    }
    if (tab === 'profile') {
      navigation.navigate('MyProfile');
      return;
    }
    navigation.navigate('Home');
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollCanvasContent}>
        <View style={styles.reviewMainCard}>
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
              <Text style={styles.alertPillText}>8:00 am</Text>
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
            <Text style={styles.medicineNameText}>Amlodipine 5mg</Text>
            <Text style={styles.medicineSubtext}>Time to take 2times daily</Text>
          </View>

          <View style={styles.infoBlockRow}>
            <View style={styles.iconColumn}>
              <Feather name="clock" size={20} color="#45A096" />
            </View>
            <View style={styles.detailsColumn}>
              <Text style={styles.sectionLabelText}>Times</Text>
              <View style={styles.timelineItem}>
                <View style={styles.orangeDot} />
                <Text style={styles.timelineContentText}>
                  8:00 AM (Before Meal 30 min)
                </Text>
              </View>
              <View style={styles.timelineItem}>
                <View style={styles.orangeDot} />
                <Text style={styles.timelineContentText}>8:30 PM (After Meal)</Text>
              </View>
            </View>
          </View>

          <View style={styles.dividerLine} />

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
                Starts : <Text style={styles.boldSpan}>April 24 2024</Text> Ends :{' '}
                <Text style={styles.boldSpan}>May 24 2024</Text>
              </Text>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <View style={styles.infoBlockRow}>
            <View style={styles.iconColumn}>
              <MaterialCommunityIcons name="refresh" size={20} color="#45A096" />
            </View>
            <View style={styles.detailsColumn}>
              <Text style={styles.inlineInfoValueText}>
                Repeats : <Text style={styles.boldSpan}>Monthly</Text>
              </Text>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <View style={styles.infoBlockRow}>
            <View style={styles.iconColumn}>
              <Feather name="eye" size={18} color="#45A096" />
            </View>
            <View style={styles.detailsColumn}>
              <Text style={styles.inlineInfoValueText}>
                Follow-up : <Text style={styles.boldSpan}>30 min before</Text>
              </Text>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <View style={[styles.infoBlockRow, styles.refillBlock]}>
            <View style={styles.iconColumn}>
              <MaterialCommunityIcons name="pill" size={20} color="#45A096" />
            </View>
            <View style={styles.detailsColumn}>
              <Text style={styles.sectionLabelText}>Reminder to refill Inventory :</Text>
              <View style={styles.timelineItem}>
                <View style={styles.orangeDot} />
                <Text style={styles.timelineContentText}>10 pc</Text>
              </View>
              <View style={styles.timelineItem}>
                <View style={styles.orangeDot} />
                <Text style={styles.timelineContentText}>
                  8:30 PM 25-10-2025 (Remind Me when)
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.footerActionContainer, {bottom: 74 + insets.bottom}]}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ReviewMedication')}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab="medication"
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
    paddingBottom: 150,
  },
  reviewMainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#E0E4F0',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
  medicineNameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  medicineSubtext: {
    fontSize: 14,
    color: '#8A94A6',
    fontWeight: '400',
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
    marginVertical: 6,
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
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#F0F2F7',
    marginVertical: 12,
  },
  refillBlock: {marginBottom: 28},
  editButton: {
    backgroundColor: '#72C1B6',
    width: '100%',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
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
  bottomNavWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
