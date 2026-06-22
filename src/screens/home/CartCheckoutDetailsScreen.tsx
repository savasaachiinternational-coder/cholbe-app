import {useState} from 'react';
import {
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
import {GOOGLE_MAPS_API_KEY} from '../../config/googleMaps';
import type {RootStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CartCheckoutDetails'>;
type VariantKey = 'PC' | 'Stripe' | 'Box';
type AddressCategory = 'Home' | 'Office';

const VARIANTS: {key: VariantKey; label: string}[] = [
  {key: 'PC', label: '1 PC'},
  {key: 'Stripe', label: '1 Stripe = 10 pcs'},
  {key: 'Box', label: '1 Box = 10 Stripes'},
];

const REGION_CHIPS = ['Dhaka', 'Dhaka North', 'Uttara Sector 12'];

const MAP_PREVIEW_URL = `https://maps.googleapis.com/maps/api/staticmap?center=23.8740,90.3695&zoom=14&size=600x240&scale=2&markers=color:red%7C23.8740,90.3695&key=${GOOGLE_MAPS_API_KEY}`;

function VerifiedBadgeIcon() {
  return (
    <View style={styles.badgeShieldIcon}>
      <MaterialCommunityIcons name="check-decagram" size={14} color="#FFFFFF" />
    </View>
  );
}

export function CartCheckoutDetailsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [addressCategory, setAddressCategory] = useState<AddressCategory>('Home');
  const [selectedVariant, setSelectedVariant] = useState<VariantKey>('Box');
  const [quantities, setQuantities] = useState<Record<VariantKey, number>>({
    PC: 0,
    Stripe: 0,
    Box: 5,
  });

  const handleQuantityChange = (variant: VariantKey, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [variant]: Math.max(0, prev[variant] + delta),
    }));
    setSelectedVariant(variant);
  };

  const formatQuantity = (value: number) => value.toString().padStart(2, '0');

  const openAddressMap = () => navigation.navigate('AddressMapPicker');

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipping</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.timelineContainer}>
          <View style={styles.timelineLine} />

          <View style={styles.stepWrapper}>
            <View style={[styles.stepCircle, styles.stepActive]}>
              <Text style={styles.stepTextActive}>1</Text>
            </View>
            <Text style={styles.stepLabel}>Cart</Text>
          </View>

          <View style={styles.stepWrapper}>
            <View style={[styles.stepCircle, styles.stepActive]}>
              <Text style={styles.stepTextActive}>2</Text>
            </View>
            <Text style={styles.stepLabel}>Shipping</Text>
          </View>

          <View style={styles.stepWrapper}>
            <View style={[styles.stepCircle, styles.stepInactive]}>
              <Text style={styles.stepTextInactive}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Payment</Text>
          </View>
        </View>

        <View style={styles.guestBanner}>
          <Text style={styles.guestBannerText}>
            Order now as a guest.{' '}
            <Text style={styles.greenLink}>Enjoy Free Home Delivery</Text> on your first order after{' '}
            <Text style={[styles.greenLink, styles.underlineText]}>Log in</Text> !
          </Text>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Add Shipping Address</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={openAddressMap}>
              <MaterialCommunityIcons name="pencil-outline" size={20} color="#1A1C1E" />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Recipient's Name</Text>
          <View style={styles.inputFieldBox}>
            <Feather name="user" size={18} color="#4F5E6D" style={styles.fieldIcon} />
            <TextInput style={styles.textInputStyle} defaultValue="Tanvir Ahmed" editable={false} />
          </View>

          <Text style={styles.inputLabel}>Phone</Text>
          <View style={styles.inputFieldBox}>
            <Feather name="phone" size={18} color="#4F5E6D" style={styles.fieldIcon} />
            <TextInput
              style={styles.textInputStyle}
              defaultValue="01677589448"
              editable={false}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.inputLabel}>Region/City/Dhaka</Text>
          <View style={styles.chipsFormBlock}>
            {REGION_CHIPS.map(chip => (
              <View key={chip} style={styles.inlineChip}>
                <MaterialCommunityIcons name="checkbox-blank-circle" size={14} color="#47B39D" />
                <Text style={styles.chipFormLabel}>{chip}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.inputLabel}>Delivery address</Text>
          <TouchableOpacity
            style={styles.mapPreviewCard}
            activeOpacity={0.9}
            onPress={openAddressMap}>
            <Image source={{uri: MAP_PREVIEW_URL}} style={styles.mapPreviewImage} />
            <View style={styles.mapPreviewPin}>
              <Feather name="map-pin" size={22} color="#E26D6D" />
            </View>
          </TouchableOpacity>

          <View style={styles.deliveryAddressRow}>
            <TouchableOpacity
              style={styles.addressTextRow}
              activeOpacity={0.8}
              onPress={openAddressMap}>
              <TouchableOpacity
                style={styles.mapPinButton}
                activeOpacity={0.7}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                onPress={openAddressMap}>
                <Feather name="map-pin" size={18} color="#4F5E6D" />
              </TouchableOpacity>
              <Text style={styles.deliveryAddressText}>House 14 Road D6, Uttara 12</Text>
            </TouchableOpacity>

            <View style={styles.radioOptionGroup}>
              {(['Home', 'Office'] as AddressCategory[]).map(category => (
                <TouchableOpacity
                  key={category}
                  style={styles.radioClickItem}
                  activeOpacity={0.8}
                  onPress={() => setAddressCategory(category)}>
                  <MaterialCommunityIcons
                    name={addressCategory === category ? 'radiobox-marked' : 'radiobox-blank'}
                    size={18}
                    color={addressCategory === category ? '#4F5E6D' : '#7E8B97'}
                  />
                  <Text style={styles.radioLabelText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>Apply Your Promo Code</Text>
          <View style={styles.promoInputWrapper}>
            <TextInput
              style={styles.promoInputField}
              defaultValue="MULEN300FF"
              editable={false}
              placeholderTextColor="#9AA6B2"
            />
            <TouchableOpacity style={styles.applyPromoBtn} activeOpacity={0.85}>
              <Text style={styles.applyPromoBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.orderSummaryTitleRow}>
            <MaterialCommunityIcons name="text-box-search-outline" size={20} color="#1A1C1E" />
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
          </View>

          {VARIANTS.map(variant => (
            <View key={variant.key} style={styles.summaryCounterItem}>
              <View
                style={[
                  styles.summaryRadioFake,
                  selectedVariant === variant.key && styles.summaryRadioFakeActive,
                ]}
              />
              <Text style={styles.summaryUnitText}>{variant.label}</Text>
              <View style={styles.summaryControlRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleQuantityChange(variant.key, -1)}>
                  <Feather
                    name="minus-circle"
                    size={20}
                    color={quantities[variant.key] > 0 ? '#1A1C1E' : '#C8D1DB'}
                  />
                </TouchableOpacity>
                <Text style={styles.summaryCountVal}>{formatQuantity(quantities[variant.key])}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleQuantityChange(variant.key, 1)}>
                  <Feather name="plus-circle" size={20} color="#1A1C1E" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={styles.dividerLine} />

          <View style={styles.productInvoiceBlock}>
            <Image
              source={{
                uri: 'https://via.placeholder.com/100x100/FF8C00/FFFFFF?text=Immune+12S',
              }}
              style={styles.invoiceProductImage}
            />
            <View style={styles.invoiceMetaDetails}>
              <View style={styles.invoiceTitleContainer}>
                <Text style={styles.invoiceProductTitle}>Cetirizine 10 mg</Text>
                <Text style={styles.invoiceCurrencyValue}>৳ 800</Text>
              </View>
              <Text style={styles.invoiceDiscountsText}>
                ৳ 8000 <Text style={styles.lineThroughText}>৳ 960</Text> 10% off
              </Text>

              <View style={styles.invoiceRowSpaced}>
                <Text style={styles.invoiceLabelStandard}>Items Total</Text>
                <Text style={styles.invoiceLabelStandard}>৳ 800</Text>
              </View>
              <View style={styles.invoiceTitleContainer}>
                <Text style={styles.invoiceLabelStandard}>Delivery Charge</Text>
                <Text style={styles.invoiceLabelStandard}>৳ 30</Text>
              </View>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <View style={styles.grandTotalContainer}>
            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotalValue}>৳ 830</Text>
          </View>

          <View style={styles.trustBadgesRow}>
            <View style={styles.trustBadgeItem}>
              <VerifiedBadgeIcon />
              <Text style={styles.trustBadgeText}>Verified Purchase Badge</Text>
            </View>
            <View style={styles.trustBadgeItem}>
              <MaterialCommunityIcons name="replay" size={16} color="#4F5E6D" />
              <Text style={styles.trustBadgeText}>Free 1-Day Returns &1-Year warranty</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryActionButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('CartPayment')}>
          <Text style={styles.primaryActionButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.totalStickyFooter, {paddingBottom: Math.max(insets.bottom, 16)}]}>
        <View style={styles.footerDragTopHandle} />
        <View style={styles.footerFlexRow}>
          <View>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTaxSubtitle}>(incl.fees and tax)</Text>
          </View>
          <View style={styles.footerValueBlock}>
            <Text style={styles.footerTotalCurrency}>+৳ 830</Text>
            <Text style={styles.footerCentFraction}>00</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#F9FAFC',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  headerButton: {
    padding: 2,
  },
  headerSpacer: {
    width: 28,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 36,
    marginVertical: 18,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 14,
    left: 55,
    right: 55,
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  stepWrapper: {
    alignItems: 'center',
    zIndex: 2,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: '#4E929D',
  },
  stepInactive: {
    backgroundColor: '#E2E8F0',
  },
  stepTextActive: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  stepTextInactive: {
    color: '#7E8B97',
    fontSize: 13,
    fontWeight: '600',
  },
  stepLabel: {
    fontSize: 11,
    color: '#4F5E6D',
    marginTop: 6,
    fontWeight: '500',
  },
  guestBanner: {
    backgroundColor: '#EDF9F6',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  guestBannerText: {
    fontSize: 13,
    color: '#333D47',
    textAlign: 'center',
    lineHeight: 18,
  },
  greenLink: {
    color: '#00A884',
    fontWeight: '600',
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEFF5',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333D47',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F5E6D',
    marginBottom: 6,
    marginTop: 10,
  },
  inputFieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECEFF3',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInputStyle: {
    flex: 1,
    fontSize: 13,
    color: '#1A1C1E',
    fontWeight: '500',
    padding: 0,
  },
  chipsFormBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#ECEFF3',
    borderRadius: 10,
    padding: 10,
    gap: 12,
  },
  inlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipFormLabel: {
    fontSize: 12,
    color: '#333D47',
    fontWeight: '500',
  },
  mapPreviewCard: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ECEFF3',
    marginTop: 4,
    position: 'relative',
  },
  mapPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mapPreviewPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -22,
    marginLeft: -11,
  },
  deliveryAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  addressTextRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  mapPinButton: {
    paddingTop: 1,
  },
  deliveryAddressText: {
    flex: 1,
    fontSize: 13,
    color: '#1A1C1E',
    fontWeight: '500',
    lineHeight: 18,
  },
  radioOptionGroup: {
    flexDirection: 'row',
    gap: 14,
  },
  radioClickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  radioLabelText: {
    fontSize: 13,
    color: '#333D47',
    fontWeight: '500',
  },
  promoInputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#ECEFF3',
    borderRadius: 24,
    height: 46,
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 4,
    marginTop: 12,
  },
  promoInputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#4F5E6D',
    padding: 0,
    letterSpacing: 0.5,
  },
  applyPromoBtn: {
    backgroundColor: '#4E929D',
    height: 38,
    paddingHorizontal: 22,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyPromoBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  orderSummaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  orderSummaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333D47',
  },
  summaryCounterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryRadioFake: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#C8D1DB',
    marginRight: 12,
  },
  summaryRadioFakeActive: {
    borderColor: '#47B39D',
    backgroundColor: '#47B39D',
  },
  summaryUnitText: {
    flex: 1,
    fontSize: 13,
    color: '#4F5E6D',
    fontWeight: '500',
  },
  summaryControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryCountVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1C1E',
    minWidth: 16,
    textAlign: 'center',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#ECEFF3',
    marginVertical: 12,
  },
  productInvoiceBlock: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  invoiceProductImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  invoiceMetaDetails: {
    flex: 1,
  },
  invoiceTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceRowSpaced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  invoiceProductTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  invoiceCurrencyValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  invoiceDiscountsText: {
    fontSize: 11,
    color: '#7E8B97',
    marginTop: 2,
    fontWeight: '500',
  },
  lineThroughText: {
    textDecorationLine: 'line-through',
  },
  invoiceLabelStandard: {
    fontSize: 12,
    color: '#4F5E6D',
    fontWeight: '500',
    marginTop: 3,
  },
  grandTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  grandTotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  trustBadgesRow: {
    borderTopWidth: 1,
    borderTopColor: '#ECEFF3',
    paddingTop: 12,
    gap: 6,
  },
  trustBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeShieldIcon: {
    backgroundColor: '#47B39D',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustBadgeText: {
    fontSize: 11,
    color: '#7E8B97',
    fontWeight: '500',
    flex: 1,
  },
  primaryActionButton: {
    backgroundColor: '#4E929D',
    borderRadius: 24,
    marginHorizontal: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  totalStickyFooter: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#ECEFF3',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  footerDragTopHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 14,
  },
  footerFlexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerTotalLabel: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  footerTaxSubtitle: {
    fontSize: 13,
    color: '#7E8B97',
    fontWeight: '500',
  },
  footerValueBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  footerTotalCurrency: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4E929D',
  },
  footerCentFraction: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4E929D',
    marginTop: 3,
    marginLeft: 1,
  },
});
