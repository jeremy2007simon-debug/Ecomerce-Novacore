# Atlantic Supply — NovaCore Commerce demo

A cinematic, mobile-first storefront for a fictional brand, built as a
commercial demonstration of what NovaCore Commerce can deliver: brand,
e-commerce, UX, automation, AI and analytics in one experience.

**Everything in this repository runs in DEMO MODE.** No payment is processed,
no AI model is called, no analytics vendor receives anything, and no external
API is contacted. See [Demo vs production](#demo-vs-production).

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000 → redirects to /es
```

No environment variables are required. The store runs entirely on local data.

```bash
npm run verify       # typecheck + lint + production build — the gate
npm run build && npm start
```

### Requirements

Node ≥ 20.9. Versions are exact-pinned (Next 16.3.2, React 19.2.8, Tailwind
4.3.3, Motion 13.1.1, TypeScript 5.9.3) — see [Toolchain notes](#toolchain-notes)
for why.

---

## Routes

| Route | What it is |
|---|---|
| `/[locale]` | Home — hero plus four scroll-linked storytelling scenes |
| `/[locale]/collection` | Product grid, filter and sort held in the URL |
| `/[locale]/product/[handle]` | Product page as a narrative sequence |
| `/[locale]/story` | Long-form brand editorial |
| `/[locale]/search` | Server-rendered results (the overlay is the primary path) |
| `/[locale]/checkout` | Four-step demo checkout |
| `/[locale]/demo/dashboard` | **NovaCore commerce dashboard** — not linked from the storefront |

`locale` is `es` (default) or `en`. Every route is statically prerendered in
both languages.

---

## Architecture

Static RSC HTML with a small number of surgical client islands. Copy, product
data, structural markup and all generated SVG are Server Components and ship
zero JavaScript. Client JS is spent only on scroll orchestration, the cart and
UI stores, overlays and the dashboard.

```
app/[locale]/          routes — never contain 'use client'
components/motion/     ScrollScene, StickyStage, SceneLayer, RevealText, …
components/visual/     ProductVisual seam, procedural art, brand marks
components/commerce/   cart, search, checkout, product card
components/product/    PDP sections, reviews, ASK ATLANTIC
components/dashboard/  KPIs, hand-rolled SVG chart, live event feed
data/                  demo fixtures — UI may never import these
lib/commerce/          repository interface, demo impl, Shopify stubs
lib/i18n/              typed dictionaries, server/client split
types/ styles/ public/
```

### Four seams, enforced by ESLint rather than by convention

Each protects a decision that is expensive to recover from once it has drifted.

1. **UI never imports `data/`.** Everything reads through `lib/commerce`, so
   swapping in Shopify is a configuration change, not a refactor.
2. **Route files never carry `'use client'`.** One directive at the top of a
   `page.tsx` converts all of its copy, data and SVG into client JS — and Next 16
   removed the build-output column that used to make that visible. (Error
   boundaries are exempted by filename; Next requires them to be client
   components.)
3. **Motion is imported as `m` from `motion/react-m`.** The bare `motion`
   factory pulls the whole feature bundle onto the critical path.
4. **No `Math.random()` or `Date.now()` in render.** Non-deterministic values
   make server and client HTML disagree; React 19 responds by discarding the
   subtree, which visibly replays entrance animations.

Try it: add `'use client'` to any `page.tsx`, or import `@/data/products` from a
component, and `npm run lint` fails.

---

## Demo vs production

### Demo (works now, connected to nothing)

- Catalogue, reviews, recommendations and dashboard figures — local fixtures
- Checkout — full four-step flow, **no payment processed**
- ASK ATLANTIC — keyword matching over a hand-written knowledge base
- Analytics — typed events dispatched to in-memory sinks only

### Production integration required

| Area | What is needed | Where |
|---|---|---|
| Catalogue | Implement `normalizeProduct`, set `COMMERCE_PROVIDER=shopify` | `lib/commerce/shopify/` |
| Payments | A server-side provider; the flow is UI-only today | `components/commerce/checkout/` |
| AI assistant | Route handler proxying a real model | `lib/assistant/engine.ts` |
| Analytics | Register a sink mapping `TrackedEvent` to a vendor SDK | `lib/analytics/` |
| Reviews | Replace fixtures; **remove the demo `aggregateRating`** from JSON-LD | `lib/seo/json-ld.ts` |

The Shopify adapter is written and typed, and every method throws
`NotConfiguredError`. That is deliberate: the interface is provably
implementable, the compiler keeps both adapters in step, and nothing can
silently pretend to be connected to a real store.

`.env.example` documents every variable. All are unset.

---

## Deploy

```bash
npm run build
```

Any Node host works; Vercel needs no configuration. Set
`NEXT_PUBLIC_SITE_URL` so canonical URLs, `hreflang` and the sitemap point at
the real domain — everything else works unset.

---

## Toolchain notes

- **ESLint is pinned to 9, not 10.** The `eslint-plugin-react` bundled by
  `eslint-config-next` calls `context.getFilename()`, removed in ESLint 10.
- **TypeScript is pinned to 5.9.3, not 7.x.** `typescript-eslint@8` peers
  `<6.1.0`, and Next only type-checks TS 7 behind an experimental flag.
- **`next build` no longer runs lint.** `npm run verify` is the gate.
- **`middleware.ts` is `proxy.ts`** in Next 16.
- **New `--text-*` or `--color-*` tokens must also be registered in
  `lib/utils/cn.ts`.** `tailwind-merge` does not know custom theme scales, so it
  treats `text-display` and `text-ink` as conflicting and silently drops the
  font size.

---

## Verification

```bash
npm run verify                                    # typecheck, lint, build
node scripts/flow.mjs                             # full purchase flow, 12 assertions
node scripts/qa.mjs                               # reduced motion, keyboard, a11y, cart
RUNS=3 bash scripts/run-lh-median.sh /es          # Lighthouse median
```

The browser scripts expect `npm start` on port 3100; the `scripts/run-*.sh`
wrappers manage that.

---

*Commerce experience by NovaCore.*
