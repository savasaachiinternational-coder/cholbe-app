export const ORDER_STATUS_FLOW = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'ON_THE_WAY',
  'DELIVERED',
] as const;

export type OrderFlowStatus = (typeof ORDER_STATUS_FLOW)[number];

export function adminAllowedStatuses(current: string): string[] {
  if (current === 'CANCELLED' || current === 'DELIVERED') {
    return [];
  }

  const idx = ORDER_STATUS_FLOW.indexOf(current as OrderFlowStatus);
  if (idx === -1) {
    return [];
  }

  const forward = ORDER_STATUS_FLOW.slice(idx + 1);
  const cancel =
    current === 'PENDING' || current === 'CONFIRMED' ? ['CANCELLED'] : [];

  return [...forward, ...cancel];
}

export function vendorNextStatus(current: string): string | null {
  switch (current) {
    case 'PENDING':
      return 'CONFIRMED';
    case 'CONFIRMED':
      return 'PREPARING';
    case 'PREPARING':
      return 'ON_THE_WAY';
    case 'ON_THE_WAY':
      return 'DELIVERED';
    default:
      return null;
  }
}

export function vendorActionLabel(current: string): string | null {
  switch (current) {
    case 'CONFIRMED':
      return 'Mark as Preparing';
    case 'PREPARING':
      return 'Ready for Pickup';
    case 'ON_THE_WAY':
      return 'Mark as Delivered';
    default:
      return null;
  }
}
