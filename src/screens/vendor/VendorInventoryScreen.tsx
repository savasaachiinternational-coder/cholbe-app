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
import {VendorBottomNav} from './VendorBottomNav';
import {FILTER_CATEGORIES} from './vendorNav';

type Props = NativeStackScreenProps<RootStackParamList, 'VInventory'>;

export function VendorInventoryScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('All Items');

  const renderInventoryCard = (index: number) => (
    <View key={index} style={styles.inventoryCard}>
      <Image
        source={{uri: 'https://via.placeholder.com/80x60/ECEFF3/000000?text=Medicine'}}
        style={styles.inventoryImage}
      />
      <View style={styles.inventoryDetails}>
        <Text style={styles.itemTitle}>Aamdocal Plus 50</Text>
        <Text style={styles.itemMetaText}>Generic: Amlodipine Besylate</Text>
        <Text style={styles.itemMetaText}>In Stock: 150 Boxes</Text>
        <Text style={styles.itemPriceText}>
          Price: TK 120/box <Text style={styles.discountText}>(-5%)</Text>
        </Text>

        <View style={styles.tagBadge}>
          <Feather name="edit-2" size={10} color="#1A1C1E" />
          <Text style={styles.tagBadgeText}>Medicines</Text>
        </View>
      </View>

      <View style={styles.statusToggleActive}>
        <View style={styles.statusToggleInner} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory List</Text>
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
          {paddingBottom: 80 + insets.bottom},
        ]}>
        <TouchableOpacity
          style={styles.addProductBtn}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('VAddProduct')}>
          <Feather name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addProductBtnText}>Add New Product</Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#9AA6B2" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9AA6B2"
            style={styles.searchInput}
          />
          <TouchableOpacity style={styles.filterIconButton} activeOpacity={0.7}>
            <MaterialCommunityIcons name="tune" size={20} color="#4E929D" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}>
          {FILTER_CATEGORIES.map(category => {
            const isActive = activeCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[styles.chip, isActive && styles.activeChip]}
                activeOpacity={0.8}
                onPress={() => setActiveCategory(category)}>
                <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.listStack}>
          {Array.from({length: 12}, (_, index) => renderInventoryCard(index + 1))}
        </View>
      </ScrollView>

      <VendorBottomNav activeTab="inventory" bottomInset={insets.bottom} navigation={navigation} />
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
  },
  addProductBtn: {
    backgroundColor: '#4E929D',
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addProductBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    color: '#1A1C1E',
  },
  filterIconButton: {
    padding: 2,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F0F3F6',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeChip: {
    backgroundColor: '#E26D6D',
  },
  chipText: {
    color: '#4F5E6D',
    fontWeight: '500',
    fontSize: 12,
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  listStack: {
    gap: 10,
  },
  inventoryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  inventoryImage: {
    width: 75,
    height: 65,
    borderRadius: 6,
    resizeMode: 'contain',
    marginRight: 14,
  },
  inventoryDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  itemMetaText: {
    fontSize: 11,
    color: '#7E8B97',
    marginTop: 1,
  },
  itemPriceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1C1E',
    marginTop: 2,
  },
  discountText: {
    color: '#E26D6D',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
    gap: 4,
  },
  tagBadgeText: {
    fontSize: 11,
    color: '#1A1C1E',
    fontWeight: '500',
  },
  statusToggleActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#47B39D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusToggleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#47B39D',
  },
});
