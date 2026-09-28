import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './Lightbox.module.css';

export interface LightboxProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the close control, and for the dialog itself. */
  label: string;
  /**
   * What the close control sits on. A photograph needs a dark disc to stay
   * visible; a cream card does not, and the disc reads as a foreign object on
   * one. Defaults to the photograph's treatment.
   */
  closeTone?: 'onDark' | 'onLight';
  children: React.ReactNode;
}

/**
 * One full-screen viewer, for every picture the invitation shows full size.
 *
 * The uploaded invitation and the story's photographs open the same way, so
 * they open through the same component: a second viewer would be a second set
 * of decisions about focus, Escape and what a background click does, and the
 * two would drift.
 *
 * It is a modal in the real sense — while it is open the invitation behind it
 * cannot be scrolled or tabbed into, because a viewer you can scroll the page
 * behind is a viewer that loses the reader's place.
 */
export function Lightbox({
  open,
  onClose,
  label,
  closeTone = 'onDark',
  children,
}: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  /* Where focus was, so closing returns the reader to the thing they opened. */
  const openerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement;
    closeRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      (openerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
    >
      {/* The picture itself is not a way out, so a click on it does nothing. */}
      <div
        className={styles.frame}
        role="presentation"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          type="button"
          className={`${styles.close} ${closeTone === 'onLight' ? styles.closeLight : ''}`}
          onClick={onClose}
          aria-label={label}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

export default Lightbox;
