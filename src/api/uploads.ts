import {apiRequest} from './client';
import type {Asset} from 'react-native-image-picker';
import {pickedFileFromAsset} from '../utils/fileAsset';

export type UploadResult = {
  fileUrl: string;
  fileName: string;
  mimeType: string;
  size: number;
};

function normalizeImageMime(mimeType: string) {
  const mime = mimeType.toLowerCase();
  if (mime === 'image/jpg') return 'image/jpeg';
  return mime;
}

export async function uploadFile(
  endpoint:
    | '/uploads/report'
    | '/uploads/prescription'
    | '/uploads/product-image'
    | '/uploads/avatar'
    | '/uploads/chat-attachment'
    | '/uploads/vendor-document',
  uri: string,
  fileName: string,
  mimeType: string,
): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', {
    uri,
    name: fileName,
    type: normalizeImageMime(mimeType),
  } as never);
  return apiRequest<UploadResult>(endpoint, {
    method: 'POST',
    auth: true,
    body: form,
  });
}

export async function uploadAvatarAsset(asset: Asset) {
  const file = pickedFileFromAsset(asset, 'avatar');
  if (!file) {
    throw new Error('Could not read selected photo');
  }
  return uploadFile('/uploads/avatar', file.uri, file.fileName, file.mimeType);
}
