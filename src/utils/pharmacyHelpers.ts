import {ImageSourcePropType} from 'react-native';
import type {PharmacyProduct} from '../api/pharmacy';
import {
  FALLBACK_PRODUCT,
  resolveImageSource,
} from './imageFallbacks';
import {
  getProductKind,
  unitTypeToVariant,
} from './productVariants';

export {unitTypeToVariant} from './productVariants';

export const DEFAULT_PRODUCT_IMAGE = FALLBACK_PRODUCT;

export function formatBdt(amount: number | string) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!Number.isFinite(n)) {
    return '৳0';
  }
  const hasFraction = Math.abs(n % 1) > 0.001;
  return `৳ ${n.toLocaleString('en-BD', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  })}`;
}

export function getProductImageSource(url?: string | null): ImageSourcePropType {
  return resolveImageSource(url, DEFAULT_PRODUCT_IMAGE);
}

export function productImageUrl(url?: string | null) {
  const source = getProductImageSource(url);
  if ('uri' in source && source.uri) {
    return source.uri;
  }
  return '';
}

export function productUnitPrice(product: PharmacyProduct) {
  const raw = product.discountPrice ?? product.unitPrice;
  return typeof raw === 'string' ? parseFloat(raw) : Number(raw);
}

export function productListPrice(product: PharmacyProduct) {
  const raw = product.unitPrice;
  return typeof raw === 'string' ? parseFloat(raw) : Number(raw);
}

export function discountPercent(product: PharmacyProduct) {
  if (!product.discountPrice) return null;
  const unit = productListPrice(product);
  const disc = productUnitPrice(product);
  if (disc >= unit) return null;
  return Math.round((1 - disc / unit) * 100);
}

export function matchesShopCategory(product: PharmacyProduct, chip: string) {
  if (chip === 'All Items') return true;
  if (chip === 'Medicines') return getProductKind(product.category) === 'medicine';
  return (product.category ?? '') === chip;
}

export function productVolumeLabel(product: PharmacyProduct) {
  if (product.unitType) return product.unitType;
  return product.category ?? '1 pc';
}

export function groupProductsForShop(products: PharmacyProduct[]) {
  const topPicks = products.filter(p => p.discountPrice != null).slice(0, 4);
  const baby = products.filter(p => p.category === 'Baby Products').slice(0, 4);
  const body = products.filter(p => p.category === 'Body Care').slice(0, 4);
  const sections = [
    {title: 'Top Picks', items: topPicks.length ? topPicks : products.slice(0, 4)},
    {title: 'Baby Products', items: baby.length ? baby : products.slice(4, 8)},
    {title: 'Oral & Body Care', items: body.length ? body : products.slice(8, 12)},
  ];
  return sections.filter(s => s.items.length > 0);
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  ON_THE_WAY: 'On the Way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: '#9AA6B2',
  CONFIRMED: '#45A096',
  PREPARING: '#45A096',
  ON_THE_WAY: '#FF9F43',
  DELIVERED: '#00A884',
  CANCELLED: '#DC6468',
};
