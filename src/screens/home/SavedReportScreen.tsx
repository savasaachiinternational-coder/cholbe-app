import {useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {
  SAVED_REPORT_GRID,
  SAVED_REPORT_ROW1,
  type SavedReportItem,
  type SavedReportType,
} from './savedReportData';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedReport'>;

const {width} = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const GRID_GAP = 8;
const AVAILABLE_WIDTH = width - HORIZONTAL_PADDING * 2;
const WIDTH_THREE_COLUMNS = (AVAILABLE_WIDTH - GRID_GAP * 2) / 3;
const WIDTH_FOUR_COLUMNS = (AVAILABLE_WIDTH - GRID_GAP * 3) / 4;

function getTypeIcon(type: SavedReportType) {
  if (type.includes('report_document')) {
    return (
      <MaterialCommunityIcons
        name="file-document-text-outline"
        size={28}
        color="#A0A5BA"
      />
    );
  }
  if (type === 'lab_tech') {
    return (
      <MaterialCommunityIcons
        name="account-search-outline"
        size={28}
        color="#A0A5BA"
      />
    );
  }
  if (type === 'microscope') {
    return <MaterialCommunityIcons name="microscope" size={28} color="#A0A5BA" />;
  }
  if (type.includes('room') || type.includes('bed')) {
    return (
      <MaterialCommunityIcons name="hospital-building" size={28} color="#A0A5BA" />
    );
  }
  return (
    <MaterialCommunityIcons name="badge-account-outline" size={28} color="#A0A5BA" />
  );
}

export function SavedReportScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<string | null>('rep1-1');

  const renderItemBox = (item: SavedReportItem, boxWidth: number) => {
    const isSelected = selectedId === item.id;
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.gridItem, {width: boxWidth, height: boxWidth * 0.9}]}
        activeOpacity={0.8}
        onPress={() => setSelectedId(item.id)}>
        <View style={styles.imageMockPlaceholder}>{getTypeIcon(item.type)}</View>
        {isSelected && <View style={styles.selectedIndicatorBorder} />}
      </TouchableOpacity>
    );
  };

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollCanvasContent}>
        <View style={styles.threeColumnGridRow}>
          {SAVED_REPORT_ROW1.map(item => renderItemBox(item, WIDTH_THREE_COLUMNS))}
        </View>

        <View style={styles.fourColumnGridWrapper}>
          {SAVED_REPORT_GRID.map(item => renderItemBox(item, WIDTH_FOUR_COLUMNS))}
        </View>
      </ScrollView>

      <View style={[styles.footerActionContainer, {bottom: 74 + insets.bottom}]}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('UploadReportDetails')}>
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
    fontWeight: '600',
    color: '#333333',
  },
  headerSpacer: {width: 28},
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EBEFF5',
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
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
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
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#45A096',
    fontWeight: '600',
  },
});
