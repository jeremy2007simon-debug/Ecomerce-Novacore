/**
 * GENERATED FILE — do not edit by hand.
 * Produced by scripts/optimize-images.mjs.
 *
 * Dimensions and blur placeholders for the committed brand photography.
 * Keeping them here means a product page never touches the filesystem and the
 * blur is inlined into the prerendered HTML, so there is no layout shift and no
 * flash of empty frame.
 */
export interface MediaManifestEntry {
  file: string;
  width: number;
  height: number;
  blurDataURL: string;
}

export const MEDIA_MANIFEST: Record<string, MediaManifestEntry> = {
  'atlantic-01': {
    file: '/products/atlantic-01.webp',
    width: 896,
    height: 1152,
    blurDataURL:
      'data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAAAQBACdASoQABUAPu1iqk2ppaQiMAgBMB2JYwC06CBRx0sgZOXZa5+/AAD8qmZXVopCitsjiwN7DWb9Xdj8h/tOzByU4dwpS6KazEXdHGTf2LoefVF/yeIW89Juic2Grk0r/9XCCi6OauDR0n+viK4AAAA=',
  },
  'atlantic-bottle': {
    file: '/products/atlantic-bottle.webp',
    width: 896,
    height: 1152,
    blurDataURL:
      'data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAADQAwCdASoQABUAPu1kq04ppaQiMAgBMB2JZQC7ACBUyegTRiEF73AA/jekObFY9q5HDkljiEblqUOsupgMRR4++A/CFw7jHnhPUvy6roMxcdnkYqeG/zEbwzSYpbq221AAAA==',
  },
  'basalt-knit': {
    file: '/products/basalt-knit.webp',
    width: 896,
    height: 1152,
    blurDataURL:
      'data:image/webp;base64,UklGRnQAAABXRUJQVlA4IGgAAAAQBACdASoQABUAPu1iqk2ppaQiMAgBMB2JZQC/OB4XF/0BXkBWFk0aYADz8rBIKxvqBMD323xx4zYW3wO7y9jHfYgCHflz6V+S6SZCSn6ST5GCvefIpZcYj4bVY+kQB041kyuM54AAAA==',
  },
  'current-bag': {
    file: '/products/current-bag.webp',
    width: 896,
    height: 1152,
    blurDataURL:
      'data:image/webp;base64,UklGRnQAAABXRUJQVlA4IGgAAAAQBACdASoQABUAPu1iqk4ppaQiMAgBMB2JZQDImCIO2uT3llWY+HTuAAD+0Lx8DE5xJUOJ1f8uf8RJakoEr76zLnD7qzNImxjF0XnzuCZnyRyPKcUlwvXpuhbO5xgY+PFJQ0pI8miAAA==',
  },
  'north-cap': {
    file: '/products/north-cap.webp',
    width: 896,
    height: 1152,
    blurDataURL:
      'data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAQBACdASoQABUAPu1iqU2ppaOiMAgBMB2JYwCdABVBc6m2ZXVP09mHgAD+UtfRk3UUq/gLTs+qv24EyE15S3PwWSMn0W6qft1eUXmvKWxF2LEdmPuGkTOhy3oaYYZS4AKkAAAA',
  },
  'tide-01': {
    file: '/products/tide-01.webp',
    width: 896,
    height: 1152,
    blurDataURL:
      'data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAACwAwCdASoQABUAPu1iqk2ppaQiMAgBMB2JZQDCgBnD3IE7rbECMAD+X9w4q/uBeAzE5cDiffBAj/4uG6LwV+jOEVPqTXUE0BnS2b44vo61FVsjhvYSl7oDUFuMWHRdNHhXDyKpDx63P9XTQNUAAA==',
  },
  'trade-pant': {
    file: '/products/trade-pant.webp',
    width: 896,
    height: 1152,
    blurDataURL:
      'data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAACwAwCdASoQABUAPu1mqk2ppaQiMAgBMB2JYwCAAAZa0OPX37lKAAD+OqoOgKpMVqO50LlhNhCHcqLeuvRW66nzhl/8fJ9vlQJvgjiKo0f6ml83tQ41Mvs/rKTRfH2AAAA=',
  },
  'volcanic-tee': {
    file: '/products/volcanic-tee.webp',
    width: 896,
    height: 1152,
    blurDataURL:
      'data:image/webp;base64,UklGRowAAABXRUJQVlA4IIAAAABwBACdASoQABUAPu1iqU2ppaOiMAgBMB2JZQCpE8ACvCWI93rTH4OWIAOUwAD6/lnrZQXdCTU54KPoUD5DmJlLaxxmBYg0+Bo00XTBltzCWWYDQEX1uC6jbbLpk1Q3qQTAnnpJxHOLag7dVycKW4KPYes4/chIjxMDx2yDVAAAAA==',
  },
};

/** Look up committed photography for a handle, if any exists. */
export function mediaFor(handle: string): MediaManifestEntry | undefined {
  return MEDIA_MANIFEST[handle];
}
