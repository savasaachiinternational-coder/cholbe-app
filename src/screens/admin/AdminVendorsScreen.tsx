import {useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';
import {ADMIN_VENDOR_FILTERS, type AdminVendorFilter} from './adminNav';

type Props = NativeStackScreenProps<RootStackParamList, 'AVendors'>;

type VendorRecord = {
  id: string;
  name: string;
  pharmacy: string;
  phone: string;
  timeAgo: string;
};

const MOCK_VENDORS: VendorRecord[] = Array.from({length: 6}, (_, index) => ({
  id: String(index + 1),
  name: 'Rayhan Ullah',
  pharmacy: 'Medicare Pharmacy',
  phone: '01677589448',
  timeAgo: '2 min ago',
}));

function VendorCard({item}: {item: VendorRecord}) {
  return (
    <View style={styles.vendorCard}>
      <Text style={styles.timeAgoText}>{item.timeAgo}</Text>

      <View style={styles.cardBodyRow}>
        <Image
          source={{uri: 'https://via.placeholder.com/54/E2E8F0/000000?text=Vendor'}}
          style={styles.vendorAvatar}
        />
        <View style={styles.metaInfoColumn}>
          <Text style={styles.vendorNameText}>{item.name}</Text>
          <View style={styles.subRowItem}>
            <MaterialCommunityIcons name="hospital-box" size={13} color="#7E8B97" />
            <Text style={styles.subRowText}>{item.pharmacy}</Text>
          </View>
          <View style={styles.subRowItem}>
            <Feather name="phone" size={12} color="#7E8B97" />
            <Text style={styles.subRowText}>{item.phone}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.btnApprove]} activeOpacity={0.85}>
          <Feather name="check-circle" size={14} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.btnReject]} activeOpacity={0.85}>
          <Feather name="x-circle" size={14} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function AdminVendorsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<AdminVendorFilter>('Pending');

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendors</Text>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color="#1A1C1E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: 85 + insets.bottom},
        ]}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#9AA6B2" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9AA6B2"
            style={styles.searchInput}
          />
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialCommunityIcons name="tune" size={20} color="#4E929D" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}>
          {ADMIN_VENDOR_FILTERS.map(filterItem => {
            const isFilterActive = activeFilter === filterItem;
            return (
              <TouchableOpacity
                key={filterItem}
                style={[styles.chipItem, isFilterActive && styles.chipItemActive]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filterItem)}>
                <Text style={[styles.chipItemText, isFilterActive && styles.chipItemActiveText]}>
                  {filterItem}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.cardsVerticalStack}>
          {MOCK_VENDORS.map((record, index) => (
            <VendorCard key={`${record.id}-${index}`} item={record} />
          ))}
        </View>
      </ScrollView>

      <AdminBottomNav activeTab="vendors" bottomInset={insets.bottom} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  scrollContent: {
    paddingTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#F9FAFC',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1E',
    flex: 1,
    marginLeft: 12,
  },
  headerButton: {
    padding: 2,
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    color: '#1A1C1E',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  chipItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F0F3F6',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipItemActive: {
    backgroundColor: '#4E929D',
  },
  chipItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7E8B97',
  },
  chipItemActiveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardsVerticalStack: {
    gap: 12,
  },
  vendorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    position: 'relative',
  },
  timeAgoText: {
    position: 'absolute',
    top: 14,
    right: 14,
    fontSize: 10,
    color: '#9AA6B2',
    fontWeight: '500',
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 56,
  },
  vendorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  metaInfoColumn: {
    flex: 1,
    gap: 2,
  },
  vendorNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  subRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subRowText: {
    fontSize: 11,
    color: '#7E8B97',
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    height: 34,
    borderRadius: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnApprove: {
    backgroundColor: '#47B39D',
  },
  btnReject: {
    backgroundColor: '#E26D6D',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
