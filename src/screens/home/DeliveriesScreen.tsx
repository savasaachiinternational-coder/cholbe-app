import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import { FONT } from '../../theme/typography';
import {
  DELIVERY_ACTIONS,
  DELIVERY_COLORS,
  DELIVERY_INFO,
  DELIVERY_MEDICINES,
  NEXT_DELIVERY,
} from './deliveriesData';

type Props = NativeStackScreenProps<RootStackParamList, 'Deliveries'>;

const C = DELIVERY_COLORS;

export function DeliveriesScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

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
    <View style={[styles.container, {backgroundColor: C.background}]}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={C.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deliveries</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
          <Feather name="search" size={22} color={C.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 110},
        ]}>
        <View style={styles.nextDeliveryCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.folderIconContainer}>
              <Feather name="folder" size={22} color={C.primaryMint} />
            </View>
            <Text style={styles.cardTitle}>{NEXT_DELIVERY.title}</Text>
          </View>

          <View style={styles.metaRow}>
            <Feather
              name="calendar"
              size={16}
              color={C.primaryMint}
              style={styles.metaIcon}
            />
            <Text style={styles.metaText}>{NEXT_DELIVERY.dateLabel}</Text>
          </View>

          <View style={styles.metaRow}>
            <Feather
              name="clock"
              size={16}
              color={C.primaryMint}
              style={styles.metaIcon}
            />
            <Text style={styles.metaText}>{NEXT_DELIVERY.countdownLabel}</Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              Status : {NEXT_DELIVERY.status}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Medicines Included</Text>
        <View style={styles.listContainer}>
          {DELIVERY_MEDICINES.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.listItem,
                index === DELIVERY_MEDICINES.length - 1 && styles.listItemLast,
              ]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('MedicineList')}>
              <View style={styles.listItemLeft}>
                <FontAwesome5 name="pills" size={18} color={C.primaryMint} />
                <Text style={styles.medicineName}>{item.name}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={C.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Delivery Info</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <FontAwesome5
              name="truck"
              size={20}
              color={C.textDark}
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoText}>
                <Text style={styles.boldLabel}>Delivery Time:</Text>{' '}
                {DELIVERY_INFO.deliveryTime}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.boldLabel}>Payment:</Text>{' '}
                {DELIVERY_INFO.payment}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionContainer}>
          {DELIVERY_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionRow}
              activeOpacity={0.7}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIconWrapper}>
                  <Feather name={action.icon} size={20} color={C.textDark} />
                </View>
                <Text style={styles.actionText}>{action.label}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={C.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.previousDeliveriesBtn} activeOpacity={0.6}>
          <Text style={styles.previousDeliveriesText}>View Previous Deliveries</Text>
          <Feather name="chevron-right" size={14} color={C.primaryMint} />
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={[styles.floatingButton, {bottom: insets.bottom + 90}]}
        activeOpacity={0.85}>
        <Feather name="maximize" size={24} color={C.textDark} />
        <View style={styles.sparkleIcon}>
          <FontAwesome5 name="sparkles" size={10} color={C.textDark} />
        </View>
      </TouchableOpacity>

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab="profile"
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: C.background,
  },
  headerBtn: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: C.textDark,
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  nextDeliveryCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 24,
    marginTop: 10,
    shadowColor: '#5A607F',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  folderIconContainer: {
    backgroundColor: C.mintBg,
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: C.textDark,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaIcon: {
    marginRight: 10,
    width: 16,
  },
  metaText: {
    fontSize: 13,
    color: C.textMuted,
  },
  statusBadge: {
    backgroundColor: C.mintBg,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#D2F0EC',
  },
  statusText: {
    fontSize: 12,
    color: C.primaryMint,
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: C.textMuted,
    marginTop: 24,
    marginBottom: 12,
    paddingLeft: 4,
  },
  listContainer: {
    backgroundColor: C.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#5A607F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  medicineName: {
    fontSize: 15,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: C.textDark,
  },
  infoCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#5A607F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 14,
    width: 24,
  },
  infoText: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 22,
  },
  boldLabel: {
    color: C.textDark,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#5A607F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconWrapper: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    fontSize: 15,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: C.textDark,
  },
  previousDeliveriesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingVertical: 8,
  },
  previousDeliveriesText: {
    fontSize: 13,
    color: C.primaryMint,
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginRight: 4,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.floatingBtn,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.primaryMint,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  sparkleIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
