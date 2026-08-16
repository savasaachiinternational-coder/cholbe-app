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
import {ApiError} from '../../api/client';
import {medicinesApi, type Medicine} from '../../api/medicines';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';
import {ADMIN_MEDICINE_FILTERS, type AdminMedicineFilter} from './adminNav';
import {NotificationBell} from '../../components/NotificationBell';

type Props = NativeStackScreenProps<RootStackParamList, 'AMedicines'>;

function filterMedicines(items: Medicine[], filter: AdminMedicineFilter) {
  if (filter === 'All') return items;
  if (filter === 'Active') return items.filter(m => m.status === 'ACTIVE');
  if (filter === 'Inactive') return items.filter(m => m.status === 'INACTIVE');
  if (filter === 'Out of Stock') return items.filter(m => m.status === 'OUT_OF_STOCK');
  return items;
}

function statusColor(status: string) {
  if (status === 'ACTIVE') return '#00A884';
  if (status === 'INACTIVE') return '#9AA6B2';
  return '#E26D6D';
}

function statusLabel(status: string) {
  if (status === 'ACTIVE') return 'Active';
  if (status === 'INACTIVE') return 'Inactive';
  return 'Out of Stock';
}

function MedicineCard({
  item,
  onPress,
  onDelete,
  onToggleStatus,
  updating,
}: {
  item: Medicine;
  onPress: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  updating: boolean;
}) {
  return (
    <TouchableOpacity style={styles.medicineCard} onPress={onPress} activeOpacity={0.85}>
      <Image
        source={{
          uri: item.imageUrl ?? 'https://via.placeholder.com/80x60/ECEFF3/000000?text=Medicine',
        }}
        style={styles.medicineImage}
      />
      <View style={styles.metaInfoColumn}>
        <Text style={styles.medicineNameText}>{item.name}</Text>
        <Text style={styles.medicineTypeText}>{item.category ?? item.brand ?? '—'}</Text>
        {item.genericName ? (
          <Text style={styles.genericText}>{item.genericName}</Text>
        ) : null}
        <View style={[styles.statusBadge, {backgroundColor: statusColor(item.status) + '20'}]}>
          <Text style={[styles.statusBadgeText, {color: statusColor(item.status)}]}>
            {statusLabel(item.status)}
          </Text>
        </View>
      </View>
      <View style={styles.actionColumn}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onToggleStatus}
          disabled={updating}
          activeOpacity={0.7}>
          <Feather
            name={item.status === 'ACTIVE' ? 'toggle-right' : 'toggle-left'}
            size={20}
            color={item.status === 'ACTIVE' ? '#00A884' : '#9AA6B2'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={onDelete}
          disabled={updating}
          activeOpacity={0.7}>
          <Feather name="trash-2" size={16} color="#E26D6D" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function MedicineDetailModal({
  medicine,
  onClose,
}: {
  medicine: Medicine | null;
  onClose: () => void;
}) {
  if (!medicine) return null;
  return (
    <Modal visible={!!medicine} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.detailModal}>
          <View style={styles.detailModalHeader}>
            <Text style={styles.detailModalTitle}>Medicine Details</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={22} color="#1A1C1E" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Image
              source={{
                uri:
                  medicine.imageUrl ??
                  'https://via.placeholder.com/200x120/ECEFF3/000000?text=Medicine',
              }}
              style={styles.detailImage}
              resizeMode="contain"
            />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{medicine.name}</Text>
            </View>
            {medicine.genericName ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Generic Name</Text>
                <Text style={styles.detailValue}>{medicine.genericName}</Text>
              </View>
            ) : null}
            {medicine.category ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{medicine.category}</Text>
              </View>
            ) : null}
            {medicine.brand ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Brand</Text>
                <Text style={styles.detailValue}>{medicine.brand}</Text>
              </View>
            ) : null}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, {color: statusColor(medicine.status)}]}>
                {statusLabel(medicine.status)}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function AdminMedicinesScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<AdminMedicineFilter>('All');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const loadMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const data = await medicinesApi.list();
      setMedicines(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load medicines';
      Alert.alert('Medicines', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMedicines();
    }, [loadMedicines]),
  );

  const handleDelete = useCallback(
    (id: string, name: string) => {
      Alert.alert('Delete Medicine', `Delete "${name}"? This cannot be undone.`, [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setUpdatingId(id);
            try {
              await medicinesApi.delete(id);
              await loadMedicines();
            } catch (err) {
              const message = err instanceof ApiError ? err.message : 'Could not delete medicine';
              Alert.alert('Error', message);
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]);
    },
    [loadMedicines],
  );

  const handleToggleStatus = useCallback(
    async (medicine: Medicine) => {
      const nextStatus =
        medicine.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      setUpdatingId(medicine.id);
      try {
        await medicinesApi.updateStatus(medicine.id, nextStatus);
        await loadMedicines();
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Could not update status';
        Alert.alert('Error', message);
      } finally {
        setUpdatingId(null);
      }
    },
    [loadMedicines],
  );

  const filteredMedicines = useMemo(() => {
    const byFilter = filterMedicines(medicines, activeFilter);
    const q = search.trim().toLowerCase();
    if (!q) return byFilter;
    return byFilter.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        (m.category?.toLowerCase().includes(q) ?? false) ||
        (m.genericName?.toLowerCase().includes(q) ?? false),
    );
  }, [medicines, activeFilter, search]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medicines</Text>
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
          {ADMIN_MEDICINE_FILTERS.map(filterItem => {
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
          ) : filteredMedicines.length === 0 ? (
            <Text style={styles.emptyText}>No medicines found.</Text>
          ) : (
            filteredMedicines.map(medicine => (
              <MedicineCard
                key={medicine.id}
                item={medicine}
                updating={updatingId === medicine.id}
                onPress={() => setSelectedMedicine(medicine)}
                onDelete={() => handleDelete(medicine.id, medicine.name)}
                onToggleStatus={() => handleToggleStatus(medicine)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <AdminBottomNav activeTab="medicine" bottomInset={insets.bottom} navigation={navigation} />

      <MedicineDetailModal
        medicine={selectedMedicine}
        onClose={() => setSelectedMedicine(null)}
      />
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
    paddingHorizontal: 20,
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
  medicineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicineImage: {
    width: 70,
    height: 56,
    borderRadius: 8,
    resizeMode: 'contain',
    marginRight: 12,
  },
  metaInfoColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  medicineNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  medicineTypeText: {
    fontSize: 11,
    color: '#7E8B97',
    fontWeight: '500',
  },
  genericText: {
    fontSize: 11,
    color: '#9AA6B2',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionColumn: {
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
  },
  actionBtn: {
    padding: 6,
  },
  deleteBtn: {},
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
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  detailImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#F6F8FB',
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
});
