/**
 * Dynamically imported Motion feature bundle.
 *
 * `domAnimation` (~15 kB) covers transforms, opacity, variants, gestures and
 * whileInView — everything this site actually uses. `domMax` adds layout
 * animations and drag for roughly twice the size; if the cart drawer ever needs
 * layout animation it should load domMax inside its OWN dynamic chunk rather
 * than upgrading this global one.
 */
export { domAnimation as default } from 'motion/react';
