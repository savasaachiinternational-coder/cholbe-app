import {useState} from 'react';
import {Image, type ImageStyle, type StyleProp} from 'react-native';
import {
  DEFAULT_PRODUCT_IMAGE,
  getProductImageSource,
} from '../utils/pharmacyHelpers';

type Props = {
  imageUrl?: string | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
};

export function ProductImage({
  imageUrl,
  style,
  resizeMode = 'cover',
}: Props) {
  const [failed, setFailed] = useState(false);
  const source = failed
    ? DEFAULT_PRODUCT_IMAGE
    : getProductImageSource(imageUrl);

  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}
