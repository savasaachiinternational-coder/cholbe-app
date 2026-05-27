import {useMemo, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {
  NOTIFICATION_SECTIONS,
  matchesNotificationTab,
  type NotificationFilterTab,
  type NotificationItem,
} from './notificationsData';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export function NotificationsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<NotificationFilterTab>('all');

  const filteredSections = useMemo(
    () =>
      NOTIFICATION_SECTIONS.map(section => ({
        ...section,
        items: section.items.filter(item =>
          matchesNotificationTab(item.category, activeTab),
        ),
      })).filter(section => section.items.length > 0),
    [activeTab],
  );

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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 110},
        ]}>
        <View style={styles.tabsContainer}>
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
                styles.tabButton,
                activeTab === tab.key && styles.activeTabButton,
              ]}
              activeOpacity={0.85}
              onPress={() => {
                if (tab.key === 'reminders') {
                  navigation.navigate('Reminders');
                  return;
                }
                if (tab.key === 'alerts') {
                  navigation.navigate('Alerts');
                  return;
                }
                setActiveTab(tab.key);
              }}>
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab.key && styles.activeTabButtonText,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.settingsLinkButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Reminders')}>
          <Text style={styles.settingsLinkText}>Notification Settings</Text>
        </TouchableOpacity>

        {filteredSections.map(section => (
          <View key={section.id}>
            <Text style={styles.dateSectionHeader}>{section.dateLabel}</Text>
            {section.items.map(item => (
              <NotificationCard key={item.id} item={item} />
            ))}
          </View>
        ))}
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

function NotificationCard({item}: {item: NotificationItem}) {
  if (item.category === 'managed' && item.managedMember) {
    return (
      <View style={styles.notificationCard}>
        <View style={styles.managedHeaderRow}>
          <CategoryIcon category="followup" />
          <View style={styles.cardTextContentMetaManaged}>
            <Text style={styles.cardHeadingTitleText}>{item.title}</Text>
          </View>
          <Text style={styles.inlineRightUtilityLabel}>Managed</Text>
        </View>
        <TouchableOpacity style={styles.embeddedUserRowAction} activeOpacity={0.8}>
          <Image
            source={item.managedMember.avatar}
            style={styles.embeddedAvatarThumb}
          />
          <View style={styles.embeddedTextMetaBlock}>
            <Text style={styles.embeddedProfileName}>
              {item.managedMember.name}
            </Text>
            <Text style={styles.embeddedProfileRelationship}>
              {item.managedMember.relation}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.notificationCard}>
      <View style={styles.cardInnerContentRow}>
        <CategoryIcon category={item.category} />
        <View style={styles.cardTextContentMeta}>
          <Text style={styles.cardHeadingTitleText}>{item.title}</Text>
          {item.body ? (
            <Text style={styles.cardBodyDescriptionText}>{item.body}</Text>
          ) : null}
          {item.time ? (
            <Text style={styles.cardTimestampText}>{item.time}</Text>
          ) : null}
        </View>
        {item.showMarkTaken ? (
          <TouchableOpacity
            style={styles.inlineActionLinkTextButton}
            activeOpacity={0.8}>
            <Text style={styles.inlineActionLinkText}>Mark as Taken</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function CategoryIcon({category}: {category: NotificationItem['category']}) {
  if (category === 'medication') {
    return (
      <View style={[styles.categoryIconCircle, styles.iconMedication]}>
        <FontAwesome name="medkit" size={18} color="#0D9488" />
      </View>
    );
  }
  if (category === 'missed_dose') {
    return (
      <View style={[styles.categoryIconCircle, styles.iconAlert]}>
        <Feather name="alert-circle" size={18} color="#EF4444" />
      </View>
    );
  }
  return (
    <View style={[styles.categoryIconCircle, styles.iconFollowup]}>
      <Feather name="activity" size={18} color="#2563EB" />
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
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginTop: 12,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#408E91',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  settingsLinkButton: {
    alignSelf: 'center',
    paddingVertical: 4,
    marginBottom: 20,
  },
  settingsLinkText: {
    color: '#14B8A6',
    fontSize: 15,
    fontWeight: '600',
  },
  dateSectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
    marginBottom: 10,
  },
  notificationCard: {
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
  managedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  categoryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  iconMedication: {
    backgroundColor: '#E6F4F1',
  },
  iconAlert: {
    backgroundColor: '#FEE2E2',
  },
  iconFollowup: {
    backgroundColor: '#EFF6FF',
  },
  cardTextContentMeta: {
    marginLeft: 12,
    flex: 1,
    paddingRight: 60,
  },
  cardTextContentMetaManaged: {
    marginLeft: 12,
    flex: 1,
    paddingRight: 56,
  },
  cardHeadingTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
  },
  cardBodyDescriptionText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  cardTimestampText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 6,
  },
  inlineActionLinkTextButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
  },
  inlineActionLinkText: {
    fontSize: 10,
    color: '#0D9488',
    fontWeight: '700',
  },
  inlineRightUtilityLabel: {
    position: 'absolute',
    right: 0,
    top: 4,
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  embeddedUserRowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 4,
  },
  embeddedAvatarThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CBD5E1',
  },
  embeddedTextMetaBlock: {
    marginLeft: 10,
    flex: 1,
  },
  embeddedProfileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  embeddedProfileRelationship: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
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
