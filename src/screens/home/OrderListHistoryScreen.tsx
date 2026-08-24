import {useCallback, useState} from 'react';
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
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {ordersApi, type Order} from '../../api/orders';
import {ApiError} from '../../api/client';
import {
  formatBdt,
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
} from '../../utils/pharmacyHelpers';
import {NotificationBell} from '../../components/NotificationBell';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderListHistory'>;

const {width} = Dimensions.get('window');

export function OrderListHistoryScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ordersApi.list();
      setOrders(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load orders';
      Alert.alert('Orders', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

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

        <NotificationBell
          style={styles.headerIconButton}
          color="#333333"
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Order List</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollCanvasContent, {paddingBottom: insets.bottom + 24}]}>
        {loading ? (
          <ActivityIndicator color="#45A096" style={styles.loader} />
        ) : orders.length === 0 ? (
          <Text style={styles.emptyText}>No orders yet.</Text>
        ) : (
          orders.map(order => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('OrderTracking', {orderId: order.id})}>
              <View style={styles.orderCardTop}>
                <Text style={styles.orderIdText}>{order.orderNumber}</Text>
                <Text style={[styles.statusText, {color: ORDER_STATUS_COLOR[order.status] ?? '#45A096'}]}>
                  {ORDER_STATUS_LABEL[order.status] ?? order.status}
                </Text>
              </View>
              <View style={styles.orderCardBottom}>
                <Text style={styles.itemsCountText}>
                  {order.items.length} Item{order.items.length === 1 ? '' : 's'}
                </Text>
                <Text style={styles.priceText}>{formatBdt(Number(order.total))}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  logoTextMain: {fontSize: 22, fontFamily: FONT.semibold, fontWeight: '600', color: '#1E3A60', marginLeft: 4},
  logoTextSub: {fontSize: 9, fontFamily: FONT.semibold, fontWeight: '600', color: '#49739B', letterSpacing: 2, marginTop: -2},
  titleContainer: {alignItems: 'center', marginTop: 24, marginBottom: 16},
  screenTitle: {fontSize: 20, fontFamily: FONT.semibold, fontWeight: '600', color: '#333333'},
  scrollCanvasContent: {paddingHorizontal: 20, paddingTop: 8},
  loader: {marginVertical: 32},
  emptyText: {textAlign: 'center', color: '#8A94A6', marginTop: 24},
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEFF7',
  },
  orderCardTop: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
  orderIdText: {fontSize: 15, fontFamily: FONT.semibold, fontWeight: '600', color: '#212529'},
  statusText: {fontSize: 13, fontFamily: FONT.semibold, fontWeight: '600'},
  orderCardBottom: {flexDirection: 'row', justifyContent: 'space-between'},
  itemsCountText: {fontSize: 13, color: '#7D8797'},
  priceText: {fontSize: 14, fontFamily: FONT.semibold, fontWeight: '600', color: '#45A096'},
});
