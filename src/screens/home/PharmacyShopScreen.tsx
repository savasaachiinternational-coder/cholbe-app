import {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {pharmacyApi, type PharmacyProduct} from '../../api/pharmacy';
import {cartApi} from '../../api/cart';
import {ApiError} from '../../api/client';
import {ProductImage} from '../../components/ProductImage';
import {NotificationBell} from '../../components/NotificationBell';
import {
  discountPercent,
  formatBdt,
  groupProductsForShop,
  matchesShopCategory,
  productUnitPrice,
  productListPrice,
  productVolumeLabel,
  unitTypeToVariant,
} from '../../utils/pharmacyHelpers';

type Props = NativeStackScreenProps<RootStackParamList, 'PharmacyShop'>;

const {width} = Dimensions.get('window');
const CARD_SPACING = 12;
const CARD_WIDTH = (width - 32 - CARD_SPACING) / 2;

const FILTER_CATEGORIES = ['All Items', 'Medicines', "Women's Care", 'Body Care'];

export function PharmacyShopScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [addingId, setAddingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [productList, cart] = await Promise.all([
        pharmacyApi.list(search.trim() ? {search: search.trim()} : undefined),
        cartApi.get().catch(() => null),
      ]);
      setProducts(productList);
      setCartCount(cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load pharmacy';
      Alert.alert('Pharmacy', message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const filteredProducts = useMemo(
    () => products.filter(p => matchesShopCategory(p, activeCategory)),
    [products, activeCategory],
  );

  const sections = useMemo(
    () => groupProductsForShop(filteredProducts),
    [filteredProducts],
  );

  const handleAddToCart = async (product: PharmacyProduct) => {
    setAddingId(product.id);
    try {
      const cart = await cartApi.addItem(
        product.id,
        1,
        unitTypeToVariant(product.unitType),
      );
      setCartCount(cart.items.reduce((n, i) => n + i.quantity, 0));
      Alert.alert('Added', `${product.name} added to cart.`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not add to cart';
      Alert.alert('Cart', message);
    } finally {
      setAddingId(null);
    }
  };

  const renderProductCard = (product: PharmacyProduct) => {
    const pct = discountPercent(product);

    return (
      <View key={product.id} style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('PharmacyDetails', {productId: product.id})}>
          {pct != null && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>-{pct}%</Text>
            </View>
          )}

          <ProductImage imageUrl={product.imageUrl} style={styles.productImage} />

          <View style={styles.infoContainer}>
            <Text style={styles.productTitle} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.productSubtitle} numberOfLines={1}>
              {product.genericName ?? product.brand ?? ''}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.sizeContainer}>
                <Feather name="droplet" size={12} color="#7E8B97" />
                <Text style={styles.sizeText}>{productVolumeLabel(product)}</Text>
              </View>
              <View style={styles.priceContainer}>
                {product.discountPrice != null && (
                  <Text style={styles.oldPrice}>{formatBdt(productListPrice(product))}</Text>
                )}
                <Text style={styles.newPrice}>{formatBdt(productUnitPrice(product))}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addToCartBtn}
          activeOpacity={0.8}
          disabled={addingId === product.id}
          onPress={() => handleAddToCart(product)}>
          {addingId === product.id ? (
            <ActivityIndicator color="#00A884" size="small" />
          ) : (
            <Text style={styles.addToCartText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderSection = (title: string, items: PharmacyProduct[]) => (
    <View style={styles.sectionContainer} key={title}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity style={styles.viewAllRow} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All</Text>
          <Feather name="chevron-right" size={16} color="#7E8B97" />
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {items.slice(0, 2).map(item => renderProductCard(item))}
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
          <Feather name="chevron-left" size={24} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pharmacy</Text>
        <View style={styles.headerRightIcons}>
          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PharmacyCartOverlay')}>
            <Feather name="shopping-cart" size={22} color="#1A1C1E" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 9 ? '9+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <NotificationBell
          style={styles.headerButton}
          onPress={() => navigation.navigate('Notifications')}
        />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContainer,
          {paddingBottom: 100 + insets.bottom},
        ]}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#9AA6B2" style={styles.searchIcon} />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9AA6B2"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={loadData}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7} onPress={loadData}>
            <MaterialCommunityIcons name="tune" size={20} color="#00A884" />
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

        {loading ? (
          <ActivityIndicator color="#00A884" style={styles.loader} />
        ) : sections.length === 0 ? (
          <Text style={styles.emptyText}>No products found.</Text>
        ) : (
          sections.map(section => renderSection(section.title, section.items))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, {bottom: 90 + insets.bottom}]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('PharmacyPrescriptionMenu')}>
        <MaterialCommunityIcons name="file-document-scan-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={[styles.bottomNav, {paddingBottom: 12 + insets.bottom}]}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={22} color="#9AA6B2" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <MaterialCommunityIcons name="clippy" size={22} color="#00A884" />
          <Text style={[styles.navText, styles.activeNavText]}>Pharmacy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MedicineList')}>
          <MaterialCommunityIcons name="heart-pulse" size={22} color="#9AA6B2" />
          <Text style={styles.navText}>Medication</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ReportsList')}>
          <MaterialCommunityIcons name="file-document-outline" size={22} color="#9AA6B2" />
          <Text style={styles.navText}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MyProfile')}>
          <Feather name="user" size={22} color="#9AA6B2" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F6F8FB',
  },
  headerButton: {
    padding: 4,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1E',
    flex: 1,
    textAlign: 'center',
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#DC6468',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  scrollContainer: {
    paddingTop: 4,
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
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1C1E',
    padding: 0,
  },
  filterButton: {
    padding: 4,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: '#DC6468',
    borderColor: '#DC6468',
  },
  chipText: {
    fontSize: 13,
    color: '#7E8B97',
    fontWeight: '500',
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loader: {marginVertical: 40},
  emptyText: {
    textAlign: 'center',
    color: '#9AA6B2',
    marginVertical: 24,
    fontSize: 14,
  },
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    color: '#7E8B97',
    marginRight: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: CARD_SPACING,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    marginBottom: CARD_SPACING,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DC6468',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F0F3F6',
  },
  infoContainer: {
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  productSubtitle: {
    fontSize: 11,
    color: '#7E8B97',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sizeText: {
    fontSize: 10,
    color: '#7E8B97',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  oldPrice: {
    fontSize: 10,
    color: '#9AA6B2',
    textDecorationLine: 'line-through',
  },
  newPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  addToCartBtn: {
    borderWidth: 1.5,
    borderColor: '#00A884',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#00A884',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    minHeight: 74,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F7',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width / 5,
  },
  navText: {
    fontSize: 11,
    color: '#9AA6B2',
    marginTop: 4,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#00A884',
    fontWeight: '600',
  },
});
