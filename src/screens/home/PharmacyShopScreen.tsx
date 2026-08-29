import {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import { WaveTitleBand } from '../../components/WaveTitleBand';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {navigateCustomerTab} from './customerTabNavigation';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'PharmacyShop'>;

const {width} = Dimensions.get('window');
const CARD_SPACING = 10;
const CARD_WIDTH = (width - 32 - CARD_SPACING) / 2;

const FILTER_CATEGORIES = ['All Items', 'Medicines', "Women's Care", 'Body Care'];

export function PharmacyShopScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const handleTabPress = (tab: BottomTabKey) => {
    // Already on the pharmacy tab, so pressing it is a no-op - matching the
    // inline bar this replaced, where Pharmacy had no onPress.
    if (tab === 'pharmacy') return;
    navigateCustomerTab(navigation, tab);
  };
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
          style={styles.cardTop}
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
        <View style={styles.titleBack}> 
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#171717" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pharmacy</Text>
        </View>
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
        onPress={() => navigation.navigate('AiSymptomHome')}>
          <Image source={require('../../assets/syaiicon.png')} style={styles.fabIcon}/>
        {/* <MaterialCommunityIcons name="search" size={24} color="#FFFFFF" /> */}
      </TouchableOpacity>

      {/* Superseded by the shared HomeBottomNav below - kept for reference.
          To restore, delete this comment wrapper and the HomeBottomNav block.

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
      */}

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab="pharmacy"
          bottomInset={insets.bottom}
          onTabPress={handleTabPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F3FC',
  },
  titleBack:{flexDirection:'row', justifyContent:'flex-start', gap:10, alignItems:'center'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F4F3FC',
  },
  headerButton: {
    padding: 4,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingTop: 4,
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
    paddingVertical: 12,
    borderRadius: 40,
    backgroundColor: '#F3F2FB',
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginRight: 8,
    elevation:1,
  },
  activeChip: {
    backgroundColor: '#DC6468',
    borderColor: '#DC6468',
  },
  chipText: {
    fontSize: 10,
    color: '#424242',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  activeChipText: {
    color: '#FFF',
    fontFamily: FONT.regular,
    fontWeight: '400',
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
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#616161',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    color: '#424242',
    fontFamily: FONT.regular,
    fontWeight: '400',
    marginRight: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: CARD_SPACING,
  },
  // Figma: 8px padding, 8px column gap, 10px radius, #F5F4FD, no border.
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#F5F4FD',
    borderRadius: 10,
    padding: 8,
    gap: 8,
  },
  cardTop: {
    gap: 8,
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
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  // Proportional rather than a fixed 103px so the tile keeps the mockup's
  // ratio while the card width stays responsive.
  productImage: {
    width: '100%',
    aspectRatio: 1.32,
    borderRadius: 8,
    backgroundColor: '#F0F3F6',
  },
  infoContainer: {},
  productTitle: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  productSubtitle: {
    fontSize: 12,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sizeText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#424242',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  oldPrice: {
    fontSize: 12,
    color: '#9E9E9E',
    fontFamily: FONT.regular,
    fontWeight: '400',
    textDecorationLine: 'line-through',
  },
  newPrice: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  addToCartBtn: {
    borderWidth: 1.5,
    borderColor: '#4DA69F',
    borderRadius: 40,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#4DA69F',
    fontSize: 16,
    fontFamily: FONT.semibold,
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
  fabIcon:{
    resizeMode:'cover'
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomNav: {
    flexDirection: 'row',
    minHeight: 74,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    paddingTop:10,
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
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#00A884',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
