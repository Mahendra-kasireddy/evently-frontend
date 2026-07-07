import { useRef } from 'react';
import { Heart, Play, MessageCircle, Share2, ShieldCheck, Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { AsyncSection } from '@shared/reusable';
import { SECTION_COPY } from '../../constants';
import type { Testimonial } from '../../types';
import common from '../../styles.module.css';
import styles from './Testimonials.module.css';

export interface TestimonialsProps {
  testimonials: Testimonial[];
  isLoading: boolean;
  isError: boolean;
}

function formatLikes(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function Card({ t }: { t: Testimonial }) {
  return (
    <li className={styles.card}>
      <img src={t.imageUrl} alt="" className={styles.bg} loading="lazy" />
      <div className={styles.scrim} />
      <button type="button" className={styles.play} aria-label={`Play ${t.authorName}'s story`}><Play size={18} fill="currentColor" /></button>
      <div className={styles.sideActions} aria-hidden>
        <span><Heart size={16} /></span>
        <span><MessageCircle size={16} /></span>
        <span><Share2 size={16} /></span>
      </div>
      <div className={styles.body}>
        <div className={styles.tags}>
          {t.verified && <span className={styles.verified}><ShieldCheck size={13} /> Verified booking</span>}
          <span className={styles.stars}>
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
            ))}
          </span>
        </div>
        <blockquote className={styles.quote}>&ldquo;{t.quote}&rdquo;</blockquote>
        <div className={styles.author}>
          <span className={styles.avatar}>{t.authorInitials}</span>
          <div>
            <strong className={styles.name}>{t.authorName}</strong>
            <span className={styles.meta}>{t.city} · {t.occasion}</span>
          </div>
          <span className={styles.likes}><Heart size={14} fill="currentColor" strokeWidth={0} /> {formatLikes(t.likes)}</span>
        </div>
      </div>
    </li>
  );
}

export function Testimonials({ testimonials, isLoading, isError }: TestimonialsProps) {
  const rowRef = useRef<HTMLUListElement>(null);
  const scroll = (dir: -1 | 1) => rowRef.current?.scrollBy({ left: dir * 380, behavior: 'smooth' });

  return (
    <section className={common.section} id="stories">
      <div className={common.container}>
        <div className={styles.head}>
          <div className={styles.headText}>
            <h2 className={common.sectionTitle}>{SECTION_COPY.testimonials.title}</h2>
            <p className={common.sectionSubtitle}>{SECTION_COPY.testimonials.subtitle}</p>
          </div>
          <a href="#stories" className={styles.seeAll}>See all <ArrowRight size={16} /></a>
        </div>

        <div className={styles.carousel}>
          <button type="button" className={`${styles.nav} ${styles.navLeft}`} aria-label="Previous stories" onClick={() => scroll(-1)}>
            <ChevronLeft size={20} />
          </button>
          <ul className={styles.grid} ref={rowRef}>
            <AsyncSection
              isLoading={isLoading}
              isError={isError}
              isEmpty={testimonials.length === 0}
              loading={Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className={`${styles.card} ${common.skeleton}`} style={{ height: 444 }} aria-hidden />
              ))}
            >
              {testimonials.map((t) => <Card key={t.id} t={t} />)}
            </AsyncSection>
          </ul>
          <button type="button" className={`${styles.nav} ${styles.navRight}`} aria-label="Next stories" onClick={() => scroll(1)}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
