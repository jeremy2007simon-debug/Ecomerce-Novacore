import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ARCHITECTURAL SEAMS ENFORCED HERE
 *
 * These are not style rules. Each one protects a decision that is expensive to
 * recover from once it has drifted:
 *
 *  1. UI never imports demo data directly  → keeps the Shopify swap a data change
 *  2. Motion is imported through LazyMotion → keeps Motion off the critical path
 *  3. `'use client'` never lands in a route → keeps pages as zero-JS RSC
 *  4. No Math.random()/new Date() in render → keeps SSR and client output identical
 * ─────────────────────────────────────────────────────────────────────────────
 */
const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'out/**'],
  },

  {
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // SEAM 2 — Motion import discipline.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'motion/react-client',
              message:
                'motion/react-client eagerly bundles the full feature set (~34kB) and defeats LazyMotion. Use `m` from motion/react-m inside <MotionProvider>.',
            },
            {
              name: 'motion/react',
              importNames: ['motion'],
              message:
                'SEAM: the `motion` component factory pulls the whole feature bundle onto the critical path. Import `m` from motion/react-m instead; hooks (useScroll, useTransform, ...) from motion/react are fine.',
            },
          ],
          patterns: [
            {
              group: ['@/data', '@/data/*'],
              message:
                'SEAM: UI must read commerce data through lib/commerce, never from data/ directly. Only lib/commerce/demo/** may import @/data.',
            },
          ],
        },
      ],

      // SEAM 4 — determinism. Non-deterministic values in render cause hydration
      // mismatches that React 19 resolves by discarding and re-rendering the whole
      // subtree, which visibly replays entrance animations.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='Math'][callee.property.name='random']",
          message:
            'Math.random() is banned: it differs between server and client render. Use mulberry32 from lib/utils/prng.ts with an explicit seed.',
        },
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message:
            'Date.now() is banned: it differs between server and client render. Use the DEMO_NOW constant.',
        },
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message:
            'new Date() with no argument is banned: it differs between server and client render. Use the DEMO_NOW constant.',
        },
      ],
    },
  },

  // SEAM 1 (inverse) — the DATA LAYER may read data/. UI may not.
  //
  // The rule protects a boundary, not a directory: everything listed here is a
  // module whose job is to turn demo fixtures into domain objects, which is
  // exactly what a Shopify adapter would do. Adding a path here is a deliberate
  // statement that the module is part of the data layer — never a way to quiet
  // the rule for a component.
  {
    files: [
      'lib/commerce/**/*.ts',
      'lib/assistant/**/*.ts',
      'lib/dashboard/**/*.ts',
      'data/**/*.ts',
    ],
    rules: { 'no-restricted-imports': 'off' },
  },

  // Error boundaries are the ONE exception to SEAM 3, and not by choice: Next
  // requires error.tsx and global-error.tsx to be Client Components, because
  // they receive a `reset` function and must be able to re-render on the
  // client. They are exempted narrowly, by filename, rather than by loosening
  // the rule for the whole app directory.
  {
    files: ['app/**/error.tsx', 'app/**/global-error.tsx'],
    rules: { 'no-restricted-syntax': 'off' },
  },

  // SEAM 3 — route files stay Server Components. A single 'use client' at the top
  // of a page.tsx converts all of its copy, data and SVG into client JS, and Next 16
  // removed the build-output column that used to make that visible.
  {
    files: ['app/**/*.tsx', 'app/**/*.ts'],
    ignores: ['app/**/error.tsx', 'app/**/global-error.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "ExpressionStatement > Literal[value='use client']",
          message:
            "SEAM: route files must stay Server Components. Move the interactive part into a leaf under components/ and pass server-rendered children through it.",
        },
        {
          selector:
            "CallExpression[callee.object.name='Math'][callee.property.name='random']",
          message: 'Math.random() is banned in render. Use lib/utils/prng.ts with a seed.',
        },
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: 'Date.now() is banned in render. Use the DEMO_NOW constant.',
        },
      ],
    },
  },

  // Infrastructure that legitimately needs entropy or wall-clock time, none of
  // which runs during a server render of page content.
  {
    files: [
      'lib/analytics/**/*.ts',
      'lib/utils/prng.ts',
      'lib/utils/id.ts',
      'lib/store/**/*.ts',
      'components/commerce/checkout/**/*.tsx',
    ],
    rules: { 'no-restricted-syntax': 'off' },
  },
];

export default config;
