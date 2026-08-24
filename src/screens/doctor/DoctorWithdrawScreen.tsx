import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {doctorPortalApi, type DoctorFinance, type DoctorWithdrawal} from '../../api/doctorPortal';
import {ApiError} from '../../api/client';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {formatBdt} from '../../utils/pharmacyHelpers';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'DWithdraw'>;

export function DoctorWithdrawScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finance, setFinance] = useState<DoctorFinance | null>(null);
  const [withdrawals, setWithdrawals] = useState<DoctorWithdrawal[]>([]);
  const [amount, setAmount] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [financeData, withdrawalData] = await Promise.all([
        doctorPortalApi.getFinance(),
        doctorPortalApi.listWithdrawals(),
      ]);
      setFinance(financeData);
      setWithdrawals(withdrawalData);
    } catch {
      setFinance(null);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const available = finance?.wallet.availableBalance ?? 0;
  const primaryMethod = finance?.payoutMethods.find(m => m.isPrimary) ?? finance?.payoutMethods[0];

  const submitWithdraw = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      Alert.alert('Withdraw', 'Enter a valid amount');
      return;
    }
    if (!primaryMethod) {
      Alert.alert('Payout method required', 'Add a payout method in Payment settings first.', [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Add method', onPress: () => navigation.navigate('DEditProfile', {initialTab: 'payment'})},
      ]);
      return;
    }
    setSubmitting(true);
    try {
      await doctorPortalApi.requestWithdrawal({amount: value, payoutMethodId: primaryMethod.id});
      Alert.alert('Success', 'Withdrawal request submitted');
      setAmount('');
      await load();
    } catch (e) {
      Alert.alert('Withdraw', e instanceof ApiError ? e.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#1A2332" />
        </TouchableOpacity>
        <Text style={styles.title}>Withdraw</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4E929D" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 24}]}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available balance</Text>
            <Text style={styles.balanceValue}>৳{formatBdt(available)}</Text>
            {primaryMethod ? (
              <Text style={styles.payoutInfo}>
                Payout to {primaryMethod.label} ({primaryMethod.methodType}) · {primaryMethod.accountMasked}
              </Text>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate('DEditProfile', {initialTab: 'payment'})}>
                <Text style={styles.addPayoutLink}>+ Add payout method</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.fieldLabel}>Withdraw amount (৳)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Enter amount"
          />
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => setAmount(String(Math.floor(available)))}>
            <Text style={styles.quickBtnText}>Withdraw full balance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitDisabled]}
            disabled={submitting}
            onPress={() => void submitWithdraw()}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Request Withdrawal</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Withdrawal history</Text>
          {withdrawals.length === 0 ? (
            <Text style={styles.emptyText}>No withdrawals yet.</Text>
          ) : (
            withdrawals.map(w => (
              <View key={w.id} style={styles.historyRow}>
                <View>
                  <Text style={styles.historyAmount}>৳{formatBdt(w.amount)}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(w.createdAt).toLocaleDateString()} · {w.payoutMethod?.label ?? 'Payout'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, statusStyle(w.status)]}>
                  <Text style={[styles.statusText, {color: statusColor(w.status)}]}>{w.status}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

function statusColor(status: string) {
  if (status === 'PAID') return '#2E7D32';
  if (status === 'REJECTED') return '#C62828';
  if (status === 'PROCESSING') return '#1565C0';
  return '#F57C00';
}

function statusStyle(status: string) {
  return {backgroundColor: `${statusColor(status)}18`};
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {width: 32, height: 32, justifyContent: 'center'},
  title: {fontSize: 17, fontFamily: FONT.semibold, fontWeight: '600', color: '#1A2332'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  content: {padding: 16},
  balanceCard: {
    backgroundColor: '#4E929D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  balanceLabel: {fontSize: 12, color: 'rgba(255,255,255,0.8)'},
  balanceValue: {fontSize: 28, fontFamily: FONT.semibold, fontWeight: '600', color: '#FFFFFF', marginTop: 4},
  payoutInfo: {fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 8},
  addPayoutLink: {fontSize: 13, color: '#FFFFFF', fontFamily: FONT.semibold, fontWeight: '600', marginTop: 8},
  fieldLabel: {fontSize: 13, color: '#7E8B97', marginBottom: 6},
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  quickBtn: {alignSelf: 'flex-start', marginBottom: 16},
  quickBtnText: {fontSize: 13, color: '#4E929D', fontFamily: FONT.semibold, fontWeight: '600'},
  submitBtn: {
    backgroundColor: '#4E929D',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitDisabled: {opacity: 0.7},
  submitText: {color: '#FFFFFF', fontSize: 15, fontFamily: FONT.semibold, fontWeight: '600'},
  sectionTitle: {fontSize: 14, fontFamily: FONT.semibold, fontWeight: '600', color: '#7E8B97', marginBottom: 8},
  emptyText: {fontSize: 13, color: '#7E8B97'},
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  historyAmount: {fontSize: 15, fontFamily: FONT.semibold, fontWeight: '600', color: '#1A2332'},
  historyDate: {fontSize: 11, color: '#7E8B97', marginTop: 2},
  statusBadge: {borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4},
  statusText: {fontSize: 10, fontFamily: FONT.semibold, fontWeight: '600'},
});
