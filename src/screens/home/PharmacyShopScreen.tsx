import {useState} from 'react';
import {
  Dimensions,
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

type Props = NativeStackScreenProps<RootStackParamList, 'PharmacyShop'>;

const {width} = Dimensions.get('window');
const CARD_SPACING = 12;
const CARD_WIDTH = (width - 32 - CARD_SPACING) / 2;

const FILTER_CATEGORIES = ['All Items', 'Medicines', "Women's Care", 'Body Care'];
const PRODUCT_SECTIONS = ['Top Picks', 'Baby Products', 'Oral & Body Care'];

export function PharmacyShopScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('All Items');

  const renderProductCard = (index: number) => {
    const isOrangePack = index % 2 !== 0;
    const imgUrl = isOrangePack
      ? 'https://via.placeholder.com/150/FF8C00/FFFFFF?text=Immune+Pack'
      : 'https://via.placeholder.com/150/4682B4/FFFFFF?text=Pills+Bottle';
    const product = {
      name: 'Immunity support',
      subtitle: 'Vitamin C + Zinc',
      imageUrl: imgUrl,
      price: '$120',
      oldPrice: '$10',
    };

    return (
      <View key={index} style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('PharmacyDetails', product)}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>-10%</Text>
          </View>

          <Image source={{uri: imgUrl}} style={styles.productImage} />

          <View style={styles.infoContainer}>
            <Text style={styles.productTitle} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.productSubtitle}>{product.subtitle}</Text>

            <View style={styles.metaRow}>
              <View style={styles.sizeContainer}>
                <Feather name="droplet" size={12} color="#7E8B97" />
                <Text style={styles.sizeText}>60 ml</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.oldPrice}>{product.oldPrice}</Text>
                <Text style={styles.newPrice}>{product.price}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addToCartBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('PharmacyCartOverlay')}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSection = (title: string) => (
    <View style={styles.sectionContainer} key={title}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity style={styles.viewAllRow} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All</Text>
          <Feather name="chevron-right" size={16} color="#7E8B97" />
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {[1, 2].map(item => renderProductCard(item))}
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
            <View style={styles.cartBadge} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Notifications')}>
            <Feather name="bell" size={22} color="#1A1C1E" />
          </TouchableOpacity>
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
          />
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
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

        {PRODUCT_SECTIONS.map(section => renderSection(section))}
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
    backgroundColor: '#F9FAFC',
  },
  scrollContainer: {
    paddingTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1C1E',
    flex: 1,
    marginLeft: 12,
  },
  headerRightIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E26D6D',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EAEFF5',
    height: 48,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1C1E',
  },
  filterButton: {
    padding: 4,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    fontSize: 13,
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 13,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    color: '#7E8B97',
    marginRight: 2,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: CARD_SPACING,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAEFF5',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E26D6D',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  productImage: {
    width: '100%',
    height: 110,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  infoContainer: {
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    marginTop: 8,
  },
  sizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sizeText: {
    fontSize: 11,
    color: '#7E8B97',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  oldPrice: {
    fontSize: 11,
    color: '#9AA6B2',
    textDecorationLine: 'line-through',
  },
  newPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  addToCartBtn: {
    borderWidth: 1,
    borderColor: '#00A884',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#00A884',
    fontSize: 13,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7CD1A1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 65,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EAEFF5',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    color: '#9AA6B2',
    marginTop: 4,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#00A884',
    fontWeight: '600',
  },
});
