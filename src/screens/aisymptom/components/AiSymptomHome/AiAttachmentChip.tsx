import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import type {PickedFile} from '../../../../utils/fileAsset';
import {isImageFile} from '../../../../utils/fileAsset';
import { FONT } from '../../../../theme/typography';

type Props = {
  file: PickedFile;
  scanning?: boolean;
  /** What the scan is busy with — OCR first, then the Gemini clean-up. */
  scanLabel?: string;
  onRemove: () => void;
};

export function AiAttachmentChip({file, scanning, scanLabel, onRemove}: Props) {
  const isImage = isImageFile(file.mimeType, file.uri, file.fileName);

  return (
    <View style={styles.container}>
      {isImage ? (
        <Image source={{uri: file.uri}} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.fileThumb]}>
          <Feather name="file-text" size={18} color="#3BAE8C" />
        </View>
      )}
      <View style={styles.details}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.fileName}
        </Text>
        {scanning ? (
          <Text style={styles.scanningLabel}>
            {scanLabel || 'Reading text…'}
          </Text>
        ) : null}
      </View>
      {scanning ? (
        <ActivityIndicator size="small" color="#3BAE8C" />
      ) : (
        <TouchableOpacity activeOpacity={0.8} hitSlop={10} onPress={onRemove}>
          <Feather name="x" size={16} color="#5F6B76" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#BFDDD4',
    borderRadius: 12,
    backgroundColor: '#F1F9F6',
  },
  thumb: {
    height: 36,
    width: 36,
    borderRadius: 8,
    backgroundColor: '#E4F1EC',
  },
  fileThumb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
  },
  scanningLabel: {
    marginTop: 2,
    color: '#454F5B',
    fontSize: 11,
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
  fileName: {
    color: '#091B27',
    fontSize: 13,
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
});
