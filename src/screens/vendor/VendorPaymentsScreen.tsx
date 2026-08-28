import {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
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
import {vendorApi} from '../../api/vendor';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {VendorBottomNav} from './VendorBottomNav';
import {NotificationBell} from '../../components/NotificationBell';
import {AvatarImage} from '../../components/AvatarImage';
import { FONT } from '../../theme/typography';
import {
  PAYMENT_DATE_FILTERS,
  PAYMENT_STATUS_FILTERS,
  type PaymentDateFilter,
  type PaymentStatusFilter,
} from './vendorNav';

type Props = NativeStackScreenProps<RootStackParamList, 'VPayments'>;

// Proxima Nova per the Figma typography. Android resolves a weight by the exact
// font file name, so each weight is referenced by its own family name.
type PickerField = 'date' | 'status' | null;

type PickerConfig = {
  title: string;
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
};

type TransactionIconType = 'bkash' | 'nagad' | 'card' | 'cod' | 'fee';

type ApiPayment = {
  id: string;
  method: string;
  amount: string | number;
  status: string;
  createdAt: string;
  order?: {
    orderNumber: string;
    customer?: {fullName: string};
  };
};

type TransactionItem = {
  id: string;
  gateway: string;
  methodLabel: string;
  iconType: TransactionIconType;
  date: string;
  amount: string;
  isPositive: boolean;
  status: 'Paid' | 'Pending';
  isProcessing?: boolean;
};

function formatAmount(amount: string | number) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Number.isFinite(n)
    ? n.toLocaleString('en-BD', {maximumFractionDigits: 0})
    : '0';
}

function formatTxnDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function methodToIcon(method: string): TransactionIconType {
  if (method === 'BKASH') return 'bkash';
  if (method === 'NAGAD') return 'nagad';
  if (method === 'CARD') return 'card';
  return 'cod';
}

function methodToLabel(method: string) {
  if (method === 'BKASH') return 'bkash';
  if (method === 'NAGAD') return 'Nagad';
  if (method === 'CARD') return 'Credit Card';
  return 'Cash on Delivery';
}

function toTransaction(txn: ApiPayment): TransactionItem {
  return {
    id: txn.order?.orderNumber ?? txn.id,
    gateway: txn.order?.customer?.fullName ?? 'Order',
    methodLabel: methodToLabel(txn.method),
    iconType: methodToIcon(txn.method),
    date: formatTxnDate(txn.createdAt),
    amount: formatAmount(txn.amount),
    isPositive: true,
    status: txn.status === 'PAID' ? 'Paid' : 'Pending',
    isProcessing: txn.status === 'PENDING',
  };
}

function withinDateFilter(createdAt: string, filter: PaymentDateFilter) {
  if (filter === 'All Time') return true;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return true;
  const now = Date.now();
  const days =
    filter === 'Last 7 Days' ? 7 : filter === 'Last 30 Days' ? 30 : 90;
  return now - d.getTime() <= days * 24 * 60 * 60 * 1000;
}

function TransactionRow({item}: {item: TransactionItem}) {
  return (
    <View style={styles.transactionCard}>
      <AvatarImage style={styles.avatarImage} />

      <View style={styles.detailsBlock}>
        <Text style={styles.transactionIdText}>
          {item.id}|{item.gateway}
        </Text>
        <View style={styles.methodInlineRow}>
          {item.iconType === 'bkash' ? (
            <View style={[styles.miniBrandIcon, styles.bkashIcon]}>
              <Text style={styles.miniBrandText}>b</Text>
            </View>
          ) : null}
          {item.iconType === 'nagad' ? (
            <View style={[styles.miniBrandIcon, styles.nagadIcon]}>
              <Text style={styles.miniBrandText}>n</Text>
            </View>
          ) : null}
          {item.iconType === 'card' ? (
            <MaterialCommunityIcons name="credit-card-outline" size={14} color="#5C6470" />
          ) : null}
          {item.iconType === 'cod' ? (
            <MaterialCommunityIcons name="handshake-outline" size={14} color="#5C6470" />
          ) : null}

          <Text style={styles.methodLabelText}>{item.methodLabel}</Text>

          {item.iconType === 'fee' ? (
            <View style={styles.feeBadge}>
              <Text style={styles.feeBadgeText}>Service Fee</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>

      <View style={styles.rightStatusBlock}>
        <View
          style={[
            styles.statusBadge,
            item.status === 'Paid' ? styles.badgePaid : styles.badgePending,
          ]}>
          <Text
            style={[
              styles.statusBadgeText,
              item.status === 'Paid' ? styles.textPaid : styles.textPending,
            ]}>
            {item.status}
          </Text>
        </View>
        <Text style={styles.amountText}>
          {item.isPositive ? '+' : '-'}Tk {item.amount}
        </Text>
        {item.isProcessing ? (
          <Text style={styles.processingSubtext}>(Processing)</Text>
        ) : null}
      </View>
    </View>
  );
}

export function VendorPaymentsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [dateFilter, setDateFilter] = useState<PaymentDateFilter>('Last 7 Days');
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('All Statuses');
  const [activePicker, setActivePicker] = useState<PickerField>(null);
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vendorApi.payments();
      setPayments(data as ApiPayment[]);
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

  const earnings = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const sumInRange = (days: number) =>
      payments
        .filter(p => p.status === 'PAID' && now - new Date(p.createdAt).getTime() <= days * dayMs)
        .reduce((sum, p) => {
          const n = typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount;
          return sum + (Number.isFinite(n) ? n : 0);
        }, 0);

    const balance = payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => {
        const n = typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount;
        return sum + (Number.isFinite(n) ? n : 0);
      }, 0);

    return {
      balance,
      today: sumInRange(1),
      week: sumInRange(7),
      month: sumInRange(30),
    };
  }, [payments]);

  const pickerConfig: PickerConfig | null =
    activePicker === 'date'
      ? {
          title: 'Date Range',
          options: PAYMENT_DATE_FILTERS,
          selected: dateFilter,
          onSelect: value => setDateFilter(value as PaymentDateFilter),
        }
      : activePicker === 'status'
        ? {
            title: 'Status',
            options: PAYMENT_STATUS_FILTERS,
            selected: statusFilter,
            onSelect: value => setStatusFilter(value as PaymentStatusFilter),
          }
        : null;

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments
      .filter(raw => {
        if (!withinDateFilter(raw.createdAt, dateFilter)) return false;
        const uiStatus = raw.status === 'PAID' ? 'Paid' : 'Pending';
        if (statusFilter !== 'All Statuses' && uiStatus !== statusFilter) return false;
        if (!q) return true;
        const txn = toTransaction(raw);
        return (
          txn.id.toLowerCase().includes(q) ||
          txn.gateway.toLowerCase().includes(q) ||
          txn.methodLabel.toLowerCase().includes(q)
        );
      })
      .map(toTransaction);
  }, [payments, dateFilter, statusFilter, search]);

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
          {paddingBottom: 90 + insets.bottom},
        ]}>
        <View style={styles.balanceCardContainer}>
          <Image source={require('../../assets/medicine_cardbg.png')} style={styles.waveBackground}/>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.mainBalanceValue}>
            Tk{earnings.balance.toLocaleString('en-BD', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </Text>

          <View style={styles.payoutIndicatorBadge}>
            <Text style={styles.payoutIndicatorText}>Available for payout</Text>
          </View>

          <TouchableOpacity style={styles.withdrawButton} activeOpacity={0.9}>
            <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeadingTitle}>Earning Breakdown</Text>
        <View style={styles.earningsGrid}>
          <View style={styles.earningBox}>
            <Text style={styles.earningBoxLabel}>Today:</Text>
            <Text style={styles.earningBoxValue}>Tk {formatAmount(earnings.today)}</Text>
            <Text style={[styles.earningBoxSub, styles.earningPositive]}> </Text>
          </View>
          <View style={styles.earningBox}>
            <Text style={styles.earningBoxLabel}>This Week:</Text>
            <Text style={styles.earningBoxValue}>Tk {formatAmount(earnings.week)}</Text>
            <Text style={[styles.earningBoxSub, styles.earningPositive]}> </Text>
          </View>
          <View style={styles.earningBox}>
            <Text style={styles.earningBoxLabel}>This Month:</Text>
            <Text style={styles.earningBoxValue}>Tk {formatAmount(earnings.month)}</Text>
            <Text style={[styles.earningBoxSub, styles.earningNegative]}> </Text>
          </View>
        </View>

        <Text style={styles.sectionHeadingTitle}>Transaction History</Text>

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#9AA6B2" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9AA6B2"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialCommunityIcons name="tune" size={20} color="#4E929D" />
          </TouchableOpacity>
        </View>

        <View style={styles.filtersWrapperRow}>
          <TouchableOpacity
            style={styles.dropdownSelector}
            activeOpacity={0.7}
            onPress={() => setActivePicker('date')}>
            <Text style={styles.dropdownSelectorText}>{dateFilter}</Text>
            <Feather name="chevron-down" size={14} color="#7E8B97" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownSelector}
            activeOpacity={0.7}
            onPress={() => setActivePicker('status')}>
            <MaterialCommunityIcons name="filter-variant" size={14} color="#7E8B97" />
            <Text style={styles.dropdownSelectorText}>{statusFilter}</Text>
            <Feather name="chevron-down" size={14} color="#7E8B97" />
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsStack}>
          {loading ? (
            <ActivityIndicator color="#4E929D" style={styles.loader} />
          ) : filteredTransactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions found.</Text>
          ) : (
            filteredTransactions.map((item, index) => (
              <TransactionRow key={`${item.id}-${index}`} item={item} />
            ))
          )}
        </View>
      </ScrollView>

      <VendorBottomNav activeTab="payments" bottomInset={insets.bottom} navigation={navigation} />

      {pickerConfig ? (
        <OptionPickerModal
          visible={activePicker !== null}
          title={pickerConfig.title}
          options={pickerConfig.options}
          selected={pickerConfig.selected}
          onSelect={value => {
            pickerConfig.onSelect(value);
            setActivePicker(null);
          }}
          onClose={() => setActivePicker(null)}
        />
      ) : null}
    </View>
  );
}

type OptionPickerModalProps<T extends string> = {
  visible: boolean;
  title: string;
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

function OptionPickerModal<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: OptionPickerModalProps<T>) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.pickerOverlay} onPress={onClose}>
        <Pressable style={styles.pickerCard} onPress={e => e.stopPropagation()}>
          <Text style={styles.pickerTitle}>{title}</Text>
          {options.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pickerOption,
                selected === option && styles.pickerOptionSelected,
              ]}
              activeOpacity={0.7}
              onPress={() => onSelect(option)}>
              <Text
                style={[
                  styles.pickerOptionText,
                  selected === option && styles.pickerOptionTextSelected,
                ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FE',
  },
  scrollContent: {
    paddingTop: 4,
  },
  loader: {
    marginVertical: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7E8B97',
    fontSize: 13,
    fontFamily: FONT.regular,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#F5F3FE',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
    flex: 1,
    marginLeft: 12,
  },
  headerButton: {
    padding: 2,
    width: 32,
  },
  balanceCardContainer: {
    backgroundColor: '#F3F2FB',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF3',
    shadowColor: '#4E929D',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
   waveBackground: {
    position: 'absolute',
    marginLeft:0,
    top: 40,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: .1,

  },
  balanceLabel: {
    fontSize: 13,
    color: '#7E8B97',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  mainBalanceValue: {
    fontSize: 32,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#3A3F47',
    marginVertical: 6,
  },
  payoutIndicatorBadge: {
    backgroundColor: '#8BC255',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 20,
  },
  payoutIndicatorText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  withdrawButton: {
    backgroundColor: '#4E929D',
    borderRadius: 22,
    height: 44,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '85%',
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  sectionHeadingTitle: {
    fontSize: 12,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#616161',
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 12,
  },
  earningsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  earningBox: {
    flex: 1,
    backgroundColor: '#F5F4FD',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  earningBoxLabel: {
    fontSize: 11,
    color: '#7E8B97',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  earningBoxValue: {
    fontSize: 15,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
    marginTop: 4,
  },
  earningBoxSub: {
    fontSize: 9,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    marginTop: 2,
  },
  earningPositive: {
    color: '#00A884',
  },
  earningNegative: {
    color: '#E26D6D',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4FD',
    marginHorizontal: 16,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONT.regular,
    padding: 0,
    color: '#1A1C1E',
  },
  filtersWrapperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 10,
  },
  dropdownSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEF9',
    height:32,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
  },
  dropdownSelectorText: {
    flex: 1,
    fontSize: 12,
    color: '#4F5E6D',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  transactionsStack: {
    gap: 10,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F2FB',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E3EE',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  detailsBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionIdText: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#424242',
  },
  methodInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
    gap: 4,
  },
  miniBrandIcon: {
    width: 14,
    height: 14,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bkashIcon: {
    backgroundColor: '#E2136E',
  },
  nagadIcon: {
    backgroundColor: '#F37021',
  },
  miniBrandText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  methodLabelText: {
    fontSize: 13,
    color: '#5C6470',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  feeBadge: {
    backgroundColor: '#E26D6D',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  feeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: '#9AA6B2',
    marginTop: 2,
  },
  rightStatusBlock: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePaid: {
    backgroundColor: '#E6F7ED',
  },
  badgePending: {
    backgroundColor: '#FF981F',
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  textPaid: {
    color: '#00A884',
  },
  textPending: {
    color: '#EDF7F6',
  },
  amountText: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  processingSubtext: {
    fontSize: 10,
    color: '#7E8B97',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pickerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    maxHeight: '70%',
  },
  pickerTitle: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#1A1C1E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF3',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerOptionSelected: {
    backgroundColor: '#E8F4F6',
  },
  pickerOptionText: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: '#4F5E6D',
  },
  pickerOptionTextSelected: {
    color: '#3F8694',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
