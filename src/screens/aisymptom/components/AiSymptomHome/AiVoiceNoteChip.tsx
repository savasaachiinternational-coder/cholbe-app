import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {useVoicePlayer} from '../../../../hooks/useVoicePlayer';
import { FONT } from '../../../../theme/typography';

type Props = {
  id: string;
  uri: string;
  onRemove: () => void;
};

export function AiVoiceNoteChip({id, uri, onRemove}: Props) {
  const {isPlaying, progress, positionLabel, durationLabel, toggle, stop} =
    useVoicePlayer(id, uri);

  const remove = () => {
    void stop();
    onRemove();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => void toggle()}
        style={styles.playButton}>
        <Feather
          name={isPlaying ? 'pause' : 'play'}
          size={16}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <View style={styles.trackContainer}>
        <View style={styles.track}>
          <View style={[styles.trackFill, {width: `${progress * 100}%`}]} />
        </View>
        <Text style={styles.timeLabel}>
          {isPlaying ? positionLabel : durationLabel}
        </Text>
      </View>

      <TouchableOpacity activeOpacity={0.8} hitSlop={10} onPress={remove}>
        <Feather name="trash-2" size={16} color="#5F6B76" />
      </TouchableOpacity>
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
  playButton: {
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3BAE8C',
  },
  trackContainer: {
    flex: 1,
    gap: 6,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D6E9E1',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#3BAE8C',
  },
  timeLabel: {
    color: '#454F5B',
    fontSize: 11,
    fontFamily: FONT.medium,
    fontWeight: '500',
  },
});
