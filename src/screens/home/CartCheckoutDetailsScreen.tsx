import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import { GOOGLE_MAPS_API_KEY } from '../../config/googleMaps';
import type { RootStackParamList } from '../../navigation/types';
import { addressesApi, type Address } from '../../api/addresses';
import { authApi } from '../../api/auth';
import { cartApi } from '../../api/cart';
import { getStoredUser } from '../../api/tokenStorage';
import { ApiError } from '../../api/client';
import { formatBdt } from '../../utils/pharmacyHelpers';

type Props = NativeStackScreenProps<RootStackParamList, 'CartCheckoutDetails'>;
type VariantKey = 'PC' | 'Stripe' | 'Box';
type AddressCategory = 'Home' | 'Office';

const VARIANTS: { key: VariantKey; label: string }[] = [
  { key: 'PC', label: '1 PC' },
  { key: 'Stripe', label: '1 Stripe = 10 pcs' },
  { key: 'Box', label: '1 Box = 10 Stripes' },
];

const DEFAULT_LAT = 23.874;
const DEFAULT_LNG = 90.3695;

function buildMapPreviewUrl(lat: number, lng: number) {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=600x240&scale=2&markers=color:red%7C${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
}

function parseRegion(region: string | null | undefined) {
  const parts = (region ?? 'Dhaka, Dhaka North, Uttara Sector 12')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
  return {
    city: parts[0] ?? 'Dhaka',
    area: parts[1] ?? 'Dhaka North',
    sector: parts[2] ?? 'Uttara Sector 12',
  };
}

function joinRegion(city: string, area: string, sector: string) {
  return [city, area, sector]
    .map(part => part.trim())
    .filter(Boolean)
    .join(', ');
}

function VerifiedBadgeIcon() {
  return (
    <View style={styles.badgeShieldIcon}>
      <MaterialCommunityIcons name="check-decagram" size={14} color="#FFFFFF" />
    </View>
  );
}

export function CartCheckoutDetailsScreen({ navigation, route }: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [addressCategory, setAddressCategory] =
    useState<AddressCategory>('Home');
  const [selectedVariant, setSelectedVariant] = useState<VariantKey>('Box');
  const [quantities, setQuantities] = useState<Record<VariantKey, number>>({
    PC: 0,
    Stripe: 0,
    Box: 5,
  });
  const [address, setAddress] = useState<Address | null>(null);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartItems, setCartItems] = useState<
    { name: string; quantity: number; unitPrice: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [regionCity, setRegionCity] = useState('Dhaka');
  const [regionArea, setRegionArea] = useState('Dhaka North');
  const [regionSector, setRegionSector] = useState('Uttara Sector 12');
  const [formattedAddress, setFormattedAddress] = useState('');
  const [latitude, setLatitude] = useState(DEFAULT_LAT);
  const [longitude, setLongitude] = useState(DEFAULT_LNG);
  const addressLoadedRef = useRef(false);
  const deliveryCharge = 30;
  const grandTotal = cartSubtotal + deliveryCharge;

  const loadCart = useCallback(async () => {
    try {
      const cart = await cartApi.get();
      setCartSubtotal(cart.subtotal);
      setCartItems(
        cart.items.map(i => ({
          name: i.name,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
        })),
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not load cart';
      Alert.alert('Checkout', message);
    }
  }, []);

  const loadAddressAndUser = useCallback(async () => {
    setLoading(true);
    try {
      const [addresses, user] = await Promise.all([
        addressesApi.list(),
        getStoredUser(),
      ]);
      const selected =
        addresses.find(a => a.id === route.params?.addressId) ??
        addresses.find(a => a.isDefault) ??
        addresses[0] ??
        null;
      setAddress(selected);
      if (selected?.label === 'Office') setAddressCategory('Office');
      else if (selected?.label === 'Home') setAddressCategory('Home');

      const region = parseRegion(selected?.region);
      setRegionCity(region.city);
      setRegionArea(region.area);
      setRegionSector(region.sector);
      setFormattedAddress(selected?.formattedAddress ?? '');
      setLatitude(selected?.latitude ?? DEFAULT_LAT);
      setLongitude(selected?.longitude ?? DEFAULT_LNG);
      setUserName(user?.fullName ?? '');
      setUserPhone(user?.phone ?? '');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not load checkout';
      Alert.alert('Checkout', message);
    } finally {
      setLoading(false);
    }
  }, [route.params?.addressId]);

  useFocusEffect(
    useCallback(() => {
      void loadCart();
      if (!addressLoadedRef.current) {
        void loadAddressAndUser();
        addressLoadedRef.current = true;
      }
    }, [loadCart, loadAddressAndUser]),
  );

  useEffect(() => {
    addressLoadedRef.current = false;
    void loadAddressAndUser().then(() => {
      addressLoadedRef.current = true;
    });
  }, [route.params?.addressId, loadAddressAndUser]);

  useEffect(() => {
    const { pickedLatitude, pickedLongitude } = route.params ?? {};
    if (pickedLatitude != null && pickedLongitude != null) {
      setLatitude(pickedLatitude);
      setLongitude(pickedLongitude);
    }
  }, [route.params?.pickedLatitude, route.params?.pickedLongitude]);

  const saveShippingDetails = useCallback(async (): Promise<Address> => {
    const trimmedName = userName.trim();
    const trimmedPhone = userPhone.trim();
    const trimmedAddress = formattedAddress.trim();
    const region = joinRegion(regionCity, regionArea, regionSector);

    if (!trimmedName) {
      throw new Error('Please enter recipient name.');
    }
    if (!trimmedPhone) {
      throw new Error('Please enter phone number.');
    }
    if (!trimmedAddress) {
      throw new Error('Please enter delivery address.');
    }

    await authApi.updateMe({ fullName: trimmedName, phone: trimmedPhone });

    const payload = {
      label: addressCategory,
      region,
      formattedAddress: trimmedAddress,
      latitude,
      longitude,
      isDefault: true,
    };

    if (address?.id) {
      return addressesApi.update(address.id, payload);
    }
    return addressesApi.create(payload);
  }, [
    address?.id,
    addressCategory,
    formattedAddress,
    latitude,
    longitude,
    regionArea,
    regionCity,
    regionSector,
    userName,
    userPhone,
  ]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveShippingDetails();
      setAddress(saved);
      Alert.alert('Saved', 'Shipping details updated.');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not save shipping details';
      Alert.alert('Shipping', message);
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      const saved = await saveShippingDetails();
      setAddress(saved);
      navigation.navigate('CartPayment', { addressId: saved.id });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not save shipping details';
      Alert.alert('Shipping', message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuantityChange = (variant: VariantKey, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [variant]: Math.max(0, prev[variant] + delta),
    }));
    setSelectedVariant(variant);
  };

  const formatQuantity = (value: number) => value.toString().padStart(2, '0');

  const openAddressMap = () =>
    navigation.navigate('AddressMapPicker', { addressId: address?.id });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipping</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
            <Text style={styles.greenLink}>Enjoy Free Home Delivery</Text> on
            your first order after{' '}
            <Text style={[styles.greenLink, styles.underlineText]}>Log in</Text>{' '}
            !
          </Text>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Add Shipping Address</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSave}
              disabled={saving}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={20}
                color="#1A1C1E"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Recipient's Name</Text>
          <View style={styles.inputFieldBox}>
            <Feather
              name="user"
              size={18}
              color="#4F5E6D"
              style={styles.fieldIcon}
            />
            <TextInput
              style={styles.textInputStyle}
              value={userName}
              onChangeText={setUserName}
              placeholder="Recipient name"
              placeholderTextColor="#9AA6B2"
            />
          </View>

          <Text style={styles.inputLabel}>Phone</Text>
          <View style={styles.inputFieldBox}>
            <Feather
              name="phone"
              size={18}
              color="#4F5E6D"
              style={styles.fieldIcon}
            />
            <TextInput
              style={styles.textInputStyle}
              value={userPhone}
              onChangeText={setUserPhone}
              keyboardType="phone-pad"
              placeholder="Phone number"
              placeholderTextColor="#9AA6B2"
            />
          </View>

          <Text style={styles.inputLabel}>Region/City/Area</Text>
          <View style={styles.chipsFormBlock}>
            <View style={styles.inlineChip}>
              <MaterialCommunityIcons
                name="checkbox-blank-circle"
                size={14}
                color="#47B39D"
              />
              <TextInput
                style={styles.chipInput}
                value={regionCity}
                onChangeText={setRegionCity}
                placeholder="City"
                placeholderTextColor="#9AA6B2"
              />
            </View>
            <View style={styles.inlineChip}>
              <MaterialCommunityIcons
                name="checkbox-blank-circle"
                size={14}
                color="#47B39D"
              />
              <TextInput
                style={styles.chipInput}
                value={regionArea}
                onChangeText={setRegionArea}
                placeholder="Area"
                placeholderTextColor="#9AA6B2"
              />
            </View>
            <View style={styles.inlineChip}>
              <MaterialCommunityIcons
                name="checkbox-blank-circle"
                size={14}
                color="#47B39D"
              />
              <TextInput
                style={styles.chipInput}
                value={regionSector}
                onChangeText={setRegionSector}
                placeholder="Sector"
                placeholderTextColor="#9AA6B2"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Delivery address</Text>
          <TouchableOpacity
            style={styles.mapPreviewCard}
            activeOpacity={0.9}
            onPress={openAddressMap}
          >
            <Image
              source={{ uri: buildMapPreviewUrl(latitude, longitude) }}
              style={styles.mapPreviewImage}
            />
            <View style={styles.mapPreviewPin}>
              <Feather name="map-pin" size={22} color="#E26D6D" />
            </View>
          </TouchableOpacity>

          <View style={styles.deliveryAddressRow}>
            <View style={styles.addressInputRow}>
              <Feather
                name="map-pin"
                size={18}
                color="#4F5E6D"
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.addressInput}
                value={formattedAddress}
                onChangeText={setFormattedAddress}
                placeholder="House, road, area"
                placeholderTextColor="#9AA6B2"
                multiline
              />
            </View>

            <View style={styles.radioOptionGroup}>
              {(['Home', 'Office'] as AddressCategory[]).map(category => (
                <TouchableOpacity
                  key={category}
                  style={styles.radioClickItem}
                  activeOpacity={0.8}
                  onPress={() => setAddressCategory(category)}
                >
                  <MaterialCommunityIcons
                    name={
                      addressCategory === category
                        ? 'radiobox-marked'
                        : 'radiobox-blank'
                    }
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
            <MaterialCommunityIcons
              name="text-box-search-outline"
              size={20}
              color="#1A1C1E"
            />
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
          </View>

          {VARIANTS.map(variant => (
            <View key={variant.key} style={styles.summaryCounterItem}>
              <View
                style={[
                  styles.summaryRadioFake,
                  selectedVariant === variant.key &&
                    styles.summaryRadioFakeActive,
                ]}
              />
              <Text style={styles.summaryUnitText}>{variant.label}</Text>
              <View style={styles.summaryControlRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleQuantityChange(variant.key, -1)}
                >
                  <Feather
                    name="minus-circle"
                    size={20}
                    color={quantities[variant.key] > 0 ? '#1A1C1E' : '#C8D1DB'}
                  />
                </TouchableOpacity>
                <Text style={styles.summaryCountVal}>
                  {formatQuantity(quantities[variant.key])}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleQuantityChange(variant.key, 1)}
                >
                  <Feather name="plus-circle" size={20} color="#1A1C1E" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={styles.dividerLine} />

          {cartItems.map((item, idx) => (
            <View key={`${item.name}-${idx}`} style={styles.invoiceRowSpaced}>
              <Text style={styles.invoiceLabelStandard}>
                {item.name} x{item.quantity}
              </Text>
              <Text style={styles.invoiceLabelStandard}>
                {formatBdt(item.unitPrice * item.quantity)}
              </Text>
            </View>
          ))}

          <View style={styles.dividerLine} />

          <View style={styles.productInvoiceBlock}>
            <View style={styles.invoiceMetaDetails}>
              <View style={styles.invoiceRowSpaced}>
                <Text style={styles.invoiceLabelStandard}>Items Total</Text>
                <Text style={styles.invoiceLabelStandard}>
                  {formatBdt(cartSubtotal)}
                </Text>
              </View>
              <View style={styles.invoiceTitleContainer}>
                <Text style={styles.invoiceLabelStandard}>Delivery Charge</Text>
                <Text style={styles.invoiceLabelStandard}>
                  {formatBdt(deliveryCharge)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <View style={styles.grandTotalContainer}>
            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotalValue}>{formatBdt(grandTotal)}</Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.stickyFooterContainer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.continueBtn,
            (loading || saving) && styles.disabledBtn,
          ]}
          activeOpacity={0.9}
          disabled={loading || saving}
          onPress={handleContinue}
        >
          {loading || saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueBtnText}>Continue to Payment</Text>
          )}
        </TouchableOpacity>
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
  chipInput: {
    fontSize: 12,
    color: '#333D47',
    fontWeight: '500',
    padding: 0,
    minWidth: 72,
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
    marginTop: 12,
    gap: 12,
  },
  addressInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECEFF3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  addressInput: {
    flex: 1,
    fontSize: 13,
    color: '#1A1C1E',
    fontWeight: '500',
    lineHeight: 18,
    padding: 0,
    minHeight: 36,
  },
  radioOptionGroup: {
    flexDirection: 'row',
    gap: 14,
    alignSelf: 'flex-end',
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
  stickyFooterContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#F7F9FC',
    borderTopWidth: 1,
    borderTopColor: '#ECEFF3',
  },
  continueBtn: {
    backgroundColor: '#00A884',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.6,
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
    shadowOffset: { width: 0, height: -4 },
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
