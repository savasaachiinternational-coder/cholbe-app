import {useState} from 'react';
import {Image, type ImageStyle, type StyleProp} from 'react-native';
import {
  FALLBACK_AVATAR,
  resolveImageSource,
} from '../utils/imageFallbacks';

type Props = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
};

export function AvatarImage({
  uri,
  style,
  resizeMode = 'cover',
}: Props) {
  const [failed, setFailed] = useState(false);
  const source = failed
    ? FALLBACK_AVATAR
    : resolveImageSource(uri, FALLBACK_AVATAR);

  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}
