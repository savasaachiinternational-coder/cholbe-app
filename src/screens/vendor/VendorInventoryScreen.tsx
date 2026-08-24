import {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
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
import {ProductImage} from '../../components/ProductImage';
import {formatBdt} from '../../utils/pharmacyHelpers';
import {VendorBottomNav} from './VendorBottomNav';
import {FILTER_CATEGORIES} from './vendorNav';
import {NotificationBell} from '../../components/NotificationBell';
import { FONT } from '../../theme/typography';

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
  return formatBdt(amount);
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
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [editFields, setEditFields] = useState({
    name: '',
    genericName: '',
    unitPrice: '',
    discountPrice: '',
    stockQuantity: '',
    minAlertLevel: '',
  });
  const [editSaving, setEditSaving] = useState(false);

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

  const openEdit = useCallback((product: VendorProduct) => {
    setEditFields({
      name: product.name,
      genericName: product.genericName ?? '',
      unitPrice: String(product.unitPrice),
      discountPrice: product.discountPrice ? String(product.discountPrice) : '',
      stockQuantity: String(product.stockQuantity),
      minAlertLevel: '',
    });
    setEditingProduct(product);
  }, []);

  const handleDelete = useCallback(
    (product: VendorProduct) => {
      Alert.alert(
        'Delete Product',
        `Are you sure you want to delete "${product.name}"?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await vendorProductsApi.delete(product.id);
                loadProducts();
              } catch (err) {
                const message = err instanceof ApiError ? err.message : 'Could not delete product';
                Alert.alert('Delete', message);
              }
            },
          },
        ],
      );
    },
    [loadProducts],
  );

  const handleSaveEdit = useCallback(async () => {
    if (!editingProduct) return;
    const price = parseFloat(editFields.unitPrice);
    const stock = parseInt(editFields.stockQuantity, 10);
    if (Number.isNaN(price) || price < 0) {
      Alert.alert('Edit', 'Enter a valid unit price.');
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      Alert.alert('Edit', 'Enter a valid stock quantity.');
      return;
    }
    setEditSaving(true);
    try {
      await vendorProductsApi.update(editingProduct.id, {
        name: editFields.name.trim(),
        genericName: editFields.genericName.trim() || undefined,
        unitPrice: price,
        discountPrice: editFields.discountPrice ? parseFloat(editFields.discountPrice) : undefined,
        stockQuantity: stock,
        minAlertLevel: editFields.minAlertLevel ? parseInt(editFields.minAlertLevel, 10) : undefined,
      });
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not update product';
      Alert.alert('Edit', message);
    } finally {
      setEditSaving(false);
    }
  }, [editingProduct, editFields, loadProducts]);

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
        <ProductImage
          imageUrl={product.imageUrl}
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

          <TouchableOpacity
            style={styles.editPill}
            activeOpacity={0.7}
            onPress={() => openEdit(product)}>
            <Feather name="edit-2" size={12} color="#616161" />
            <Text style={styles.editPillText}>{product.category ?? 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => handleDelete(product)}>
            <Feather name="trash-2" size={16} color="#E26D6D" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isToggling}
            onPress={() => toggleActive(product)}
            style={[
              styles.statusToggleTrack,
              product.isActive
                ? styles.statusToggleTrackOn
                : styles.statusToggleTrackOff,
            ]}>
            <View style={styles.statusToggleKnob} />
          </TouchableOpacity>
        </View>
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
        <NotificationBell
          style={styles.headerButton}
          onPress={() => navigation.navigate('Notifications')}
        />
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

      <Modal
        animationType="slide"
        transparent
        visible={editingProduct !== null}
        onRequestClose={() => setEditingProduct(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditingProduct(null)}>
          <Pressable style={[styles.editSheet, {paddingBottom: insets.bottom + 16}]} onPress={e => e.stopPropagation()}>
            <View style={styles.editSheetHandle} />
            <Text style={styles.editSheetTitle}>Edit Product</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.editLabel}>Product Name</Text>
              <TextInput
                style={styles.editInput}
                value={editFields.name}
                onChangeText={v => setEditFields(f => ({...f, name: v}))}
                placeholder="Product Name"
                placeholderTextColor="#A0AEC0"
              />
              <Text style={styles.editLabel}>Generic Name</Text>
              <TextInput
                style={styles.editInput}
                value={editFields.genericName}
                onChangeText={v => setEditFields(f => ({...f, genericName: v}))}
                placeholder="Generic Name"
                placeholderTextColor="#A0AEC0"
              />
              <Text style={styles.editLabel}>Unit Price</Text>
              <TextInput
                style={styles.editInput}
                value={editFields.unitPrice}
                onChangeText={v => setEditFields(f => ({...f, unitPrice: v}))}
                placeholder="0.00"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
              />
              <Text style={styles.editLabel}>Discount Price</Text>
              <TextInput
                style={styles.editInput}
                value={editFields.discountPrice}
                onChangeText={v => setEditFields(f => ({...f, discountPrice: v}))}
                placeholder="0.00"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
              />
              <Text style={styles.editLabel}>Stock Quantity</Text>
              <TextInput
                style={styles.editInput}
                value={editFields.stockQuantity}
                onChangeText={v => setEditFields(f => ({...f, stockQuantity: v}))}
                placeholder="0"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
              />
              <Text style={styles.editLabel}>Min. Alert Level</Text>
              <TextInput
                style={styles.editInput}
                value={editFields.minAlertLevel}
                onChangeText={v => setEditFields(f => ({...f, minAlertLevel: v}))}
                placeholder="e.g. 10"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.saveEditBtn, editSaving && styles.saveEditBtnDisabled]}
                activeOpacity={0.9}
                disabled={editSaving}
                onPress={handleSaveEdit}>
                {editSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveEditBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1FD',
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
    backgroundColor: '#F4F1FD',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
    flex: 1,
    marginLeft: 12,
  },
  headerButton: {
    padding: 2,
  },
  addProductBtn: {
    backgroundColor: '#4DA69F',
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    height: 46,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addProductBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4FD',
    marginHorizontal: 16,
    borderRadius: 40,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 2,
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
    paddingVertical: 12,
    borderRadius: 40,
    backgroundColor: '#F3F2FB',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth:1,
    borderColor:'#E0E0E0'
  },
  activeChip: {
    backgroundColor: '#E26D6D',
  },
  chipText: {
    color: '#424242',
    fontFamily: FONT.regular,
    fontWeight: '400',
    fontSize: 10,
  },
  activeChipText: {
    color: '#FFFFFF',
    fontFamily: FONT.regular,
    fontWeight: '400',
    fontSize: 10,
  },
  listStack: {
    gap: 10,
  },
  inventoryCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F2FB',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E3EE',
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  itemMetaText: {
    fontSize: 11,
    color: '#7E8B97',
    marginTop: 1,
  },
  itemPriceText: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
    marginTop: 2,
  },
  discountText: {
    color: '#E26D6D',
  },
  // Figma: pencil + category pill, 100px radius, white fill, 1px Greyscale-300.
  // Doubles as the edit control for the row.
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    height: 32,
    marginTop: 8,
    gap: 6,
  },
  editPillText: {
    fontSize: 12,
    color: '#424242',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  // Figma: 40 x 22 track, 16px knob, Primary-500 on / Greyscale-300 off.
  statusToggleTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    padding: 3,
    justifyContent: 'center',
  },
  statusToggleTrackOn: {
    backgroundColor: '#4DA69F',
    alignItems: 'flex-end',
  },
  statusToggleTrackOff: {
    backgroundColor: '#E0E0E0',
    alignItems: 'flex-start',
  },
  statusToggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  // Delete sits on the same last row as the toggle.
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 12,
  },
  actionBtn: {
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  editSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '85%',
  },
  editSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  editSheetTitle: {
    fontSize: 17,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 12,
    color: '#6F767E',
    fontFamily: FONT.medium,
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 8,
  },
  editInput: {
    backgroundColor: '#F4F5F6',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1A1C1E',
    marginBottom: 4,
  },
  saveEditBtn: {
    backgroundColor: '#3F8694',
    borderRadius: 22,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  saveEditBtnDisabled: {
    opacity: 0.7,
  },
  saveEditBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
