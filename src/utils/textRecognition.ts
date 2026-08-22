import TextRecognition from '@react-native-ml-kit/text-recognition';
import {isImageFile} from './fileAsset';

/**
 * Runs Google ML Kit's on-device OCR over a local image.
 *
 * Returns null when the image holds no readable text. Throws when the
 * recognizer itself fails — including the library's linking error if the app
 * has not been rebuilt since installing it — so callers can surface the reason
 * rather than silently doing nothing.
 */
export async function recognizeTextFromImage(uri: string) {
  const result = await TextRecognition.recognize(uri);
  const text = result.text.trim();
  return text.length > 0 ? text : null;
}

/** ML Kit only reads still images — videos and documents are skipped. */
export function canRecognizeText(
  mimeType?: string | null,
  uri?: string | null,
  fileName?: string | null,
) {
  return isImageFile(mimeType, uri, fileName);
}
