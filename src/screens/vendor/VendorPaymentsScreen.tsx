import {useState} from 'react';
import {
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {VendorBottomNav} from './VendorBottomNav';
import {
  PAYMENT_DATE_FILTERS,
  PAYMENT_STATUS_FILTERS,
  type PaymentDateFilter,
  type PaymentStatusFilter,
} from './vendorNav';

type Props = NativeStackScreenProps<RootStackParamList, 'VPayments'>;
type PickerField = 'date' | 'status' | null;

type TransactionIconType = 'bkash' | 'nagad' | 'card' | 'cod' | 'fee';

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

const MOCK_TRANSACTIONS: TransactionItem[] = [
  {
    id: 'OD1234',
    gateway: 'Bkash',
    methodLabel: 'bkash',
    iconType: 'bkash',
    date: '05 May, 10:15 am',
    amount: '845',
    isPositive: true,
    status: 'Paid',
  },
  {
    id: 'OD1234',
    gateway: 'Bkash',
    methodLabel: 'Fee',
    iconType: 'fee',
    date: '05 May, 10:15 am',
    amount: '80',
    isPositive: false,
    status: 'Pending',
  },
  {
    id: 'OD1234',
    gateway: 'Bkash',
    methodLabel: 'Credit Card',
    iconType: 'card',
    date: '05 May, 10:15 am',
    amount: '8,800',
    isPositive: true,
    status: 'Paid',
  },
  {
    id: 'OD1234',
    gateway: 'Bkash',
    methodLabel: 'Nagad',
    iconType: 'nagad',
    date: '05 May, 10:15 am',
    amount: '880',
    isPositive: true,
    status: 'Pending',
    isProcessing: true,
  },
  {
    id: 'OD1234',
    gateway: 'Bkash',
    methodLabel: 'Cash on Delivery',
    iconType: 'cod',
    date: '05 May, 10:15 am',
    amount: '800',
    isPositive: true,
    status: 'Paid',
  },
];

function TransactionRow({item}: {item: TransactionItem}) {
  return (
    <View style={styles.transactionCard}>
      <Image
        source={{uri: 'https://via.placeholder.com/40/CBD5E1/000000?text=User'}}
        style={styles.avatarImage}
      />

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

  const pickerConfig =
    activePicker === 'date'
      ? {
          title: 'Date Range',
          options: PAYMENT_DATE_FILTERS,
          selected: dateFilter,
          onSelect: setDateFilter,
        }
      : activePicker === 'status'
        ? {
            title: 'Status',
            options: PAYMENT_STATUS_FILTERS,
            selected: statusFilter,
            onSelect: setStatusFilter,
          }
        : null;

  const filteredTransactions = MOCK_TRANSACTIONS.filter(item => {
    if (statusFilter === 'All Statuses') {
      return true;
    }
    return item.status === statusFilter;
  });

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
          {paddingBottom: 90 + insets.bottom},
        ]}>
        <View style={styles.balanceCardContainer}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.mainBalanceValue}>Tk28,450.00</Text>

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
            <Text style={styles.earningBoxValue}>Tk 1,250</Text>
            <Text style={[styles.earningBoxSub, styles.earningPositive]}>Paragraph(+5%)</Text>
          </View>
          <View style={styles.earningBox}>
            <Text style={styles.earningBoxLabel}>This Week:</Text>
            <Text style={styles.earningBoxValue}>Tk 8,800</Text>
            <Text style={[styles.earningBoxSub, styles.earningPositive]}>Paragraph(+8%)</Text>
          </View>
          <View style={styles.earningBox}>
            <Text style={styles.earningBoxLabel}>This Month:</Text>
            <Text style={styles.earningBoxValue}>Tk 35,600</Text>
            <Text style={[styles.earningBoxSub, styles.earningNegative]}>Paragraph(-5%)</Text>
          </View>
        </View>

        <Text style={styles.sectionHeadingTitle}>Transaction History</Text>

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
          {filteredTransactions.map((item, index) => (
            <TransactionRow key={`${item.id}-${index}`} item={item} />
          ))}
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
  balanceCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
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
  balanceLabel: {
    fontSize: 13,
    color: '#7E8B97',
    fontWeight: '500',
  },
  mainBalanceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3A3F47',
    marginVertical: 6,
  },
  payoutIndicatorBadge: {
    backgroundColor: '#7CD1A1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 20,
  },
  payoutIndicatorText: {
    color: '#FFFFFF',
    fontSize: 11,
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
    fontWeight: '600',
  },
  sectionHeadingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333D47',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  earningBoxLabel: {
    fontSize: 11,
    color: '#7E8B97',
    fontWeight: '500',
  },
  earningBoxValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
    marginTop: 4,
  },
  earningBoxSub: {
    fontSize: 9,
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
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
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
    backgroundColor: '#F0F3F6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
  },
  dropdownSelectorText: {
    flex: 1,
    fontSize: 12,
    color: '#4F5E6D',
    fontWeight: '500',
  },
  transactionsStack: {
    gap: 10,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF3',
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
    fontSize: 14,
    fontWeight: '700',
    color: '#2A3038',
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
    fontWeight: 'bold',
  },
  methodLabelText: {
    fontSize: 13,
    color: '#5C6470',
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
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
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
    backgroundColor: '#FFF3E0',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textPaid: {
    color: '#00A884',
  },
  textPending: {
    color: '#F37021',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  processingSubtext: {
    fontSize: 10,
    color: '#7E8B97',
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
    fontWeight: '700',
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
    color: '#4F5E6D',
  },
  pickerOptionTextSelected: {
    color: '#3F8694',
    fontWeight: '600',
  },
});
