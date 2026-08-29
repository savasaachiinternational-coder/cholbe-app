import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import {ProductImage} from '../../components/ProductImage';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {navigateCustomerTab} from './customerTabNavigation';
import { FONT } from '../../theme/typography';
import {
  discountPercent,
  formatBdt,
  productListPrice,
  productUnitPrice,
} from '../../utils/pharmacyHelpers';
import {
  defaultPurchaseOption,
  variantLabelForUnit,
} from '../../utils/productVariants';

type Props = NativeStackScreenProps<RootStackParamList, 'PharmacyCartOverlay'>;

// Proxima Nova per the Figma typography. Android resolves a weight by the exact
// font file name, so each weight is referenced by its own family name.
const {width} = Dimensions.get('window');
const CARD_SPACING = 12;
const CARD_WIDTH = (width - 32 - CARD_SPACING) / 2;
const DELIVERY_CHARGE = 30;

export function PharmacyCartOverlayScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const handleTabPress = (tab: BottomTabKey) => {
    navigateCustomerTab(navigation, tab);
  };
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
      setProducts(shop);
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
      const option = defaultPurchaseOption(product);
      const cart = await cartApi.addItem(product.id, 1, option.key);
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

  // The cart line only carries the paid unit price, so the shop list is used to
  // recover the struck-through list price and the discount badge.
  const productById = new Map(products.map(item => [item.id, item]));

  const handleLineQuantity = async (item: CartItem, delta: number) => {
    const next = item.quantity + delta;
    try {
      const cart =
        next < 1
          ? await cartApi.removeItem(item.id)
          : await cartApi.updateItem(item.id, next);
      setCartItems(cart.items);
      setSubtotal(cart.subtotal);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not update cart';
      Alert.alert('Cart', message);
    }
  };

  const formatQuantity = (value: number) => value.toString().padStart(2, '0');
  const grandTotal = subtotal + (cartItems.length ? DELIVERY_CHARGE : 0);

  const renderCartLine = (item: CartItem) => {
    const product = item.vendorProductId
      ? productById.get(item.vendorProductId)
      : undefined;
    const lineTotal = Number(item.unitPrice) * item.quantity;
    const listTotal = product ? productListPrice(product) * item.quantity : null;
    const pct = product ? discountPercent(product) : null;

    const variantLabel = variantLabelForUnit(
      product?.unitType ?? item.vendorProduct?.unitType,
      product?.category ?? item.vendorProduct?.category,
      item.variant,
    );

    return (
      <View key={item.id} style={styles.itemRow}>
        <ProductImage
          imageUrl={product?.imageUrl ?? item.vendorProduct?.imageUrl}
          style={styles.itemThumb}
        />
        <View style={styles.itemBody}>
          <View style={styles.itemTopRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.itemPrice}>{formatBdt(lineTotal)}</Text>
          </View>
          <View style={styles.itemMetaRow}>
            <Text style={styles.itemUnitPrice}>
              {formatBdt(Number(item.unitPrice))} · {variantLabel}
            </Text>
            {listTotal != null && pct != null ? (
              <>
                <Text style={styles.itemOldPrice}>{formatBdt(listTotal)}</Text>
                <Text style={styles.itemDiscount}>{pct}% off</Text>
              </>
            ) : null}
          </View>
          <View style={styles.lineCounterRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              activeOpacity={0.7}
              onPress={() => handleLineQuantity(item, -1)}>
              <Feather name="minus" size={15} color="#9E9E9E" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{formatQuantity(item.quantity)}</Text>
            <TouchableOpacity
              style={styles.counterBtn}
              activeOpacity={0.7}
              onPress={() => handleLineQuantity(item, 1)}>
              <Feather name="plus" size={15} color="#212121" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
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
            <ProductImage
              imageUrl={product.imageUrl}
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
        {/* Handle and title are one block so the sheet's 24px gap only falls
            between header, list and button. */}
        <View style={styles.sheetTopBlock}>
          <View style={styles.dragHandle} />
          <View style={styles.sheetHeaderRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={24} color="#212121" />
            </TouchableOpacity>
            <Text style={styles.sheetTitleText}>Cart</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#45A096" style={styles.loader} />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetScrollContent}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeaderRow}>
                <MaterialCommunityIcons
                  name="clipboard-text-outline"
                  size={18}
                  color="#4E929D"
                />
                <Text style={styles.summaryHeaderText}>Order Summary</Text>
              </View>

              {cartItems.length === 0 ? (
                <Text style={styles.emptyCartText}>Cart is empty</Text>
              ) : (
                cartItems.map(item => renderCartLine(item))
              )}

              <View style={styles.totalsBlock}>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Items Total</Text>
                  <Text style={styles.totalsValue}>{formatBdt(subtotal)}</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Delivery Charge</Text>
                  <Text style={styles.totalsValue}>
                    {formatBdt(cartItems.length ? DELIVERY_CHARGE : 0)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <Text style={styles.grandTotalText}>
                Grand Total:{' '}
                <Text style={styles.grandTotalValue}>
                  {formatBdt(grandTotal)}
                </Text>
              </Text>

              <View style={styles.trustRow}>
                <View style={styles.trustItem}>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color="#34C759"
                  />
                  <Text style={styles.trustText}>Verified Purchase Badge</Text>
                </View>
                <View style={styles.trustDivider} />
                <View style={styles.trustItem}>
                  <Feather name="corner-up-left" size={16} color="#7E8B97" />
                  <Text style={styles.trustText}>
                    Free 1-Day Returns &1-Year warranty
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        <TouchableOpacity
          style={[styles.continueButton, !cartItems.length && styles.disabledBtn]}
          activeOpacity={0.9}
          disabled={!cartItems.length}
          onPress={handleCheckout}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* Superseded by the shared HomeBottomNav below - kept for reference.
          To restore, delete this comment wrapper and the HomeBottomNav block.

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
  headerTitleText: {fontSize: 20, fontFamily: FONT.semibold, fontWeight: '600', color: '#333333'},
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
  productNameText: {fontSize: 12, fontFamily: FONT.semibold, fontWeight: '600', color: '#333'},
  productTypeText: {fontSize: 10, color: '#7E8B97'},
  priceCounterRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4},
  productPriceText: {fontSize: 12, fontFamily: FONT.semibold, fontWeight: '600', color: '#45A096'},
  inlineAddButton: {
    backgroundColor: '#45A096',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inlineAddButtonText: {color: '#FFF', fontSize: 10, fontFamily: FONT.semibold, fontWeight: '600'},
  dimmedBackdropFilm: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  // Figma: 24px top radius, 12/16/40/16 padding, 24px gap, #F4F3FC.
  cartBottomSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F4F3FC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#E3E5E8',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 24,
    maxHeight: '82%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  sheetTopBlock: {
    gap: 12,
  },
  dragHandle: {
    width: 50,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D9E0',
    alignSelf: 'center',
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // Figma H4/bold: Proxima Nova 24px / 600 / 120%, Greyscale-900.
  sheetTitleText: {
    fontSize: 24,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 29,
    color: '#212121',
  },
  sheetScrollContent: {paddingBottom: 4},
  loader: {marginVertical: 16},
  emptyCartText: {
    textAlign: 'center',
    color: '#9AA6B2',
    fontSize: 12,
    paddingVertical: 16,
  },
  summaryCard: {
    backgroundColor: '#F0EFF8',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  // Figma H6/bold: Proxima Nova 18px / 600 / 120%, Greyscale-800.
  summaryHeaderText: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 22,
    color: '#424242',
  },
  variantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C8D1DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {borderColor: '#47B39D'},
  radioInnerCircle: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#47B39D',
  },
  variantLabel: {
    fontSize: 14,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#424242',
    flexShrink: 1,
  },
  counterRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  // Outline only — a near-white fill read as solid circles on the lavender card.
  counterBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#D6D3E4',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  counterValue: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
    minWidth: 18,
    textAlign: 'center',
  },
  cardDivider: {height: 1, backgroundColor: '#ECEFF3', marginVertical: 12},
  itemRow: {flexDirection: 'row', gap: 12, marginBottom: 12},
  itemThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#F5F4FD',
    resizeMode: 'cover',
  },
  itemBody: {flex: 1, minWidth: 0},
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  lineCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  itemUnitPrice: {fontSize: 12, fontFamily: FONT.regular, color: '#616161'},
  itemOldPrice: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#9AA6B2',
    textDecorationLine: 'line-through',
  },
  itemDiscount: {
    fontSize: 12,
    color: '#4DA69F',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  totalsBlock: {gap: 6},
  totalsRow: {flexDirection: 'row', justifyContent: 'space-between'},
  totalsLabel: {fontSize: 12, fontFamily: FONT.regular, color: '#616161'},
  totalsValue: {
    fontSize: 12,
    color: '#212121',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  grandTotalText: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'right',
  },
  grandTotalValue: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ECEFF3',
    marginTop: 12,
    paddingTop: 12,
  },
  trustItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  trustDivider: {width: 1, alignSelf: 'stretch', backgroundColor: '#ECEFF3'},
  trustText: {
    flex: 1,
    fontSize: 11,
    fontFamily: FONT.regular,
    color: '#616161',
    lineHeight: 15,
  },
  // Figma: 10px 24px padding, 100px radius, Primary/500.
  continueButton: {
    backgroundColor: '#4DA69F',
    borderRadius: 100,
    minHeight: 52,
    paddingVertical: 10,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  disabledBtn: {opacity: 0.5},
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
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
  tabLabel: {fontSize: 11, color: '#9CA3AF', marginTop: 5, fontFamily: FONT.medium, fontWeight: '500'},
  activeTabLabel: {color: '#45A096', fontFamily: FONT.semibold, fontWeight: '600'},
});
