/**
 * Interpolate `{name}` placeholders.
 *
 * Deliberately not ICU MessageFormat. Roughly 200 keys with simple substitution
 * do not justify a runtime formatter; where plurals matter (one item / N items)
 * the dictionary carries both forms and the call site picks, which is more
 * readable than a plural rule embedded in a string.
 */
export function format(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
}
