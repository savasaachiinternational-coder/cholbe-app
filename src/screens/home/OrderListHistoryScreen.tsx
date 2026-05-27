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

type Props = NativeStackScreenProps<RootStackParamList, 'OrderListHistory'>;

const {width} = Dimensions.get('window');

const ORDER_HISTORY_DATA = [
  {
    id: '1',
    orderId: '#683949',
    itemsCount: '4 Items',
    status: 'On the Way',
    price: '৳72.00',
    statusColor: '#FF9F43',
  },
  {
    id: '2',
    orderId: '#683949',
    itemsCount: '4 Items',
    status: 'Preparing',
    price: '৳72.00',
    statusColor: '#45A096',
  },
  {
    id: '3',
    orderId: '#683949',
    itemsCount: '4 Items',
    status: 'Preparing',
    price: '৳72.00',
    statusColor: '#45A096',
  },
  {
    id: '4',
    orderId: '#683949',
    itemsCount: '4 Items',
    status: 'Preparing',
    price: '৳72.00',
    statusColor: '#45A096',
  },
];

export function OrderListHistoryScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <MaterialCommunityIcons name="medical-bag" size={20} color="#00A896" />
            <Text style={styles.logoTextMain}>Cholbe</Text>
          </View>
          <Text style={styles.logoTextSub}>PHARMACY</Text>
        </View>

        <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Order List</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollCanvasContent, {paddingBottom: 110 + insets.bottom}]}>
        {ORDER_HISTORY_DATA.map(order => (
          <View key={order.id} style={styles.orderHistoryCard}>
            <View style={styles.cardLeftContent}>
              <View style={styles.shoppingBagIconContainer}>
                <MaterialCommunityIcons name="shopping-outline" size={24} color="#7D8797" />
              </View>

              <View style={styles.metaTextGroup}>
                <Text style={styles.orderIdText}>{order.orderId}</Text>
                <Text style={styles.itemsCountText}>{order.itemsCount}</Text>
                <View style={styles.statusBadgeRow}>
                  <View style={[styles.statusIndicatorDot, {backgroundColor: order.statusColor}]} />
                  <Text style={[styles.statusLabelText, {color: order.statusColor}]}>{order.status}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardRightContent}>
              <Text style={styles.totalPriceText}>{order.price}</Text>
              <TouchableOpacity
                style={styles.detailsActionButton}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('OrderTracking')}>
                <Text style={styles.detailsButtonText}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F9F9FE'},
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerIconButton: {padding: 4},
  backButton: {padding: 4},
  logoContainer: {alignItems: 'center', justifyContent: 'center'},
  logoPlaceholder: {flexDirection: 'row', alignItems: 'center'},
  logoTextMain: {fontSize: 22, fontWeight: '700', color: '#1E3A60', marginLeft: 4},
  logoTextSub: {fontSize: 9, fontWeight: '600', color: '#49739B', letterSpacing: 2, marginTop: -2},
  titleContainer: {alignItems: 'center', marginTop: 24, marginBottom: 16},
  screenTitle: {fontSize: 20, fontWeight: '600', color: '#333333'},
  scrollCanvasContent: {paddingHorizontal: 20, paddingTop: 8},
  orderHistoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEFF7',
    shadowColor: '#E0E4F0',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeftContent: {flexDirection: 'row', alignItems: 'center', flex: 1},
  shoppingBagIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metaTextGroup: {justifyContent: 'center'},
  orderIdText: {fontSize: 16, fontWeight: '700', color: '#212529', marginBottom: 3},
  itemsCountText: {fontSize: 13, color: '#8A94A6', fontWeight: '400', marginBottom: 4},
  statusBadgeRow: {flexDirection: 'row', alignItems: 'center'},
  statusIndicatorDot: {width: 6, height: 6, borderRadius: 3, marginRight: 6},
  statusLabelText: {fontSize: 12, fontWeight: '600'},
  cardRightContent: {alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 56},
  totalPriceText: {fontSize: 16, fontWeight: '700', color: '#212529'},
  detailsActionButton: {
    borderWidth: 1,
    borderColor: '#72C1B6',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  detailsButtonText: {color: '#45A096', fontSize: 13, fontWeight: '600'},
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
