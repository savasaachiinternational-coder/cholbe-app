import {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {
  INITIAL_SWITCH_STATE,
  REMINDER_SECTIONS,
  SWITCH_TRACK,
  type ReminderItem,
  type ReminderSegmentTab,
} from './remindersData';

type Props = NativeStackScreenProps<RootStackParamList, 'Reminders'>;

export function RemindersScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeSegmentTab, setActiveSegmentTab] =
    useState<ReminderSegmentTab>('reminders');
  const [switches, setSwitches] = useState(INITIAL_SWITCH_STATE);

  const toggleSwitch = (key: string) => {
    setSwitches(prev => ({...prev, [key]: !prev[key]}));
  };

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
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reminders</Text>
        <TouchableOpacity style={styles.addReminderTopButton} activeOpacity={0.8}>
          <Feather
            name="plus"
            size={14}
            color="#475569"
            style={styles.plusIconMargin}
          />
          <Text style={styles.addReminderTopText}>Add Reminder</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 120},
        ]}>
        <View style={styles.tabsSegmentContainer}>
          {(
            [
              {key: 'all' as const, label: 'All'},
              {key: 'reminders' as const, label: 'Reminders'},
              {key: 'alerts' as const, label: 'Alerts'},
            ] as const
          ).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.segmentButton,
                activeSegmentTab === tab.key && styles.activeSegmentButton,
              ]}
              activeOpacity={0.85}
              onPress={() => {
                if (tab.key === 'alerts') {
                  navigation.navigate('Alerts');
                  return;
                }
                if (tab.key === 'all') {
                  navigation.navigate('Notifications');
                  return;
                }
                setActiveSegmentTab(tab.key);
              }}>
              <Text
                style={[
                  styles.segmentButtonText,
                  activeSegmentTab === tab.key && styles.activeSegmentButtonText,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.notificationSettingsLink}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.notificationSettingsLinkText}>
            Notification Settings
          </Text>
        </TouchableOpacity>

        {REMINDER_SECTIONS.map(section => (
              <View key={section.id}>
                <Text style={styles.timePeriodLabelHeader}>{section.label}</Text>
                {section.items.map(item => (
                  <ReminderCard
                    key={item.switchKey}
                    item={item}
                    enabled={switches[item.switchKey] ?? true}
                    onToggle={() => toggleSwitch(item.switchKey)}
                  />
                ))}
              </View>
            ))}

            <View style={styles.masterSettingsBannerCard}>
              <View style={styles.masterLeftBlockTextMeta}>
                <View style={styles.masterIconCircle}>
                  <Feather name="clock" size={20} color="#0D9488" />
                </View>
                <View style={styles.masterTextBlock}>
                  <Text style={styles.masterTitleMainHeadingText}>
                    Medication Reminders
                  </Text>
                  <Text style={styles.masterDescriptionBodyText}>
                    Receive medication reminders
                  </Text>
                </View>
              </View>
              <Switch
                value={switches.masterReminders}
                onValueChange={() => toggleSwitch('masterReminders')}
                trackColor={SWITCH_TRACK}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#CBD5E1"
              />
            </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.floatingScanButton, {bottom: insets.bottom + 90}]}
        activeOpacity={0.85}>
        <Feather name="maximize" size={24} color="#1E293B" />
      </TouchableOpacity>

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab="home"
          bottomInset={insets.bottom}
          onTabPress={handleTabPress}
        />
      </View>
    </View>
  );
}

function ReminderCard({
  item,
  enabled,
  onToggle,
}: {
  item: ReminderItem;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.reminderCard}>
      <View style={styles.cardLeftContentMeta}>
        <View style={styles.iconCircleContainer}>
          <Feather name="clock" size={18} color="#0D9488" />
        </View>
        <View style={styles.reminderTextMetaBlock}>
          <Text style={styles.medicineNameTitleText}>{item.medicine}</Text>
          <Text style={styles.timeScheduleSubtext}>{item.time}</Text>
          <Text style={styles.frequencyIntervalSubtext}>{item.frequency}</Text>
        </View>
      </View>
      <View style={styles.cardRightToggleActionRow}>
        <View style={styles.alarmIndicatorBadge}>
          <Feather
            name="bell"
            size={12}
            color="#0D9488"
            style={styles.bellIconMargin}
          />
          <Text style={styles.alarmBadgeText}>Alarm</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={SWITCH_TRACK}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#CBD5E1"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#F5F6FA',
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  addReminderTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  plusIconMargin: {
    marginRight: 2,
  },
  addReminderTopText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  tabsSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginTop: 12,
    marginBottom: 14,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeSegmentButton: {
    backgroundColor: '#408E91',
  },
  segmentButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  activeSegmentButtonText: {
    color: '#FFFFFF',
  },
  notificationSettingsLink: {
    alignSelf: 'center',
    paddingVertical: 4,
    marginBottom: 20,
  },
  notificationSettingsLinkText: {
    color: '#14B8A6',
    fontSize: 15,
    fontWeight: '600',
  },
  timePeriodLabelHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
    marginBottom: 10,
  },
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  cardLeftContentMeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  iconCircleContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  reminderTextMetaBlock: {
    marginLeft: 12,
    flex: 1,
  },
  medicineNameTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
  },
  timeScheduleSubtext: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  frequencyIntervalSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  cardRightToggleActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  alarmIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F1',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  bellIconMargin: {
    marginRight: 4,
  },
  alarmBadgeText: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '700',
  },
  masterSettingsBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  masterLeftBlockTextMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
    minWidth: 0,
  },
  masterIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterTextBlock: {
    marginLeft: 12,
    flex: 1,
  },
  masterTitleMainHeadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  masterDescriptionBodyText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  floatingScanButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 99,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
