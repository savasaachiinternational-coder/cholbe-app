import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {reportsApi, type HealthReport} from '../../api/reports';
import {ApiError} from '../../api/client';
import {ReportFilePreview} from '../../components/ReportFilePreview';
import {PassportListScreenLayout} from '../../components/PassportListScreenLayout';
import {
  formatPassportListTime,
  PassportTimelineCard,
} from '../../components/PassportTimelineCard';
import {navigateCustomerTab} from './customerTabNavigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportsList'>;

function reportListTime(item: HealthReport) {
  return formatPassportListTime(item.createdAt ?? item.reportDate);
}

export function ReportsListScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
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
    <PassportListScreenLayout
      title="Reports List"
      subtitle="Health Passport"
      uploadLabel="Upload Report"
      onUpload={() => navigation.navigate('AddReportMenu')}
      activeTab="report"
      onTabPress={tab => navigateCustomerTab(navigation, tab)}
      onBack={() => navigation.goBack()}
      onNotifications={() => navigation.navigate('Notifications')}>
      <View style={styles.listContent}>
        {loading ? (
          <ActivityIndicator color="#45A096" style={styles.loader} />
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>No reports yet. Tap Upload Report.</Text>
        ) : (
          items.map((item, index) => (
            <PassportTimelineCard
              key={item.id}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              title={item.title}
              time={reportListTime(item)}
              meta={[{label: item.provider ?? '—'}]}
              icon={
                item.fileUrl ? (
                  <ReportFilePreview
                    fileUrl={item.fileUrl}
                    mimeType={item.mimeType}
                    fileName={item.fileName}
                    size={48}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="pill"
                    size={22}
                    color="#7D8797"
                    style={styles.rotatedPillIcon}
                  />
                )
              }
              onPressAction={() =>
                navigation.navigate('ReportDetailsView', {reportId: item.id})
              }
            />
          ))
        )}
      </View>
    </PassportListScreenLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  loader: {marginVertical: 24},
  emptyText: {
    textAlign: 'center',
    color: '#8A94A6',
    fontSize: 14,
    marginTop: 8,
  },
  rotatedPillIcon: {
    transform: [{rotate: '-45deg'}],
  },
});
