import {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {HomeBottomNav} from './HomeBottomNav';
import type {BottomTabKey} from './homeData';
import {useMedicationDraft} from '../../context/MedicationDraftContext';
import {ApiError} from '../../api/client';
import {pickedFileFromAsset} from '../../utils/fileAsset';
import { FONT } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseFromGallery'>;

const {width} = Dimensions.get('window');
const NUM_COLUMNS = 4;
const GRID_SPACING = 8;
const CARD_WIDTH = (width - 32 - GRID_SPACING * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

type GalleryItem = {
  id: string;
  uri: string;
  fileName: string;
  mimeType: string;
};

export function ChooseFromGalleryScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const {uploadAndScan} = useMedicationDraft();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openDeviceGallery = useCallback(async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 12,
      includeBase64: false,
    });

    const assets = result.assets ?? [];
    if (!assets.length) return;

    const deviceItems: GalleryItem[] = assets
      .map((asset, index) => {
        const picked = pickedFileFromAsset(asset, 'prescription');
        if (!picked) return null;
        return {
          id: `device-${index}`,
          uri: picked.uri,
          fileName: picked.fileName,
          mimeType: picked.mimeType,
        };
      })
      .filter((item): item is GalleryItem => item !== null);

    if (!deviceItems.length) return;
    setItems(deviceItems);
    setSelectedImageId(deviceItems[0]?.id ?? null);
  }, []);

  useEffect(() => {
    openDeviceGallery();
  }, [openDeviceGallery]);

  const handleContinue = async () => {
    const selected = items.find(item => item.id === selectedImageId);
    if (!selected) {
      Alert.alert('Gallery', 'Please select an image to continue.');
      return;
    }

    setLoading(true);
    try {
      await uploadAndScan(
        selected.uri,
        selected.fileName,
        selected.mimeType,
        'gallery',
      );
      navigation.navigate('ReviewDetails');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not scan prescription';
      Alert.alert('Prescription scan', message);
    } finally {
      setLoading(false);
    }
  };

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

  const renderGalleryItem = ({item}: {item: GalleryItem}) => {
    const isSelected = selectedImageId === item.id;

    return (
      <TouchableOpacity
        style={[styles.imageCard, {width: CARD_WIDTH, height: CARD_WIDTH}]}
        activeOpacity={0.8}
        onPress={() => {
          if (!items.length) {
            openDeviceGallery();
            return;
          }
          setSelectedImageId(item.id);
        }}>
        <View style={styles.imagePlaceholderBox}>
          <Image source={{uri: item.uri}} style={styles.previewImage} />
        </View>
        {isSelected && <View style={styles.selectedOverlayBorder} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 8}]}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={28} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>Choose From Gallery</Text>
        </View>

        <TouchableOpacity
          style={styles.dropdownFilterPill}
          activeOpacity={0.8}
          onPress={openDeviceGallery}>
          <Text style={styles.dropdownFilterText}>All Images</Text>
          <Feather name="chevron-down" size={14} color="#FFFFFF" style={styles.dropdownIcon} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderGalleryItem}
        keyExtractor={item => item.id}
        numColumns={NUM_COLUMNS}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.galleryGridContent}
        columnWrapperStyle={styles.galleryRowWrapper}
        ListEmptyComponent={
          <TouchableOpacity
            style={styles.emptyPickerCard}
            activeOpacity={0.8}
            onPress={openDeviceGallery}>
            <MaterialCommunityIcons name="image-plus" size={36} color="#A0A5BA" />
            <Text style={styles.helperText}>Tap to choose from your gallery</Text>
          </TouchableOpacity>
        }
        ListHeaderComponent={
          items.length ? (
            <Text style={styles.helperText}>
              Select a prescription image, then tap Continue.
            </Text>
          ) : null
        }
      />

      <View style={[styles.footerActionContainer, {bottom: 74 + insets.bottom}]}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.9}
          disabled={loading}
          onPress={handleContinue}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F9F9FE',
  },
  headerLeftGroup: {flexDirection: 'row', alignItems: 'center'},
  backButton: {marginRight: 6},
  headerTitleText: {
    fontSize: 18,
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#424242',
  },
  dropdownFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3E3E3E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  dropdownFilterText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
  dropdownIcon: {marginLeft: 4},
  helperText: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: '#7D8797',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyPickerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  galleryGridContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
  galleryRowWrapper: {
    justifyContent: 'flex-start',
    gap: GRID_SPACING,
    marginBottom: GRID_SPACING,
  },
  imageCard: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EAECEF',
  },
  imagePlaceholderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EBEFF5',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  selectedOverlayBorder: {
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
    fontFamily: FONT.semibold,
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
