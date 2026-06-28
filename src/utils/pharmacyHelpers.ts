import {API_ORIGIN} from '../config/api';
import type {PharmacyProduct} from '../api/pharmacy';

export function formatBdt(amount: number | string) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `৳${n.toFixed(2)}`;
}

export function productImageUrl(url?: string | null) {
  if (!url) {
    return 'https://via.placeholder.com/300/4682B4/FFFFFF?text=Product';
  }
  if (url.startsWith('http')) {
    return url;
  }
  return `${API_ORIGIN}${url}`;
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

export function unitTypeToVariant(unitType?: string | null): 'PC' | 'STRIPE' | 'BOX' {
  const u = (unitType ?? '').toLowerCase();
  if (u.includes('box')) return 'BOX';
  if (u.includes('stripe') || u.includes('strip')) return 'STRIPE';
  return 'PC';
}

const MEDICINE_CATEGORIES = new Set(['Tablet', 'Capsule', 'Syrup', 'Medicines']);

export function matchesShopCategory(product: PharmacyProduct, chip: string) {
  if (chip === 'All Items') return true;
  if (chip === 'Medicines') return MEDICINE_CATEGORIES.has(product.category ?? '');
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
