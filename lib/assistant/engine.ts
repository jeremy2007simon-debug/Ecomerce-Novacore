import { ASSISTANT_INTENTS, ASSISTANT_SUGGESTIONS } from '@/data/assistant';
import type { Locale } from '@/types/i18n';

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

export async function answer(question: string, locale: Locale): Promise<AssistantAnswer> {
  const match = matchIntent(question, locale);

  if (!match) {
    return { intent: null, text: '', cites: [], matched: false };
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

export function suggestionsFor(locale: Locale): string[] {
  return ASSISTANT_SUGGESTIONS[locale];
}
