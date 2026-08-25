import {
  ASSISTANT_INTENTS,
  ASSISTANT_SUGGESTIONS_BY_FORM,
  CARE_FORM_OVERRIDE,
  SIZELESS_SIZE_OVERRIDE,
} from '@/data/assistant';
import type { Locale } from '@/types/i18n';
import type { ProductForm } from '@/types/visual';

/** The two intents that assume the product being asked about has a clothing size. */
const SIZING_INTENTS = new Set(['size-general', 'size-height']);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ASK ATLANTIC — DEMO ENGINE
 *
 * Keyword scoring over a hand-written knowledge base. NO MODEL IS CALLED, no
 * network request is made, and no API key exists anywhere in this project.
 *
 * The interface is what matters: `answer()` is async and returns a typed
 * result, so replacing this file with a fetch to a route handler that proxies a
 * real model is a change to one function. Nothing in the UI knows the
 * difference.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface AssistantAnswer {
  /** Intent id, or null when nothing matched well enough. */
  intent: string | null;
  text: string;
  /** Product handles worth showing alongside the answer. */
  cites: string[];
  matched: boolean;
}

function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/**
 * Scores each intent by how many of its keywords appear in the question,
 * weighted by keyword length so that "impermeable" counts for much more than
 * "que". Without that weighting, common short words dominate and every question
 * matches the same intent.
 */
export function matchIntent(question: string, locale: Locale) {
  const text = normalise(question);
  if (text.length < 2) return null;

  let best: { id: string; score: number } | null = null;

  for (const intent of ASSISTANT_INTENTS) {
    let score = 0;
    for (const keyword of intent.keywords[locale]) {
      if (text.includes(normalise(keyword))) {
        score += Math.max(1, keyword.length / 3);
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { id: intent.id, score };
    }
  }

  // A single weak keyword hit is usually a coincidence; require real signal
  // before claiming an answer, so the fallback stays honest.
  return best && best.score >= 2 ? best : null;
}

export async function answer(
  question: string,
  locale: Locale,
  /** The product this question is being asked from, when asked on a PDP. */
  product?: { form: ProductForm; handle: string },
): Promise<AssistantAnswer> {
  const match = matchIntent(question, locale);

  if (!match) {
    return { intent: null, text: '', cites: [], matched: false };
  }

  // A sizing question asked from a product that has no clothing size gets its
  // own answer instead of the apparel one — see SIZELESS_SIZE_OVERRIDE.
  if (product && SIZING_INTENTS.has(match.id)) {
    const override = SIZELESS_SIZE_OVERRIDE[product.form];
    if (override) {
      return { intent: match.id, text: override[locale], cites: [product.handle], matched: true };
    }
  }

  // The generic `care` answer is written for the ATLANTIC 01's membrane.
  // Every other form's own PDP Care accordion describes something else
  // entirely, so a washing question asked from those products gets its own
  // answer instead — see CARE_FORM_OVERRIDE.
  if (product && match.id === 'care') {
    const careOverride = CARE_FORM_OVERRIDE[product.form];
    if (careOverride) {
      return { intent: match.id, text: careOverride[locale], cites: [product.handle], matched: true };
    }
  }

  const intent = ASSISTANT_INTENTS.find((candidate) => candidate.id === match.id);
  if (!intent) {
    return { intent: null, text: '', cites: [], matched: false };
  }

  return {
    intent: intent.id,
    text: intent.answer[locale],
    cites: intent.cites ?? [],
    matched: true,
  };
}

export function suggestionsFor(locale: Locale, form: ProductForm): string[] {
  return ASSISTANT_SUGGESTIONS_BY_FORM[form][locale];
}
