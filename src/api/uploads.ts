import {apiRequest, ApiError} from './client';
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

type UploadEndpoint =
  | '/uploads/report'
  | '/uploads/prescription'
  | '/uploads/product-image'
  | '/uploads/avatar'
  | '/uploads/chat-attachment'
  | '/uploads/vendor-document';

/** Older production API builds only expose a subset of upload routes. */
const UPLOAD_ENDPOINT_FALLBACKS: Partial<Record<UploadEndpoint, UploadEndpoint>> = {
  '/uploads/avatar': '/uploads/product-image',
  '/uploads/chat-attachment': '/uploads/report',
  '/uploads/vendor-document': '/uploads/report',
};

export async function uploadFile(
  endpoint: UploadEndpoint,
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

  try {
    return await apiRequest<UploadResult>(endpoint, {
      method: 'POST',
      auth: true,
      body: form,
    });
  } catch (err) {
    const fallback = UPLOAD_ENDPOINT_FALLBACKS[endpoint];
    if (fallback && err instanceof ApiError && err.status === 404) {
      return apiRequest<UploadResult>(fallback, {
        method: 'POST',
        auth: true,
        body: form,
      });
    }
    throw err;
  }
}

export async function uploadAvatarAsset(asset: Asset) {
  const file = pickedFileFromAsset(asset, 'avatar');
  if (!file) {
    throw new Error('Could not read selected photo');
  }
  return uploadFile('/uploads/avatar', file.uri, file.fileName, file.mimeType);
}
