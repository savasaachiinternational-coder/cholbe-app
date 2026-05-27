import {useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PharmacyCartOverlay'>;

const {width, height} = Dimensions.get('window');
const CARD_SPACING = 12;
const CARD_WIDTH = (width - 32 - CARD_SPACING) / 2;

const BACKGROUND_PRODUCTS = [
  {id: '1', name: 'Thyrox 50mg Tablet', type: 'pc', price: '৳10.00'},
  {id: '2', name: 'Napa Extend Tablet', type: 'pc', price: '৳15.00'},
  {id: '3', name: 'Sergel 20mg Capsule', type: 'pc', price: '৳7.00'},
  {id: '4', name: 'Ace 500mg Tablet', type: 'pc', price: '৳5.00'},
];

const INITIAL_CART_DATA = [
  {id: 'c1', name: 'Thyrox 50mg Tablet', qty: 1, totalPrice: '৳10.00'},
  {id: 'c2', name: 'Sergel 20mg Capsule', qty: 1, totalPrice: '৳7.00'},
  {id: 'c3', name: 'Ace 500mg Tablet', qty: 2, totalPrice: '৳10.00'},
];

export function PharmacyCartOverlayScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [cartItems] = useState(INITIAL_CART_DATA);

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Shop</Text>
        <View style={styles.cartIconButton}>
          <Feather name="shopping-cart" size={22} color="#333333" />
          <View style={styles.cartBadge} />
        </View>
      </View>

      <View style={styles.filterSectionWrapper}>
        <ScrollView horizontal contentContainerStyle={styles.filterScrollContent} showsHorizontalScrollIndicator={false}>
          <View style={[styles.filterPill, styles.activeFilterPill]}>
            <Text style={styles.activeFilterPillText}>All Medicine</Text>
          </View>
          {['Tablet', 'Syrup', 'Capsule'].map(category => (
            <View key={category} style={styles.filterPill}>
              <Text style={styles.filterPillText}>{category}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.gridWrapper}>
        {BACKGROUND_PRODUCTS.map(product => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productImageContainer}>
              <MaterialCommunityIcons
                name="pill"
                size={44}
                color="#A0A5BA"
                style={styles.rotatedPillIcon}
              />
            </View>
            <View style={styles.productInfoBlock}>
              <Text style={styles.productNameText}>{product.name}</Text>
              <Text style={styles.productTypeText}>{product.type}</Text>
              <View style={styles.priceCounterRow}>
                <Text style={styles.productPriceText}>{product.price}</Text>
                <View style={styles.inlineAddButton}>
                  <Text style={styles.inlineAddButtonText}>Add</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.dimmedBackdropFilm, {bottom: 74 + insets.bottom}]} />

      <View style={[styles.cartBottomSheetContainer, {bottom: 74 + insets.bottom}]}>
        <View style={styles.dragNotchIndicator} />
        <Text style={styles.cartSheetTitleText}>Cart</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cartItemsScrollContainer}>
          {cartItems.map(item => (
            <View key={item.id} style={styles.cartItemRowLine}>
              <View style={styles.cartItemLeftInfo}>
                <Text style={styles.cartItemNameText}>{item.name}</Text>
                <Text style={styles.cartItemQtyLabelText}>Qty: {item.qty}</Text>
              </View>
              <Text style={styles.cartItemPriceText}>{item.totalPrice}</Text>
            </View>
          ))}

          <View style={styles.horizontalDivider} />
          <View style={styles.totalBillSummaryRow}>
            <Text style={styles.totalLabelText}>Total</Text>
            <Text style={styles.totalValueText}>৳27.00</Text>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.checkoutPrimaryButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('CartCheckoutDetails')}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.bottomTabBar, {paddingBottom: 12 + insets.bottom}]}>
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => navigation.navigate('PharmacyShop')}>
          <MaterialCommunityIcons name="clippy" size={24} color="#45A096" />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Pharmacy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MedicineList')}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Medication</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ReportsList')}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MyProfile')}>
          <Feather name="user" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9FE',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    opacity: 0.3,
  },
  backButton: {
    padding: 2,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  cartIconButton: {
    padding: 4,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC6468',
  },
  filterSectionWrapper: {
    marginVertical: 8,
    opacity: 0.3,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECEFF7',
  },
  activeFilterPill: {
    backgroundColor: '#45A096',
    borderColor: '#45A096',
  },
  filterPillText: {
    fontSize: 14,
    color: '#7D8797',
  },
  activeFilterPillText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_SPACING,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    opacity: 0.3,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEFF7',
    marginBottom: 4,
  },
  productImageContainer: {
    height: 110,
    backgroundColor: '#F4F6FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  rotatedPillIcon: {
    transform: [{rotate: '-45deg'}],
  },
  productInfoBlock: {
    padding: 12,
  },
  productNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212529',
  },
  productTypeText: {
    fontSize: 12,
    color: '#8A94A6',
    marginVertical: 4,
  },
  priceCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPriceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212529',
  },
  inlineAddButton: {
    borderWidth: 1,
    borderColor: '#72C1B6',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  inlineAddButtonText: {
    fontSize: 12,
    color: '#45A096',
    fontWeight: '600',
  },
  dimmedBackdropFilm: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(26, 28, 35, 0.45)',
  },
  cartBottomSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 16,
    maxHeight: height * 0.52,
    shadowColor: '#1A1C23',
    shadowOffset: {width: 0, height: -10},
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 20,
  },
  dragNotchIndicator: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E4E7ED',
    alignSelf: 'center',
    marginBottom: 16,
  },
  cartSheetTitleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E3A60',
    marginBottom: 18,
  },
  cartItemsScrollContainer: {
    paddingBottom: 16,
  },
  cartItemRowLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  cartItemLeftInfo: {
    flex: 1,
  },
  cartItemNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3142',
    marginBottom: 4,
  },
  cartItemQtyLabelText: {
    fontSize: 13,
    color: '#8A94A6',
    fontWeight: '500',
  },
  cartItemPriceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3142',
    textAlign: 'right',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#F1F3F7',
    marginVertical: 14,
  },
  totalBillSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  totalLabelText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A60',
  },
  totalValueText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E3A60',
  },
  checkoutPrimaryButton: {
    backgroundColor: '#45A096',
    width: '100%',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#45A096',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width / 5,
  },
  tabLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 5,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#45A096',
    fontWeight: '600',
  },
});
