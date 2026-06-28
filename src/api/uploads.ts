import {apiRequest} from './client';

export type UploadResult = {
  fileUrl: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export async function uploadFile(
  endpoint: '/uploads/report' | '/uploads/prescription' | '/uploads/product-image',
  uri: string,
  fileName: string,
  mimeType: string,
): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', {uri, name: fileName, type: mimeType} as never);
  return apiRequest<UploadResult>(endpoint, {
    method: 'POST',
    auth: true,
    body: form,
  });
}
