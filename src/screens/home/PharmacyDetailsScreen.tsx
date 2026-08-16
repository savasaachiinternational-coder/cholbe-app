import {useCallback, useEffect, useState, type ReactNode} from 'react';
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {pharmacyApi, type PharmacyProduct} from '../../api/pharmacy';
import {cartApi} from '../../api/cart';
import {ApiError} from '../../api/client';
import {ProductImage} from '../../components/ProductImage';
import {
  discountPercent,
  formatBdt,
  productListPrice,
  productUnitPrice,
  productVolumeLabel,
  unitTypeToVariant,
} from '../../utils/pharmacyHelpers';

type Props = NativeStackScreenProps<RootStackParamList, 'PharmacyDetails'>;
type VariantKey = 'PC' | 'Stripe' | 'Box';
type TabKey = 'Summary' | 'Medicine Info';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2;

const VARIANTS: {key: VariantKey; label: string}[] = [
  {key: 'PC', label: '1 PC'},
  {key: 'Stripe', label: '1 Stripe = 10 pcs'},
  {key: 'Box', label: '1 Box = 10 Stripes'},
];

function variantLabel(product: PharmacyProduct, key: VariantKey) {
  if (key === 'PC') {
    return product.unitType ? `1 ${product.unitType}` : '1 PC';
  }
  if (key === 'Stripe') {
    return '1 Stripe = 10 pcs';
  }
  return '1 Box = 10 Stripes';
}

export function PharmacyDetailsScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const productId = route.params.productId;
  const [product, setProduct] = useState<PharmacyProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<PharmacyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('Summary');
  const [selectedVariant, setSelectedVariant] = useState<VariantKey>('Box');
  const [quantities, setQuantities] = useState<Record<VariantKey, number>>({
    PC: 0,
    Stripe: 0,
    Box: 1,
  });

  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pharmacyApi.getById(productId);
      setProduct(data);
      const shop = await pharmacyApi.list(
        data.category ? {category: data.category} : undefined,
      );
      setRelatedProducts(
        shop.filter(item => item.id !== data.id).slice(0, 4),
      );
      const variantKey =
        unitTypeToVariant(data.unitType) === 'BOX'
          ? 'Box'
          : unitTypeToVariant(data.unitType) === 'STRIPE'
            ? 'Stripe'
            : 'PC';
      setSelectedVariant(variantKey);
      setQuantities({PC: 0, Stripe: 0, Box: 0, [variantKey]: 1});
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Product not found';
      Alert.alert('Product', message, [{text: 'OK', onPress: () => navigation.goBack()}]);
    } finally {
      setLoading(false);
    }
  }, [navigation, productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const productName = product?.name ?? 'Product';
  const productType = product?.genericName ?? product?.category ?? 'Medicine';
  const salePrice = product ? productUnitPrice(product) : 0;
  const listPrice = product ? productListPrice(product) : 0;
  const hasDiscount = product?.discountPrice != null && salePrice < listPrice;
  const medicineDescription =
    product?.medicine?.description?.trim() ||
    `${productName} is available from ${product?.vendor?.pharmacyName ?? 'our pharmacy'}. Please follow your doctor's advice before use.`;

  const handleAddToCart = async () => {
    if (!product) return;
    const qty = quantities[selectedVariant] || 1;
    if (qty < 1) {
      Alert.alert('Cart', 'Please select quantity.');
      return;
    }
    setAdding(true);
    try {
      await cartApi.addItem(product.id, qty, unitTypeToVariant(product.unitType));
      navigation.navigate('PharmacyCartOverlay');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not add to cart';
      Alert.alert('Cart', message);
    } finally {
      setAdding(false);
    }
  };

  if (loading || !product) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#00A884" size="large" />
      </View>
    );
  }

  const handleQuantityChange = (variant: VariantKey, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [variant]: Math.max(0, prev[variant] + delta),
    }));
  };

  const formatQuantity = (value: number) => value.toString().padStart(2, '0');

  const renderBulletRow = (children: ReactNode) => (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.contentText}>{children}</Text>
    </View>
  );

  const renderMedicineInfoContent = () => (
    <View style={styles.infoContentContainer}>
      <Text style={styles.contentHeading}>About this medicine</Text>
      <Text style={styles.contentText}>{medicineDescription}</Text>
      {product?.medicine?.medicineType ? (
        <>
          <Text style={styles.contentHeading}>Type</Text>
          <Text style={styles.contentText}>{product.medicine.medicineType}</Text>
        </>
      ) : null}
      {product?.brand || product?.medicine?.brand ? (
        <>
          <Text style={styles.contentHeading}>Brand</Text>
          <Text style={styles.contentText}>
            {product.brand ?? product.medicine?.brand}
          </Text>
        </>
      ) : null}
      {product?.prescriptionRequired ? (
        <>
          <Text style={styles.contentHeading}>Prescription</Text>
          {renderBulletRow(
            <Text style={styles.boldText}>
              Prescription is required for this product.
            </Text>,
          )}
        </>
      ) : null}
    </View>
  );

  const renderSummaryContent = () => (
    <>
      <View style={styles.deliveryBox}>
        <View style={styles.deliveryRow}>
          <MaterialCommunityIcons name="truck-delivery-outline" size={20} color="#4F5E6D" />
          <Text style={styles.deliveryText}>Fast Delivery to Your Home</Text>
        </View>
        <View style={styles.deliveryRowSpaced}>
          <Feather name="phone" size={16} color="#4F5E6D" />
          <Text style={styles.deliveryText}>
            Need urgent delivery? <Text style={styles.blueLink}>Get in touch with us.</Text>
          </Text>
        </View>
      </View>

      {relatedProducts.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Alternative Brands for</Text>
              <Text style={styles.sectionSubtitle}>{productName}</Text>
            </View>
            <TouchableOpacity style={styles.viewAllRow} activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View All</Text>
              <Feather name="chevron-right" size={14} color="#7E8B97" />
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {relatedProducts.map(item => renderAlternativeCard(item))}
          </View>
        </>
      ) : null}

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerTitle}>Disclaimer:</Text>
        <Text style={styles.disclaimerText}>
          {medicineDescription}
        </Text>
      </View>
    </>
  );

  const renderAlternativeCard = (item: PharmacyProduct) => {
    const pct = discountPercent(item);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          navigation.push('PharmacyDetails', {
            productId: item.id,
          })
        }>
        {pct != null ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>-{pct}%</Text>
          </View>
        ) : null}
        <ProductImage imageUrl={item.imageUrl} style={styles.productImage} />
        <Text style={styles.productTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productDesc}>
          {item.genericName ?? item.brand ?? item.category ?? ''}
        </Text>
        <View style={styles.cardMetaRow}>
          <View style={styles.sizeRow}>
            <Feather name="droplet" size={11} color="#7E8B97" />
            <Text style={styles.sizeText}>{productVolumeLabel(item)}</Text>
          </View>
          <Text style={styles.priceText}>
            {item.discountPrice != null ? (
              <Text style={styles.oldPrice}>{formatBdt(productListPrice(item))} </Text>
            ) : null}
            {formatBdt(productUnitPrice(item))}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addToCartBtn}
          activeOpacity={0.8}
          onPress={async () => {
            try {
              await cartApi.addItem(item.id, 1, unitTypeToVariant(item.unitType));
              navigation.navigate('PharmacyCartOverlay');
            } catch (err) {
              const message =
                err instanceof ApiError ? err.message : 'Could not add to cart';
              Alert.alert('Cart', message);
            }
          }}
          disabled={adding}>
          <Text style={styles.addToCartBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pharmacy Details</Text>
        <View style={styles.headerRightIcons}>
          <TouchableOpacity
            style={styles.headerButtonCircle}
            activeOpacity={0.7}
            onPress={handleAddToCart}
            disabled={adding}>
            <Feather name="shopping-cart" size={18} color="#7E8B97" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButtonCircle} activeOpacity={0.7}>
            <Feather name="search" size={18} color="#7E8B97" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.mainImageCard}>
            <ProductImage
              imageUrl={product.imageUrl}
              style={styles.mainProductImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.thumbnailRow}>
            <TouchableOpacity
              style={[styles.thumbnailWrapper, styles.activeThumbnailBorder]}
              activeOpacity={0.8}>
              <ProductImage
                imageUrl={product.imageUrl}
                style={styles.thumbnailImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.activeDot]} />
          </View>

          <View style={styles.tabsContainer}>
            {(['Summary', 'Medicine Info'] as TabKey[]).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.titleRow}>
              <View style={styles.titleBlock}>
                <Text style={styles.mainTitle}>{productName}</Text>
                <Text style={styles.subTitleText}>{productType}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <FontAwesome5 name="capsules" size={12} color="#FFFFFF" />
                <Text style={styles.categoryBadgeText}>
                  {product.category ?? 'Medicines'}
                </Text>
              </View>
            </View>

            <View style={styles.detailsBlock}>
              <Text style={styles.detailLine}>
                Generics:{' '}
                <Text style={styles.blueLink}>
                  {product.genericName ?? product.name}.
                </Text>
              </Text>
              <Text style={styles.detailLine}>
                Type:{' '}
                <Text style={styles.blueLink}>
                  {product.medicine?.medicineType ?? product.category ?? 'Medicine'}.
                </Text>
              </Text>
              <Text style={styles.blueLink}>
                {product.vendor?.pharmacyName ?? product.brand ?? 'Cholbe Pharmacy'}
              </Text>
            </View>
          </View>

          {activeTab === 'Summary' ? renderSummaryContent() : renderMedicineInfoContent()}
        </ScrollView>

        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('PharmacyPrescriptionMenu')}>
          <MaterialCommunityIcons name="file-document-scan-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={[styles.bottomPurchaseSheet, {paddingBottom: Math.max(insets.bottom, 16)}]}>
        <View style={styles.dragHandle} />

        {VARIANTS.map(variant => (
          <View key={variant.key} style={styles.variantRow}>
            <TouchableOpacity
              style={styles.radioRow}
              activeOpacity={0.8}
              onPress={() => setSelectedVariant(variant.key)}>
              <View
                style={[
                  styles.radioCircle,
                  selectedVariant === variant.key && styles.radioCircleActive,
                ]}>
                {selectedVariant === variant.key && <View style={styles.radioInnerCircle} />}
              </View>
              <Text style={styles.variantLabel}>{variantLabel(product, variant.key)}</Text>
            </TouchableOpacity>

            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterBtn}
                activeOpacity={0.7}
                onPress={() => handleQuantityChange(variant.key, -1)}>
                <Feather name="minus" size={16} color="#7E8B97" />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{formatQuantity(quantities[variant.key])}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                activeOpacity={0.7}
                onPress={() => handleQuantityChange(variant.key, 1)}>
                <Feather name="plus" size={16} color="#1A1C1E" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.actionFooterRow}>
          <View style={styles.footerPriceBlock}>
            <View style={styles.priceFooterRow}>
              <Text style={styles.footerPrice}>{formatBdt(salePrice)}</Text>
              {hasDiscount ? (
                <Text style={styles.footerOldPrice}>{formatBdt(listPrice)}</Text>
              ) : null}
            </View>
            {product.prescriptionRequired ? (
              <View style={styles.prescriptionContainer}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={14} color="#E26D6D" />
                <Text style={styles.prescriptionText}>Prescription Required</Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.footerCheckoutBtn}
            activeOpacity={0.9}
            onPress={handleAddToCart}
            disabled={adding}>
            <Text style={styles.footerCheckoutBtnText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
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
    gap: 8,
  },
  headerButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEFF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    padding: 4,
  },
  mainImageCard: {
    backgroundColor: '#F2F4F7',
    borderRadius: 24,
    marginHorizontal: 16,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mainProductImage: {
    width: '90%',
    height: '85%',
    resizeMode: 'contain',
  },
  thumbnailRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  thumbnailWrapper: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEFF5',
    padding: 4,
  },
  activeThumbnailBorder: {
    borderColor: '#00A884',
    borderWidth: 1.5,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C8D1DB',
  },
  activeDot: {
    width: 16,
    backgroundColor: '#47B39D',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEFF5',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#47B39D',
  },
  tabText: {
    fontSize: 14,
    color: '#7E8B97',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#47B39D',
    fontWeight: '600',
  },
  metaContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  subTitleText: {
    fontSize: 14,
    color: '#7E8B97',
    marginTop: 2,
  },
  categoryBadge: {
    flexDirection: 'row',
    backgroundColor: '#4E929D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  detailsBlock: {
    marginTop: 14,
    gap: 4,
  },
  detailLine: {
    fontSize: 14,
    color: '#4F5E6D',
  },
  blueLink: {
    color: '#4A69BD',
    fontWeight: '500',
  },
  infoContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  contentHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3F444D',
    marginTop: 18,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF3',
    paddingBottom: 6,
  },
  contentText: {
    fontSize: 13,
    color: '#5C6470',
    lineHeight: 19,
    textAlign: 'justify',
    flex: 1,
  },
  contentTextSpaced: {
    fontSize: 13,
    color: '#5C6470',
    lineHeight: 19,
    textAlign: 'justify',
    marginTop: 12,
  },
  contentSubtext: {
    fontSize: 13,
    color: '#5C6470',
    fontWeight: '500',
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    paddingLeft: 4,
    paddingRight: 12,
    marginTop: 6,
  },
  bullet: {
    fontSize: 14,
    color: '#5C6470',
    marginRight: 8,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: '#2B2F36',
  },
  mediumText: {
    fontWeight: '600',
    color: '#3F444D',
  },
  deliveryBox: {
    backgroundColor: '#EDF2F7',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 14,
    marginVertical: 16,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryRowSpaced: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  deliveryText: {
    fontSize: 13,
    color: '#333D47',
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#7E8B97',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    color: '#7E8B97',
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
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
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  productDesc: {
    fontSize: 11,
    color: '#7E8B97',
    marginTop: 2,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sizeText: {
    fontSize: 11,
    color: '#7E8B97',
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  oldPrice: {
    fontSize: 10,
    color: '#9AA6B2',
    textDecorationLine: 'line-through',
    fontWeight: '400',
  },
  addToCartBtn: {
    borderWidth: 1,
    borderColor: '#47B39D',
    borderRadius: 20,
    paddingVertical: 6,
    alignItems: 'center',
  },
  addToCartBtnText: {
    color: '#47B39D',
    fontWeight: '600',
    fontSize: 12,
  },
  disclaimerContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  disclaimerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#7E8B97',
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7CD1A1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 10,
  },
  bottomPurchaseSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#EAEFF5',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  dragHandle: {
    width: 50,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D9E0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  variantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
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
  radioCircleActive: {
    borderColor: '#47B39D',
  },
  radioInnerCircle: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#47B39D',
  },
  variantLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333D47',
    flexShrink: 1,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEFF5',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
  },
  counterValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1C1E',
    minWidth: 18,
    textAlign: 'center',
  },
  actionFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
    paddingTop: 16,
    gap: 12,
  },
  footerPriceBlock: {
    flex: 1,
  },
  priceFooterRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  footerPrice: {
    fontSize: 26,
    fontWeight: '700',
    color: '#4E929D',
  },
  footerOldPrice: {
    fontSize: 14,
    color: '#9AA6B2',
    textDecorationLine: 'line-through',
  },
  prescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  prescriptionText: {
    fontSize: 11,
    color: '#7E8B97',
    fontWeight: '500',
  },
  footerCheckoutBtn: {
    backgroundColor: '#4E929D',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  footerCheckoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
