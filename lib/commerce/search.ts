import type { Product } from '@/types/commerce';

/**
 * Tokenised scoring over the in-memory product index.
 *
 * Deliberately not a fuzzy-matching library. For a catalogue of this size,
 * prefix matching with weighted fields gives better results than trigram
 * similarity and costs nothing — typing "atl" must return ATLANTIC 01 and
 * ATLANTIC BOTTLE instantly, and typing "chaqueta" must find the shell via its
 * localized subtitle.
 *
 * Field weights, highest first: title > subtitle > tags > material > description.
 * A title prefix match outranks a description substring by an order of
 * magnitude, which is what stops "cap" from surfacing every product whose
 * description contains "capa".
 */

const FIELD_WEIGHTS = {
  titleExact: 120,
  titlePrefix: 90,
  titleWord: 60,
  subtitlePrefix: 40,
  subtitleWord: 26,
  tag: 22,
  material: 14,
  descriptionWord: 8,
} as const;

function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    // Strip diacritics so "algodon" matches "algodón" and vice versa.
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

function tokenise(value: string): string[] {
  return normalise(value)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0);
}

function scoreField(tokens: string[], field: string, prefixWeight: number, wordWeight: number) {
  const normalisedField = normalise(field);
  const fieldTokens = tokenise(field);
  let score = 0;

  for (const token of tokens) {
    if (normalisedField.startsWith(token)) {
      score += prefixWeight;
      continue;
    }
    if (fieldTokens.some((ft) => ft.startsWith(token))) {
      score += wordWeight;
      continue;
    }
    if (token.length >= 4 && normalisedField.includes(token)) {
      score += wordWeight * 0.4;
    }
  }

  return score;
}

export interface SearchHit {
  product: Product;
  score: number;
}

export function scoreProduct(product: Product, query: string): number {
  const tokens = tokenise(query);
  if (tokens.length === 0) return 0;

  const normalisedTitle = normalise(product.title);
  const normalisedQuery = normalise(query);

  let score = 0;

  if (normalisedTitle === normalisedQuery) {
    score += FIELD_WEIGHTS.titleExact;
  }

  score += scoreField(tokens, product.title, FIELD_WEIGHTS.titlePrefix, FIELD_WEIGHTS.titleWord);
  score += scoreField(
    tokens,
    product.subtitle,
    FIELD_WEIGHTS.subtitlePrefix,
    FIELD_WEIGHTS.subtitleWord,
  );

  for (const tag of product.tags) {
    score += scoreField(tokens, tag, FIELD_WEIGHTS.tag, FIELD_WEIGHTS.tag * 0.6);
  }

  score += scoreField(
    tokens,
    product.metafields.material,
    FIELD_WEIGHTS.material,
    FIELD_WEIGHTS.material * 0.7,
  );
  score += scoreField(
    tokens,
    product.description,
    FIELD_WEIGHTS.descriptionWord,
    FIELD_WEIGHTS.descriptionWord * 0.5,
  );

  // Every query token must contribute something, otherwise "atlantic jersey"
  // would rank ATLANTIC 01 highly on the strength of one token alone.
  const matchedTokens = tokens.filter(
    (token) =>
      normalise(product.title).includes(token) ||
      normalise(product.subtitle).includes(token) ||
      product.tags.some((t) => normalise(t).includes(token)) ||
      normalise(product.description).includes(token) ||
      normalise(product.metafields.material).includes(token),
  ).length;

  if (matchedTokens < tokens.length) {
    score *= matchedTokens / tokens.length;
  }

  return score;
}

export function searchIndex(products: Product[], query: string, limit = 8): SearchHit[] {
  if (query.trim().length === 0) return [];

  return products
    .map((product) => ({ product, score: scoreProduct(product, query) }))
    .filter((hit) => hit.score > 0)
    // Stable tiebreak on handle: two products with identical scores must always
    // sort the same way, or SSR and client renders can disagree.
    .sort((a, b) => b.score - a.score || a.product.handle.localeCompare(b.product.handle))
    .slice(0, limit);
}
