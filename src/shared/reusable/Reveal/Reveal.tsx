import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Reveal.module.css';

export interface RevealProps {
  children: ReactNode;
  /** Stagger delay in ms. */
  delay?: number;
  className?: string;
}

/**
 * Scroll-reveal wrapper: fades + slides its content up when it enters the
 * viewport (once). Uses IntersectionObserver, honors prefers-reduced-motion.
 * Reusable across sections for the reference's "comes alive on scroll" feel.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.dataset.revealed = 'true';
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.dataset.revealed = 'true';
            obs.unobserve(el);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.reveal} ${className ?? ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
