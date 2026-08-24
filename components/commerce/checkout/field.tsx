'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * A form field on a hairline, not in a box.
 *
 * The error is bound with aria-describedby and aria-invalid so it is announced
 * rather than merely coloured — a red border alone conveys nothing to a screen
 * reader, and nothing at all to someone who cannot distinguish the colour.
 */
export function Field({
  label,
  value,
  onChange,
  error,
  type = 'text',
  autoComplete,
  inputMode,
  placeholder,
  className,
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  type?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric';
  placeholder?: string;
  className?: string;
  optional?: boolean;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={cn('flex flex-col', className)}>
      <label htmlFor={id} className="micro-label mb-2.5 text-ink-subtle">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-required={!optional}
        className={cn(
          'w-full border-b bg-transparent pb-3 text-body text-ink outline-none transition-colors',
          'placeholder:text-ink-subtle focus:border-ink',
          error ? 'border-negative' : 'border-hairline-strong',
        )}
      />
      {error ? (
        <p id={errorId} role="alert" className="micro-label mt-2 text-negative">
          {error}
        </p>
      ) : null}
    </div>
  );
}
