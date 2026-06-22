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
import {ADMIN_MEDICINE_FILTERS, type AdminMedicineFilter} from './adminNav';

type Props = NativeStackScreenProps<RootStackParamList, 'AMedicines'>;

type MedicineRecord = {
  name: string;
  type: string;
  stock: string;
  price: string;
};

const MOCK_MEDICINES: MedicineRecord[] = Array.from({length: 6}, () => ({
  name: 'Aamdocal Plus 50',
  type: 'Tablet',
  stock: '2,450',
  price: '250',
}));

function MedicineCard({item}: {item: MedicineRecord}) {
  return (
    <View style={styles.medicineCard}>
      <Image
        source={{uri: 'https://via.placeholder.com/80x60/ECEFF3/000000?text=Medicine'}}
        style={styles.medicineImage}
      />
      <View style={styles.metaInfoColumn}>
        <Text style={styles.medicineNameText}>{item.name}</Text>
        <Text style={styles.medicineTypeText}>{item.type}</Text>
        <Text style={styles.stockText}>Stock:{item.stock}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>tk {item.price}</Text>
      </View>
    </View>
  );
}

export function AdminMedicinesScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<AdminMedicineFilter>('Active');

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
          {MOCK_MEDICINES.map((medicine, index) => (
            <MedicineCard key={`${medicine.name}-${index}`} item={medicine} />
          ))}
        </View>
      </ScrollView>

      <AdminBottomNav activeTab="medicine" bottomInset={insets.bottom} navigation={navigation} />
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
    width: 75,
    height: 60,
    borderRadius: 8,
    resizeMode: 'contain',
    marginRight: 14,
  },
  metaInfoColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  medicineNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  medicineTypeText: {
    fontSize: 12,
    color: '#7E8B97',
    fontWeight: '500',
  },
  stockText: {
    fontSize: 12,
    color: '#7E8B97',
    fontWeight: '500',
    marginTop: 2,
  },
  priceContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
});
