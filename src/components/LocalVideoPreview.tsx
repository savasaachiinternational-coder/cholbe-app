import {Platform, StyleSheet, Text, View, type ViewStyle} from 'react-native';
import {
  RenderModeType,
  RtcSurfaceView,
  RtcTextureView,
  VideoSourceType,
} from 'react-native-agora';
import Feather from 'react-native-vector-icons/Feather';

type Props = {
  style?: ViewStyle;
  videoEnabled: boolean;
  zOrderMediaOverlay?: boolean;
};

const localCanvas = {
  uid: 0,
  renderMode: RenderModeType.RenderModeHidden,
  sourceType: VideoSourceType.VideoSourceCamera,
};

/** Agora views must not receive backgroundColor — wrap in a plain View instead. */
const agoraViewStyle = {width: '100%' as const, height: '100%' as const};

export function LocalVideoPreview({style, videoEnabled, zOrderMediaOverlay}: Props) {
  if (!videoEnabled) {
    return (
      <View style={[styles.offContainer, style]}>
        <Feather name="video-off" size={28} color="#94A3B8" />
        <Text style={styles.offLabel}>Camera off</Text>
      </View>
    );
  }

  if (Platform.OS === 'android') {
    return (
      <View style={[styles.videoWrap, style]}>
        <RtcTextureView style={agoraViewStyle} canvas={localCanvas} />
      </View>
    );
  }

  return (
    <View style={[styles.videoWrap, style]}>
      <RtcSurfaceView
        style={agoraViewStyle}
        canvas={localCanvas}
        zOrderMediaOverlay={zOrderMediaOverlay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  videoWrap: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E293B',
    overflow: 'hidden',
  },
  offContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  offLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
});
