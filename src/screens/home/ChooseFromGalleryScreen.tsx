import {useState} from 'react';
import {
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

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseFromGallery'>;

const {width} = Dimensions.get('window');
const NUM_COLUMNS = 4;
const GRID_SPACING = 8;
const CARD_WIDTH = (width - 32 - GRID_SPACING * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

type GalleryType =
  | 'prescription_text'
  | 'doctor_profile'
  | 'medical_kit'
  | 'surgery_room';

type GalleryItem = {
  id: string;
  type: GalleryType;
};

const GALLERY_MOCK_DATA: GalleryItem[] = Array.from({length: 28}).map(
  (_, index) => {
    const mod = index % 4;
    if (mod === 0) {
      return {id: String(index), type: 'prescription_text'};
    }
    if (mod === 1) {
      return {id: String(index), type: 'doctor_profile'};
    }
    if (mod === 2) {
      return {id: String(index), type: 'medical_kit'};
    }
    return {id: String(index), type: 'surgery_room'};
  },
);

function getTypeIcon(type: GalleryType) {
  if (type === 'prescription_text') {
    return (
      <MaterialCommunityIcons
        name="file-document-text-outline"
        size={32}
        color="#A0A5BA"
      />
    );
  }
  if (type === 'doctor_profile') {
    return (
      <MaterialCommunityIcons name="account-doctor" size={32} color="#A0A5BA" />
    );
  }
  if (type === 'medical_kit') {
    return (
      <MaterialCommunityIcons name="first-aid-kit" size={32} color="#A0A5BA" />
    );
  }
  return <MaterialCommunityIcons name="hospital-building" size={32} color="#A0A5BA" />;
}

export function ChooseFromGalleryScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const [selectedImageId, setSelectedImageId] = useState<string | null>('0');
  const [pickedUri, setPickedUri] = useState<string | null>(null);

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

  const handleContinue = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      includeBase64: false,
    });

    const uri = result.assets?.[0]?.uri;
    if (!uri) {
      return;
    }

    setPickedUri(uri);
    setSelectedImageId('0');
    navigation.navigate('ReviewDetails');
  };

  const renderGalleryItem = ({item}: {item: GalleryItem}) => {
    const isSelected = selectedImageId === item.id;
    const showPickedImage = item.id === '0' && pickedUri;

    return (
      <TouchableOpacity
        style={[styles.imageCard, {width: CARD_WIDTH, height: CARD_WIDTH}]}
        activeOpacity={0.8}
        onPress={() => setSelectedImageId(item.id)}>
        <View style={styles.imagePlaceholderBox}>
          {showPickedImage ? (
            <Image source={{uri: pickedUri}} style={styles.previewImage} />
          ) : (
            getTypeIcon(item.type)
          )}
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

        <TouchableOpacity style={styles.dropdownFilterPill} activeOpacity={0.8}>
          <Text style={styles.dropdownFilterText}>All Images</Text>
          <Feather name="chevron-down" size={14} color="#FFFFFF" style={styles.dropdownIcon} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={GALLERY_MOCK_DATA}
        renderItem={renderGalleryItem}
        keyExtractor={item => item.id}
        numColumns={NUM_COLUMNS}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.galleryGridContent}
        columnWrapperStyle={styles.galleryRowWrapper}
      />

      <View style={[styles.footerActionContainer, {bottom: 74 + insets.bottom}]}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.9}
          onPress={handleContinue}>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F9F9FE',
  },
  headerLeftGroup: {flexDirection: 'row', alignItems: 'center'},
  backButton: {marginRight: 6},
  headerTitleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
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
    fontWeight: '500',
  },
  dropdownIcon: {marginLeft: 4},
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
