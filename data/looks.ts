import type { Localized } from '@/types/i18n';

/**
 * Shop the Look — data model and component are built (see
 * components/home/shop-the-look.tsx) but NOT mounted on the home page this
 * phase.
 *
 * No genuine multi-product lifestyle photograph exists anywhere in this
 * codebase (only single-product studio shots, one per product, first
 * colorway — see public/products/*.webp), and none may be fabricated. A
 * single-product photo cannot honestly stand in for "a look." Ships as an
 * empty array rather than a placeholder entry — populate it and import
 * <ShopTheLook> from the home page once real lifestyle photography exists.
 */

export interface LookHotspot {
  /** Percent position within the image, 0-100. */
  x: number;
  y: number;
  productHandle: string;
}

export interface Look {
  id: string;
  title: Localized<string>;
  image: { src: string; alt: Localized<string>; aspect: '3/4' | '4/5' | '1/1' } | null;
  hotspots: LookHotspot[];
}

export const DEMO_LOOKS: Look[] = [];
