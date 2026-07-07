import { useState } from 'react';
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

function Card({
  item,
  activeCard,
  style,
  onClick,
}: {
  item: PackageItem;
  activeCard: boolean;
  style: React.CSSProperties;
  onClick: () => void;
}) {
  return (
    <div
      className={`${styles.slide} ${activeCard ? styles.slideActive : ''}`}
      style={style}
      role="button"
      tabIndex={activeCard ? 0 : -1}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.card}>
        <div className={styles.banner} style={{ backgroundImage: GRAD[item.art] }}>
          <span className={styles.badge}>{item.badge}</span>
          <span className={styles.art} aria-hidden>
            <Confetti />
            <OccasionArt art={item.art} />
          </span>
          <span className={styles.scrim} aria-hidden />
        </div>
        <div className={styles.body}>
          <div className={styles.titleRow}>
            <h3 className={styles.cTitle}>{item.title}</h3>
            <span className={styles.guests}>{item.guests}</span>
          </div>
          <div className={styles.budget}>{item.budget}</div>
          <div className={styles.tags}>
            {item.tags.map((t) => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
          </div>
          <span className={`${styles.explore} ${activeCard ? styles.exploreFilled : styles.exploreOutline}`}>
            <ChevronRight size={15} /> Explore package
          </span>
        </div>
      </div>
    </div>
  );
}

export interface PackagesCarouselProps {
  data: PackagesSection;
}

export function PackagesCarousel({ data }: PackagesCarouselProps) {
  // Items + copy arrive via props from the aggregated home feed (dynamic).
  const items = data.items;
  const n = items.length;
  const navigate = useNavigate();

  // Bounded 3D coverflow (matches the POC): the active card is centred and
  // emphasised; neighbours rotate back in 3D. No auto-advance, no infinite loop
  // — arrows clamp to the ends, exactly like the POC.
  const [active, setActive] = useState(n > 1 ? 1 : 0);

  if (n === 0) return null;

  const current = Math.min(active, n - 1);

  return (
    <section className={styles.section}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>{data.title}</h2>
          <p className={styles.subtitle}>{data.subtitle}</p>
        </div>
        <button type="button" className={styles.build} onClick={() => navigate('/plan')}>
          {data.buildLabel} <ChevronRight size={15} />
        </button>
      </header>

      <div className={styles.stage}>
        {items.map((item, i) => {
          const pos = i - current;
          const ab = Math.abs(pos);
          const style: React.CSSProperties = {
            transform: `translateX(${pos * 222}px) rotateY(${-pos * 30}deg) scale(${pos === 0 ? 1 : 0.84})`,
            zIndex: 10 - ab,
            opacity: ab > 1 ? 0 : pos === 0 ? 1 : 0.62,
            pointerEvents: ab > 1 ? 'none' : 'auto',
          };
          return (
            <Card
              key={item.id}
              item={item}
              activeCard={pos === 0}
              style={style}
              onClick={() => (pos === 0 ? navigate('/plan') : setActive(i))}
            />
          );
        })}

        {n > 1 && (
          <button
            type="button"
            className={`${styles.nav} ${styles.navLeft}`}
            onClick={() => setActive((a) => Math.max(0, a - 1))}
            disabled={current === 0}
            aria-label="Previous package"
          >
            <ChevronLeft size={19} />
          </button>
        )}
        {n > 1 && (
          <button
            type="button"
            className={`${styles.nav} ${styles.navRight}`}
            onClick={() => setActive((a) => Math.min(n - 1, a + 1))}
            disabled={current === n - 1}
            aria-label="Next package"
          >
            <ChevronRight size={19} />
          </button>
        )}
      </div>

      {n > 1 && (
        <div className={styles.dots}>
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              className={`${styles.dot} ${i === current ? styles.dotOn : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Go to ${it.title}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
