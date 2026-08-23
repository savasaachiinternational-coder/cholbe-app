import {useCallback, useEffect, useMemo, useState} from 'react';
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
import {WaveTitleBand} from '../../components/WaveTitleBand';
import {
  discountPercent,
  formatBdt,
  productListPrice,
  productUnitPrice,
  productVolumeLabel,
} from '../../utils/pharmacyHelpers';
import {
  type ApiVariant,
  defaultPurchaseOption,
  getPurchaseOptions,
  isMedicineProduct,
  productInfoTabLabel,
  productMetaLines,
  productSubtitle,
} from '../../utils/productVariants';

type Props = NativeStackScreenProps<RootStackParamList, 'PharmacyDetails'>;
type TabKey = 'Summary' | 'Info';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2;

type InfoBlock = {text: string; bullet?: boolean; bold?: boolean};

// Dummy copy standing in for the medicine monograph until the API returns it.
const MEDICINE_INFO_SECTIONS: {title: string; blocks: InfoBlock[]}[] = [
  {
    title: 'Indications',
    blocks: [
      {
        text: 'Cetirizine is indicated for the relief of symptoms associated with seasonal & perennial allergic rhinitis. It is also indicated for the treatment of the uncomplicated skin manifestations of chronic idiopathic urticaria and allergen induced asthma.',
      },
      {
        text: 'Take medication as per the advice of a registered doctor.',
        bullet: true,
        bold: true,
      },
    ],
  },
  {
    title: 'Dosage & Administration',
    blocks: [
      {text: 'Cetirizine oral dosage form:'},
      {
        text: 'Adults and Children 6 years and older: 1 tablet or 2 teaspoonfuls daily (or 1 teaspoonful twice daily).',
        bullet: true,
      },
      {
        text: 'Children 2-6 years: 1 teaspoonful once daily or 1/2 teaspoonful twice daily.',
        bullet: true,
      },
      {
        text: 'Children 6 months to 2 years : 1/2 teaspoonful once daily. The dose in children 12-23 months of age can be increased to a maximum dose as 1/2 teaspoonful every 12 hours.',
        bullet: true,
      },
      {
        text: 'Cetirizine injectable dosage form: Cetirizine is a single use injectable product for intravenous administration only. The recommended dosage regimen is once every 24 hours as needed for treatment of acute urticaria. Administer Cetirizine as an intravenous push over a period of 1 to 2 minutes. Cetirizine is not recommended in pediatric patients less than 6 years of age with impaired renal or hepatic function.',
      },
      {
        text: 'Adults and adolescents 12 years of age and older: The recommended dosage is 10 mg administered by intravenous injection.',
        bullet: true,
      },
      {
        text: 'Children 6 to 11 years of age: The recommended dosage is 5 mg or 10 mg depending on symptom severity administered by intravenous injection.',
        bullet: true,
      },
      {
        text: 'Children 6 months to 5 years of age: The recommended dosage is 2.5 mg administered by intravenous injection.',
        bullet: true,
      },
    ],
  },
  {
    title: 'Interaction',
    blocks: [
      {
        text: 'No clinically significant drug interactions have been found with Theophylline, Azithromycin, Pseudoephedrine, Ketoconazole or Erythromycin and with other drugs.',
      },
      {text: 'Contraindications'},
    ],
  },
  {
    title: 'Side Effects',
    blocks: [
      {
        text: 'The most common side effects that occurred more frequently on Cetirizine is somnolence',
      },
    ],
  },
  {
    title: 'Storage Conditions',
    blocks: [
      {
        text: 'Keep in a dry place away from light and heat. Keep out of the reach of children.',
      },
    ],
  },
];

function categoryBadgeIcon(category?: string | null) {
  const cat = (category ?? '').toLowerCase();
  if (cat.includes('baby')) return 'baby-carriage';
  if (cat.includes('body') || cat.includes('skin') || cat.includes('hair')) {
    return 'hand-holding-water';
  }
  if (cat.includes('oral')) return 'tooth';
  if (cat.includes('women')) return 'female';
  return 'capsules';
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ApiVariant>('PC');
  const [quantities, setQuantities] = useState<Partial<Record<ApiVariant, number>>>({
    PC: 1,
  });

  const purchaseOptions = useMemo(
    () => (product ? getPurchaseOptions(product) : []),
    [product],
  );

  const infoTabLabel = productInfoTabLabel(product?.category);
  const productMeta = product ? productMetaLines(product) : null;

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
      const options = getPurchaseOptions(data);
      const initial = defaultPurchaseOption(data);
      setSelectedVariant(initial.key);
      setQuantities(
        Object.fromEntries(options.map(option => [option.key, option.key === initial.key ? 1 : 0])),
      );
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
  const productType = product ? productSubtitle(product) : 'Product';
  const salePrice = product ? productUnitPrice(product) : 0;
  const listPrice = product ? productListPrice(product) : 0;
  const hasDiscount = product?.discountPrice != null && salePrice < listPrice;
  const productDescription =
    product?.medicine?.description?.trim() ||
    `${productName} is available from ${product?.vendor?.pharmacyName ?? 'our pharmacy'}.${
      product && isMedicineProduct(product)
        ? " Please follow your doctor's advice before use."
        : ''
    }`;

  const handleAddToCart = async () => {
    if (!product) return;
    const qty = quantities[selectedVariant] || 1;
    if (qty < 1) {
      Alert.alert('Cart', 'Please select quantity.');
      return;
    }
    setAdding(true);
    try {
      await cartApi.addItem(product.id, qty, selectedVariant);
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

  const handleQuantityChange = (variant: ApiVariant, delta: number) => {
    setSelectedVariant(variant);
    setQuantities(prev => ({
      ...prev,
      [variant]: Math.max(0, (prev[variant] ?? 0) + delta),
    }));
  };

  const handleSelectVariant = (variant: ApiVariant) => {
    setSelectedVariant(variant);
    setQuantities(prev => {
      const next: Partial<Record<ApiVariant, number>> = {};
      purchaseOptions.forEach(option => {
        next[option.key] = option.key === variant ? Math.max(prev[variant] ?? 0, 1) : 0;
      });
      return next;
    });
  };

  const formatQuantity = (value: number) => value.toString().padStart(2, '0');

  // Placeholder gallery: the product only carries one image today, so it is
  // repeated to exercise the thumbnail strip and the dots.
  const galleryImages = [product.imageUrl, product.imageUrl, product.imageUrl];
  const activeImage = galleryImages[activeImageIndex] ?? product.imageUrl;

  const renderMedicineInfoContent = () => (
    <View style={styles.infoContentContainer}>
      {isMedicineProduct(product) ? (
        MEDICINE_INFO_SECTIONS.map(section => (
          <View key={section.title}>
            <Text style={styles.contentHeading}>{section.title}</Text>
            {section.blocks.map((block, index) =>
              block.bullet ? (
                <View key={`${section.title}-${index}`} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text
                    style={[styles.contentText, block.bold && styles.boldText]}>
                    {block.text}
                  </Text>
                </View>
              ) : (
                <Text
                  key={`${section.title}-${index}`}
                  style={[styles.paragraph, block.bold && styles.boldText]}>
                  {block.text}
                </Text>
              ),
            )}
          </View>
        ))
      ) : (
        <>
          <Text style={styles.contentHeading}>About this product</Text>
          <Text style={styles.paragraph}>{productDescription}</Text>
          {product.brand ? (
            <>
              <Text style={styles.contentHeading}>Brand</Text>
              <Text style={styles.paragraph}>{product.brand}</Text>
            </>
          ) : null}
          {product.unitType ? (
            <>
              <Text style={styles.contentHeading}>Unit</Text>
              <Text style={styles.paragraph}>Sold per {product.unitType.toLowerCase()}.</Text>
            </>
          ) : null}
        </>
      )}
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
          {productDescription}
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
              const option = defaultPurchaseOption(item);
              await cartApi.addItem(item.id, 1, option.key);
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

      <WaveTitleBand title="" color="#F4F3FC"/>

      <View style={styles.body}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.mainImageCard}>
            <ProductImage
              imageUrl={activeImage}
              style={styles.mainProductImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.thumbnailRow}>
            {galleryImages.map((image, index) => (
              <TouchableOpacity
                key={`thumb-${index}`}
                style={[
                  styles.thumbnailWrapper,
                  index === activeImageIndex && styles.activeThumbnailBorder,
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveImageIndex(index)}>
                <ProductImage
                  imageUrl={image}
                  style={styles.thumbnailImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dotsContainer}>
            {galleryImages.map((_, index) => (
              <View
                key={`dot-${index}`}
                style={[
                  styles.dot,
                  index === activeImageIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>

          <View style={styles.tabsContainer}>
            {(['Summary', 'Info'] as TabKey[]).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab === 'Info' ? infoTabLabel : 'Summary'}
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
                <FontAwesome5
                  name={categoryBadgeIcon(product.category)}
                  size={12}
                  color="#EDF7F6"
                />
                <Text style={styles.categoryBadgeText}>
                  {product.category ?? 'Product'}
                </Text>
              </View>
            </View>

            {productMeta ? (
              <View style={styles.detailsBlock}>
                <Text style={styles.detailLine}>
                  {productMeta.primaryLabel}:{' '}
                  <Text style={styles.blueLink}>{productMeta.primaryValue}.</Text>
                </Text>
                <Text style={styles.detailLine}>
                  {productMeta.secondaryLabel}:{' '}
                  <Text style={styles.blueLink}>{productMeta.secondaryValue}.</Text>
                </Text>
                <Text style={styles.blueLink}>
                  {product.vendor?.pharmacyName ?? product.brand ?? 'Cholbe Pharmacy'}
                </Text>
              </View>
            ) : null}
          </View>

          {activeTab === 'Summary' ? renderSummaryContent() : renderMedicineInfoContent()}
        </ScrollView>

        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('PharmacyPrescriptionMenu')}>
          {/* <MaterialCommunityIcons name="file-document-scan-outline" size={24} color="#FFFFFF" />
           */}
           <Image source={require('../../assets/syaiicon.png')}/>
        </TouchableOpacity>
      </View>

      <View style={[styles.bottomPurchaseSheet, {paddingBottom: Math.max(insets.bottom, 16)}]}>
        <View style={styles.dragHandle} />

        {purchaseOptions.map(variant => (
          <View key={variant.key} style={styles.variantRow}>
            <TouchableOpacity
              style={styles.radioRow}
              activeOpacity={0.8}
              onPress={() => handleSelectVariant(variant.key)}>
              <View
                style={[
                  styles.radioCircle,
                  selectedVariant === variant.key && styles.radioCircleActive,
                ]}>
                {selectedVariant === variant.key && <View style={styles.radioInnerCircle} />}
              </View>
              <Text style={styles.variantLabel}>{variant.label}</Text>
            </TouchableOpacity>

            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterBtn}
                activeOpacity={0.7}
                onPress={() => handleQuantityChange(variant.key, -1)}>
                <Feather name="minus" size={16} color="#7E8B97" />
              </TouchableOpacity>
              <Text style={styles.counterValue}>
                {formatQuantity(quantities[variant.key] ?? 0)}
              </Text>
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
    backgroundColor: '#F4F3FC',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveStyle:{
    marginTop:-10,
  },
  body: {
    flex: 1,
    marginTop:-48,
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
    backgroundColor: '#F5F4FD',
    borderRadius: 16,
    marginHorizontal: 16,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation:1,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#091B27',
  },
  subTitleText: {
    fontSize: 14,
    color: '#454F5B',
    fontWeight: '400',
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
    color: '#EDF7F6',
    fontSize: 16,
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
    fontSize: 15,
    fontWeight: '700',
    color: '#2B2F36',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF3',
    paddingBottom: 8,
  },
  // Standalone paragraph; contentText keeps flex:1 for the bullet rows.
  paragraph: {
    fontSize: 12,
    color: '#616161',
    lineHeight: 18,
    textAlign: 'justify',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 12,
    color: '#616161',
    lineHeight: 18,
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
    paddingRight: 4,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 13,
    color: '#616161',
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
    backgroundColor: '#F4F3FC',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 14,
    borderWidth:1,
    borderColor:'#C5D3E1',
    marginVertical: 16,
    elevation:2,
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
    fontWeight: '600',
    color: '#424242',
  },
  sectionSubtitle: {
    fontSize: 10,
    color: '#616161',
    fontWeight: '400',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#091B27',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#454F5B',
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
