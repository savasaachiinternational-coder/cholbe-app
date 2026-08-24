import {useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {API_ORIGIN} from '../config/api';
import {imageUri, isImageFile, isPdfFile} from '../utils/fileAsset';
import { FONT } from '../theme/typography';

type Props = {
  fileUrl?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
  size?: number;
  variant?: 'thumb' | 'hero';
  style?: StyleProp<ViewStyle>;
  rounded?: boolean;
};

export function ReportFilePreview({
  fileUrl,
  mimeType,
  fileName,
  size = 44,
  variant = 'thumb',
  style,
  rounded = true,
}: Props) {
  const [failed, setFailed] = useState(false);
  const pdf = isPdfFile(mimeType, fileUrl, fileName);
  const image = isImageFile(mimeType, fileUrl, fileName);
  const uri = fileUrl ? imageUri(fileUrl, API_ORIGIN) : null;
  const radius = rounded ? size / 2 : 12;

  if (variant === 'hero' && image && uri && !failed) {
    return (
      <Image
        source={{uri}}
        style={[styles.heroImage, style]}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
    );
  }

  const boxStyle = [
    styles.box,
    {width: size, height: size, borderRadius: radius},
    style,
  ];

  if (image && uri && !failed) {
    return (
      <Image
        source={{uri}}
        style={[boxStyle, styles.image]}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
    );
  }

  if (pdf) {
    const pdfSize = variant === 'hero' ? 88 : size;
    return (
      <View style={[boxStyle, styles.pdfBox, variant === 'hero' && styles.heroPdfBox]}>
        <MaterialCommunityIcons
          name="file-pdf-box"
          size={Math.round(pdfSize * 0.58)}
          color="#E53935"
        />
        <Text style={styles.pdfLabel}>PDF</Text>
      </View>
    );
  }

  return (
    <View style={[boxStyle, styles.fallbackBox]}>
      <MaterialCommunityIcons
        name="file-document-outline"
        size={Math.round(size * 0.52)}
        color="#7D8797"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    overflow: 'hidden',
    backgroundColor: '#F1F3F7',
  },
  image: {
    backgroundColor: '#EBEFF5',
  },
  heroImage: {
    width: '92%',
    height: 140,
    borderRadius: 12,
    backgroundColor: '#EBEFF5',
    marginBottom: 8,
  },
  heroPdfBox: {
    width: '92%',
    height: 120,
    alignSelf: 'center',
    marginBottom: 8,
  },
  pdfBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FAD4D4',
  },
  pdfLabel: {
    fontSize: 9,
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: '#E53935',
    marginTop: 2,
  },
  fallbackBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
