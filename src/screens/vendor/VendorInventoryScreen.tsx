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
import {vendorProductsApi} from '../../api/vendorProducts';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {productImageUrl} from '../../utils/pharmacyHelpers';
import {VendorBottomNav} from './VendorBottomNav';
import {FILTER_CATEGORIES} from './vendorNav';

type Props = NativeStackScreenProps<RootStackParamList, 'VInventory'>;

type VendorProduct = {
  id: string;
  name: string;
  genericName?: string | null;
  category?: string | null;
  unitPrice: string | number;
  discountPrice?: string | number | null;
  stockQuantity: number;
  unitType?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
};

function formatTk(amount: string | number) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `TK ${Number.isFinite(n) ? n.toLocaleString('en-BD', {maximumFractionDigits: 0}) : '0'}`;
}

function discountLabel(product: VendorProduct) {
  if (!product.discountPrice) return null;
  const unit = typeof product.unitPrice === 'string' ? parseFloat(product.unitPrice) : product.unitPrice;
  const disc = typeof product.discountPrice === 'string' ? parseFloat(product.discountPrice) : product.discountPrice;
  if (disc >= unit) return null;
  return `(-${Math.round((1 - disc / unit) * 100)}%)`;
}

function matchesCategory(product: VendorProduct, category: string) {
  if (category === 'All Items') return true;
  if (category === 'Medicines') {
    return ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Inhaler', 'Medicines'].includes(
      product.category ?? '',
    );
  }
  return (product.category ?? '') === category;
}

export function VendorInventoryScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vendorProductsApi.list();
      setProducts(data as VendorProduct[]);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load inventory';
      Alert.alert('Inventory', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts]),
  );

  const toggleActive = useCallback(
    async (product: VendorProduct) => {
      setTogglingId(product.id);
      try {
        await vendorProductsApi.updateStatus(product.id, !product.isActive);
        setProducts(prev =>
          prev.map(p => (p.id === product.id ? {...p, isActive: !p.isActive} : p)),
        );
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Could not update product';
        Alert.alert('Inventory', message);
      } finally {
        setTogglingId(null);
      }
    },
    [],
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      if (!matchesCategory(p, activeCategory)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.genericName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [products, activeCategory, search]);

  const renderInventoryCard = (product: VendorProduct) => {
    const discount = discountLabel(product);
    const isToggling = togglingId === product.id;

    return (
      <View key={product.id} style={styles.inventoryCard}>
        <Image
          source={{uri: productImageUrl(product.imageUrl)}}
          style={styles.inventoryImage}
        />
        <View style={styles.inventoryDetails}>
          <Text style={styles.itemTitle}>{product.name}</Text>
          {product.genericName ? (
            <Text style={styles.itemMetaText}>Generic: {product.genericName}</Text>
          ) : null}
          <Text style={styles.itemMetaText}>
            In Stock: {product.stockQuantity} {product.unitType ?? 'units'}
          </Text>
          <Text style={styles.itemPriceText}>
            Price: {formatTk(product.discountPrice ?? product.unitPrice)}
            {product.unitType ? `/${product.unitType.toLowerCase()}` : ''}
            {discount ? <Text style={styles.discountText}> {discount}</Text> : null}
          </Text>

          {product.category ? (
            <View style={styles.tagBadge}>
              <Feather name="edit-2" size={10} color="#1A1C1E" />
              <Text style={styles.tagBadgeText}>{product.category}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          disabled={isToggling}
          onPress={() => toggleActive(product)}
          style={product.isActive ? styles.statusToggleActive : styles.statusToggleInactive}>
          {product.isActive ? <View style={styles.statusToggleInner} /> : null}
        </TouchableOpacity>
      </View>
    );
  };

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
            value={search}
            onChangeText={setSearch}
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
          {loading ? (
            <ActivityIndicator color="#4E929D" style={styles.loader} />
          ) : filteredProducts.length === 0 ? (
            <Text style={styles.emptyText}>No products found.</Text>
          ) : (
            filteredProducts.map(renderInventoryCard)
          )}
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
  loader: {
    marginVertical: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7E8B97',
    fontSize: 13,
    marginVertical: 12,
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
  statusToggleInactive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
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
