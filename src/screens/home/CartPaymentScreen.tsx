import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEdgeToEdgeStatusBar } from '../../hooks/useEdgeToEdgeStatusBar';
import type { RootStackParamList } from '../../navigation/types';
import { cartApi } from '../../api/cart';
import { ordersApi, uiPaymentToApi } from '../../api/orders';
import { checkoutSession } from '../../checkout/checkoutSession';
import { ApiError } from '../../api/client';
import { LEGAL_URLS } from '../../config/legal';
import { formatBdt } from '../../utils/pharmacyHelpers';
import { FONT } from '../../theme/typography';
import {useKeyboardHeight} from '../../hooks/useKeyboardHeight';

type Props = NativeStackScreenProps<RootStackParamList, 'CartPayment'>;
type PaymentMethod = 'COD' | 'bKash' | 'Nagad' | 'Card';

// Proxima Nova per the Figma typography. Android resolves a weight by the exact
// font file name, so each weight is referenced by its own family name.
const DELIVERY_CHARGE = 30;

export function CartPaymentScreen({ navigation, route }: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('COD');
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [notes, setNotes] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');
  const grandTotal = cartSubtotal + DELIVERY_CHARGE;

  const loadCart = useCallback(async () => {
    try {
      const cart = await cartApi.get();
      setCartSubtotal(cart.subtotal);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not load cart';
      Alert.alert('Payment', message);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      const order = await ordersApi.checkout({
        addressId: route.params.addressId,
        paymentMethod: uiPaymentToApi(selectedMethod),
        prescriptionUrl: checkoutSession.getPrescriptionUrl(),
        notes: notes.trim() || checkoutSession.getDeliveryNotes(),
      });
      if (selectedMethod !== 'COD') {
        await ordersApi.confirmPayment(order.id);
      }
      setPlacedOrderId(order.id);
      checkoutSession.clear();
      setIsOrderSuccessOpen(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Checkout failed';
      Alert.alert('Order failed', message);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods: {
    key: PaymentMethod;
    label: string;
    icon: ReactNode;
  }[] = [
    {
      key: 'COD',
      label: 'Cash on Delivery',
      icon: (
        <MaterialCommunityIcons
          name="handshake-outline"
          size={20}
          color="#1A1C1E"
        />
      ),
    },
    {
      key: 'bKash',
      label: 'bkash',
      icon: (
        <View style={[styles.brandIconMock, { backgroundColor: '#E2136E' }]}>
          <Text style={styles.brandIconText}>b</Text>
        </View>
      ),
    },
    {
      key: 'Nagad',
      label: 'Nagad',
      icon: (
        <View style={[styles.brandIconMock, { backgroundColor: '#F37021' }]}>
          <Text style={styles.brandIconText}>n</Text>
        </View>
      ),
    },
    {
      key: 'Card',
      label: 'Card',
      icon: (
        <MaterialCommunityIcons
          name="credit-card-plus-outline"
          size={20}
          color="#1A1C1E"
        />
      ),
    },
  ];

  const handleDone = () => {
    setIsOrderSuccessOpen(false);
    navigation.navigate('PharmacyShop');
  };

  // Real ids are UUIDs, so only the leading block is shown as the order ref.
  const orderReference = placedOrderId
    ? `#${placedOrderId.replace(/-/g, '').slice(0, 8).toUpperCase()}`
    : '';

  const keyboardHeight = useKeyboardHeight();
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
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.headerDivider} />

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
            <View style={[styles.stepCircle, styles.stepActive]}>
              <Text style={styles.stepTextActive}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Payment</Text>
          </View>
        </View>

        <Text style={styles.deliveryNotice}>Fast Delivery & Free Return</Text>

        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>Selected Payments Method</Text>

          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.key}
              style={styles.paymentRow}
              activeOpacity={0.85}
              onPress={() => setSelectedMethod(method.key)}
            >
              <View style={styles.methodLeft}>
                {method.icon}
                <Text style={styles.methodName}>{method.label}</Text>
              </View>
              <MaterialCommunityIcons
                name={
                  selectedMethod === method.key
                    ? 'radiobox-marked'
                    : 'radiobox-blank'
                }
                size={22}
                color="#00A651"
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.instructionSection}>
          <Text style={styles.instructionHeading}>Delivery Instruction</Text>
          <View style={styles.inputFieldBox}>
            <TextInput
              style={styles.textInputStyle}
              placeholder="(Optional) floor or Apt No or tell us how we"
              placeholderTextColor="#9AA6B2"
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.orderSummaryTitleRow}>
            <MaterialCommunityIcons
              name="text-box-search-outline"
              size={18}
              color="#1A1C1E"
            />
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
          </View>

          <View style={styles.invoiceRowSpaced}>
            <Text style={styles.invoiceLabelMain}>Subtotal</Text>
            <Text style={styles.invoiceValueMain}>
              {formatBdt(cartSubtotal)}
            </Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabelStandard}>Delivery Charge</Text>
            <Text style={styles.invoiceValueStandard}>
              {formatBdt(DELIVERY_CHARGE)}
            </Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabelStandard}>VAT</Text>
            <Text style={styles.invoiceValueStandard}>৳ 00</Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabelStandard}>Promo Code</Text>
            <Text style={[styles.invoiceValueStandard, styles.promoValue]}>
              ৳ 00
            </Text>
          </View>
        </View>

        <Text style={styles.termsAgreementText}>
          By completing this order, I agree to all{' '}
          <Text
            style={styles.underlineText}
            onPress={() => void Linking.openURL(LEGAL_URLS.terms)}
          >
            terms & conditions
          </Text>
          .
        </Text>
      </ScrollView>

      <View
        style={[
          styles.stickyFooterContainer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <View style={styles.footerDragTopHandle} />

        <View style={styles.footerFlexRow}>
          <View>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTaxSubtitle}>(incl.fees and tax)</Text>
          </View>
          <View style={styles.footerValueBlock}>
            <Text style={styles.footerTotalCurrency}>
              +{formatBdt(grandTotal)}
            </Text>
            <Text style={styles.footerCentFraction}>00</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.confirmOrderBtn}
          activeOpacity={0.9}
          disabled={loading}
          onPress={handleConfirmOrder}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmOrderBtnText}>Confirm Order</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={isOrderSuccessOpen}
        transparent
        animationType="fade"
        onRequestClose={handleDone}
      >
        <Pressable style={[styles.modalBackdrop, {paddingBottom: keyboardHeight}]} onPress={handleDone} />

        <View style={styles.congratsWrapper} pointerEvents="box-none">
          <View style={styles.congratsCard}>
            <Image
              source={require('../../assets/medicine_cardbg.png')}
              style={styles.congratsCardBg}
              resizeMode="cover"
            />

            {/* Confetti dots scattered around the badge. */}
            <View style={[styles.confettiDot, styles.confettiDotOne]} />
            <View style={[styles.confettiDot, styles.confettiDotTwo]} />
            <View style={[styles.confettiDot, styles.confettiDotThree]} />
            <View style={[styles.confettiDot, styles.confettiDotFour]} />
            <View style={[styles.confettiDot, styles.confettiDotFive]} />

            <View style={styles.congratsBadgeOuter}>
              <View style={styles.congratsBadgeInner}>
                <Feather name="check" size={26} color="#35BE9D" />
              </View>
            </View>

            <Text style={styles.congratsTitle}>Congratulations</Text>
            <Text style={styles.congratsSubtitle}>
              Your Colbe Pharmacy Order is Confirmed!
            </Text>
            {orderReference ? (
              <Text style={styles.congratsSubtitle}>
                (Order ID: {orderReference})
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.doneButton}
              activeOpacity={0.9}
              onPress={handleDone}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EFF8',
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
    backgroundColor: '#F0EFF8',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 29,
    color: '#212121',
  },
  headerButton: {
    padding: 2,
  },
  headerSpacer: {
    width: 28,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 36,
    marginVertical: 20,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 16,
    left: 55,
    right: 55,
    height: 1,
    backgroundColor: '#BDBDBD',
    zIndex: 1,
  },
  stepWrapper: {
    alignItems: 'center',
    zIndex: 2,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: '#4DA69F',
  },
  stepTextActive: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  stepLabel: {
    fontSize: 14,
    color: '#424242',
    marginTop: 8,
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  deliveryNotice: {
    fontSize: 14,
    color: '#616161',
    fontFamily: FONT.regular,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 20,
  },
  cardSection: {
    backgroundColor: '#F4F3FC',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionHeading: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 22,
    color: '#424242',
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E6E4EF',
    borderRadius: 100,
    paddingHorizontal: 18,
    height: 56,
    marginBottom: 12,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodName: {
    fontSize: 16,
    color: '#212121',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  brandIconMock: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  instructionSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  instructionHeading: {
    fontSize: 16,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 10,
  },
  inputFieldBox: {
    backgroundColor: '#E6E4EF',
    borderRadius: 100,
    height: 56,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  textInputStyle: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: '#212121',
    padding: 0,
  },
  orderSummaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 12,
    marginBottom: 8,
    gap: 8,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  invoiceRowSpaced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    marginTop: 6,
  },
  invoiceLabelMain: {
    fontSize: 24,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  invoiceValueMain: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  invoiceLabelStandard: {
    fontSize: 16,
    color: '#212121',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  invoiceValueStandard: {
    fontSize: 16,
    color: '#212121',
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  promoValue: {
    color: '#F4511E',
  },
  termsAgreementText: {
    fontSize: 12,
    color: '#616161',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
    fontFamily: FONT.regular,
    fontWeight: '400',
    paddingHorizontal: 16,
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
  stickyFooterContainer: {
    backgroundColor: '#F7F7FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  footerDragTopHandle: {
    width: 50,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 18,
  },
  footerFlexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  footerTotalLabel: {
    fontSize: 28,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#212121',
  },
  footerTaxSubtitle: {
    fontSize: 14,
    color: '#424242',
    fontFamily: FONT.regular,
    fontWeight: '400',
    marginTop: 2,
  },
  footerValueBlock: {
    alignItems: 'flex-end',
  },
  footerTotalCurrency: {
    fontSize: 24,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#4DA69F',
  },
  footerCentFraction: {
    fontSize: 14,
    fontFamily: FONT.regular,
    fontWeight: '400',
    color: '#9E9E9E',
  },
  confirmOrderBtn: {
    backgroundColor: '#4DA69F',
    borderRadius: 100,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 28, 35, 0.55)',
  },
  congratsWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  congratsCard: {
    width: '100%',
    backgroundColor: '#EEF6FB',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 28,
    alignItems: 'center',
    overflow: 'hidden',
  },
  // Oversized, offset and tilted so the wave reads as a texture rather than a
  // centred picture; same treatment as the medicine timeline cards.
  congratsCardBg: {
    position: 'absolute',
    top: '-30%',
    left: '-25%',
    width: '150%',
    height: '160%',
    opacity: 0.1,
    transform: [{ rotate: '-8deg' }],
  },
  confettiDot: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#7FD8C4',
  },
  confettiDotOne: {
    width: 14,
    height: 14,
    top: 42,
    left: 44,
    opacity: 0.55,
  },
  confettiDotTwo: {
    width: 8,
    height: 8,
    top: 34,
    right: 66,
    opacity: 0.7,
  },
  confettiDotThree: {
    width: 10,
    height: 10,
    top: 118,
    right: 40,
    opacity: 0.5,
  },
  confettiDotFour: {
    width: 7,
    height: 7,
    top: 150,
    left: 52,
    opacity: 0.6,
  },
  confettiDotFive: {
    width: 5,
    height: 5,
    top: 96,
    left: 30,
    opacity: 0.45,
  },
  congratsBadgeOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#35BE9D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 34,
  },
  congratsBadgeInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  congratsTitle: {
    fontSize: 26,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#3BA697',
    marginBottom: 10,
    textAlign: 'center',
  },
  congratsSubtitle: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: '#212121',
    textAlign: 'center',
    lineHeight: 20,
  },
  doneButton: {
    alignSelf: 'stretch',
    backgroundColor: '#4DA69F',
    borderRadius: 100,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  successModalSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '92%',
    backgroundColor: '#F9F9FE',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  modalHandle: {
    width: 56,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#E4E7ED',
    alignSelf: 'center',
    marginTop: 10,
  },
  successHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 8,
  },
  headerIconButton: {
    padding: 4,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTextMain: {
    fontSize: 22,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E3A60',
    marginLeft: 4,
  },
  logoTextSub: {
    fontSize: 9,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#49739B',
    letterSpacing: 2,
    marginTop: -2,
  },
  successScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  successBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  circularSuccessRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#59A699',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#45A096',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  successHeadlineText: {
    fontSize: 22,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
    textAlign: 'center',
  },
  successSubheadText: {
    fontSize: 14,
    color: '#7D8797',
    fontFamily: FONT.regular,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#E0E4F0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F2F7',
  },
  itemsSection: {
    width: '100%',
  },
  invoiceItemRowLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  itemInfoLeft: {
    flex: 1,
  },
  invoiceItemNameText: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#2D3142',
    marginBottom: 4,
  },
  invoiceItemQtyText: {
    fontSize: 13,
    color: '#8A94A6',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  invoiceItemPriceText: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#2D3142',
    textAlign: 'right',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#ECEFF3',
    marginVertical: 12,
  },
  costBreakdownSection: {
    width: '100%',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 2,
  },
  costRowTotal: {
    marginTop: 6,
  },
  costLabel: {
    fontSize: 14,
    color: '#8A94A6',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  costValue: {
    fontSize: 15,
    color: '#2D3142',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  costTotalLabel: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E3A60',
  },
  costTotalValue: {
    fontSize: 20,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1E3A60',
  },
  backToShopButton: {
    backgroundColor: '#45A096',
    width: '100%',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 4,
    shadowColor: '#45A096',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  backToShopButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
