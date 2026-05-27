import {useState} from 'react';
import {
  Dimensions,
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

type Props = NativeStackScreenProps<RootStackParamList, 'CartCheckoutDetails'>;

const {width} = Dimensions.get('window');

const ORDER_SUMMARY_ITEMS = [
  {id: '1', name: 'Thyrox 50mg Tablet', qty: 1, price: '৳10.00'},
  {id: '2', name: 'Sergel 20mg Capsule', qty: 1, price: '৳7.00'},
  {id: '3', name: 'Ace 500mg Tablet', qty: 2, price: '৳10.00'},
];

export function CartCheckoutDetailsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);

  const handleModalNavigation = (
    route:
      | 'Home'
      | 'PharmacyShop'
      | 'MedicineList'
      | 'ReportsList'
      | 'MyProfile'
      | 'Notifications'
      | 'OrderTracking'
      | 'OrderListHistory',
  ) => {
    setIsOrderSuccessOpen(false);
    navigation.navigate(route);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Cart Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollCanvasContent, {paddingBottom: 140 + insets.bottom}]}>
        <View style={styles.checkoutMainCard}>
          <View style={styles.sectionBlock}>
            {ORDER_SUMMARY_ITEMS.map(item => (
              <View key={item.id} style={styles.productRowLine}>
                <View style={styles.productInfoLeft}>
                  <Text style={styles.productNameText}>{item.name}</Text>
                  <Text style={styles.productQtyText}>Qty: {item.qty}</Text>
                </View>
                <Text style={styles.productPriceText}>{item.price}</Text>
              </View>
            ))}
          </View>

          <View style={styles.horizontalDivider} />

          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons
                name="truck-delivery-outline"
                size={22}
                color="#45A096"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionHeadingTitle}>Home Delivery</Text>
              <TouchableOpacity
                style={styles.mapSelectButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AddressMapPicker')}>
                <Feather name="map-pin" size={14} color="#45A096" />
                <Text style={styles.mapSelectText}>Select on map</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Village</Text>
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.textInput}
                  defaultValue="Mokimpur"
                  placeholderTextColor="#A0A5BA"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Post Office</Text>
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.textInput}
                  defaultValue="Mokimpur"
                  placeholderTextColor="#A0A5BA"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Upazila</Text>
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.textInput}
                  defaultValue="Haripur"
                  placeholderTextColor="#A0A5BA"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>District</Text>
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.textInput}
                  defaultValue="Thakurgaon"
                  placeholderTextColor="#A0A5BA"
                />
              </View>
            </View>
          </View>

          <View style={styles.horizontalDivider} />

          <View style={[styles.sectionBlock, styles.summaryBlock]}>
            <View style={styles.summaryCostRow}>
              <Text style={styles.summaryLabelText}>Subtotal</Text>
              <Text style={styles.summaryValueText}>৳27.00</Text>
            </View>

            <View style={styles.summaryCostRow}>
              <Text style={styles.summaryLabelText}>Delivery charge</Text>
              <Text style={styles.summaryValueText}>৳45.00</Text>
            </View>

            <View style={[styles.summaryCostRow, styles.totalRow]}>
              <Text style={styles.totalLabelText}>Total</Text>
              <Text style={styles.totalValueText}>৳72.00</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            activeOpacity={0.9}
            onPress={() => setIsOrderSuccessOpen(true)}>
            <Text style={styles.confirmButtonText}>Confirm Order</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.bottomTabBar, {paddingBottom: 12 + insets.bottom}]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('PharmacyShop')}>
          <MaterialCommunityIcons name="clippy" size={24} color="#45A096" />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Pharmacy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MedicineList')}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Medication</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ReportsList')}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MyProfile')}>
          <Feather name="user" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Profile</Text>
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

          <View style={[styles.successHeaderContainer, {paddingTop: 8}]}>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => setIsOrderSuccessOpen(false)}>
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
            contentContainerStyle={styles.successScrollCanvasContent}>
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
                      <Text style={styles.invoiceItemQtyText}>Qty: {item.qty}</Text>
                    </View>
                    <Text style={styles.invoiceItemPriceText}>{item.price}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.horizontalDivider} />

              <View style={styles.costBreakdownSection}>
                <View style={styles.summaryCostRow}>
                  <Text style={styles.summaryLabelText}>Subtotal</Text>
                  <Text style={styles.summaryValueText}>৳27.00</Text>
                </View>

                <View style={styles.summaryCostRow}>
                  <Text style={styles.summaryLabelText}>Delivery charge</Text>
                  <Text style={styles.summaryValueText}>৳45.00</Text>
                </View>

                <View style={[styles.summaryCostRow, {marginTop: 6}]}>
                  <Text style={styles.totalLabelText}>Total</Text>
                  <Text style={styles.totalValueText}>৳72.00</Text>
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

          <View style={[styles.bottomTabBar, styles.successBottomTabs]}>
            <TouchableOpacity style={styles.tabItem} onPress={() => handleModalNavigation('Home')}>
              <Feather name="home" size={24} color="#A0A5BA" />
              <Text style={styles.tabLabel}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => handleModalNavigation('PharmacyShop')}>
              <MaterialCommunityIcons name="clippy" size={24} color="#45A096" />
              <Text style={[styles.tabLabel, styles.activeTabLabel]}>Pharmacy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => handleModalNavigation('MedicineList')}>
              <MaterialCommunityIcons name="heart-pulse" size={24} color="#A0A5BA" />
              <Text style={styles.tabLabel}>Medication</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => handleModalNavigation('ReportsList')}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color="#A0A5BA" />
              <Text style={styles.tabLabel}>Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => handleModalNavigation('MyProfile')}>
              <Feather name="user" size={24} color="#A0A5BA" />
              <Text style={styles.tabLabel}>Profile</Text>
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
    backgroundColor: '#F9F9FE',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F9F9FE',
  },
  backButton: {
    padding: 2,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  headerSpacer: {
    width: 28,
  },
  scrollCanvasContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  checkoutMainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 16,
    shadowColor: '#E0E4F0',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#ECEFF7',
  },
  sectionBlock: {
    width: '100%',
  },
  productRowLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  productInfoLeft: {
    flex: 1,
  },
  productNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3142',
    marginBottom: 4,
  },
  productQtyText: {
    fontSize: 13,
    color: '#8A94A6',
    fontWeight: '500',
  },
  productPriceText: {
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionHeadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A60',
  },
  mapSelectButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#72C1B6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  mapSelectText: {
    fontSize: 12,
    color: '#45A096',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    color: '#8A94A6',
    fontWeight: '500',
    marginBottom: 6,
    paddingLeft: 2,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2F7',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
    padding: 0,
  },
  summaryBlock: {
    marginBottom: 12,
  },
  summaryCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 2,
  },
  summaryLabelText: {
    fontSize: 14,
    color: '#8A94A6',
    fontWeight: '500',
  },
  summaryValueText: {
    fontSize: 15,
    color: '#2D3142',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 4,
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
  confirmButton: {
    backgroundColor: '#45A096',
    width: '100%',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
    shadowColor: '#45A096',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
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
  successScrollCanvasContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 160,
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
  costBreakdownSection: {
    width: '100%',
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
  successBottomTabs: {
    backgroundColor: '#FFFFFF',
  },
});
