import type {ImageSourcePropType} from 'react-native';
import {API_ORIGIN} from '../config/api';
import {imageUri} from './fileAsset';

export const FALLBACK_AVATAR = require('../assets/logo.png');
export const FALLBACK_PRODUCT = require('../assets/b2.png');
export const FALLBACK_BANNER = require('../assets/b3.png');

export function isUnreliableImageUrl(url?: string | null) {
  if (!url?.trim()) {
    return true;
  }
  const lower = url.trim().toLowerCase();
  return (
    lower.includes('via.placeholder.com') ||
    lower.includes('placeholder.com/') ||
    lower === 'null' ||
    lower === 'undefined'
  );
}

/**
 * Resolve a remote/relative image URL to an Image source, falling back to a
 * bundled asset when the URL is missing or a known placeholder host.
 */
export function resolveImageSource(
  url?: string | null,
  fallback: ImageSourcePropType = FALLBACK_AVATAR,
): ImageSourcePropType {
  const trimmed = url?.trim();
  if (!trimmed || isUnreliableImageUrl(trimmed)) {
    return fallback;
  }
  return {uri: imageUri(trimmed, API_ORIGIN)};
}
