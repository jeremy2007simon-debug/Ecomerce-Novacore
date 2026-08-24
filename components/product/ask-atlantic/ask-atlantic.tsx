'use client';

import Link from 'next/link';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useId, useState } from 'react';
import { DemoBadge } from '@/components/ui/demo-badge';
import { IconArrowRight, IconSpark } from '@/components/visual/icons';
import { useLocale } from '@/lib/i18n/locale-provider';
import { answer, suggestionsFor, type AssistantAnswer } from '@/lib/assistant/engine';
import { track } from '@/lib/analytics';
import { routes } from '@/lib/utils/routes';
import { cn } from '@/lib/utils/cn';
import type { Product } from '@/types/commerce';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ASK ATLANTIC.
 *
 * Deliberately NOT a floating chat bubble in the corner. The brief rules that
 * out and it is the right call: a generic widget hovering over the page reads
 * as bolted-on software, while a module sitting in the product's own flow reads
 * as part of the brand.
 *
 * It also earns its place by asking the questions a shopper actually has at
 * that moment — sizing, fabric, what to wear at a given temperature — rather
 * than an empty "How can I help you?".
 *
 * DEMO: answers come from a local keyword engine (lib/assistant/engine.ts).
 * No model is called and no network request is made. The DEMO badge says so
 * on screen, not just in the source.
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface Exchange {
  id: number;
  question: string;
  response: AssistantAnswer;
}

export function AskAtlantic({
  product,
  catalogue,
}: {
  product: Product;
  catalogue: { handle: string; title: string }[];
}) {
  const { t, locale } = useLocale();
  const inputId = useId();
  const [question, setQuestion] = useState('');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [pending, setPending] = useState(false);

  const suggestions = suggestionsFor(locale);

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length === 0 || pending) return;

    setPending(true);
    setQuestion('');

    const response = await answer(trimmed, locale);

    track({
      name: 'ai_assistant_query',
      payload: { intent: response.intent ?? 'fallback', matched: response.matched },
    });

    setExchanges((current) => [
      ...current,
      { id: current.length, question: trimmed, response },
    ]);
    setPending(false);
  };

  return (
    <section
      aria-labelledby="ask-atlantic-heading"
      className="editorial border-t border-hairline py-[--spacing-section]"
    >
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="label flex items-center gap-2.5 text-ember">
            <IconSpark className="size-4" />
            Ask Atlantic
          </p>
          <h2 id="ask-atlantic-heading" className="text-headline mt-6 font-medium text-ink">
            {t.assistant.subtitle}
          </h2>
          <p className="reading mt-5 text-small text-ink-muted">{t.assistant.demoNote}</p>
          <DemoBadge tone="accent" className="mt-5" />
        </div>

        <div className="flex flex-col">
          {/* Thread */}
          <div className="flex flex-col gap-8">
            <AnimatePresence initial={false}>
              {exchanges.map((exchange) => (
                <m.div
                  key={exchange.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-hairline pb-8"
                >
                  <p className="text-subtitle font-medium text-ink">{exchange.question}</p>

                  <p className="mt-4 text-small leading-relaxed text-ink-muted">
                    {exchange.response.matched ? exchange.response.text : t.assistant.fallback}
                  </p>

                  {/* Cited products — the part that makes the answer actionable. */}
                  {exchange.response.cites.length > 0 ? (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {exchange.response.cites.map((handle) => {
                        const cited = catalogue.find((item) => item.handle === handle);
                        if (!cited) return null;
                        return (
                          <li key={handle}>
                            <Link
                              href={routes.product(locale, handle)}
                              className="micro-label group inline-flex items-center gap-2 rounded-xs border border-hairline-strong px-3 py-2 text-ink-muted transition-colors hover:border-mist hover:text-ink"
                            >
                              {cited.title}
                              <IconArrowRight className="size-3 text-ember transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </m.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Suggestions — only before the first question. */}
          {exchanges.length === 0 ? (
            <div className="mb-8">
              <p className="micro-label mb-4 text-ink-subtle">{t.assistant.suggestionsTitle}</p>
              <ul className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onClick={() => void ask(suggestion)}
                      className="rounded-xs border border-hairline-strong px-3.5 py-2.5 text-left text-small text-ink-muted transition-colors hover:border-mist hover:text-ink"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void ask(question);
            }}
            className={cn('flex items-center gap-4 border-b border-hairline-strong pb-4', exchanges.length > 0 && 'mt-8')}
          >
            <label htmlFor={inputId} className="sr-only">
              {t.assistant.placeholder}
            </label>
            <input
              id={inputId}
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={t.assistant.placeholder}
              autoComplete="off"
              className="w-full bg-transparent text-small text-ink outline-none placeholder:text-ink-subtle"
            />
            <button
              type="submit"
              disabled={question.trim().length === 0 || pending}
              className="label shrink-0 text-ember transition-opacity disabled:opacity-30"
            >
              {pending ? t.assistant.thinking : t.assistant.send}
            </button>
          </form>

          <p className="micro-label mt-4 text-ink-subtle">
            {product.title} · {t.assistant.demoNote}
          </p>
        </div>
      </div>
    </section>
  );
}
