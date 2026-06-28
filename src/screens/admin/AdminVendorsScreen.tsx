import {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {adminApi} from '../../api/admin';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';
import {ADMIN_VENDOR_FILTERS, type AdminVendorFilter} from './adminNav';

type Props = NativeStackScreenProps<RootStackParamList, 'AVendors'>;

type ApiVendor = {
  id: string;
  pharmacyName: string;
  phone: string | null;
  approvalStatus: string;
  createdAt: string;
  user: {fullName: string; email: string | null; phone: string | null};
};

type VendorRecord = {
  id: string;
  name: string;
  pharmacy: string;
  phone: string;
  timeAgo: string;
  approvalStatus: string;
};

function filterToApiStatus(filter: AdminVendorFilter): string | undefined {
  if (filter === 'All') return undefined;
  if (filter === 'Pending') return 'PENDING';
  if (filter === 'Approved') return 'APPROVED';
  if (filter === 'Rejected') return 'REJECTED';
  return undefined;
}

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day ago`;
}

function mapVendor(record: ApiVendor): VendorRecord {
  return {
    id: record.id,
    name: record.user.fullName,
    pharmacy: record.pharmacyName,
    phone: record.user.phone ?? record.phone ?? '—',
    timeAgo: formatTimeAgo(record.createdAt),
    approvalStatus: record.approvalStatus,
  };
}

function VendorCard({
  item,
  onApprove,
  onReject,
  updating,
}: {
  item: VendorRecord;
  onApprove: () => void;
  onReject: () => void;
  updating: boolean;
}) {
  const showActions = item.approvalStatus === 'PENDING';

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

      {showActions && (
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnApprove]}
            activeOpacity={0.85}
            disabled={updating}
            onPress={onApprove}>
            <Feather name="check-circle" size={14} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnReject]}
            activeOpacity={0.85}
            disabled={updating}
            onPress={onReject}>
            <Feather name="x-circle" size={14} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export function AdminVendorsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<AdminVendorFilter>('Pending');
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadVendors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.vendors(filterToApiStatus(activeFilter));
      setVendors((data as ApiVendor[]).map(mapVendor));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load vendors';
      Alert.alert('Vendors', message);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useFocusEffect(
    useCallback(() => {
      loadVendors();
    }, [loadVendors]),
  );

  const updateStatus = useCallback(
    async (vendorId: string, approvalStatus: 'APPROVED' | 'REJECTED') => {
      setUpdatingId(vendorId);
      try {
        await adminApi.updateVendorStatus(vendorId, approvalStatus);
        await loadVendors();
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Could not update vendor';
        Alert.alert('Vendors', message);
      } finally {
        setUpdatingId(null);
      }
    },
    [loadVendors],
  );

  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter(
      v =>
        v.name.toLowerCase().includes(q) ||
        v.pharmacy.toLowerCase().includes(q) ||
        v.phone.includes(q),
    );
  }, [vendors, search]);

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
            value={search}
            onChangeText={setSearch}
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
          {loading ? (
            <ActivityIndicator color="#4E929D" style={styles.loader} />
          ) : filteredVendors.length === 0 ? (
            <Text style={styles.emptyText}>No vendors found.</Text>
          ) : (
            filteredVendors.map(record => (
              <VendorCard
                key={record.id}
                item={record}
                updating={updatingId === record.id}
                onApprove={() => updateStatus(record.id, 'APPROVED')}
                onReject={() => updateStatus(record.id, 'REJECTED')}
              />
            ))
          )}
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
  loader: {marginVertical: 32},
  emptyText: {
    textAlign: 'center',
    color: '#9AA6B2',
    fontSize: 14,
    paddingVertical: 32,
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
