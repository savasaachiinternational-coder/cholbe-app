import {useState, type ReactNode} from 'react';
import {
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

type Props = NativeStackScreenProps<RootStackParamList, 'PharmacyDetails'>;
type VariantKey = 'PC' | 'Stripe' | 'Box';
type TabKey = 'Summary' | 'Medicine Info';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2;

const THUMBNAILS = [
  'https://via.placeholder.com/150/FFA500/FFFFFF?text=Cetirizine',
  'https://via.placeholder.com/150/00FFFF/000000?text=Capsule',
  'https://via.placeholder.com/150/32CD32/FFFFFF?text=Bottles',
  'https://via.placeholder.com/150/8A2BE2/FFFFFF?text=Pills',
];

const VARIANTS: {key: VariantKey; label: string}[] = [
  {key: 'PC', label: '1 PC'},
  {key: 'Stripe', label: '1 Stripe = 10 pcs'},
  {key: 'Box', label: '1 Box = 10 Stripes'},
];

export function PharmacyDetailsScreen({navigation, route}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('Summary');
  const [selectedVariant, setSelectedVariant] = useState<VariantKey>('Box');
  const [activeThumbnail, setActiveThumbnail] = useState(0);
  const [quantities, setQuantities] = useState<Record<VariantKey, number>>({
    PC: 0,
    Stripe: 0,
    Box: 5,
  });

  const productName = route.params?.name ?? 'Cetirizine 10 mg';
  const productType = route.params?.subtitle ?? 'Tablet';
  const mainImage =
    route.params?.imageUrl ??
    'https://via.placeholder.com/300x200/FFA500/FFFFFF?text=Cetirizine+Tablets';

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
      <Text style={styles.contentHeading}>Indications</Text>
      <Text style={styles.contentText}>
        Cetirizine is indicated for the relief of symptoms associated with seasonal & perennial
        allergic rhinitis. It is also indicated for the treatment of the uncomplicated skin
        manifestations of chronic idiopathic urticaria and allergen induced asthma.
      </Text>
      {renderBulletRow(
        <Text style={styles.boldText}>
          Take medication as per the advice of a registered doctor.
        </Text>,
      )}

      <Text style={styles.contentHeading}>Dosage & Administration</Text>
      <Text style={styles.contentSubtext}>Cetirizine oral dosage form:</Text>
      {renderBulletRow(
        <>
          <Text style={styles.mediumText}>Adults and Children 6 years and older: </Text>
          1 tablet or 2 teaspoonfuls daily (or 1 teaspoonful twice daily).
        </>,
      )}
      {renderBulletRow(
        <>
          <Text style={styles.mediumText}>Children 2-6 years: </Text>
          1 teaspoonful once daily or 1/2 teaspoonful twice daily.
        </>,
      )}
      {renderBulletRow(
        <>
          <Text style={styles.mediumText}>Children 6 months to 2 years: </Text>
          1/2 teaspoonful once daily. The dose in children 12-23 months of age can be increased to
          a maximum dose as 1/2 teaspoonful every 12 hours.
        </>,
      )}

      <Text style={styles.contentTextSpaced}>
        Cetirizine injectable dosage form: Cetirizine is a single use injectable product for
        intravenous administration only. The recommended dosage regimen is once every 24 hours as
        needed for treatment of acute urticaria. Administer Cetirizine as an intravenous push over
        a period of 1 to 2 minutes. Cetirizine is not recommended in pediatric patients less than 6
        years of age with impaired renal or hepatic function.
      </Text>

      {renderBulletRow(
        <>
          <Text style={styles.mediumText}>Adults and adolescents 12 years of age and older: </Text>
          The recommended dosage is 10 mg administered by intravenous injection.
        </>,
      )}
      {renderBulletRow(
        <>
          <Text style={styles.mediumText}>Children 6 to 11 years of age: </Text>
          The recommended dosage is 5 mg or 10 mg depending on symptom severity administered by
          intravenous injection.
        </>,
      )}
      {renderBulletRow(
        <>
          <Text style={styles.mediumText}>Children 6 months to 5 years of age: </Text>
          The recommended dosage is 2.5 mg administered by intravenous injection.
        </>,
      )}

      <Text style={styles.contentHeading}>Interaction</Text>
      <Text style={styles.contentText}>
        No clinically significant drug interactions have been found with Theophylline,
        Azithromycin, Pseudoephedrine, Ketoconazole or Erythromycin and with other drugs.
        Contraindications
      </Text>

      <Text style={styles.contentHeading}>Side Effects</Text>
      <Text style={styles.contentText}>
        The most common side effects that occurred more frequently on Cetirizine is somnolence
      </Text>

      <Text style={styles.contentHeading}>Storage Conditions</Text>
      <Text style={styles.contentText}>
        Keep in a dry place away from light and heat. Keep out of the reach of children.
      </Text>
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

      <View style={styles.grid}>{[0, 1].map(index => renderAlternativeCard(index))}</View>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerTitle}>Disclaimer:</Text>
        <Text style={styles.disclaimerText}>
          Cetirizine Hydrochloride is a potent H1 receptor antagonist without any significant
          anticholinergic and antiserotonic effects. At pharmacologically active dose levels,
          effect and does not cause behavioral changes...
          <Text style={styles.blueLink}>Read More</Text>
        </Text>
      </View>
    </>
  );

  const renderAlternativeCard = (index: number) => {
    const isOrangePack = index % 2 !== 0;
    const imgUrl = isOrangePack
      ? 'https://via.placeholder.com/150/FF8C00/FFFFFF?text=Orange+Pack'
      : 'https://via.placeholder.com/150/4682B4/FFFFFF?text=Pills';

    return (
      <TouchableOpacity
        key={index}
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          navigation.push('PharmacyDetails', {
            name: 'Immunity support',
            subtitle: 'Vitamin C + Zinc',
            imageUrl: imgUrl,
          })
        }>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>-10%</Text>
        </View>
        <Image source={{uri: imgUrl}} style={styles.productImage} />
        <Text style={styles.productTitle} numberOfLines={1}>
          Immunity support
        </Text>
        <Text style={styles.productDesc}>Vitamin C + Zinc</Text>
        <View style={styles.cardMetaRow}>
          <View style={styles.sizeRow}>
            <Feather name="droplet" size={11} color="#7E8B97" />
            <Text style={styles.sizeText}>60 ml</Text>
          </View>
          <Text style={styles.priceText}>
            <Text style={styles.oldPrice}>$10 </Text>$120
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addToCartBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('PharmacyCartOverlay')}>
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
            onPress={() => navigation.navigate('PharmacyCartOverlay')}>
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
            <Image source={{uri: mainImage}} style={styles.mainProductImage} />
          </View>

          <View style={styles.thumbnailRow}>
            {THUMBNAILS.map((uri, index) => (
              <TouchableOpacity
                key={uri}
                style={[
                  styles.thumbnailWrapper,
                  index === activeThumbnail && styles.activeThumbnailBorder,
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveThumbnail(index)}>
                <Image source={{uri}} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dotsContainer}>
            {THUMBNAILS.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === activeThumbnail && styles.activeDot]}
              />
            ))}
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
                <Text style={styles.categoryBadgeText}>Medicines</Text>
              </View>
            </View>

            <View style={styles.detailsBlock}>
              <Text style={styles.detailLine}>
                Generics: <Text style={styles.blueLink}>Cetirizine Hydrochloride.</Text>
              </Text>
              <Text style={styles.detailLine}>
                Type: <Text style={styles.blueLink}>Antihistamine.</Text>
              </Text>
              <Text style={styles.blueLink}>Ad-din Pharmaceuticals Ltd.</Text>
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
              <Text style={styles.variantLabel}>{variant.label}</Text>
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
              <Text style={styles.footerPrice}>$80</Text>
              <Text style={styles.footerOldPrice}>$120</Text>
            </View>
            <View style={styles.prescriptionContainer}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={14} color="#E26D6D" />
              <Text style={styles.prescriptionText}>Prescription Required</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.footerCheckoutBtn}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('PharmacyCartOverlay')}>
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
