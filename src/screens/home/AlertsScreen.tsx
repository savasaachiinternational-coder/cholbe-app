import {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {type AlertSegmentTab} from './alertsData';
import {notificationsApi, type Notification} from '../../api/notifications';
import {ApiError} from '../../api/client';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Alerts'>;

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(date, today)) {
    return `Today, ${date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`;
  }
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isAlertNotification(n: Notification): boolean {
  return n.category === 'alert' || n.title.toLowerCase().includes('missed');
}

export function AlertsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeSegmentTab, setActiveSegmentTab] =
    useState<AlertSegmentTab>('alerts');
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.list();
      setItems(data.filter(isAlertNotification));
    } catch (err) {
      Alert.alert(
        'Alerts',
        err instanceof ApiError ? err.message : 'Could not load alerts',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [loadAlerts]),
  );

  const groupedAlerts = useMemo(() => {
    const map = new Map<string, Notification[]>();
    items.forEach(alert => {
      const key = formatDateLabel(alert.createdAt);
      const list = map.get(key) ?? [];
      list.push(alert);
      map.set(key, list);
    });
    return Array.from(map.entries());
  }, [items]);

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

  const onSegmentPress = (tab: AlertSegmentTab) => {
    if (tab === 'all') {
      navigation.navigate('Notifications');
      return;
    }
    if (tab === 'reminders') {
      navigation.navigate('Reminders');
      return;
    }
    setActiveSegmentTab('alerts');
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
        <Text style={styles.headerTitle}>Alerts</Text>
        <TouchableOpacity
          style={styles.addReminderTopButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Reminders')}>
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
          {paddingBottom: insets.bottom + 110},
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
              onPress={() => onSegmentPress(tab.key)}>
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
          onPress={() => navigation.navigate('Reminders')}>
          <Text style={styles.notificationSettingsLinkText}>
            Notification Settings
          </Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#0D9488" style={styles.loader} />
        ) : groupedAlerts.length === 0 ? (
          <Text style={styles.emptyText}>No alerts right now. You are on track!</Text>
        ) : (
          groupedAlerts.map(([dateLabel, alerts]) => (
            <View key={dateLabel}>
              <Text style={styles.dateSectionHeader}>{dateLabel}</Text>
              {alerts.map(alert => (
                <View key={alert.id} style={styles.alertNotificationCard}>
                  <View style={styles.cardInnerContentRow}>
                    <View style={styles.warningIconCircle}>
                      <Feather name="alert-circle" size={18} color="#EF4444" />
                    </View>
                    <View style={styles.cardTextMetaBlock}>
                      <Text style={styles.cardHeadingTitleText}>{alert.title}</Text>
                      <Text style={styles.cardBodyDescriptionText}>
                        {alert.body}
                      </Text>
                      <Text style={styles.cardTimestampText}>
                        {formatTime(alert.createdAt)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewHistoryTagButton}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('MedicineList')}>
                      <Text style={styles.viewHistoryTagText}>View History</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#475569',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  loader: {
    marginVertical: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 32,
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
    fontFamily: FONT.semibold,
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  dateSectionHeader: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
    marginBottom: 12,
  },
  alertNotificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  cardInnerContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  warningIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardTextMetaBlock: {
    marginLeft: 12,
    flex: 1,
    paddingRight: 75,
  },
  cardHeadingTitleText: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 18,
  },
  cardBodyDescriptionText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginTop: 4,
  },
  cardTimestampText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginTop: 6,
  },
  viewHistoryTagButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
  },
  viewHistoryTagText: {
    fontSize: 10,
    color: '#14B8A6',
    fontFamily: FONT.semibold,
    fontWeight: '600',
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
