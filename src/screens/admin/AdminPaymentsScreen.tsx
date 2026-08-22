import {useCallback, useMemo, useState} from 'react';
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
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {adminApi} from '../../api/admin';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {AdminBottomNav} from './AdminBottomNav';
import {NotificationBell} from '../../components/NotificationBell';

type Props = NativeStackScreenProps<RootStackParamList, 'APayments'>;

// Proxima Nova per the Figma typography. Android resolves a weight by the exact
// font file name, so each weight is referenced by its own family name.
const FONT = {
  regular: 'ProximaNova-Regular',
  medium: 'ProximaNova-Medium',
  semibold: 'ProximaNova-Semibold',
  bold: 'ProximaNova-Bold',
} as const;

type PaymentStatus = 'Paid' | 'failed';

type ApiPayment = {
  id: string;
  amount: string | number;
  status: string;
  createdAt: string;
  order: {
    orderNumber: string;
    createdAt: string;
    customer: {fullName: string};
  };
};

type InvoiceRecord = {
  id: string;
  orderId: string;
  name: string;
  date: string;
  amount: string;
  status: PaymentStatus;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function mapPaymentStatus(status: string): PaymentStatus {
  return status === 'PAID' ? 'Paid' : 'failed';
}

function mapPayment(record: ApiPayment): InvoiceRecord {
  const amount =
    typeof record.amount === 'string' ? parseFloat(record.amount) : record.amount;
  return {
    id: record.id,
    orderId: `#${record.order.orderNumber}`,
    name: record.order.customer.fullName,
    date: formatDate(record.order.createdAt ?? record.createdAt),
    amount: String(Math.round(amount || 0)),
    status: mapPaymentStatus(record.status),
  };
}

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
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.payments();
      setInvoices((data as ApiPayment[]).map(mapPayment));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load payments';
      Alert.alert('Payments', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [loadPayments]),
  );

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      i =>
        i.orderId.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q) ||
        i.amount.includes(q),
    );
  }, [invoices, search]);

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
        <NotificationBell
          style={styles.headerButton}
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: 85 + insets.bottom},
        ]}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={24} color="#9E9E9E" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9E9E9E"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialCommunityIcons name="tune" size={22} color="#4DA69F" />
          </TouchableOpacity>
        </View>

        <View style={styles.recordsContainerCard}>
          {loading ? (
            <ActivityIndicator color="#4E929D" style={styles.loader} />
          ) : filteredInvoices.length === 0 ? (
            <Text style={styles.emptyText}>No payments found.</Text>
          ) : (
            filteredInvoices.map((invoice, index) => (
              <InvoiceCard
                key={invoice.id}
                item={invoice}
                isLast={index === filteredInvoices.length - 1}
              />
            ))
          )}
        </View>
      </ScrollView>

      <AdminBottomNav activeTab="payments" bottomInset={insets.bottom} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F0FC',
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
    backgroundColor: '#F3F0FC',
  },
  // Figma H6/bold: Proxima Nova 18px / 600 / 120%, Greyscale-800.
  headerTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 22,
    color: '#424242',
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
    backgroundColor: '#F5F4FD',
    marginHorizontal: 16,
    borderRadius: 40,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 24,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONT.regular,
    padding: 0,
    color: '#212121',
  },
  // Figma: 24px 16px padding, 12px gap, 8px radius, 1px #E6E3EE,
  // Card/Shadow 1 = 0 4px 60px rgba(4, 6, 15, .08).
  recordsContainerCard: {
    backgroundColor: '#F3F2FB',
    borderRadius: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E6E3EE',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 12,
    minHeight: 120,
    shadowColor: '#04060F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 2,
  },
  loader: {marginVertical: 32},
  emptyText: {
    textAlign: 'center',
    color: '#9AA6B2',
    fontSize: 14,
    paddingVertical: 32,
  },
  invoiceRowItem: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  invoiceRowItemLast: {
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  invoiceMetaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Figma body/small/medium: 12px / 600, 0.2px tracking, Greyscale-800.
  orderIdText: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: '#424242',
  },
  amountText: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
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
  // Figma H6/bold: 18px / 600 / 120%, Greyscale-800.
  userNameText: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 22,
    color: '#424242',
  },
  // Figma body/small/regular: 12px / 400, 0.2px tracking, Greyscale-700.
  dateText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#616161',
    fontWeight: '400',
    letterSpacing: 0.2,
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
  // Figma: 10px / 600 / 110%, 0.2px tracking, Primary-100.
  statusBadgeText: {
    color: '#EDF7F6',
    fontSize: 10,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    lineHeight: 11,
    letterSpacing: 0.2,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});
