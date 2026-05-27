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
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {
  SAVED_PRESCRIPTION_GRID,
  SAVED_PRESCRIPTION_ROW1,
  type SavedPrescriptionItem,
  type SavedPrescriptionType,
} from './savedPrescriptionData';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedPrescription'>;

const {width} = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const GRID_GAP = 8;
const AVAILABLE_WIDTH = width - HORIZONTAL_PADDING * 2;
const WIDTH_THREE_COLUMNS = (AVAILABLE_WIDTH - GRID_GAP * 2) / 3;
const WIDTH_FOUR_COLUMNS = (AVAILABLE_WIDTH - GRID_GAP * 3) / 4;

function getTypeIcon(type: SavedPrescriptionType) {
  if (type.includes('prescription')) {
    return (
      <MaterialCommunityIcons
        name="file-document-text-outline"
        size={28}
        color="#A0A5BA"
      />
    );
  }
  if (type === 'doctor') {
    return (
      <MaterialCommunityIcons name="account-doctor" size={28} color="#A0A5BA" />
    );
  }
  if (type === 'kit') {
    return (
      <MaterialCommunityIcons name="first-aid-kit" size={28} color="#A0A5BA" />
    );
  }
  if (type.includes('surgery')) {
    return (
      <MaterialCommunityIcons name="hospital-building" size={28} color="#A0A5BA" />
    );
  }
  return (
    <MaterialCommunityIcons name="storefront-outline" size={28} color="#A0A5BA" />
  );
}

export function SavedPrescriptionScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<string | null>('r1-1');

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === 'home') {
      navigation.navigate('Home');
      return;
    }
    if (tab === 'medication') {
      navigation.navigate('MedicineList');
      return;
    }
    if (tab === 'report') {
      navigation.navigate('ReportsList');
      return;
    }
    if (tab === 'profile') {
      navigation.navigate('MyProfile');
      return;
    }
    navigation.navigate('Home');
  };

  const renderItemBox = (item: SavedPrescriptionItem, boxWidth: number) => {
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
        <Text style={styles.headerTitleText}>Saved Prescription</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollCanvasContent}>
        <View style={styles.threeColumnGridRow}>
          {SAVED_PRESCRIPTION_ROW1.map(item =>
            renderItemBox(item, WIDTH_THREE_COLUMNS),
          )}
        </View>

        <View style={styles.fourColumnGridWrapper}>
          {SAVED_PRESCRIPTION_GRID.map(item =>
            renderItemBox(item, WIDTH_FOUR_COLUMNS),
          )}
        </View>
      </ScrollView>

      <View style={[styles.footerActionContainer, {bottom: 74 + insets.bottom}]}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ReviewDetails')}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNavWrap}>
        <HomeBottomNav
          activeTab="medication"
          bottomInset={insets.bottom}
          onTabPress={handleTabPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F9F9FE'},
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F9F9FE',
  },
  backButton: {padding: 2},
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
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
