import { Archivo, JetBrains_Mono, Instrument_Serif } from 'next/font/google';

/**
 * Three families, three jobs.
 *
 *  archivo    — display + UI. A workhorse grotesk that holds -0.045em tracking
 *               at hero sizes without the counters collapsing, which is what
 *               lets one family cover 11px labels and 200px headlines.
 *  jetbrains  — mono micro-labels, coordinates, SKUs, tabular figures.
 *  instrument — a single high-contrast serif accent, used perhaps four times on
 *               the whole site. `preload: false` because it is never above the
 *               fold and preloading it would compete with the two that are.
 *
 * `display: 'swap'` + Next's automatic size-adjusted fallback means the headline
 * is legible in the fallback face at t=0 with minimal reflow — a font-blocking
 * hero is an LCP failure no amount of animation polish recovers from.
 */

export const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  preload: true,
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['300', '400', '500'],
  preload: true,
});

export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
  weight: ['400'],
  style: ['normal', 'italic'],
  preload: false,
});

export const fontVariables = [
  archivo.variable,
  jetbrainsMono.variable,
  instrumentSerif.variable,
].join(' ');
