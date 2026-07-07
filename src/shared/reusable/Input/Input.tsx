import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '../cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Validation/error message rendered below the field. */
  error?: string;
  /** Hide the label visually while keeping it for screen readers. */
  hideLabel?: boolean;
}

/**
 * Stateless, accessible text input primitive. Controlled by the parent
 * (value + onChange come in as props). Wires label/error to the field via ids
 * and aria-* for screen readers.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hideLabel = false, id, className, required, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium text-gray-700',
            hideLabel && 'sr-only',
          )}
        >
          {label}
          {required && <span className="text-[#e5484d]" aria-hidden> *</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'h-11 rounded-md border bg-white px-3 text-sm text-gray-900 shadow-sm',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-300 focus:ring-gray-400',
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
