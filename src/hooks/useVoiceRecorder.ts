import {useCallback, useEffect, useRef, useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import Sound from 'react-native-nitro-sound';

function formatRecordTime(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

async function requestMicPermission() {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Microphone permission',
      message: 'Cholbe needs microphone access to record voice messages.',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [recordMs, setRecordMs] = useState(0);
  // Why the last start() failed, so callers can tell a denied mic apart from a
  // recorder that could not start at all.
  const [lastError, setLastError] = useState<string | null>(null);
  // start() resolves before the state update lands, so callers that want the
  // reason right after an await read it through the ref instead.
  const lastErrorRef = useRef<string | null>(null);

  const recordError = useCallback((reason: string | null) => {
    lastErrorRef.current = reason;
    setLastError(reason);
  }, []);

  useEffect(() => {
    return () => {
      Sound.stopRecorder().catch(() => undefined);
      Sound.removeRecordBackListener();
    };
  }, []);

  const start = useCallback(async () => {
    if (recording) return true;

    recordError(null);

    const allowed = await requestMicPermission();
    if (!allowed) {
      recordError('Microphone permission was denied.');
      return false;
    }

    try {
      const fileName = `voice-${Date.now()}.m4a`;
      const path = Platform.select({
        ios: fileName,
        android: undefined,
        default: fileName,
      });

      await Sound.startRecorder(path);
      Sound.addRecordBackListener(e => {
        setRecordMs(e.currentPosition);
      });
      setRecording(true);
      setRecordMs(0);
      return true;
    } catch (err) {
      recordError(
        err instanceof Error ? err.message : 'Could not start the recorder.',
      );
      Sound.removeRecordBackListener();
      setRecording(false);
      setRecordMs(0);
      return false;
    }
  }, [recording, recordError]);

  const stop = useCallback(async () => {
    try {
      const uri = await Sound.stopRecorder();
      if (!uri) return null;
      return uri.startsWith('file://') ? uri : `file://${uri}`;
    } catch {
      return null;
    } finally {
      Sound.removeRecordBackListener();
      setRecording(false);
      setRecordMs(0);
    }
  }, []);

  const cancel = useCallback(async () => {
    try {
      await Sound.stopRecorder();
    } catch {
      // Ignore stop errors when discarding a recording.
    } finally {
      Sound.removeRecordBackListener();
      setRecording(false);
      setRecordMs(0);
    }
  }, []);

  const getLastError = useCallback(() => lastErrorRef.current, []);

  return {
    recording,
    lastError,
    getLastError,
    recordLabel: formatRecordTime(recordMs),
    start,
    stop,
    cancel,
  };
}
