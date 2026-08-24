import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useVoicePlayer} from '../hooks/useVoicePlayer';
import { FONT } from '../theme/typography';

type Props = {
  messageId: string;
  uri: string;
  incoming?: boolean;
};

export function VoiceMessagePlayer({messageId, uri, incoming = false}: Props) {
  const {
    isPlaying,
    isPaused,
    positionLabel,
    durationLabel,
    durationMs,
    progress,
    toggle,
    stop,
  } = useVoicePlayer(messageId, uri);

  const accent = incoming ? '#0D9488' : '#7C3AED';
  const trackBg = incoming ? '#C8E6C9' : '#D1C4E9';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.playButton, {backgroundColor: accent}]}
        activeOpacity={0.85}
        onPress={toggle}>
        <Feather name={isPlaying ? 'pause' : 'play'} size={16} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.trackColumn}>
        <View style={[styles.track, {backgroundColor: trackBg}]}>
          <View
            style={[
              styles.fill,
              {
                width: `${Math.max(progress * 100, isPlaying ? 8 : 0)}%`,
                backgroundColor: accent,
              },
            ]}
          />
        </View>
        <Text style={styles.timeText}>
          {isPlaying || isPaused
            ? durationMs > 0
              ? `${positionLabel} / ${durationLabel}`
              : positionLabel
            : durationMs > 0
              ? `Voice · ${durationLabel}`
              : 'Tap to play voice'}
        </Text>
      </View>

      {isPlaying || isPaused ? (
        <TouchableOpacity
          style={[styles.stopButton, {borderColor: accent}]}
          activeOpacity={0.8}
          onPress={stop}>
          <Feather name="square" size={12} color={accent} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 220,
    marginTop: 4,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackColumn: {
    flex: 1,
    gap: 4,
  },
  track: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  timeText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  stopButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
