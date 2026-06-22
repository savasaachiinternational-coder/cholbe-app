import {useState, type ReactNode} from 'react';
import {
  Modal,
  Pressable,
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

type Props = NativeStackScreenProps<RootStackParamList, 'CartPayment'>;
type PaymentMethod = 'COD' | 'bKash' | 'Nagad' | 'Card';

const ORDER_SUMMARY_ITEMS = [
  {id: '1', name: 'Cetirizine 10 mg', qty: 5, price: '৳800.00'},
  {id: '2', name: 'Delivery Charge', qty: 1, price: '৳30.00'},
];

export function CartPaymentScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('COD');
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);

  const paymentMethods: {key: PaymentMethod; label: string; icon: ReactNode}[] = [
    {
      key: 'COD',
      label: 'Cash on Delivery',
      icon: <MaterialCommunityIcons name="handshake-outline" size={20} color="#1A1C1E" />,
    },
    {
      key: 'bKash',
      label: 'bkash',
      icon: (
        <View style={[styles.brandIconMock, {backgroundColor: '#E2136E'}]}>
          <Text style={styles.brandIconText}>b</Text>
        </View>
      ),
    },
    {
      key: 'Nagad',
      label: 'Nagad',
      icon: (
        <View style={[styles.brandIconMock, {backgroundColor: '#F37021'}]}>
          <Text style={styles.brandIconText}>n</Text>
        </View>
      ),
    },
    {
      key: 'Card',
      label: 'Card',
      icon: <MaterialCommunityIcons name="credit-card-plus-outline" size={20} color="#1A1C1E" />,
    },
  ];

  const handleModalNavigation = (
    route: 'Notifications' | 'OrderListHistory',
  ) => {
    setIsOrderSuccessOpen(false);
    navigation.navigate(route);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
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
              onPress={() => setSelectedMethod(method.key)}>
              <View style={styles.methodLeft}>
                {method.icon}
                <Text style={styles.methodName}>{method.label}</Text>
              </View>
              <MaterialCommunityIcons
                name={selectedMethod === method.key ? 'radiobox-marked' : 'radiobox-blank'}
                size={20}
                color={selectedMethod === method.key ? '#00A884' : '#7E8B97'}
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
            />
          </View>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.orderSummaryTitleRow}>
            <MaterialCommunityIcons name="text-box-search-outline" size={18} color="#1A1C1E" />
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
          </View>

          <View style={styles.invoiceRowSpaced}>
            <Text style={styles.invoiceLabelMain}>Subtotal</Text>
            <Text style={styles.invoiceValueMain}>৳ 800</Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabelStandard}>Delivery Charge</Text>
            <Text style={styles.invoiceValueStandard}>৳ 30</Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabelStandard}>VAT</Text>
            <Text style={styles.invoiceValueStandard}>৳ 00</Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabelStandard}>Promo Code</Text>
            <Text style={[styles.invoiceValueStandard, styles.promoValue]}>৳ 00</Text>
          </View>
        </View>

        <Text style={styles.termsAgreementText}>
          By completing this order , I agree to all{' '}
          <Text style={styles.underlineText}>terms & condition .</Text>
        </Text>
      </ScrollView>

      <View style={[styles.stickyFooterContainer, {paddingBottom: Math.max(insets.bottom, 16)}]}>
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

        <TouchableOpacity
          style={styles.confirmOrderBtn}
          activeOpacity={0.9}
          onPress={() => setIsOrderSuccessOpen(true)}>
          <Text style={styles.confirmOrderBtnText}>Confirm Order</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isOrderSuccessOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOrderSuccessOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setIsOrderSuccessOpen(false)} />

        <View style={[styles.successModalSheet, {paddingBottom: insets.bottom}]}>
          <View style={styles.modalHandle} />

          <View style={styles.successHeaderContainer}>
            <TouchableOpacity
              style={styles.headerButton}
              activeOpacity={0.7}
              onPress={() => setIsOrderSuccessOpen(false)}>
              <Feather name="chevron-left" size={28} color="#333333" />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <MaterialCommunityIcons name="medical-bag" size={20} color="#00A896" />
                <Text style={styles.logoTextMain}>Cholbe</Text>
              </View>
              <Text style={styles.logoTextSub}>PHARMACY</Text>
            </View>

            <TouchableOpacity
              style={styles.headerIconButton}
              activeOpacity={0.7}
              onPress={() => handleModalNavigation('Notifications')}>
              <Feather name="bell" size={24} color="#333333" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.successScrollContent}>
            <View style={styles.successBadgeContainer}>
              <View style={styles.circularSuccessRing}>
                <Feather name="check" size={36} color="#FFFFFF" />
              </View>
              <Text style={styles.successHeadlineText}>Order Placed</Text>
              <Text style={styles.successSubheadText}>Your order has been placed successfully</Text>
            </View>

            <View style={styles.summaryDetailsCard}>
              <View style={styles.itemsSection}>
                {ORDER_SUMMARY_ITEMS.map(item => (
                  <View key={item.id} style={styles.invoiceItemRowLine}>
                    <View style={styles.itemInfoLeft}>
                      <Text style={styles.invoiceItemNameText}>{item.name}</Text>
                      {item.id === '1' && (
                        <Text style={styles.invoiceItemQtyText}>Qty: {item.qty}</Text>
                      )}
                    </View>
                    <Text style={styles.invoiceItemPriceText}>{item.price}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.dividerLine} />

              <View style={styles.costBreakdownSection}>
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Subtotal</Text>
                  <Text style={styles.costValue}>৳800.00</Text>
                </View>
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Delivery charge</Text>
                  <Text style={styles.costValue}>৳30.00</Text>
                </View>
                <View style={[styles.costRow, styles.costRowTotal]}>
                  <Text style={styles.costTotalLabel}>Total</Text>
                  <Text style={styles.costTotalValue}>৳830.00</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.backToShopButton}
                activeOpacity={0.9}
                onPress={() => handleModalNavigation('OrderListHistory')}>
                <Text style={styles.backToShopButtonText}>Track Order</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    backgroundColor: '#4E929D',
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
  stepTextActive: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  stepLabel: {
    fontSize: 11,
    color: '#4F5E6D',
    marginTop: 6,
    fontWeight: '500',
  },
  deliveryNotice: {
    fontSize: 13,
    color: '#4F5E6D',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
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
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333D47',
    marginBottom: 14,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECEFF3',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 12,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodName: {
    fontSize: 14,
    color: '#333D47',
    fontWeight: '600',
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
    fontWeight: 'bold',
  },
  instructionSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  instructionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333D47',
    marginBottom: 8,
  },
  inputFieldBox: {
    backgroundColor: '#ECEFF3',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textInputStyle: {
    fontSize: 13,
    color: '#1A1C1E',
    padding: 0,
  },
  orderSummaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF3',
    paddingBottom: 10,
    marginBottom: 4,
    gap: 6,
  },
  orderSummaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333D47',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  invoiceRowSpaced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    marginTop: 8,
  },
  invoiceLabelMain: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  invoiceValueMain: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  invoiceLabelStandard: {
    fontSize: 13,
    color: '#4F5E6D',
    fontWeight: '500',
  },
  invoiceValueStandard: {
    fontSize: 14,
    color: '#1A1C1E',
    fontWeight: '600',
  },
  promoValue: {
    color: '#E26D6D',
  },
  termsAgreementText: {
    fontSize: 11,
    color: '#7E8B97',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
  stickyFooterContainer: {
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
    marginBottom: 16,
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
  confirmOrderBtn: {
    backgroundColor: '#4E929D',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 28, 35, 0.4)',
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
    fontWeight: '700',
    color: '#1E3A60',
    marginLeft: 4,
  },
  logoTextSub: {
    fontSize: 9,
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
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  successHeadlineText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 6,
    textAlign: 'center',
  },
  successSubheadText: {
    fontSize: 14,
    color: '#7D8797',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#E0E4F0',
    shadowOffset: {width: 0, height: 8},
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
    fontWeight: '600',
    color: '#2D3142',
    marginBottom: 4,
  },
  invoiceItemQtyText: {
    fontSize: 13,
    color: '#8A94A6',
    fontWeight: '500',
  },
  invoiceItemPriceText: {
    fontSize: 16,
    fontWeight: '700',
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
    fontWeight: '500',
  },
  costValue: {
    fontSize: 15,
    color: '#2D3142',
    fontWeight: '600',
  },
  costTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A60',
  },
  costTotalValue: {
    fontSize: 20,
    fontWeight: '800',
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
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  backToShopButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
