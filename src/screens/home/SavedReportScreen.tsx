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
import {reportsApi, type HealthReport} from '../../api/reports';
import {ApiError} from '../../api/client';
import {ReportFilePreview} from '../../components/ReportFilePreview';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedReport'>;

const {width} = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const GRID_GAP = 8;
const AVAILABLE_WIDTH = width - HORIZONTAL_PADDING * 2;
const WIDTH_THREE_COLUMNS = (AVAILABLE_WIDTH - GRID_GAP * 2) / 3;
const WIDTH_FOUR_COLUMNS = (AVAILABLE_WIDTH - GRID_GAP * 3) / 4;

export function SavedReportScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportsApi.list();
      setReports(data);
      setSelectedId(data[0]?.id ?? null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load reports';
      Alert.alert('Saved Report', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports]),
  );

  const handleContinue = () => {
    const selected = reports.find(report => report.id === selectedId);
    if (!selected) {
      Alert.alert('Saved Report', 'Please select a saved report.');
      return;
    }
    navigation.navigate('UploadReportDetails', {
      existingFileUrl: selected.fileUrl,
      existingFileName: selected.title,
      reportTitle: selected.title,
      reportType: selected.reportType,
      provider: selected.provider ?? undefined,
    });
  };

  const renderItemBox = (item: HealthReport, boxWidth: number) => {
    const isSelected = selectedId === item.id;
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.gridItem, {width: boxWidth, height: boxWidth * 0.9}]}
        activeOpacity={0.8}
        onPress={() => setSelectedId(item.id)}>
        <View style={styles.imageMockPlaceholder}>
          <ReportFilePreview
            fileUrl={item.fileUrl}
            mimeType={item.mimeType}
            fileName={item.fileName}
            size={Math.round(boxWidth * 0.72)}
            rounded={false}
            style={styles.thumbPreview}
          />
          <Text style={styles.thumbLabel} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
        {isSelected && <View style={styles.selectedIndicatorBorder} />}
      </TouchableOpacity>
    );
  };

  const row1 = reports.slice(0, 3);
  const rest = reports.slice(3);

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Saved Report</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <ActivityIndicator color="#45A096" style={styles.loader} />
      ) : reports.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={40}
            color="#A0A5BA"
          />
          <Text style={styles.emptyText}>
            No saved reports yet. Upload one from Camera or Gallery.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollCanvasContent}>
          {row1.length > 0 ? (
            <View style={styles.threeColumnGridRow}>
              {row1.map(item => renderItemBox(item, WIDTH_THREE_COLUMNS))}
            </View>
          ) : null}

          <View style={styles.fourColumnGridWrapper}>
            {rest.map(item => renderItemBox(item, WIDTH_FOUR_COLUMNS))}
          </View>
        </ScrollView>
      )}

      <View style={[styles.footerActionContainer, {bottom: 74 + insets.bottom}]}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedId && styles.continueDisabled]}
          activeOpacity={0.9}
          disabled={!selectedId}
          onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F9F9FE',
  },
  backButton: {
    padding: 2,
  },
  headerTitleText: {
    fontSize: 20,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#333333',
  },
  headerSpacer: {width: 28},
  loader: {marginTop: 40},
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7D8797',
  },
  scrollCanvasContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 140,
  },
  threeColumnGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
  },
  fourColumnGridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  gridItem: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EBEFF5',
  },
  imageMockPlaceholder: {
    flex: 1,
    backgroundColor: '#EBEFF5',
  },
  thumbPreview: {
    width: '100%',
    height: '70%',
  },
  thumbLabel: {
    fontSize: 10,
    color: '#5A6578',
    paddingHorizontal: 4,
    paddingVertical: 4,
    textAlign: 'center',
  },
  selectedIndicatorBorder: {
    ...StyleSheet.absoluteFill,
    borderWidth: 3,
    borderColor: '#45A096',
    borderRadius: 8,
  },
  footerActionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F9F9FE',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  continueButton: {
    backgroundColor: '#418B93',
    width: '100%',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONT.semibold,
    fontWeight: '600',
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
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#45A096',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
});
