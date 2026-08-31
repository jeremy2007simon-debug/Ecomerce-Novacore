/**
 * One email shape check, shared by checkout and the newsletter form so the two
 * can never silently drift apart on what counts as "valid".
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}
