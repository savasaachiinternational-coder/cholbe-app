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
import {uploadFile} from '../../api/uploads';
import {checkoutSession} from '../../checkout/checkoutSession';
import {ApiError} from '../../api/client';
import {pickedFileFromAsset} from '../../utils/fileAsset';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseFromPharmacyGallery'>;

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

export function ChooseFromPharmacyGalleryScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const openDeviceGallery = useCallback(async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 12,
    });
    const assets = result.assets ?? [];
    if (!assets.length) return;

    const deviceItems = assets
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
      Alert.alert('Gallery', 'Please select a prescription image.');
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadFile(
        '/uploads/prescription',
        selected.uri,
        selected.fileName,
        selected.mimeType,
      );
      checkoutSession.setPrescriptionUrl(uploaded.fileUrl);
      navigation.navigate('CartCheckoutDetails');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not upload prescription';
      Alert.alert('Upload prescription', message);
    } finally {
      setUploading(false);
    }
  };

  const renderGalleryItem = ({item}: {item: GalleryItem}) => {
    const isSelected = selectedImageId === item.id;
    return (
      <TouchableOpacity
        style={[styles.imageCard, {width: CARD_WIDTH, height: CARD_WIDTH}]}
        activeOpacity={0.8}
        onPress={() => setSelectedImageId(item.id)}>
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
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={28} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>Choose From Gallery</Text>
        </View>

        <TouchableOpacity style={styles.dropdownFilterPill} activeOpacity={0.8} onPress={openDeviceGallery}>
          <Text style={styles.dropdownFilterText}>All Images</Text>
          <Feather name="chevron-down" size={14} color="#FFFFFF" style={styles.filterChevron} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderGalleryItem}
        keyExtractor={item => item.id}
        numColumns={NUM_COLUMNS}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.galleryGridContent, {paddingBottom: 130 + insets.bottom}]}
        columnWrapperStyle={styles.galleryRowWrapper}
        ListEmptyComponent={
          <TouchableOpacity style={styles.emptyPickerCard} activeOpacity={0.8} onPress={openDeviceGallery}>
            <MaterialCommunityIcons name="image-plus" size={36} color="#A0A5BA" />
            <Text style={styles.emptyText}>Tap to choose a prescription image</Text>
          </TouchableOpacity>
        }
      />

      <View style={[styles.footerActionContainer, {bottom: 74 + insets.bottom}]}>
        <TouchableOpacity
          style={[styles.continueButton, (!selectedImageId || uploading) && styles.continueDisabled]}
          activeOpacity={0.9}
          disabled={!selectedImageId || uploading}
          onPress={handleContinue}>
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.bottomTabBar, {paddingBottom: 12 + insets.bottom}]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <MaterialCommunityIcons name="clippy" size={24} color="#45A096" />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Pharmacy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MedicineList')}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Medication</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ReportsList')}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MyProfile')}>
          <Feather name="user" size={24} color="#A0A5BA" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
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
  headerTitleText: {fontSize: 20, fontWeight: '600', color: '#333333'},
  dropdownFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3E3E3E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  dropdownFilterText: {fontSize: 13, color: '#FFFFFF', fontWeight: '500'},
  filterChevron: {marginLeft: 4},
  galleryGridContent: {paddingHorizontal: 16, paddingTop: 8},
  galleryRowWrapper: {justifyContent: 'flex-start', gap: GRID_SPACING, marginBottom: GRID_SPACING},
  imageCard: {borderRadius: 8, overflow: 'hidden', position: 'relative', backgroundColor: '#EAECEF'},
  imagePlaceholderBox: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EBEFF5'},
  previewImage: {width: '100%', height: '100%'},
  selectedOverlayBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: '#45A096',
    borderRadius: 8,
  },
  emptyPickerCard: {alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12},
  emptyText: {fontSize: 13, color: '#7D8797'},
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
  continueDisabled: {opacity: 0.5},
  continueButtonText: {color: '#FFFFFF', fontSize: 18, fontWeight: '600'},
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
  tabItem: {alignItems: 'center', justifyContent: 'center', width: width / 5},
  tabLabel: {fontSize: 11, color: '#9CA3AF', marginTop: 5, fontWeight: '500'},
  activeTabLabel: {color: '#45A096', fontWeight: '600'},
});
