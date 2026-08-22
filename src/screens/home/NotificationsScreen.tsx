import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import { useRole } from '../../hooks/useRole';
import type { RootStackParamList } from '../../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RoleBottomNav } from '../../components/RoleBottomNav';
import type { BottomTabKey } from './homeData';
import {
  matchesNotificationTab,
  type NotificationFilterTab,
} from './notificationsData';
import { notificationsApi, type Notification } from '../../api/notifications';
import { ApiError } from '../../api/client';
import { useNotificationBadge } from '../../context/NotificationContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

type SScreen = 'Notification' | 'Reminders' | 'Alert';

const FILTER_TABS: NotificationFilterTab[] = [
  'all',
  'order',
  'appointment',
  'medication',
  'vendor',
];
const FILTER_TAB_SCROLL_STEP = 140;

const FONT = {
  regular: 'ProximaNova-Regular',
  medium: 'ProximaNova-Medium',
  semibold: 'ProximaNova-Semibold',
  bold: 'ProximaNova-Bold',
} as const;

const SEGMENT_ACTIVE_COLORS = ['#307887', '#74ACB3'];
const SEGMENT_ACTIVE_START = { x: 0.98, y: 0.64 };
const SEGMENT_ACTIVE_END = { x: 0.02, y: 0.36 };
const SEGMENT_ACTIVE_COLOR = '#408E91';

// `categories` are the API notification categories each segment shows.
// Omitting it (the All segment) means "no category filter".
const SEGMENTS: {
  key: SScreen;
  label: string;
  addLabel?: string;
  categories?: string[];
}[] = [
  { key: 'Notification', label: 'All' },
  {
    key: 'Reminders',
    label: 'Reminders',
    addLabel: 'Add Reminder',
    categories: ['medication'],
  },
  {
    key: 'Alert',
    label: 'Alerts',
    addLabel: 'Add Alerts',
    categories: ['alert'],
  },
];

function filterTabLabel(tab: NotificationFilterTab) {
  return tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1);
}

function formatSection(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function categoryIcon(category: string): {
  name: string;
  color: string;
  bg: string;
} {
  switch (category) {
    case 'order':
      return { name: 'shopping-bag', color: '#7C3AED', bg: '#EDE9FE' };
    case 'appointment':
      return { name: 'calendar', color: '#0284C7', bg: '#E0F2FE' };
    case 'vendor':
      return { name: 'store', color: '#B45309', bg: '#FEF3C7' };
    case 'alert':
      return { name: 'alert-circle', color: '#E77F7E', bg: '#FEF3C7' };
    default:
      return { name: 'bell', color: '#0D9488', bg: '#CCFBF1' };
  }
}

export function NotificationsScreen({ navigation }: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<NotificationFilterTab>('all');
  const [items, setItems] = useState<Notification[]>([]);
  const [selectedScreen, setSelectedScreen] = useState<SScreen>('Notification');
  // Reminder alarm switches are local only — the API has no alarm field yet.
  const [alarmOn, setAlarmOn] = useState<Record<string, boolean>>({});
  const addButtonTitle = SEGMENTS.find(s => s.key === selectedScreen)?.addLabel;
  const [loading, setLoading] = useState(true);
  const role = useRole();
  const { refresh: refreshBadge } = useNotificationBadge();
  const filterScrollRef = useRef<ScrollView>(null);
  const [filterScrollX, setFilterScrollX] = useState(0);
  const [filterContentWidth, setFilterContentWidth] = useState(0);
  const [filterViewportWidth, setFilterViewportWidth] = useState(0);
  const tabOffsetsRef = useRef<Record<NotificationFilterTab, number>>({
    all: 0,
    order: 0,
    appointment: 0,
    medication: 0,
    vendor: 0,
  });

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.list();
      console.log(data);

      setItems(data);
    } catch (err) {
      Alert.alert(
        'Notifications',
        err instanceof ApiError ? err.message : 'Could not load',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      refreshBadge();
    }, [loadNotifications, refreshBadge]),
  );

  const filteredSections = useMemo(() => {
    const categories = SEGMENTS.find(s => s.key === selectedScreen)?.categories;
    const filtered = items.filter(
      item =>
        matchesNotificationTab(item.category as never, activeTab) &&
        (!categories || categories.includes(item.category)),
    );
    const map = new Map<string, Notification[]>();
    filtered.forEach(n => {
      const key = formatSection(n.createdAt);
      const list = map.get(key) ?? [];
      list.push(n);
      map.set(key, list);
    });
    return Array.from(map.entries()).map(([title, sectionItems]) => ({
      title,
      items: sectionItems,
    }));
  }, [items, activeTab, selectedScreen]);

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

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      loadNotifications();
      refreshBadge();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      loadNotifications();
      refreshBadge();
    } catch {}
  };

  const filterTabsOverflow = filterContentWidth > filterViewportWidth + 4;
  const canScrollFiltersLeft = filterScrollX > 4;
  const canScrollFiltersRight =
    filterTabsOverflow &&
    filterScrollX + filterViewportWidth < filterContentWidth - 4;

  const scrollFilterTabs = (direction: 'left' | 'right') => {
    const maxOffset = Math.max(0, filterContentWidth - filterViewportWidth);
    const nextOffset =
      direction === 'left'
        ? Math.max(0, filterScrollX - FILTER_TAB_SCROLL_STEP)
        : Math.min(maxOffset, filterScrollX + FILTER_TAB_SCROLL_STEP);
    filterScrollRef.current?.scrollTo({ x: nextOffset, animated: true });
    setFilterScrollX(nextOffset);
  };

  const scrollToFilterTab = useCallback(
    (tab: NotificationFilterTab) => {
      const tabX = tabOffsetsRef.current[tab] ?? 0;
      const maxOffset = Math.max(0, filterContentWidth - filterViewportWidth);
      const target = Math.min(Math.max(0, tabX - 12), maxOffset);
      filterScrollRef.current?.scrollTo({ x: target, animated: true });
      setFilterScrollX(target);
    },
    [filterContentWidth, filterViewportWidth],
  );

  useEffect(() => {
    if (filterViewportWidth > 0) {
      scrollToFilterTab(activeTab);
    }
  }, [activeTab, filterViewportWidth, scrollToFilterTab]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8 },
          selectedScreen !== 'Notification' && {
            justifyContent: 'space-between',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={24} color="#171717" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedScreen}</Text>
        {addButtonTitle ? (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllRead}>
            <Feather name="plus" size={14} color={'#171717'} />
            <Text style={styles.markAllText}>{addButtonTitle}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.segmentBandWrap}>
        <View style={styles.segmentedControlContainer}>
          {SEGMENTS.map((segment, index) => {
            const active = selectedScreen === segment.key;
            const prevActive =
              index > 0 && selectedScreen === SEGMENTS[index - 1].key;
            return (
              <TouchableOpacity
                key={segment.key}
                style={[
                  styles.segmentTab,
                  index > 0 && !active && !prevActive && styles.segmentDivider,
                  active && styles.segmentActiveTab,
                ]}
                activeOpacity={0.85}
                onPress={() => setSelectedScreen(segment.key)}
              >
                {active ? (
                  <LinearGradient
                    colors={SEGMENT_ACTIVE_COLORS}
                    start={SEGMENT_ACTIVE_START}
                    end={SEGMENT_ACTIVE_END}
                    style={StyleSheet.absoluteFill}
                  />
                ) : null}
                <Text
                  style={[
                    styles.segmentTabText,
                    active && styles.segmentActiveTabText,
                  ]}
                >
                  {segment.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.settingsLinkText}>Notification Settings</Text>
      </View>

      {/* <View style={styles.filterTabsRow}>
        <View style={styles.filterScrollWrap}>
          <ScrollView
            ref={filterScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            bounces={false}
            scrollEventThrottle={16}
            style={styles.filterScroll}
            contentContainerStyle={[
              styles.filterContent,
              filterTabsOverflow && styles.filterContentWithArrows,
            ]}
            onLayout={event => setFilterViewportWidth(event.nativeEvent.layout.width)}
            onContentSizeChange={width => setFilterContentWidth(width)}
            onScroll={event => setFilterScrollX(event.nativeEvent.contentOffset.x)}
            onMomentumScrollEnd={event =>
              setFilterScrollX(event.nativeEvent.contentOffset.x)
            }>
            {FILTER_TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.filterChip, activeTab === tab && styles.filterChipActive]}
                onLayout={event => {
                  tabOffsetsRef.current[tab] = event.nativeEvent.layout.x;
                }}
                onPress={() => setActiveTab(tab)}>
                <Text
                  style={[
                    styles.filterChipText,
                    activeTab === tab && styles.filterChipTextActive,
                  ]}>
                  {filterTabLabel(tab)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filterTabsOverflow ? (
            <>
              <View style={styles.filterArrowLeftSlot} pointerEvents="box-none">
                <TouchableOpacity
                  style={[
                    styles.filterArrowButton,
                    !canScrollFiltersLeft && styles.filterArrowButtonDisabled,
                  ]}
                  activeOpacity={0.75}
                  disabled={!canScrollFiltersLeft}
                  onPress={() => scrollFilterTabs('left')}>
                  <Feather
                    name="chevron-left"
                    size={18}
                    color={canScrollFiltersLeft ? '#475569' : '#CBD5E1'}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.filterArrowRightSlot} pointerEvents="box-none">
                <TouchableOpacity
                  style={[
                    styles.filterArrowButton,
                    !canScrollFiltersRight && styles.filterArrowButtonDisabled,
                  ]}
                  activeOpacity={0.75}
                  disabled={!canScrollFiltersRight}
                  onPress={() => scrollFilterTabs('right')}>
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={canScrollFiltersRight ? '#475569' : '#CBD5E1'}
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>
      </View> */}

      {loading ? (
        <ActivityIndicator size="large" color="#0D9488" style={styles.loader} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 110 },
          ]}
        >
          {filteredSections.length === 0 ? (
            <Text style={styles.emptyText}>No notifications yet.</Text>
          ) : (
            filteredSections.map(section => (
              <View key={section.title}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.items.map(item =>
                  selectedScreen === 'Reminders' ? (
                    <ReminderCard
                      key={item.id}
                      item={item}
                      alarmOn={alarmOn[item.id] ?? true}
                      onToggleAlarm={value =>
                        setAlarmOn(prev => ({ ...prev, [item.id]: value }))
                      }
                      onPress={() => markRead(item.id)}
                    />
                  ) : selectedScreen === 'Alert' ? (
                    <AlertCard
                      key={item.id}
                      item={item}
                      onPress={() => markRead(item.id)}
                    />
                  ) : (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.notificationCard,
                        !item.isRead && styles.unreadCard,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => markRead(item.id)}
                    >
                      <View
                        style={[
                          styles.iconCircle,
                          { backgroundColor: categoryIcon(item.category).bg },
                        ]}
                      >
                        <Feather
                          name={categoryIcon(item.category).name as any}
                          size={16}
                          color={categoryIcon(item.category).color}
                        />
                      </View>
                      <View style={styles.notificationBody}>
                        <Text style={styles.notificationTitle}>
                          {item.title}
                        </Text>
                        <Text style={styles.notificationMessage}>
                          {item.body}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {formatTime(item.createdAt)}
                        </Text>
                      </View>
                      {!item.isRead ? <View style={styles.unreadDot} /> : null}
                    </TouchableOpacity>
                  ),
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {role === 'CUSTOMER' && (
        <TouchableOpacity
          style={[styles.floatingScanButton, { bottom: insets.bottom + 90 }]}
          activeOpacity={0.85}
        >
          <Image source={require('../../assets/syaiicon.png')} />
        </TouchableOpacity>
      )}

      <View style={styles.bottomNavWrap}>
        <RoleBottomNav
          activeTab="home"
          bottomInset={insets.bottom}
          navigation={navigation}
          onTabPress={handleTabPress}
        />
      </View>
    </View>
  );
}

function ReminderCard({
  item,
  alarmOn,
  onToggleAlarm,
  onPress,
}: {
  item: Notification;
  alarmOn: boolean;
  onToggleAlarm: (value: boolean) => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.reminderCard}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.reminderIconCircle}>
        <Feather name="info" size={15} color="#FFFFFF" />
      </View>

      <View style={styles.reminderBody}>
        <Text style={styles.reminderTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.reminderTime}>{formatTime(item.createdAt)}</Text>
        {item.body ? (
          <Text style={styles.reminderSub} numberOfLines={1}>
            {item.body}
          </Text>
        ) : null}
      </View>

      <View style={styles.alarmGroup}>
        <View style={styles.alarmChip}>
          <Feather name="bell" size={11} color="#0D9488" />
          <Text style={styles.alarmChipText}>Alarm</Text>
        </View>
        <Switch
          value={alarmOn}
          onValueChange={onToggleAlarm}
          trackColor={{ false: '#E2E8F0', true: '#34C759' }}
          thumbColor="#FFFFFF"
          style={styles.alarmSwitch}
        />
      </View>
    </TouchableOpacity>
  );
}

function AlertCard({
  item,
  onPress,
}: {
  item: Notification;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.alertCard}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.alertIconCircle}>
        <Feather name="alert-circle" size={15} color="#FFFFFF" />
      </View>

      <View style={styles.notificationBody}>
        <View style={styles.alertTitleRow}>
          <Text style={styles.alertTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.viewHistoryChip}>
            <Text style={styles.viewHistoryText}>View History</Text>
          </View>
        </View>
        <Text style={styles.alertMessage}>{item.body}</Text>
        <Text style={styles.notificationTime}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F1FD' },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: { padding: 4, width: 32 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 40,
    elevation: 1,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E6E3EE',
    backgroundColor: '#F4F1FD',
    paddingHorizontal: 12,
  },
  markAllText: {
    fontSize: 10,
    paddingLeft: 4,
    fontFamily: FONT.semibold,
    color: '#424242',
    fontWeight: '400',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  segmentBandWrap: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 },
  segmentedControlContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    overflow: 'hidden',
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentDivider: {
    borderLeftWidth: 1,
    borderLeftColor: '#E8E8EF',
  },
  // The rounded ends come from the container's borderRadius + overflow: 'hidden',
  // which clips whichever segment sits at the edge.
  segmentActiveTab: {
    backgroundColor: SEGMENT_ACTIVE_COLOR,
  },
  segmentTabText: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    color: '#64748B',
    fontWeight: '600',
  },
  segmentActiveTabText: { color: '#FFFFFF' },
  settingsLinkText: {
    marginTop: 14,
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '400',
    color: '#4DA69F',
    textAlign: 'center',
  },
  filterTabsRow: {
    paddingHorizontal: 12,
    marginLeft: 5,
    marginBottom: 10,
    minHeight: 44,
  },
  filterScrollWrap: {
    position: 'relative',
    minHeight: 40,
    justifyContent: 'center',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  filterContentWithArrows: {
    paddingHorizontal: 34,
  },
  filterArrowLeftSlot: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 2,
  },
  filterArrowRightSlot: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 2,
  },
  filterArrowButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  filterArrowButtonDisabled: {
    opacity: 0.45,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
    flexShrink: 0,
  },
  filterChipActive: { backgroundColor: '#0D9488' },
  filterChipText: {
    fontSize: 13,
    fontFamily: FONT.semibold,
    color: '#64748B',
    fontWeight: '600',
  },
  filterChipTextActive: { color: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
    marginTop: 8,
  },
  // --- Reminders card ---
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4FD',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  reminderIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 14,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  reminderBody: { flex: 1 },
  reminderTitle: {
    fontSize: 14,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#1E293B',
  },
  reminderTime: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: '#475569',
    marginTop: 2,
  },
  reminderSub: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: '#94A3B8',
    marginTop: 2,
  },
  alarmGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  alarmChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F1',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  alarmSwitch: {
    transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
    marginHorizontal: -6,
  },
  alarmChipText: {
    fontSize: 11,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#0D9488',
    includeFontPadding: false,
  },
  // --- Alerts card ---
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F4FD',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  alertIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E77F7E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  alertTitle: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONT.bold,
    fontWeight: '600',
    color: '#424242',
  },
  viewHistoryChip: {
    backgroundColor: '#EDF7F6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  viewHistoryText: {
    fontSize: 10,
    fontFamily: FONT.semibold,
    fontWeight: '400',
    color: '#4DA69F',
    includeFontPadding: false,
  },
  alertMessage: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 4,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F4FD',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
  },
  unreadCard: { borderColor: '#99F6E4', backgroundColor: '#F0FDFA' },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationBody: { flex: 1 },
  notificationTitle: {
    fontSize: 15,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#1E293B',
  },
  notificationMessage: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: '#64748B',
    marginTop: 4,
  },
  notificationTime: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: '#94A3B8',
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D9488',
    marginTop: 4,
  },
  loader: { marginTop: 40 },
  emptyText: {
    fontFamily: FONT.regular,
    textAlign: 'center',
    color: '#64748B',
    marginTop: 40,
  },
  bottomNavWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 99,
  },
});
