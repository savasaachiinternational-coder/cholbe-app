import {useCallback, useState} from 'react';
import {Alert} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useVoiceRecorder} from '../../../../hooks/useVoiceRecorder';
import {stopActiveVoicePlayback} from '../../../../hooks/useVoicePlayer';
import {pickedFileFromAsset, type PickedFile} from '../../../../utils/fileAsset';
import {
  canRecognizeText,
  recognizeTextFromImage,
} from '../../../../utils/textRecognition';
import {briefSymptomText} from '../../services/AiSymptomHome/symptomBriefService';

function errorText(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

export type AiVoiceNote = {
  id: string;
  uri: string;
};

export type AiSymptomDraft = {
  /** Categories chosen in the grid — joined into the intake title. */
  categories: string[];
  message: string;
  attachment: PickedFile | null;
  voiceNote: AiVoiceNote | null;
};

/** The attachment pipeline runs on-device OCR, then a Gemini clean-up pass. */
type ScanStatus = 'idle' | 'reading' | 'briefing';

const SCAN_LABELS: Record<ScanStatus, string> = {
  idle: '',
  reading: 'Reading text…',
  briefing: 'Summarising…',
};

export function useAiSymptomComposer(onSubmit?: (draft: AiSymptomDraft) => void) {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<PickedFile | null>(null);
  const [voiceNote, setVoiceNote] = useState<AiVoiceNote | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [categories, setCategories] = useState<string[]>([]);
  const {recording, recordLabel, getLastError, start, stop, cancel} =
    useVoiceRecorder();

  const scanning = scanStatus !== 'idle';

  // Append rather than replace so a typed symptom is not lost.
  const appendMessage = useCallback((text: string) => {
    setMessage(prev => (prev ? `${prev}\n${text}` : text));
  }, []);

  const processFile = useCallback(async (file: PickedFile) => {
    setAttachment(file);

    if (!canRecognizeText(file.mimeType, file.uri, file.fileName)) return;

    setScanStatus('reading');
    try {
      const text = await recognizeTextFromImage(file.uri);
      if (!text) {
        Alert.alert('Scan', 'No readable text found in that image.');
        return;
      }

      // OCR returns the whole page — letterhead, addresses, billing lines and
      // all. Gemini trims it to the sickness-related part before it lands in
      // the composer.
      setScanStatus('briefing');
      let brief: string | null;
      try {
        brief = await briefSymptomText(text);
      } catch (err) {
        // Keep the raw transcription rather than losing the scan when the
        // brief cannot be produced (no key, offline, blocked prompt).
        Alert.alert(
          'Summary',
          errorText(err, 'Could not summarise that document.'),
        );
        appendMessage(text);
        return;
      }

      if (!brief) {
        Alert.alert('Scan', 'No health details found in that document.');
        return;
      }
      appendMessage(brief);
    } catch (err) {
      Alert.alert(
        'Scan',
        errorText(err, 'Could not read text from that image.'),
      );
    } finally {
      setScanStatus('idle');
    }
  }, [appendMessage]);

  const runPickAttachment = useCallback(async () => {
    let result;
    try {
      result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 1,
        // Full-resolution photos slow OCR down without reading any better.
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.9,
      });
    } catch (err) {
      // launchImageLibrary rejects when the native module is missing from the
      // build; without this the tap looks like it did nothing at all.
      Alert.alert('Attachment', errorText(err, 'Could not open the picker.'));
      return;
    }

    if (result.didCancel) return;

    // The picker reports failures in the response rather than by rejecting.
    if (result.errorCode) {
      Alert.alert(
        'Attachment',
        result.errorMessage ?? `Picker failed (${result.errorCode}).`,
      );
      return;
    }

    if (!result.assets?.length) return;

    const file = pickedFileFromAsset(result.assets[0], 'symptom');
    if (!file) {
      Alert.alert('Attachment', 'Could not read the selected file.');
      return;
    }
    await processFile(file);
  }, [processFile]);

  const pickAttachment = useCallback(() => {
    runPickAttachment().catch(err => {
      Alert.alert('Attachment', errorText(err, 'Could not open the picker.'));
    });
  }, [runPickAttachment]);

  // Used when a file arrives from outside the picker flow, e.g. the
  // DocScanner camera screen handing back a captured photo.
  const ingestScannedFile = useCallback(
    (file: PickedFile) => {
      processFile(file).catch(err => {
        Alert.alert('Scan', errorText(err, 'Could not read that document.'));
      });
    },
    [processFile],
  );

  const removeAttachment = useCallback(() => setAttachment(null), []);

  const runToggleRecording = useCallback(async () => {
    if (recording) {
      const uri = await stop();
      if (!uri) {
        Alert.alert('Voice note', 'Could not save the recording. Please try again.');
        return;
      }
      setVoiceNote({id: `voice-${Date.now()}`, uri});
      return;
    }

    // Only one voice note per draft — drop the previous one before recording.
    await stopActiveVoicePlayback();
    setVoiceNote(null);

    const started = await start();
    if (!started) {
      Alert.alert(
        'Voice note',
        getLastError() ?? 'Could not start recording. Please try again.',
      );
    }
  }, [recording, start, stop, getLastError]);

  const toggleRecording = useCallback(() => {
    runToggleRecording().catch(err => {
      Alert.alert('Voice note', errorText(err, 'Recording failed.'));
    });
  }, [runToggleRecording]);

  const cancelRecording = useCallback(() => {
    void cancel();
  }, [cancel]);

  const removeVoiceNote = useCallback(() => setVoiceNote(null), []);

  // Multi-select: tapping toggles a category in or out of the selection.
  const selectCategory = useCallback((title: string) => {
    setCategories(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title],
    );
  }, []);

  const canSend =
    !recording &&
    !scanning &&
    (message.trim().length > 0 ||
      categories.length > 0 ||
      !!attachment ||
      !!voiceNote);

  const send = useCallback(() => {
    if (!canSend) return;
    onSubmit?.({
      categories,
      message: message.trim(),
      attachment,
      voiceNote,
    });
    void stopActiveVoicePlayback();
    setMessage('');
    setAttachment(null);
    setVoiceNote(null);
    setCategories([]);
  }, [canSend, onSubmit, categories, message, attachment, voiceNote]);

  return {
    message,
    setMessage,
    categories,
    selectCategory,
    attachment,
    scanning,
    scanLabel: SCAN_LABELS[scanStatus],
    pickAttachment,
    ingestScannedFile,
    removeAttachment,
    voiceNote,
    removeVoiceNote,
    recording,
    recordLabel,
    toggleRecording,
    cancelRecording,
    canSend,
    send,
  };
}
