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

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

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

export function NotificationsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<NotificationFilterTab>('all');
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

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
    }, [loadNotifications]),
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
    } catch {
      // ignore
    }
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={() => notificationsApi.markAllRead().then(loadNotifications)}>
          <Text style={styles.markAllText}>Read all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}>
        {(['all', 'medication', 'order', 'appointment'] as NotificationFilterTab[]).map(
          tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, activeTab === tab && styles.filterChipActive]}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.filterChipText,
                  activeTab === tab && styles.filterChipTextActive,
                ]}>
                {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ),
        )}
      </ScrollView>

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
                    <View style={styles.iconCircle}>
                      <FontAwesome name="bell" size={16} color="#0D9488" />
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
  filterScroll: {maxHeight: 44, marginBottom: 8},
  filterContent: {paddingHorizontal: 16, gap: 8},
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
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
