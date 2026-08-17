import {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEdgeToEdgeStatusBar} from '../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../navigation/types';
import {useMedicationDraft} from '../../context/MedicationDraftContext';
import {ApiError} from '../../api/client';
import {pickedFileFromAsset} from '../../utils/fileAsset';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFromCamera'>;

const {height} = Dimensions.get('window');

export function AddFromCameraScreen({navigation}: Props) {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const {uploadAndScan} = useMedicationDraft();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');

  const captureAndScan = async () => {
    setScanning(true);
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        cameraType,
        saveToPhotos: false,
        quality: 0.8,
      });

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        if (result.didCancel) return;
        Alert.alert('Camera', 'Could not capture photo.');
        return;
      }

      const picked = pickedFileFromAsset(asset, 'prescription');
      if (!picked) return;

      setPreviewUri(picked.uri);
      await uploadAndScan(
        picked.uri,
        picked.fileName,
        picked.mimeType,
        'camera',
      );
      navigation.navigate('ReviewDetails');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not scan prescription';
      Alert.alert('Prescription scan', message);
    } finally {
      setScanning(false);
    }
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
        <Text style={styles.headerTitle}>Add From Camera</Text>
      </View>

      <View style={styles.cameraViewport}>
        {previewUri ? (
          <Image source={{uri: previewUri}} style={styles.previewImage} />
        ) : (
          <>
            <View style={[styles.cornerFrame, styles.topLeftCorner]} />
            <View style={[styles.cornerFrame, styles.topRightCorner]} />
            <View style={[styles.cornerFrame, styles.bottomLeftCorner]} />
            <View style={[styles.cornerFrame, styles.bottomRightCorner]} />
            <View style={styles.focusReticleContainer}>
              <MaterialCommunityIcons
                name="scan-helper"
                size={48}
                color="#7D8797"
                style={styles.reticleIcon}
              />
            </View>
          </>
        )}
      </View>

      <View style={[styles.shutterActionBar, {paddingBottom: insets.bottom + 12}]}>
        <TouchableOpacity
          style={styles.sideActionButton}
          activeOpacity={0.7}
          disabled={scanning}
          onPress={() =>
            setCameraType(current => (current === 'back' ? 'front' : 'back'))
          }>
          <MaterialCommunityIcons
            name="camera-flip-outline"
            size={26}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shutterOuterRing}
          activeOpacity={0.8}
          disabled={scanning}
          onPress={captureAndScan}>
          {scanning ? (
            <ActivityIndicator color="#333333" />
          ) : (
            <View style={styles.shutterInnerCircle} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideActionButton}
          activeOpacity={0.7}
          disabled={!previewUri || scanning}
          onPress={() => navigation.navigate('ReviewDetails')}>
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={28}
            color="#FFFFFF"
          />
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F9F9FE',
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  cameraViewport: {
    flex: 1,
    backgroundColor: '#F3F4F9',
    position: 'relative',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: height * 0.5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cornerFrame: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderColor: '#757575',
  },
  topLeftCorner: {
    top: 40,
    left: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 18,
  },
  topRightCorner: {
    top: 40,
    right: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 18,
  },
  bottomLeftCorner: {
    bottom: 40,
    left: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 18,
  },
  bottomRightCorner: {
    bottom: 40,
    right: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 18,
  },
  focusReticleContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleIcon: {
    opacity: 0.8,
  },
  shutterActionBar: {
    minHeight: 110,
    backgroundColor: '#1E1F22',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sideActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
});
