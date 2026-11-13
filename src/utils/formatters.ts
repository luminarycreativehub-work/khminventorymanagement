/**
 * Formats a number into clean real estate currency display.
 * Displays both formatted digit string and local Pakistani/South Asian nomenclature (Crore / Lac) where applicable.
 */
export function formatPrice(price: number, currency: string = 'PKR'): string {
  if (isNaN(price) || price === null || price === undefined) return `${currency} 0`;

  let denomination = '';
  if (price >= 10000000) {
    const crores = price / 10000000;
    denomination = ` (${crores.toFixed(2).replace(/\.00$/, '')} Crore)`;
  } else if (price >= 100000) {
    const lacs = price / 100000;
    denomination = ` (${lacs.toFixed(2).replace(/\.00$/, '')} Lac)`;
  }

  return `${currency} ${price.toLocaleString()}${denomination}`;
}

/**
 * Format relative or full dates
 */
export function formatDate(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
