import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../cn';

type Variant = 'primary' | 'secondary' | 'brand' | 'brandGhost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner and disables interaction. */
  isLoading?: boolean;
}

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-gray-900 text-white hover:bg-gray-700 focus-visible:ring-gray-900',
  secondary:
    'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-400',
  // Brand variants are token-driven (Tailwind arbitrary values referencing the
  // design-token CSS vars), so they track the Evently palette in one place.
  brand:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--color-primary)] shadow-sm hover:-translate-y-px hover:shadow-[0_8px_18px_-7px_rgba(16,32,64,0.32)] hover:brightness-[1.04]',
  brandGhost:
    'bg-white/10 text-white border border-white/25 hover:bg-white/20 focus-visible:ring-white/50',
};

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-[0.95rem]',
};

/**
 * Stateless primitive (shared/reusable): props in, callbacks out. No app/store/data
 * coupling, so it's safe to reuse anywhere. Composed/stateful widgets live in
 * shared/components instead.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled ?? isLoading}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          VARIANT[variant],
          SIZE[size],
          className,
        )}
        {...props}
      >
        {isLoading && (
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
