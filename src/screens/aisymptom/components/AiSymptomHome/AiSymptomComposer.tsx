import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import type {PickedFile} from '../../../../utils/fileAsset';
import {AiAttachmentChip} from './AiAttachmentChip';
import {AiVoiceNoteChip} from './AiVoiceNoteChip';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type VoiceNote = {
  id: string;
  uri: string;
};

type Props = {
  message: string;
  onChangeMessage: (value: string) => void;
  attachment: PickedFile | null;
  scanning: boolean;
  scanLabel: string;
  onPickAttachment: () => void;
  onRemoveAttachment: () => void;
  voiceNote: VoiceNote | null;
  onRemoveVoiceNote: () => void;
  recording: boolean;
  recordLabel: string;
  onToggleRecording: () => void;
  onCancelRecording: () => void;
  canSend: boolean;
  onSend: () => void;
};

export function AiSymptomComposer({
  message,
  onChangeMessage,
  attachment,
  scanning,
  scanLabel,
  onPickAttachment,
  onRemoveAttachment,
  voiceNote,
  onRemoveVoiceNote,
  recording,
  recordLabel,
  onToggleRecording,
  onCancelRecording,
  canSend,
  onSend,
}: Props) {
  const insect = useSafeAreaInsets();
  return (
    <View>
      {attachment ? (
        <AiAttachmentChip
          file={attachment}
          scanning={scanning}
          scanLabel={scanLabel}
          onRemove={onRemoveAttachment}
        />
      ) : null}

      {voiceNote ? (
        <AiVoiceNoteChip
          id={voiceNote.id}
          uri={voiceNote.uri}
          onRemove={onRemoveVoiceNote}
        />
      ) : null}

      <View style={[styles.inputBox, {marginBottom:insect.bottom+10}]}>
        {recording ? (
          <View style={styles.recordingRow}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingLabel}>Recording {recordLabel}</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              hitSlop={10}
              onPress={onCancelRecording}>
              <Text style={styles.recordingCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TextInput
            style={[styles.input,]}
            value={message}
            onChangeText={onChangeMessage}
            placeholder="e.g. Headache, stomach pain"
            placeholderTextColor="#8A939C"
            multiline
            textAlignVertical="top"
          />
        )}

        <View style={styles.inputActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            hitSlop={8}
            onPress={onPickAttachment}
            disabled={recording || scanning}>
            <Feather
              name="plus"
              color={recording || scanning ? '#B7BFC7' : '#454F5B'}
              size={22}
            />
          </TouchableOpacity>

          <View style={styles.inputActionsRight}>
            <TouchableOpacity
              activeOpacity={0.8}
              hitSlop={8}
              onPress={onToggleRecording}>
              <Feather
                name={recording ? 'square' : 'mic'}
                color={recording ? '#E5484D' : '#454F5B'}
                size={20}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onSend}
              disabled={!canSend}>
              <LinearGradient
                colors={['#5FD3A2', '#4EA8E9']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={[
                  styles.sendButton,
                  !canSend && styles.sendButtonDisabled,
                ]}>
                <Feather name="send" color="#FFFFFF" size={16} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputBox: {
    height: 132,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDDD4',
    borderRadius: 12,
    backgroundColor: '#F1F9F6',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    padding: 0,
    color: '#091B27',
    fontSize: 13,
  },
  recordingRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#E5484D',
  },
  recordingLabel: {
    flex: 1,
    color: '#091B27',
    fontSize: 13,
    fontWeight: '500',
  },
  recordingCancel: {
    color: '#5F6B76',
    fontSize: 13,
    fontWeight: '500',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sendButton: {
    height: 30,
    width: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});
