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
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {reportsApi, type HealthReport} from '../../api/reports';
import {ApiError} from '../../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportsList'>;
const {width} = Dimensions.get('window');

function formatReportDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB').replace(/\//g, '-');
}

export function ReportsListScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportsApi.list();
      setItems(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load reports';
      Alert.alert('Reports', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports]),
  );

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
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
          onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Reports Details</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollCanvasContent,
          {paddingBottom: insets.bottom + 120},
        ]}>
        <TouchableOpacity
          style={styles.uploadReportBar}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AddReportMenu')}>
          <MaterialCommunityIcons
            name="cloud-upload-outline"
            size={24}
            color="#FFFFFF"
            style={styles.uploadIcon}
          />
          <Text style={styles.uploadReportBarText}>Upload Report</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator color="#45A096" style={styles.loader} />
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>No reports yet. Tap Upload Report.</Text>
        ) : (
          items.map(item => (
          <View key={item.id} style={styles.reportListCard}>
            <View style={styles.documentIconContainer}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color="#7D8797" />
            </View>

            <View style={styles.reportCardDetails}>
              <Text style={styles.reportCardTitle}>{item.title}</Text>
              <View style={styles.metaLabelRow}>
                <View style={styles.orangeListDot} />
                <Text style={styles.metaLabelText}>{item.provider ?? '—'}</Text>
              </View>
            </View>

            <View style={styles.cardRightColumn}>
              <Text style={styles.dateTimestampText}>
                {formatReportDate(item.reportDate)}
              </Text>
              <TouchableOpacity
                style={styles.viewReportButton}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ViewReportDetails')}>
                <Text style={styles.viewReportButtonText}>View Report</Text>
              </TouchableOpacity>
            </View>
          </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.floatingGradientFab, {bottom: insets.bottom + 94}]}
        activeOpacity={0.85}>
        <View style={styles.fabInnerContent}>
          <MaterialCommunityIcons name="face-recognition" size={26} color="#203E5F" />
        </View>
      </TouchableOpacity>

      <View style={[styles.bottomTabBar, {paddingBottom: 12 + insets.bottom}]}>
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('PharmacyShop')}>
          <MaterialCommunityIcons name="clippy" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Pharmacy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MedicineList')}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Medication</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#45A096" />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MyProfile')}>
          <Feather name="user" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerIconButton: {
    padding: 4,
  },
  backButton: {
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
  titleContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  scrollCanvasContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  uploadReportBar: {
    backgroundColor: '#45A096',
    width: '100%',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#45A096',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadIcon: {marginRight: 10},
  uploadReportBarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {marginVertical: 24},
  emptyText: {
    textAlign: 'center',
    color: '#8A94A6',
    fontSize: 14,
    marginTop: 8,
  },
  reportListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEFF7',
    shadowColor: '#E0E4F0',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  documentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportCardDetails: {
    flex: 1,
  },
  reportCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 6,
  },
  metaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orangeListDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9F43',
    marginRight: 6,
  },
  metaLabelText: {
    fontSize: 13,
    color: '#5A6578',
    fontWeight: '500',
  },
  cardRightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    minHeight: 46,
  },
  dateTimestampText: {
    fontSize: 11,
    color: '#8A94A6',
    fontWeight: '400',
    marginBottom: 8,
  },
  viewReportButton: {
    borderWidth: 1,
    borderColor: '#72C1B6',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  viewReportButtonText: {
    color: '#45A096',
    fontSize: 12,
    fontWeight: '600',
  },
  floatingGradientFab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8CE79B',
    shadowColor: '#203E5F',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  fabInnerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6DBAE7',
    opacity: 0.9,
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
});
