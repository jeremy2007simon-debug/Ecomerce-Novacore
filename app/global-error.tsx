'use client';

/**
 * Root error boundary.
 *
 * This replaces the root layout when it is the layout itself that failed, so it
 * MUST render its own <html> and <body> — and it cannot rely on the app's CSS
 * or fonts having loaded. The styles here are inline for that reason.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0B0D',
          color: '#F5F2EC',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: '32rem' }}>
          <p
            style={{
              fontSize: '0.6875rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#8B8F96',
              margin: 0,
            }}
          >
            Atlantic Supply
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 500, margin: '1.5rem 0 0' }}>
            Algo se ha roto
          </h1>
          <p style={{ color: '#B4B8BE', lineHeight: 1.6, margin: '1rem 0 2rem' }}>
            Un error inesperado ha impedido cargar la aplicación.
            {error.digest ? ` (${error.digest})` : null}
          </p>
          <button
            onClick={reset}
            style={{
              font: 'inherit',
              fontSize: '0.6875rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '0.85rem 1.75rem',
              background: 'transparent',
              color: '#F5F2EC',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 2,
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
