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

### Shopify mode (`COMMERCE_PROVIDER=shopify`)

Catalogue, cart and checkout are real once `SHOPIFY_STORE_DOMAIN` and
`SHOPIFY_STOREFRONT_TOKEN` are set (see `.env.example` — values go in a
gitignored `.env.local`, never committed). The cart becomes a real Shopify
Cart (`cartCreate`/`cartLinesAdd`/`cartLinesUpdate`/`cartLinesRemove`), and
"Proceed to checkout" redirects the browser to the cart's real
`checkoutUrl` — Shopify's own hosted, off-site checkout, where payment
actually happens. No separate payment integration lives in this repo; that
page is Shopify's.

**Metafields the store must define** (Settings → Custom data → Products, or
via the Admin API), read by `lib/commerce/shopify/normalize.ts`:

| Metafield | Type | Maps to |
|---|---|---|
| `spec.subtitle` | Single line text | `Product.subtitle` |
| `spec.material` | Single line text | `metafields.material` |
| `spec.composition` | Single line text | `metafields.composition` |
| `spec.weight_grams` | Integer | `metafields.weightGrams` |
| `spec.origin` | Single line text | `metafields.origin` |
| `spec.care` | List of single line text | `metafields.care` |
| `story.body` | Multi line text | `metafields.story` |
| `spec.features` | JSON, `[{key,label,detail}]` | `metafields.features` |
| `spec.specs` | JSON, `[{label,value}]` | `metafields.specs` |
| `rec.pairs_with` | **List of single line text — product HANDLES, not a product-reference metafield** | `metafields.pairsWith` |
| `spec.shipping` | Multi line text | `metafields.shipping` |
| `spec.returns` | Multi line text | `metafields.returns` |

Every field above has a fallback (`''`, `[]`, or `0`) — a product missing a
metafield still normalizes successfully. There is no Shopify equivalent for
a product rating object; `rating` defaults to `{value:0, count:0}` rather
than inventing a number.

**`productType` → the site's internal product category**, used to decide
which PDP modules apply (a size selector makes no sense on a bottle). Set
each product's `productType` in the Shopify admin to one of the left-hand
values below; anything else silently falls back to `tee` (audit your real
catalogue's `productType` values against this table before going live):

| `productType` (case-insensitive) | Category |
|---|---|
| `shell`, `jacket`, `outerwear` | Waterproof shell |
| `overshirt`, `shirt` | Overshirt |
| `tee`, `t-shirt` | T-shirt |
| `knit`, `sweater`, `jumper` | Knitwear |
| `pant`, `pants`, `trouser`, `trousers` | Trousers |
| `bag` | Bag (no size option) |
| `cap`, `hat` | Cap (no size option) |
| `bottle` | Bottle (no size option) |

### Production integration still required

| Area | What is needed | Where |
|---|---|---|
| AI assistant | Route handler proxying a real model | `lib/assistant/engine.ts` |
| Analytics | Register a sink mapping `TrackedEvent` to a vendor SDK | `lib/analytics/` |
| Reviews | Shopify has no reviews API — this repo intentionally keeps demo review data in both modes rather than inventing one; wire a real reviews provider here if needed | `lib/commerce/reviews.ts` |

`.env.example` documents every variable. All are unset by default (demo mode).

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
