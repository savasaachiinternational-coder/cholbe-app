import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError } from '../../api/client';
import { medicinesApi, type Medicine } from '../../api/medicines';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import type { RootStackParamList } from '../../navigation/types';
import { AdminBottomNav } from './AdminBottomNav';
import { ADMIN_MEDICINE_FILTERS, type AdminMedicineFilter } from './adminNav';
import { NotificationBell } from '../../components/NotificationBell';
import { ProductImage } from '../../components/ProductImage';
import { FONT } from '../../theme/typography';
import {useKeyboardHeight} from '../../hooks/useKeyboardHeight';

type Props = NativeStackScreenProps<RootStackParamList, 'AMedicines'>;

// Proxima Nova per the Figma typography. Android resolves a weight by the exact
// font file name, so each weight is referenced by its own family name.
function filterMedicines(items: Medicine[], filter: AdminMedicineFilter) {
  if (filter === 'All') return items;
  if (filter === 'Active') return items.filter(m => m.status === 'ACTIVE');
  if (filter === 'Inactive') return items.filter(m => m.status === 'INACTIVE');
  if (filter === 'Out of Stock')
    return items.filter(m => m.status === 'OUT_OF_STOCK');
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
}: {
  item: Medicine;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.medicineCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.medicineImageBox}>
        <ProductImage imageUrl={item.imageUrl} style={styles.medicineImage} />
      </View>
      <View style={styles.metaInfoColumn}>
        <Text style={styles.medicineNameText} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.medicineTypeText} numberOfLines={1}>
          {item.category ?? item.brand ?? '—'}
        </Text>
        <View style={styles.medicineBottomRow}>
          {/* Stock and price are not on the medicine model yet. */}
          <Text style={styles.medicineStockText}>Stock:—</Text>
          <Text style={styles.medicinePriceText}>tk —</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function MedicineDetailModal({
  medicine,
  onClose,
  onDelete,
  onToggleStatus,
  updating,
}: {
  medicine: Medicine | null;
  onClose: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  updating: boolean;
}) {
  if (!medicine) return null;
  const keyboardHeight = useKeyboardHeight();
  return (
    <Modal
      visible={!!medicine}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, {paddingBottom: keyboardHeight}]}>
        <View style={styles.detailModal}>
          <View style={styles.detailModalHeader}>
            <Text style={styles.detailModalTitle}>Medicine Details</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={22} color="#1A1C1E" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ProductImage
              imageUrl={medicine.imageUrl}
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
              <Text
                style={[
                  styles.detailValue,
                  { color: statusColor(medicine.status) },
                ]}
              >
                {statusLabel(medicine.status)}
              </Text>
            </View>

            {/* Row actions moved here: the list card matches the design, which
                has no inline controls. */}
            <View style={styles.detailActionRow}>
              <TouchableOpacity
                style={styles.detailActionBtn}
                onPress={onToggleStatus}
                disabled={updating}
                activeOpacity={0.8}
              >
                <Feather
                  name={
                    medicine.status === 'ACTIVE'
                      ? 'toggle-right'
                      : 'toggle-left'
                  }
                  size={20}
                  color={medicine.status === 'ACTIVE' ? '#00A651' : '#9E9E9E'}
                />
                <Text style={styles.detailActionText}>
                  {medicine.status === 'ACTIVE' ? 'Set Inactive' : 'Set Active'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.detailActionBtn, styles.detailDeleteBtn]}
                onPress={onDelete}
                disabled={updating}
                activeOpacity={0.8}
              >
                <Feather name="trash-2" size={18} color="#E26D6D" />
                <Text
                  style={[styles.detailActionText, styles.detailDeleteText]}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function AdminMedicinesScreen({ navigation }: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<AdminMedicineFilter>('All');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null,
  );

  const loadMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const data = await medicinesApi.list();
      setMedicines(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not load medicines';
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
      Alert.alert(
        'Delete Medicine',
        `Delete "${name}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setUpdatingId(id);
              try {
                await medicinesApi.delete(id);
                await loadMedicines();
              } catch (err) {
                const message =
                  err instanceof ApiError
                    ? err.message
                    : 'Could not delete medicine';
                Alert.alert('Error', message);
              } finally {
                setUpdatingId(null);
              }
            },
          },
        ],
      );
    },
    [loadMedicines],
  );

  const handleToggleStatus = useCallback(
    async (medicine: Medicine) => {
      const nextStatus = medicine.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      setUpdatingId(medicine.id);
      try {
        console.log('successfully update in');
        await medicinesApi.updateStatus(medicine.id, nextStatus);
        console.log('successfully update in server');

        await loadMedicines();
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Could not update status';
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
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
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
          { paddingBottom: 85 + insets.bottom },
        ]}
      >
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
          contentContainerStyle={styles.filtersContent}
        >
          {ADMIN_MEDICINE_FILTERS.map(filterItem => {
            const isFilterActive = activeFilter === filterItem;
            return (
              <TouchableOpacity
                key={filterItem}
                style={[
                  styles.chipItem,
                  isFilterActive && styles.chipItemActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filterItem)}
              >
                <Text
                  style={[
                    styles.chipItemText,
                    isFilterActive && styles.chipItemActiveText,
                  ]}
                >
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
                onPress={() => setSelectedMedicine(medicine)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <AdminBottomNav
        activeTab="medicine"
        bottomInset={insets.bottom}
        navigation={navigation}
      />

      <MedicineDetailModal
        medicine={selectedMedicine}
        onClose={() => setSelectedMedicine(null)}
        updating={updatingId === selectedMedicine?.id}
        onDelete={() => {
          if (selectedMedicine) {
            handleDelete(selectedMedicine.id, selectedMedicine.name);
          }
        }}
        onToggleStatus={() => {
          if (selectedMedicine) {
            handleToggleStatus(selectedMedicine);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F4FD',
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
    backgroundColor: '#F5F4FD',
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
    elevation:1,
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
  loader: { marginVertical: 32 },
  emptyText: {
    textAlign: 'center',
    fontFamily: FONT.regular,
    color: '#9E9E9E',
    fontSize: 14,
    paddingVertical: 32,
  },
  // Figma: 8px padding, 8px gap, 8px radius, #F3F2FB.
  medicineCard: {
    backgroundColor: '#F3F2FB',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E6E3EE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // White tile behind the pack shot, as in the mockup.
  medicineImageBox: {
    width: 84,
    height: 84,
    borderRadius: 8,
    backgroundColor: '#E8ECF1',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  medicineImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  metaInfoColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  medicineNameText: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  medicineTypeText: {
    fontSize: 16,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  medicineBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  medicineStockText: {
    fontSize: 16,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  medicinePriceText: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  detailActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  detailActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailDeleteBtn: {
    borderColor: '#F3C9C9',
  },
  detailActionText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#424242',
  },
  detailDeleteText: {
    color: '#E26D6D',
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
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailModalTitle: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
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
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#1A1C1E',
    fontFamily: FONT.semibold,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
});
