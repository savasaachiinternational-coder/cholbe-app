import {useCallback, useEffect, useState} from 'react';
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

  useEffect(() => {
    return () => {
      Sound.stopRecorder().catch(() => undefined);
      Sound.removeRecordBackListener();
    };
  }, []);

  const start = useCallback(async () => {
    const allowed = await requestMicPermission();
    if (!allowed) return false;

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
  }, []);

  const stop = useCallback(async () => {
    const uri = await Sound.stopRecorder();
    Sound.removeRecordBackListener();
    setRecording(false);
    setRecordMs(0);
    if (!uri) return null;
    return uri.startsWith('file://') ? uri : `file://${uri}`;
  }, []);

  const cancel = useCallback(async () => {
    await Sound.stopRecorder().catch(() => undefined);
    Sound.removeRecordBackListener();
    setRecording(false);
    setRecordMs(0);
  }, []);

  return {
    recording,
    recordLabel: formatRecordTime(recordMs),
    start,
    stop,
    cancel,
  };
}
