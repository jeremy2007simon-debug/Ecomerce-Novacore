/**
 * The catalogue has two real, structurally different size systems — apparel
 * letter sizes and the trade pant's numeric waist sizes — so a single
 * hardcoded array would silently mis-sort one of them. Used only to order
 * the collection filter's size chips; PDP's own size selection already
 * renders in the correct build-time order and is untouched.
 */
const LETTER_SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export function sortSizeValues(values: string[]): string[] {
  const allNumeric = values.every((v) => /^\d+$/.test(v));
  if (allNumeric) {
    return [...values].sort((a, b) => Number(a) - Number(b));
  }

  const allLetters = values.every((v) => LETTER_SIZE_ORDER.includes(v.toUpperCase()));
  if (allLetters) {
    return [...values].sort(
      (a, b) => LETTER_SIZE_ORDER.indexOf(a.toUpperCase()) - LETTER_SIZE_ORDER.indexOf(b.toUpperCase()),
    );
  }

  return [...values].sort((a, b) => a.localeCompare(b));
}
