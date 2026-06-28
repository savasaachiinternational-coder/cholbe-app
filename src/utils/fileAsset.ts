import type {Asset} from 'react-native-image-picker';

export type PickedFile = {
  uri: string;
  fileName: string;
  mimeType: string;
};

export function fileNameFromAsset(asset: Asset, fallbackPrefix = 'file') {
  if (asset.fileName?.trim()) {
    return asset.fileName.trim();
  }
  const ext = extensionFromMime(asset.type ?? 'image/jpeg');
  return `${fallbackPrefix}-${Date.now()}${ext}`;
}

export function extensionFromMime(mimeType: string) {
  const mime = mimeType.toLowerCase();
  if (mime.includes('png')) return '.png';
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('pdf')) return '.pdf';
  if (mime.includes('heic') || mime.includes('heif')) return '.heic';
  return '.jpg';
}

export function pickedFileFromAsset(
  asset: Asset,
  fallbackPrefix = 'file',
): PickedFile | null {
  if (!asset.uri) return null;
  return {
    uri: asset.uri,
    fileName: fileNameFromAsset(asset, fallbackPrefix),
    mimeType: asset.type ?? 'image/jpeg',
  };
}

export function imageUri(fileUrl: string, apiOrigin: string) {
  return fileUrl.startsWith('http') ? fileUrl : `${apiOrigin}${fileUrl}`;
}

export function isPdfFile(
  mimeType?: string | null,
  fileUrl?: string | null,
  fileName?: string | null,
) {
  if ((mimeType ?? '').toLowerCase() === 'pdf') return true;
  const hint = `${mimeType ?? ''} ${fileUrl ?? ''} ${fileName ?? ''}`.toLowerCase();
  return hint.includes('pdf') || hint.includes('.pdf');
}

export function isImageFile(
  mimeType?: string | null,
  fileUrl?: string | null,
  fileName?: string | null,
) {
  if (isPdfFile(mimeType, fileUrl, fileName)) return false;
  if ((mimeType ?? '').toLowerCase() === 'image') return true;
  const hint = `${mimeType ?? ''} ${fileUrl ?? ''} ${fileName ?? ''}`.toLowerCase();
  return (
    hint.includes('image/') ||
    /\.(jpe?g|png|webp|heic|heif|gif)(\?|$)/i.test(hint)
  );
}

export function isAudioFile(
  mimeType?: string | null,
  fileUrl?: string | null,
  fileName?: string | null,
) {
  if ((mimeType ?? '').toLowerCase() === 'audio') return true;
  const hint = `${mimeType ?? ''} ${fileUrl ?? ''} ${fileName ?? ''}`.toLowerCase();
  return hint.includes('audio/') || /\.(mp3|m4a|wav|ogg|webm|aac)(\?|$)/i.test(hint);
}

export type AttachmentKind = 'image' | 'pdf' | 'audio' | 'file';

export function resolveAttachmentKind(
  attachmentType?: string | null,
  attachmentUrl?: string | null,
): AttachmentKind | null {
  if (!attachmentUrl) return null;
  if (isImageFile(attachmentType, attachmentUrl)) return 'image';
  if (isPdfFile(attachmentType, attachmentUrl)) return 'pdf';
  if (isAudioFile(attachmentType, attachmentUrl)) return 'audio';
  return 'file';
}
