import {useEffect, useState} from 'react';
import {Image, type ImageStyle, type StyleProp} from 'react-native';
import {staticMapImageSource, type StaticMapParams} from '../api/maps';

type Props = StaticMapParams & {
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
};

type Source = {uri: string; headers?: Record<string, string>};

/**
 * Map preview rendered through the backend proxy, so no Google Maps key is
 * embedded in the JS bundle.
 */
export function StaticMapImage({
  style,
  resizeMode = 'cover',
  ...params
}: Props) {
  const [source, setSource] = useState<Source | null>(null);
  const {latitude, longitude, zoom, width, height, scale} = params;

  useEffect(() => {
    let active = true;
    void (async () => {
      const next = await staticMapImageSource({
        latitude,
        longitude,
        zoom,
        width,
        height,
        scale,
      });
      if (active) {
        setSource(next);
      }
    })();
    return () => {
      active = false;
    };
  }, [latitude, longitude, zoom, width, height, scale]);

  if (!source) {
    return null;
  }

  return <Image source={source} style={style} resizeMode={resizeMode} />;
}
