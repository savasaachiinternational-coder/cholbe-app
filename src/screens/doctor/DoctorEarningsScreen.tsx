import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {doctorPortalApi, type DoctorFinance} from '../../api/doctorPortal';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {formatBdt} from '../../utils/pharmacyHelpers';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'DEarnings'>;

export function DoctorEarningsScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [finance, setFinance] = useState<DoctorFinance | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFinance(await doctorPortalApi.getFinance());
    } catch {
      setFinance(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const wallet = finance?.wallet;

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#1A2332" />
        </TouchableOpacity>
        <Text style={styles.title}>Earnings</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4E929D" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 24}]}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total earned</Text>
            <Text style={styles.summaryValue}>৳{formatBdt(wallet?.totalEarnings ?? 0)}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.itemLabel}>Available</Text>
                <Text style={styles.itemValue}>৳{formatBdt(wallet?.availableBalance ?? 0)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.itemLabel}>Pending withdraw</Text>
                <Text style={styles.itemValue}>৳{formatBdt(wallet?.pendingWithdrawal ?? 0)}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent consultation earnings</Text>
          {(wallet?.recentEarnings ?? []).length === 0 ? (
            <Text style={styles.emptyText}>No completed consultations yet.</Text>
          ) : (
            wallet!.recentEarnings.map(item => (
              <View key={item.id} style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowTitle}>{item.patientName}</Text>
                  <Text style={styles.rowSub}>
                    {item.consultationType} · {new Date(item.date).toLocaleDateString()} · {item.timeSlot}
                  </Text>
                </View>
                <Text style={styles.rowAmount}>+৳{formatBdt(item.amount)}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginBottom: 16,
  },
  summaryLabel: {fontSize: 12, color: '#7E8B97'},
  summaryValue: {fontSize: 28, fontFamily: FONT.semibold, fontWeight: '600', color: '#1A2332', marginTop: 4},
  summaryRow: {flexDirection: 'row', gap: 16, marginTop: 14},
  summaryItem: {flex: 1},
  itemLabel: {fontSize: 11, color: '#7E8B97'},
  itemValue: {fontSize: 15, fontFamily: FONT.semibold, fontWeight: '600', color: '#4E929D', marginTop: 2},
  sectionTitle: {fontSize: 14, fontFamily: FONT.semibold, fontWeight: '600', color: '#7E8B97', marginBottom: 8},
  emptyText: {fontSize: 13, color: '#7E8B97', paddingVertical: 12},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  rowLeft: {flex: 1},
  rowTitle: {fontSize: 14, fontFamily: FONT.semibold, fontWeight: '600', color: '#1A2332'},
  rowSub: {fontSize: 11, color: '#7E8B97', marginTop: 2},
  rowAmount: {fontSize: 14, fontFamily: FONT.semibold, fontWeight: '600', color: '#2E7D32'},
});
