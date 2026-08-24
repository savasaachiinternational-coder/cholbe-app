import {useCallback, useState} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  DocScanError,
  processSingleDocument,
} from '../../services/DocScanner/geminiService';
import type {ScannedDocument} from '../../data/DocScanner/medicalDocument';

type PickedPreview = {
  uri: string;
  fileName: string;
};

function errorText(err: unknown, fallback: string) {
  if (err instanceof DocScanError) return err.message;
  return err instanceof Error && err.message ? err.message : fallback;
}

export function useDocScanner() {
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState<ScannedDocument | null>(null);
  const [preview, setPreview] = useState<PickedPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runUpload = useCallback(async () => {
    let result;
    try {
      result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: true,
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.8,
      });
    } catch (err) {
      setError(errorText(err, 'Could not open the picker.'));
      return;
    }
    if (result.didCancel) return;
    if (result.errorCode) {
      setError(result.errorMessage ?? `Picker failed (${result.errorCode}).`);
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.base64) {
      setError(
        'Could not read that image. Try a different photo from your library.',
      );
      return;
    }

    setPreview({
      uri: asset.uri ?? '',
      fileName: asset.fileName ?? 'Selected document',
    });
    setDocument(null);
    setError(null);
    setLoading(true);

    try {
      const parsed = await processSingleDocument(
        asset.base64,
        asset.type ?? 'image/jpeg',
      );
      setDocument(parsed);
    } catch (err) {
      setError(errorText(err, 'Could not parse the selected document.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const upload = useCallback(() => {
    runUpload().catch(err => {
      setLoading(false);
      setError(errorText(err, 'Could not scan that document.'));
    });
  }, [runUpload]);

  const reset = useCallback(() => {
    setDocument(null);
    setPreview(null);
    setError(null);
  }, []);

  return {loading, document, preview, error, upload, reset};
}
