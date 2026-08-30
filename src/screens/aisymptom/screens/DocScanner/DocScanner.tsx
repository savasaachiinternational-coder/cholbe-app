import {useState} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useEdgeToEdgeStatusBar} from '../../../../hooks/useEdgeToEdgeStatusBar';
import type {RootStackParamList} from '../../../../navigation/types';
import {AiSymptomHeaderCard} from '../../components/shared/AiSymptomHeaderCard';
import {GradientPillButton} from '../../components/shared/GradientPillButton';
import {SecondaryPillButton} from '../../components/shared/SecondaryPillButton';
import {pickedFileFromAsset, type PickedFile} from '../../../../utils/fileAsset';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'DocScanner'>;

function errorText(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function DocScanner() {
  useEdgeToEdgeStatusBar();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [working, setWorking] = useState(false);

  const closeAssistant = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const capturePhoto = async () => {
    setWorking(true);
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        saveToPhotos: false,
        quality: 0.8,
      });
      if (result.didCancel) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Alert.alert(
          'Camera',
          result.errorMessage ?? 'Could not capture photo.',
        );
        return;
      }
      const file = pickedFileFromAsset(asset, 'scan');
      if (!file) {
        Alert.alert('Camera', 'Could not read the captured photo.');
        return;
      }
      setPickedFile(file);
    } catch (err) {
      Alert.alert('Camera', errorText(err, 'Could not open the camera.'));
    } finally {
      setWorking(false);
    }
  };

  const pickFromGallery = async () => {
    setWorking(true);
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 1,
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.9,
      });
      if (result.didCancel) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Alert.alert(
          'Gallery',
          result.errorMessage ?? 'Could not open the selected file.',
        );
        return;
      }
      const file = pickedFileFromAsset(asset, 'scan');
      if (!file) {
        Alert.alert('Gallery', 'Could not read the selected file.');
        return;
      }
      setPickedFile(file);
    } catch (err) {
      Alert.alert('Gallery', errorText(err, 'Could not open the picker.'));
    } finally {
      setWorking(false);
    }
  };

  const retake = () => setPickedFile(null);

  const confirm = () => {
    if (!pickedFile) return;
    navigation.navigate('AiSymptomHome', {scannedFile: pickedFile});
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={{marginTop: insets.top + 12}}>
          <AiSymptomHeaderCard
            title="Scan a document"
            subtitle="Capture or upload a prescription or lab report"
            onClose={closeAssistant}
          />
        </View>

        <View style={styles.previewFrame}>
          {pickedFile ? (
            <Image
              source={{uri: pickedFile.uri}}
              style={styles.previewImage}
            />
          ) : (
            <View style={styles.placeholder}>
              <Feather name="file-text" size={40} color="#7D8797" />
              <Text style={styles.placeholderText}>
                Line up the document inside the frame, then take a photo
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.ctaWrapper,
          {paddingBottom: Math.max(insets.bottom, 16)},
        ]}>
        {pickedFile ? (
          <>
            <GradientPillButton
              label="Use this photo"
              onPress={confirm}
              disabled={working}
            />
            <SecondaryPillButton label="Retake" onPress={retake} />
          </>
        ) : (
          <>
            <GradientPillButton
              label="Take Photo"
              onPress={capturePhoto}
              disabled={working}
            />
            <SecondaryPillButton
              label="Choose from Gallery"
              onPress={pickFromGallery}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FA',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  previewFrame: {
    marginTop: 24,
    height: 380,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#45A096',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  placeholderText: {
    marginTop: 12,
    color: '#7D8797',
    fontSize: 14,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ctaWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
});
