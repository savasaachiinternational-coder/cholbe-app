import {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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
import {NotificationBell} from '../../components/NotificationBell';

type Props = NativeStackScreenProps<RootStackParamList, 'AVendors'>;

// Proxima Nova per the Figma typography. Android resolves a weight by the exact
// font file name, so each weight is referenced by its own family name.
const FONT = {
  regular: 'ProximaNova-Regular',
  medium: 'ProximaNova-Medium',
  semibold: 'ProximaNova-Semibold',
  bold: 'ProximaNova-Bold',
} as const;

type ApiVendor = {
  id: string;
  pharmacyName: string;
  phone: string | null;
  address: string | null;
  approvalStatus: string;
  createdAt: string;
  user: {id: string; fullName: string; email: string | null; phone: string | null; avatarUrl: string | null};
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

function approvalColor(status: string) {
  if (status === 'APPROVED') return '#00A884';
  if (status === 'REJECTED') return '#E26D6D';
  return '#F5A623';
}

function VendorDetailModal({
  vendor,
  onClose,
  onApprove,
  onReject,
  onDelete,
  updating,
}: {
  vendor: ApiVendor | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  updating: boolean;
}) {
  if (!vendor) return null;
  const showActions = vendor.approvalStatus === 'PENDING';
  return (
    <Modal visible={!!vendor} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.detailModal}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>Vendor Details</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={22} color="#1A1C1E" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.detailAvatarRow}>
              <Image
                source={{uri: vendor.user.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.user.fullName)}&background=4E929D&color=fff`}}
                style={styles.detailAvatar}
              />
              <View style={styles.detailAvatarMeta}>
                <Text style={styles.detailName}>{vendor.user.fullName}</Text>
                <View style={[styles.statusChip, {backgroundColor: approvalColor(vendor.approvalStatus) + '20'}]}>
                  <Text style={[styles.statusChipText, {color: approvalColor(vendor.approvalStatus)}]}>
                    {vendor.approvalStatus}
                  </Text>
                </View>
              </View>
            </View>

            {[
              {label: 'Pharmacy', value: vendor.pharmacyName},
              {label: 'Email', value: vendor.user.email ?? '—'},
              {label: 'Phone', value: vendor.user.phone ?? vendor.phone ?? '—'},
              {label: 'Address', value: vendor.address ?? '—'},
              {label: 'Joined', value: new Date(vendor.createdAt).toLocaleDateString()},
            ].map(row => (
              <View key={row.label} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue}>{row.value}</Text>
              </View>
            ))}

            {showActions && (
              <View style={styles.detailActionsRow}>
                <TouchableOpacity
                  style={[styles.detailActionBtn, styles.btnApprove]}
                  onPress={onApprove}
                  disabled={updating}
                  activeOpacity={0.85}>
                  {updating ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Feather name="check-circle" size={14} color="#FFFFFF" />
                      <Text style={styles.detailActionBtnText}>Approve</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.detailActionBtn, styles.btnReject]}
                  onPress={onReject}
                  disabled={updating}
                  activeOpacity={0.85}>
                  {updating ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Feather name="x-circle" size={14} color="#FFFFFF" />
                      <Text style={styles.detailActionBtnText}>Reject</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={onDelete}
              disabled={updating}
              activeOpacity={0.85}>
              <Feather name="trash-2" size={15} color="#E26D6D" />
              <Text style={styles.deleteBtnText}>Delete Vendor Account</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function VendorCard({
  item,
  onPress,
  onApprove,
  onReject,
  updating,
}: {
  item: ApiVendor;
  onPress: () => void;
  onApprove: () => void;
  onReject: () => void;
  updating: boolean;
}) {
  const showActions = item.approvalStatus === 'PENDING';

  return (
    <TouchableOpacity style={styles.vendorCard} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.timeAgoText}>{formatTimeAgo(item.createdAt)}</Text>

      <View style={styles.cardBodyRow}>
        <Image
          source={{uri: item.user.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user.fullName)}&background=4DA69F&color=fff`}}
          style={styles.vendorAvatar}
        />
        <View style={styles.metaInfoColumn}>
          <Text style={styles.vendorNameText} numberOfLines={1}>
            {item.user.fullName}
          </Text>
          <View style={styles.subRowItem}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={16}
              color="#9E9E9E"
            />
            <Text style={styles.subRowText} numberOfLines={1}>
              {item.pharmacyName}
            </Text>
          </View>
          <View style={styles.subRowItem}>
            <Feather name="phone" size={14} color="#4DA69F" />
            <Text style={styles.subRowText} numberOfLines={1}>
              {item.user.phone ?? item.phone ?? '—'}
            </Text>
          </View>
          {item.approvalStatus !== 'PENDING' && (
            <View style={[styles.statusChip, {backgroundColor: approvalColor(item.approvalStatus) + '20', marginTop: 4}]}>
              <Text style={[styles.statusChipText, {color: approvalColor(item.approvalStatus)}]}>
                {item.approvalStatus}
              </Text>
            </View>
          )}

          {showActions && (
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.btnApprove]}
                activeOpacity={0.85}
                disabled={updating}
                onPress={e => {e.stopPropagation?.(); onApprove();}}>
                <Feather name="check-circle" size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.btnReject]}
                activeOpacity={0.85}
                disabled={updating}
                onPress={e => {e.stopPropagation?.(); onReject();}}>
                <Feather name="x-circle" size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function AdminVendorsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<AdminVendorFilter>('Pending');
  const [vendors, setVendors] = useState<ApiVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<ApiVendor | null>(null);

  const loadVendors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.vendors(filterToApiStatus(activeFilter));
      setVendors(data as ApiVendor[]);
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
        setSelectedVendor(null);
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

  const handleDelete = useCallback(
    (vendor: ApiVendor) => {
      Alert.alert('Delete Vendor', `Delete account for "${vendor.user.fullName}"? This cannot be undone.`, [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setUpdatingId(vendor.id);
            try {
              await adminApi.deleteUser(vendor.user.id);
              setSelectedVendor(null);
              await loadVendors();
            } catch (err) {
              const message = err instanceof ApiError ? err.message : 'Could not delete vendor';
              Alert.alert('Error', message);
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]);
    },
    [loadVendors],
  );

  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter(
      v =>
        v.user.fullName.toLowerCase().includes(q) ||
        v.pharmacyName.toLowerCase().includes(q) ||
        (v.user.phone ?? '').includes(q),
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
        <NotificationBell
          style={styles.headerButton}
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: 85 + insets.bottom},
        ]}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={24} color="#9E9E9E" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9E9E9E"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialCommunityIcons name="tune" size={22} color="#4DA69F" />
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
                onPress={() => setSelectedVendor(record)}
                onApprove={() => updateStatus(record.id, 'APPROVED')}
                onReject={() => updateStatus(record.id, 'REJECTED')}
              />
            ))
          )}
        </View>
      </ScrollView>

      <AdminBottomNav activeTab="vendors" bottomInset={insets.bottom} navigation={navigation} />

      <VendorDetailModal
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
        onApprove={() => selectedVendor && updateStatus(selectedVendor.id, 'APPROVED')}
        onReject={() => selectedVendor && updateStatus(selectedVendor.id, 'REJECTED')}
        onDelete={() => selectedVendor && handleDelete(selectedVendor)}
        updating={updatingId === selectedVendor?.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EFF8',
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
    backgroundColor: '#F0EFF8',
  },
  // Figma H6/bold: Proxima Nova 18px / 600 / 120%, Greyscale-800.
  headerTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 22,
    color: '#424242',
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
    backgroundColor: '#F5F4FD',
    marginHorizontal: 16,
    borderRadius: 100,
    paddingHorizontal: 20,
    height: 56,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONT.regular,
    padding: 0,
    color: '#212121',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 4,
  },
  // Figma: 10px 20px padding, 40px radius, 1px Greyscale-300 border.
  chipItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipItemActive: {
    backgroundColor: '#4DA69F',
    borderColor: '#4DA69F',
  },
  chipItemText: {
    fontSize: 16,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#424242',
  },
  chipItemActiveText: {
    color: '#FFFFFF',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  cardsVerticalStack: {
    gap: 12,
  },
  loader: {marginVertical: 32},
  emptyText: {
    textAlign: 'center',
    fontFamily: FONT.regular,
    color: '#9E9E9E',
    fontSize: 14,
    paddingVertical: 32,
  },
  // Figma: 16px padding, column with 8px gap, 8px radius, #F3F2FB,
  // Card/Shadow 1 = 0 4px 60px rgba(4, 6, 32, .06).
  vendorCard: {
    backgroundColor: '#F3F2FB',
    borderRadius: 8,
    padding: 16,
    gap: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E7E5F2',
    position: 'relative',
    shadowColor: '#040620',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 2,
  },
  timeAgoText: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#9E9E9E',
    fontWeight: '400',
    zIndex: 2,
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vendorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
    backgroundColor: '#E7E5F2',
  },
  metaInfoColumn: {
    flex: 1,
    gap: 4,
    paddingRight: 56,
  },
  vendorNameText: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  subRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subRowText: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: '#616161',
    fontWeight: '400',
    flexShrink: 1,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Content-sized pills sitting under the text column, as in the mockup.
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  actionBtn: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnApprove: {
    backgroundColor: '#4DA69F',
  },
  btnReject: {
    backgroundColor: '#E4696B',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  detailModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  detailAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  detailAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  detailAvatarMeta: {
    flex: 1,
    gap: 4,
  },
  detailName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
  },
  detailLabel: {
    fontSize: 13,
    color: '#7E8B97',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#1A1C1E',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  detailActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  detailActionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  detailActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FCECEC',
    borderWidth: 1,
    borderColor: '#F9D5D5',
  },
  deleteBtnText: {
    color: '#E26D6D',
    fontSize: 13,
    fontWeight: '600',
  },
});
