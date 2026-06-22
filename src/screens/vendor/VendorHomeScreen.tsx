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
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {VendorBottomNav} from './VendorBottomNav';

type Props = NativeStackScreenProps<RootStackParamList, 'VHome'>;

export function VendorHomeScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  const renderInventoryItem = (index: number) => (
    <View key={index} style={styles.inventoryCard}>
      <Image
        source={{uri: 'https://via.placeholder.com/80x60/ECEFF3/000000?text=Medicine'}}
        style={styles.inventoryImage}
      />
      <View style={styles.inventoryDetails}>
        <Text style={styles.itemTitle}>Aamdocal Plus 50</Text>
        <Text style={styles.itemMetaText}>Generic: Amlodipine Besylate</Text>
        <Text style={styles.itemMetaText}>In Stock: 156 Boxes</Text>
        <Text style={styles.itemPriceText}>
          Price: Tk 120/box <Text style={styles.discountText}>(-5%)</Text>
        </Text>

        <View style={styles.tagBadge}>
          <FontAwesome5 name="capsules" size={10} color="#7E8B97" />
          <Text style={styles.tagBadgeText}>Medicines</Text>
        </View>
      </View>

      <View style={styles.statusToggleActive}>
        <View style={styles.statusToggleInner} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}>
          <Feather name="menu" size={24} color="#1A1C1E" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoTextMain}>+ Cholbe</Text>
          <Text style={styles.logoTextSub}>PHARMACY</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color="#1A1C1E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: 80 + insets.bottom},
        ]}>
        <View style={styles.merchantHeaderCard}>
          <View style={styles.merchantIconContainer}>
            <MaterialCommunityIcons name="storefront-outline" size={28} color="#4E929D" />
          </View>
          <View style={styles.merchantInfoText}>
            <Text style={styles.merchantName}>Cholbe Pharmacy (Uttara)</Text>
            <Text style={styles.merchantMeta}>Merchant ID: CPV-001</Text>
            <Text style={styles.merchantMeta}>Opening Hours: 09:00 AM - 11:00 PM</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={[styles.metricLabel, styles.metricLabelRevenue]}>Total Revenue Today</Text>
            <Text style={styles.metricValue}>Tk15,000</Text>
            <Text style={[styles.metricSub, styles.metricSubPositive]}>(0%)</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={[styles.metricLabel, styles.metricLabelOrders]}>Total Orders Today</Text>
            <Text style={styles.metricValue}>24</Text>
            <Text style={styles.metricSub}>(2 pending)</Text>
          </View>
        </View>

        <View style={[styles.metricsGrid, styles.metricsGridSpaced]}>
          <View style={styles.metricBox}>
            <Text style={[styles.metricLabel, styles.metricLabelLowStock]}>Low Stock Items</Text>
            <Text style={styles.metricValue}>5</Text>
            <Text style={[styles.metricSub, styles.metricLabelLowStock]}>Need Attention</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={[styles.metricLabel, styles.metricLabelOutStock]}>Out of Stock Items</Text>
            <Text style={styles.metricValue}>2</Text>
            <Text style={styles.metricSub}> </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addProductBtn} activeOpacity={0.9}>
          <Feather name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addProductBtnText}>Add New Product</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Inventory List</Text>
          <TouchableOpacity
            style={styles.viewAllRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('VInventory')}>
            <Text style={styles.viewAllText}>View All</Text>
            <Feather name="chevron-right" size={14} color="#7E8B97" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#9AA6B2" />
          <TextInput placeholder="Search" placeholderTextColor="#9AA6B2" style={styles.searchInput} />
          <MaterialCommunityIcons name="tune" size={18} color="#4E929D" />
        </View>

        {[1, 2, 3, 4].map(id => renderInventoryItem(id))}

        <View style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
          <Text style={styles.sectionTitle}>Recent Order Requests</Text>
          <TouchableOpacity
            style={styles.viewAllRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('VOrders')}>
            <Text style={styles.viewAllText}>View All</Text>
            <Feather name="chevron-right" size={14} color="#7E8B97" />
          </TouchableOpacity>
        </View>

        <View style={styles.orderRequestCard}>
          <Text style={styles.customerName}>Customer : Habibur Rahman</Text>
          <Text style={styles.orderMetaText}>Order ID: #RK123456</Text>
          <Text style={styles.orderMetaText}>Phone: 01677589448</Text>
          <Text style={styles.orderMetaText}>
            Delivery Location : House 14 Road 06, Uttara Sector 12, Dhaka North, Dhaka
          </Text>

          <View style={styles.orderProductRow}>
            <Image
              source={{uri: 'https://via.placeholder.com/60/ECEFF3'}}
              style={styles.orderProductImage}
            />
            <View style={styles.orderProductInfo}>
              <Text style={styles.orderProductTitle}>Aamdocal Plus 50</Text>
              <Text style={styles.itemMetaText}>Generic: Amlodipine Besylate</Text>
              <Text style={styles.statusLabelPending}>Status: Pending</Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.btnAccept]} activeOpacity={0.85}>
              <Feather name="check-circle" size={14} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.btnDecline]} activeOpacity={0.85}>
              <Feather name="x-circle" size={14} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Declined</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.orderRequestCard}>
          <Text style={styles.customerName}>Customer : Rahman Uddin</Text>
          <Text style={styles.orderMetaText}>Order ID: #RK123458</Text>
          <Text style={styles.orderMetaText}>Phone: 01677589448</Text>
          <Text style={styles.orderMetaText}>
            Delivery Location : House 14 Road 06, Uttara Sector 12, Dhaka North, Dhaka
          </Text>

          <View style={styles.orderProductRow}>
            <Image
              source={{uri: 'https://via.placeholder.com/60/ECEFF3'}}
              style={styles.orderProductImage}
            />
            <View style={styles.orderProductInfo}>
              <Text style={styles.orderProductTitle}>Aamdocal Plus 50</Text>
              <Text style={styles.itemMetaText}>Generic: Amlodipine Besylate</Text>
              <Text style={styles.statusLabelAccepted}>Status: Accepted</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.readyPickupBtn} activeOpacity={0.85}>
            <MaterialCommunityIcons name="hammer-wrench" size={14} color="#4E929D" />
            <Text style={styles.readyPickupBtnText}>Ready for Pickup</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <VendorBottomNav activeTab="home" bottomInset={insets.bottom} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  scrollContent: {
    paddingTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#ECEFF3',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoTextMain: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3F8694',
  },
  logoTextSub: {
    fontSize: 8,
    letterSpacing: 2,
    color: '#7E8B97',
    fontWeight: '600',
    marginTop: -2,
  },
  merchantHeaderCard: {
    flexDirection: 'row',
    backgroundColor: '#E6F3F5',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  merchantIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  merchantInfoText: {
    flex: 1,
  },
  merchantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  merchantMeta: {
    fontSize: 11,
    color: '#5C6470',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  metricsGridSpaced: {
    marginTop: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricLabelRevenue: {
    color: '#4E929D',
  },
  metricLabelOrders: {
    color: '#8B4F4F',
  },
  metricLabelLowStock: {
    color: '#E26D6D',
  },
  metricLabelOutStock: {
    color: '#F37021',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1C1E',
    marginTop: 6,
  },
  metricSub: {
    fontSize: 10,
    color: '#7E8B97',
    marginTop: 2,
    fontWeight: '500',
  },
  metricSubPositive: {
    color: '#00A884',
  },
  addProductBtn: {
    backgroundColor: '#4E929D',
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 18,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addProductBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderSpaced: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
    color: '#1A1C1E',
  },
  inventoryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  inventoryImage: {
    width: 70,
    height: 60,
    borderRadius: 6,
    resizeMode: 'contain',
    marginRight: 12,
  },
  inventoryDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  itemMetaText: {
    fontSize: 11,
    color: '#7E8B97',
    marginTop: 1,
  },
  itemPriceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1C1E',
    marginTop: 2,
  },
  discountText: {
    color: '#E26D6D',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0F3F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
    gap: 4,
  },
  tagBadgeText: {
    fontSize: 10,
    color: '#7E8B97',
    fontWeight: '500',
  },
  statusToggleActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#47B39D',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  statusToggleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#47B39D',
  },
  orderRequestCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333D47',
    marginBottom: 4,
  },
  orderMetaText: {
    fontSize: 11,
    color: '#5C6470',
    lineHeight: 15,
    marginTop: 1,
  },
  orderProductRow: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  orderProductImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    resizeMode: 'contain',
    marginRight: 10,
  },
  orderProductInfo: {
    flex: 1,
  },
  orderProductTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  statusLabelPending: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F37021',
    marginTop: 2,
  },
  statusLabelAccepted: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00A884',
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    height: 34,
    borderRadius: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnAccept: {
    backgroundColor: '#47B39D',
  },
  btnDecline: {
    backgroundColor: '#E26D6D',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  readyPickupBtn: {
    borderWidth: 1,
    borderColor: '#4E929D',
    height: 34,
    borderRadius: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#E6F3F5',
    gap: 6,
  },
  readyPickupBtnText: {
    color: '#4E929D',
    fontSize: 12,
    fontWeight: '600',
  },
});
