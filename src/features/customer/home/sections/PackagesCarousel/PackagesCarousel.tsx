import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { OccasionArt, Confetti } from '@shared/reusable';
import type { PackagesSection, PackageItem, OccasionArt as ArtKey } from '../../types';
import styles from './PackagesCarousel.module.css';

const GRAD: Record<ArtKey, string> = {
  wedding: 'linear-gradient(165deg, #243a6b, #0e1a33)',
  birthday: 'linear-gradient(165deg, #5a2a30, #2a1216)',
  housewarming: 'linear-gradient(165deg, #16403a, #08201c)',
  naming: 'linear-gradient(165deg, #3a2a5e, #181233)',
  anniversary: 'linear-gradient(165deg, #5a3c1c, #2e2010)',
  corporate: 'linear-gradient(165deg, #243a6b, #0e1a33)',
};

function Card({ item, active, onExplore }: { item: PackageItem; active: boolean; onExplore: () => void }) {
  return (
    <div className={`${styles.slide} ${active ? styles.slideActive : ''}`} aria-hidden={!active}>
      <div className={styles.card}>
        <span className={styles.badge}>{item.badge}</span>
        <div className={styles.banner} style={{ backgroundImage: GRAD[item.art] }}>
          <span className={styles.art} aria-hidden><Confetti /><OccasionArt art={item.art} /></span>
        </div>
        <div className={styles.body}>
          <div className={styles.titleRow}>
            <h3 className={styles.cTitle}>{item.title}</h3>
            <span className={styles.guests}>{item.guests}</span>
          </div>
          <div className={styles.budget}>{item.budget}</div>
          <div className={styles.tags}>{item.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}</div>
          {active ? (
            <button type="button" className={styles.explore} onClick={onExplore}><ChevronRight size={16} /> Explore package</button>
          ) : (
            <span className={styles.exploreLink}><ChevronRight size={13} /> Explore package</span>
          )}
        </div>
        {!active && <span className={styles.veil} aria-hidden />}
      </div>
    </div>
  );
}

export interface PackagesCarouselProps {
  data: PackagesSection;
}

export function PackagesCarousel({ data }: PackagesCarouselProps) {
  // Items + copy arrive via props from the aggregated home feed.
  const items = data.items;
  const navigate = useNavigate();
  const n = items.length;

  // Coverflow track with clones on both ends for a seamless infinite slide.
  // Track positions: 0 = clone(last), 1..n = real items, n+1 = clone(first).
  const loop = n > 0 ? [items[n - 1]!, ...items, items[0]!] : [];
  const [pos, setPos] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const realIndex = ((pos - 1) % n + n) % n;

  const go = useCallback((d: number) => {
    setAnimate(true);
    setPos((p) => p + d);
  }, []);

  const jumpTo = (i: number) => {
    setAnimate(true);
    setPos(i + 1);
  };

  // Snap past the clones (no transition) once the slide finishes.
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== trackRef.current || e.propertyName !== 'transform') return;
    if (pos === n + 1) { setAnimate(false); setPos(1); }
    else if (pos === 0) { setAnimate(false); setPos(n); }
  };

  // Re-enable the transition on the next frame after a snap.
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  // Auto-scroll: advance every 4.5s, paused on hover/focus. Respects reduced-motion.
  useEffect(() => {
    if (paused || n <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => go(1), 4500);
    return () => window.clearInterval(id);
  }, [paused, n, go]);

  if (n === 0) return null;

  const trackStyle: React.CSSProperties = {
    transform: `translateX(calc(-1 * (var(--pc-step) * ${pos} + var(--pc-step) / 2)))`,
    transition: animate ? undefined : 'none',
  };

  return (
    <section className={styles.section}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>{data.title}</h2>
          <p className={styles.subtitle}>{data.subtitle}</p>
        </div>
        <button type="button" className={styles.build} onClick={() => navigate('/plan')}>{data.buildLabel} <ChevronRight size={15} /></button>
      </header>

      <div
        className={styles.stage}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {n > 1 && (
          <button type="button" className={`${styles.nav} ${styles.navLeft}`} onClick={() => go(-1)} aria-label="Previous"><ChevronLeft size={18} /></button>
        )}

        <div className={styles.viewport}>
          <div ref={trackRef} className={styles.track} style={trackStyle} onTransitionEnd={handleTransitionEnd}>
            {loop.map((it, i) => (
              <Card key={i} item={it} active={i === pos} onExplore={() => navigate('/plan')} />
            ))}
          </div>
        </div>

        {n > 1 && (
          <button type="button" className={`${styles.nav} ${styles.navRight}`} onClick={() => go(1)} aria-label="Next"><ChevronRight size={18} /></button>
        )}
      </div>

      {n > 1 && (
        <div className={styles.dots}>
          {items.map((it, i) => (
            <button key={it.id} type="button" className={`${styles.dot} ${i === realIndex ? styles.dotOn : ''}`} onClick={() => jumpTo(i)} aria-label={`Go to ${it.title}`} />
          ))}
        </div>
      )}
    </section>
  );
}
