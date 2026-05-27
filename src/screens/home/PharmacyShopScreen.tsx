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

type Props = NativeStackScreenProps<RootStackParamList, 'PharmacyShop'>;

const {width} = Dimensions.get('window');
const CARD_SPACING = 12;
const CARD_WIDTH = (width - 32 - CARD_SPACING) / 2;

const FILTER_CATEGORIES = ['All Medicine', 'Tablet', 'Syrup', 'Capsule', 'Injection'];
const PRODUCT_LIST_DATA = [
  {id: '1', name: 'Thyrox 50mg Tablet', type: 'pc', price: '৳10.00', qty: 1},
  {id: '2', name: 'Napa Extend Tablet', type: 'pc', price: '৳15.00', qty: 0},
  {id: '3', name: 'Sergel 20mg Capsule', type: 'pc', price: '৳7.00', qty: 1},
  {id: '4', name: 'Ace 500mg Tablet', type: 'pc', price: '৳5.00', qty: 2},
];

export function PharmacyShopScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('All Medicine');
  const [quantities, setQuantities] = useState<{[key: string]: number}>({
    '1': 1,
    '3': 1,
    '4': 2,
  });

  const handleIncrement = (id: string) => {
    setQuantities(prev => ({...prev, [id]: (prev[id] || 0) + 1}));
  };

  const handleDecrement = (id: string) => {
    setQuantities(prev => ({...prev, [id]: Math.max(0, (prev[id] || 0) - 1)}));
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Shop</Text>
        <TouchableOpacity
          style={styles.cartIconButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('PharmacyCartOverlay')}>
          <Feather name="shopping-cart" size={22} color="#333333" />
          <View style={styles.cartBadge} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterSectionWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}>
          {FILTER_CATEGORIES.map(category => {
            const isActive = activeCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[styles.filterPill, isActive && styles.activeFilterPill]}
                activeOpacity={0.8}
                onPress={() => setActiveCategory(category)}>
                <Text
                  style={[styles.filterPillText, isActive && styles.activeFilterPillText]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollCanvasContent,
          {paddingBottom: 100 + insets.bottom},
        ]}>
        <View style={styles.gridWrapper}>
          {PRODUCT_LIST_DATA.map(product => {
            const currentQty = quantities[product.id] || 0;
            return (
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
                  <Text style={styles.productNameText} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.productTypeText}>{product.type}</Text>

                  <View style={styles.priceCounterRow}>
                    <Text style={styles.productPriceText}>{product.price}</Text>

                    {currentQty > 0 ? (
                      <View style={styles.counterControlWrapper}>
                        <TouchableOpacity
                          style={styles.counterActionBtn}
                          onPress={() => handleDecrement(product.id)}>
                          <Feather name="minus" size={12} color="#45A096" />
                        </TouchableOpacity>

                        <Text style={styles.counterValueText}>{currentQty}</Text>

                        <TouchableOpacity
                          style={styles.counterActionBtn}
                          onPress={() => handleIncrement(product.id)}>
                          <Feather name="plus" size={12} color="#45A096" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.inlineAddButton}
                        activeOpacity={0.8}
                        onPress={() => handleIncrement(product.id)}>
                        <Feather name="plus" size={14} color="#45A096" />
                        <Text style={styles.inlineAddButtonText}>Add</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.bottomTabBar, {paddingBottom: 12 + insets.bottom}]}>
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
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
  container: {flex: 1, backgroundColor: '#F9F9FE'},
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F9F9FE',
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
  filterSectionWrapper: {marginVertical: 8},
  filterScrollContent: {paddingHorizontal: 16, gap: 8},
  filterPill: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECEFF7',
  },
  activeFilterPill: {backgroundColor: '#45A096', borderColor: '#45A096'},
  filterPillText: {fontSize: 14, color: '#7D8797', fontWeight: '500'},
  activeFilterPillText: {color: '#FFFFFF', fontWeight: '600'},
  scrollCanvasContent: {paddingHorizontal: 16, paddingTop: 8},
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_SPACING,
    justifyContent: 'flex-start',
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEFF7',
    shadowColor: '#E0E4F0',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  productImageContainer: {
    height: 110,
    backgroundColor: '#F4F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotatedPillIcon: {transform: [{rotate: '-45deg'}]},
  productInfoBlock: {padding: 12},
  productNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 2,
  },
  productTypeText: {
    fontSize: 12,
    color: '#8A94A6',
    fontWeight: '400',
    marginBottom: 10,
  },
  priceCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 30,
  },
  productPriceText: {fontSize: 14, fontWeight: '700', color: '#212529'},
  inlineAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#72C1B6',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  inlineAddButtonText: {
    fontSize: 12,
    color: '#45A096',
    fontWeight: '600',
    marginLeft: 2,
  },
  counterControlWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#72C1B6',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  counterActionBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#45A096',
    paddingHorizontal: 4,
    textAlign: 'center',
    minWidth: 14,
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
  tabLabel: {fontSize: 11, color: '#9CA3AF', marginTop: 5, fontWeight: '500'},
  activeTabLabel: {color: '#45A096', fontWeight: '600'},
});
