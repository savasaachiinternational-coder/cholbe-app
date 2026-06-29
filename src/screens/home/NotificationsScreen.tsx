import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {
  matchesNotificationTab,
  type NotificationFilterTab,
} from './notificationsData';
import {notificationsApi, type Notification} from '../../api/notifications';
import {ApiError} from '../../api/client';
import {useNotificationBadge} from '../../context/NotificationContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const FILTER_TABS: NotificationFilterTab[] = [
  'all',
  'order',
  'appointment',
  'medication',
  'vendor',
];
const FILTER_TAB_SCROLL_STEP = 140;

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
  return date.toLocaleDateString('en-GB', {day: 'numeric', month: 'short'});
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function categoryIcon(category: string): {name: string; color: string; bg: string} {
  switch (category) {
    case 'order': return {name: 'shopping-bag', color: '#7C3AED', bg: '#EDE9FE'};
    case 'appointment': return {name: 'calendar', color: '#0284C7', bg: '#E0F2FE'};
    case 'vendor': return {name: 'store', color: '#B45309', bg: '#FEF3C7'};
    default: return {name: 'bell', color: '#0D9488', bg: '#CCFBF1'};
  }
}

export function NotificationsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<NotificationFilterTab>('all');
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const {refresh: refreshBadge} = useNotificationBadge();
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
      setItems(data);
    } catch (err) {
      Alert.alert('Notifications', err instanceof ApiError ? err.message : 'Could not load');
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
    const filtered = items.filter(item =>
      matchesNotificationTab(item.category as never, activeTab),
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
  }, [items, activeTab]);

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
    filterScrollRef.current?.scrollTo({x: nextOffset, animated: true});
    setFilterScrollX(nextOffset);
  };

  const scrollToFilterTab = useCallback(
    (tab: NotificationFilterTab) => {
      const tabX = tabOffsetsRef.current[tab] ?? 0;
      const maxOffset = Math.max(0, filterContentWidth - filterViewportWidth);
      const target = Math.min(Math.max(0, tabX - 12), maxOffset);
      filterScrollRef.current?.scrollTo({x: target, animated: true});
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
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.markAllButton} onPress={markAllRead}>
          <Text style={styles.markAllText}>Read all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterTabsRow}>
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
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0D9488" style={styles.loader} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: insets.bottom + 110},
          ]}>
          {filteredSections.length === 0 ? (
            <Text style={styles.emptyText}>No notifications yet.</Text>
          ) : (
            filteredSections.map(section => (
              <View key={section.title}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.items.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
                    activeOpacity={0.85}
                    onPress={() => markRead(item.id)}>
                    <View style={[styles.iconCircle, {backgroundColor: categoryIcon(item.category).bg}]}>
                      <Feather name={categoryIcon(item.category).name as any} size={16} color={categoryIcon(item.category).color} />
                    </View>
                    <View style={styles.notificationBody}>
                      <Text style={styles.notificationTitle}>{item.title}</Text>
                      <Text style={styles.notificationMessage}>{item.body}</Text>
                      <Text style={styles.notificationTime}>
                        {formatTime(item.createdAt)}
                      </Text>
                    </View>
                    {!item.isRead ? <View style={styles.unreadDot} /> : null}
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      )}

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
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {padding: 4, width: 32},
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  markAllButton: {padding: 4},
  markAllText: {fontSize: 13, color: '#0D9488', fontWeight: '600'},
  filterTabsRow: {
    paddingHorizontal: 12,
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
    shadowOffset: {width: 0, height: 1},
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
  filterChipActive: {backgroundColor: '#0D9488'},
  filterChipText: {fontSize: 13, color: '#64748B', fontWeight: '600'},
  filterChipTextActive: {color: '#FFFFFF'},
  scrollContent: {paddingHorizontal: 16},
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
    marginTop: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
  },
  unreadCard: {borderColor: '#99F6E4', backgroundColor: '#F0FDFA'},
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationBody: {flex: 1},
  notificationTitle: {fontSize: 15, fontWeight: '700', color: '#1E293B'},
  notificationMessage: {fontSize: 13, color: '#64748B', marginTop: 4},
  notificationTime: {fontSize: 11, color: '#94A3B8', marginTop: 6},
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D9488',
    marginTop: 4,
  },
  loader: {marginTop: 40},
  emptyText: {textAlign: 'center', color: '#64748B', marginTop: 40},
  bottomNavWrap: {position: 'absolute', left: 0, right: 0, bottom: 0},
});
