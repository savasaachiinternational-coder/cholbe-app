import type {PharmacyProduct} from '../api/pharmacy';

export type ApiVariant = 'PC' | 'STRIPE' | 'BOX';

export type ProductKind = 'medicine' | 'personal_care';

export type PurchaseOption = {
  key: ApiVariant;
  label: string;
};

export const MEDICINE_CATEGORIES = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Injection',
  'Inhaler',
  'Medicines',
] as const;

export const PERSONAL_CARE_CATEGORIES = [
  'Body Care',
  'Beauty',
  'Skin Care',
  'Hair Care',
  'Oral Care',
  "Women's Care",
  'Baby Products',
] as const;

export const MEDICINE_UNIT_TYPES = ['Piece', 'Stripe', 'Box'] as const;
export const PERSONAL_CARE_UNIT_TYPES = [
  'Bottle',
  'Tube',
  'Pack',
  'Jar',
  'Piece',
  'Box',
] as const;

const STRIPE_PIECES = 10;
const BOX_STRIPES = 10;

export function getProductKind(category?: string | null): ProductKind {
  const cat = (category ?? '').trim();
  if (!cat) return 'medicine';
  if ((MEDICINE_CATEGORIES as readonly string[]).includes(cat)) return 'medicine';
  if ((PERSONAL_CARE_CATEGORIES as readonly string[]).includes(cat)) {
    return 'personal_care';
  }
  return 'medicine';
}

export function isMedicineProduct(
  product: Pick<PharmacyProduct, 'category'>,
): boolean {
  return getProductKind(product.category) === 'medicine';
}

export function unitTypesForCategory(category: string): readonly string[] {
  return isMedicineCategory(category)
    ? MEDICINE_UNIT_TYPES
    : PERSONAL_CARE_UNIT_TYPES;
}

export function isMedicineCategory(category: string): boolean {
  return (MEDICINE_CATEGORIES as readonly string[]).includes(category);
}

export function unitTypeToVariant(unitType?: string | null): ApiVariant {
  const u = (unitType ?? '').toLowerCase();
  if (u.includes('box')) return 'BOX';
  if (u.includes('stripe') || u.includes('strip')) return 'STRIPE';
  return 'PC';
}

function pieceLabel(unitType?: string | null, kind: ProductKind = 'medicine'): string {
  const unit = (unitType ?? '').trim();
  if (!unit) return '1 PC';
  const lower = unit.toLowerCase();
  if (
    kind === 'medicine' &&
    (lower.includes('box') || lower.includes('stripe') || lower.includes('strip'))
  ) {
    return '1 PC';
  }
  return `1 ${unit}`;
}

/** Purchase options shown on product detail — mirrors common pharmacy / grocery apps. */
export function getPurchaseOptions(
  product: Pick<PharmacyProduct, 'category' | 'unitType'>,
): PurchaseOption[] {
  const kind = getProductKind(product.category);
  const unit = (product.unitType ?? '').trim();
  const normalized = unit.toLowerCase();

  if (kind === 'personal_care') {
    return [{key: 'PC', label: pieceLabel(unit, kind)}];
  }

  if (normalized.includes('box')) {
    return [
      {key: 'PC', label: pieceLabel(unit, kind)},
      {key: 'STRIPE', label: `1 Stripe = ${STRIPE_PIECES} pcs`},
      {key: 'BOX', label: `1 Box = ${BOX_STRIPES} Stripes`},
    ];
  }

  if (normalized.includes('stripe') || normalized.includes('strip')) {
    return [
      {key: 'PC', label: pieceLabel(unit, kind)},
      {key: 'STRIPE', label: `1 Stripe = ${STRIPE_PIECES} pcs`},
    ];
  }

  return [{key: 'PC', label: pieceLabel(unit, kind)}];
}

export function defaultPurchaseOption(
  product: Pick<PharmacyProduct, 'category' | 'unitType'>,
): PurchaseOption {
  const options = getPurchaseOptions(product);
  const preferred = unitTypeToVariant(product.unitType);
  return options.find(option => option.key === preferred) ?? options[0];
}

export function variantLabelForProduct(
  product: Pick<PharmacyProduct, 'category' | 'unitType'>,
  variant: ApiVariant,
): string {
  return (
    getPurchaseOptions(product).find(option => option.key === variant)?.label ??
    variant
  );
}

export function productInfoTabLabel(category?: string | null): string {
  return getProductKind(category) === 'medicine' ? 'Medicine Info' : 'Product Info';
}

export function productSubtitle(product: PharmacyProduct): string {
  if (isMedicineProduct(product)) {
    return product.genericName ?? product.category ?? 'Medicine';
  }
  return product.brand ?? product.genericName ?? product.category ?? 'Product';
}

export function variantLabelForUnit(
  unitType: string | null | undefined,
  category: string | null | undefined,
  variant: ApiVariant,
): string {
  const resolvedCategory =
    category ?? inferProductCategoryFromUnitType(unitType) ?? undefined;
  return variantLabelForProduct({category: resolvedCategory, unitType}, variant);
}

function inferProductCategoryFromUnitType(unitType?: string | null): string | null {
  const unit = (unitType ?? '').trim().toLowerCase();
  if (!unit) return null;
  if (['bottle', 'tube', 'pack', 'jar'].some(token => unit.includes(token))) {
    return 'Body Care';
  }
  if (
    unit.includes('stripe') ||
    unit.includes('strip') ||
    unit.includes('box') ||
    unit.includes('piece') ||
    unit.includes('pc')
  ) {
    return 'Tablet';
  }
  return null;
}

export function productMetaLines(product: PharmacyProduct): {
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel: string;
  secondaryValue: string;
} {
  if (isMedicineProduct(product)) {
    return {
      primaryLabel: 'Generics',
      primaryValue: product.genericName ?? product.name,
      secondaryLabel: 'Type',
      secondaryValue:
        product.medicine?.medicineType ?? product.category ?? 'Medicine',
    };
  }
  return {
    primaryLabel: 'Brand',
    primaryValue: product.brand ?? product.name,
    secondaryLabel: 'Category',
    secondaryValue: product.category ?? 'Personal Care',
  };
}
