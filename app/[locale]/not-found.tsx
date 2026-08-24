import { NotFoundView } from '@/components/layout/not-found-view';

/**
 * 404.
 *
 * A route file, so it stays a Server Component. The body is a client island
 * because a not-found render gets no route params, and the only correct source
 * for the visitor's language is the locale provider the layout already
 * supplies — see `NotFoundView` for why the alternatives were rejected.
 */
export default function NotFound() {
  return <NotFoundView />;
}
