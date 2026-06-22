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
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';

type Props = NativeStackScreenProps<RootStackParamList, 'APayments'>;

type PaymentStatus = 'Paid' | 'failed';

type InvoiceRecord = {
  orderId: string;
  name: string;
  date: string;
  amount: string;
  status: PaymentStatus;
};

const MOCK_INVOICES: InvoiceRecord[] = [
  {orderId: '#RK123457', name: 'Rayhan Ullah', date: '01 May 2026', amount: '1250', status: 'Paid'},
  {orderId: '#RK123457', name: 'Rayhan Ullah', date: '01 May 2026', amount: '1250', status: 'Paid'},
  {orderId: '#RK123457', name: 'Rayhan Ullah', date: '01 May 2026', amount: '1250', status: 'failed'},
  {orderId: '#RK123457', name: 'Rayhan Ullah', date: '01 May 2026', amount: '1250', status: 'Paid'},
  {orderId: '#RK123457', name: 'Rayhan Ullah', date: '01 May 2026', amount: '1250', status: 'Paid'},
];

function InvoiceCard({item, isLast}: {item: InvoiceRecord; isLast: boolean}) {
  const isPaid = item.status === 'Paid';

  return (
    <View style={[styles.invoiceRowItem, isLast && styles.invoiceRowItemLast]}>
      <View style={styles.invoiceMetaHeaderRow}>
        <Text style={styles.orderIdText}>{item.orderId}</Text>
        <Text style={styles.amountText}>tk {item.amount}</Text>
      </View>

      <View style={styles.cardBodyRow}>
        <Image
          source={{uri: 'https://via.placeholder.com/52/E2E8F0/000000?text=User'}}
          style={styles.userAvatar}
        />
        <View style={styles.detailsColumn}>
          <Text style={styles.userNameText}>{item.name}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>

        <View style={[styles.statusBadge, isPaid ? styles.badgePaid : styles.badgeFailed]}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );
}

export function AdminPaymentsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color="#1A1C1E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: 85 + insets.bottom},
        ]}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#9AA6B2" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9AA6B2"
            style={styles.searchInput}
          />
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialCommunityIcons name="tune" size={20} color="#4E929D" />
          </TouchableOpacity>
        </View>

        <View style={styles.recordsContainerCard}>
          {MOCK_INVOICES.map((invoice, index) => (
            <InvoiceCard
              key={`${invoice.orderId}-${index}`}
              item={invoice}
              isLast={index === MOCK_INVOICES.length - 1}
            />
          ))}
        </View>
      </ScrollView>

      <AdminBottomNav activeTab="payments" bottomInset={insets.bottom} navigation={navigation} />
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
    paddingBottom: 14,
    backgroundColor: '#F9FAFC',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1E',
    flex: 1,
    marginLeft: 12,
  },
  headerButton: {
    padding: 2,
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 20,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    color: '#1A1C1E',
  },
  recordsContainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    paddingTop: 4,
    paddingBottom: 4,
  },
  invoiceRowItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
  },
  invoiceRowItemLast: {
    borderBottomWidth: 0,
  },
  invoiceMetaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333D47',
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333D47',
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  detailsColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  userNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  dateText: {
    fontSize: 12,
    color: '#7E8B97',
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgePaid: {
    backgroundColor: '#00A884',
  },
  badgeFailed: {
    backgroundColor: '#FF9800',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
