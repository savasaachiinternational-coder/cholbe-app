import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
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
import {cartApi, type CartItem} from '../../api/cart';
import {pharmacyApi, type PharmacyProduct} from '../../api/pharmacy';
import {ApiError} from '../../api/client';
import {
  formatBdt,
  productImageUrl,
  productUnitPrice,
  unitTypeToVariant,
} from '../../utils/pharmacyHelpers';

type Props = NativeStackScreenProps<RootStackParamList, 'PharmacyCartOverlay'>;

const {width} = Dimensions.get('window');
const CARD_SPACING = 12;
const CARD_WIDTH = (width - 32 - CARD_SPACING) / 2;

export function PharmacyCartOverlayScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cart, shop] = await Promise.all([
        cartApi.get(),
        pharmacyApi.list(),
      ]);
      setCartItems(cart.items);
      setSubtotal(cart.subtotal);
      setProducts(shop.slice(0, 4));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load cart';
      Alert.alert('Cart', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleQuickAdd = async (product: PharmacyProduct) => {
    try {
      const cart = await cartApi.addItem(
        product.id,
        1,
        unitTypeToVariant(product.unitType),
      );
      setCartItems(cart.items);
      setSubtotal(cart.subtotal);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not add item';
      Alert.alert('Cart', message);
    }
  };

  const handleCheckout = () => {
    if (!cartItems.length) {
      Alert.alert('Cart', 'Your cart is empty.');
      return;
    }
    navigation.navigate('CartCheckoutDetails');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Shop</Text>
        <View style={styles.cartIconButton}>
          <Feather name="shopping-cart" size={22} color="#333333" />
          {cartItems.length > 0 && <View style={styles.cartBadge} />}
        </View>
      </View>

      <View style={styles.gridWrapper}>
        {products.map(product => (
          <View key={product.id} style={styles.productCard}>
            <Image
              source={{uri: productImageUrl(product.imageUrl)}}
              style={styles.productThumb}
            />
            <View style={styles.productInfoBlock}>
              <Text style={styles.productNameText} numberOfLines={1}>{product.name}</Text>
              <Text style={styles.productTypeText}>{product.unitType ?? 'pc'}</Text>
              <View style={styles.priceCounterRow}>
                <Text style={styles.productPriceText}>
                  {formatBdt(productUnitPrice(product))}
                </Text>
                <TouchableOpacity
                  style={styles.inlineAddButton}
                  onPress={() => handleQuickAdd(product)}>
                  <Text style={styles.inlineAddButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.dimmedBackdropFilm, {bottom: 74 + insets.bottom}]} />

      <View style={[styles.cartBottomSheetContainer, {bottom: 74 + insets.bottom}]}>
        <View style={styles.dragNotchIndicator} />
        <Text style={styles.cartSheetTitleText}>Cart</Text>

        {loading ? (
          <ActivityIndicator color="#45A096" style={styles.loader} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cartItemsScrollContainer}>
            {cartItems.length === 0 ? (
              <Text style={styles.emptyCartText}>Cart is empty</Text>
            ) : (
              cartItems.map(item => (
                <View key={item.id} style={styles.cartItemRowLine}>
                  <View style={styles.cartItemLeftInfo}>
                    <Text style={styles.cartItemNameText}>{item.name}</Text>
                    <Text style={styles.cartItemQtyLabelText}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.cartItemPriceText}>
                    {formatBdt(Number(item.unitPrice) * item.quantity)}
                  </Text>
                </View>
              ))
            )}

            <View style={styles.horizontalDivider} />
            <View style={styles.totalBillSummaryRow}>
              <Text style={styles.totalLabelText}>Total</Text>
              <Text style={styles.totalValueText}>{formatBdt(subtotal)}</Text>
            </View>
          </ScrollView>
        )}

        <TouchableOpacity
          style={[styles.checkoutPrimaryButton, !cartItems.length && styles.disabledBtn]}
          activeOpacity={0.9}
          disabled={!cartItems.length}
          onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.bottomTabBar, {paddingBottom: 12 + insets.bottom}]}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation.navigate('PharmacyShop')}>
          <MaterialCommunityIcons name="clippy" size={24} color="#45A096" />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Pharmacy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation.navigate('MedicineList')}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Medication</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation.navigate('ReportsList')}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation.navigate('MyProfile')}>
          <Feather name="user" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F9F9FE'},
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    opacity: 0.3,
  },
  backButton: {padding: 2},
  headerTitleText: {fontSize: 20, fontWeight: '600', color: '#333333'},
  cartIconButton: {padding: 4, position: 'relative'},
  cartBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC6468',
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: CARD_SPACING,
    opacity: 0.35,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  productThumb: {width: '100%', height: 80, borderRadius: 8, marginBottom: 6},
  productInfoBlock: {},
  productNameText: {fontSize: 12, fontWeight: '600', color: '#333'},
  productTypeText: {fontSize: 10, color: '#7E8B97'},
  priceCounterRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4},
  productPriceText: {fontSize: 12, fontWeight: '700', color: '#45A096'},
  inlineAddButton: {
    backgroundColor: '#45A096',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inlineAddButtonText: {color: '#FFF', fontSize: 10, fontWeight: '600'},
  dimmedBackdropFilm: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  cartBottomSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '55%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  dragNotchIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E4EA',
    alignSelf: 'center',
    marginBottom: 8,
  },
  cartSheetTitleText: {fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8},
  loader: {marginVertical: 16},
  emptyCartText: {textAlign: 'center', color: '#9AA6B2', paddingVertical: 16},
  cartItemsScrollContainer: {paddingBottom: 8},
  cartItemRowLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  cartItemLeftInfo: {flex: 1, paddingRight: 12},
  cartItemNameText: {fontSize: 14, fontWeight: '600', color: '#333'},
  cartItemQtyLabelText: {fontSize: 12, color: '#7E8B97', marginTop: 2},
  cartItemPriceText: {fontSize: 14, fontWeight: '700', color: '#45A096'},
  horizontalDivider: {height: 1, backgroundColor: '#ECEFF3', marginVertical: 8},
  totalBillSummaryRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12},
  totalLabelText: {fontSize: 16, fontWeight: '700', color: '#333'},
  totalValueText: {fontSize: 16, fontWeight: '700', color: '#45A096'},
  checkoutPrimaryButton: {
    backgroundColor: '#45A096',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  disabledBtn: {opacity: 0.5},
  checkoutButtonText: {color: '#FFF', fontSize: 16, fontWeight: '700'},
  bottomTabBar: {
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
  tabItem: {alignItems: 'center', justifyContent: 'center', width: width / 5},
  tabLabel: {fontSize: 11, color: '#9CA3AF', marginTop: 5, fontWeight: '500'},
  activeTabLabel: {color: '#45A096', fontWeight: '600'},
});
