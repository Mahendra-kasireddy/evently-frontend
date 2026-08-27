import { ShieldCheck, Sparkles, Star } from 'lucide-react';
import { Button, Icon } from '@shared/reusable';
import { ParticleField } from '@shared/components';
import { HERO } from '../../constants';
import { useGetPlatformStatisticsQuery } from '../../service';
import styles from './Hero.module.css';

/** `2400` → `2,400+`. The `+` is honest: it is a floor, not a rounding up. */
function countLabel(value: number): string {
  return `${value.toLocaleString('en-IN')}+`;
}

/**
 * Presentational hero.
 *
 * The copy is static product copy from `constants`. The three stat cards and
 * the rating row are the exception: they are real counts from
 * `/content/getPlatformStatistics`, which exists precisely because this page
 * used to carry invented ones ("2,400+ celebrations planned", "4.8 from 2,400+
 * families") with nothing behind them — see the note at the top of
 * `../../service.ts`.
 *
 * The cards always render. A figure with nothing behind it shows as zero, which
 * is a true statement about an empty database — unlike the numbers that used to
 * be here. The API still distinguishes "nothing to report" (null) from a
 * counted zero; only the presentation collapses the two.
 */
export function Hero() {
  const { data, isLoading } = useGetPlatformStatisticsQuery();

  const planned = data?.celebrationsPlanned ?? 0;
  const rating = data?.averageRating ?? 0;
  const verified = data?.verifiedShare ?? 0;
  const families = data?.familiesServed ?? 0;

  const cards = [
    {
      key: 'planned',
      Glyph: Sparkles,
      value: countLabel(planned),
      label: 'celebrations planned',
    },
    { key: 'rating', Glyph: Star, value: `${rating.toFixed(1)}★`, label: 'average rating' },
    { key: 'verified', Glyph: ShieldCheck, value: `${verified}%`, label: 'verified & trained' },
  ];

  return (
    <section className={styles.hero} id="top">
      <div className={styles.bg} aria-hidden />
      {/* Depth behind the arch. Decoration only — no claim, no data. */}
      <span className={`${styles.glow} ${styles.glowOrange}`} aria-hidden />
      <span className={`${styles.glow} ${styles.glowTeal}`} aria-hidden />
      <ParticleField density={44} />

      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.badge}>
            <Icon name="shield-check" size={15} />
            {HERO.badge}
          </span>

          <h1 className={styles.title}>
            <span className={styles.titleLead}>{HERO.titleLead}</span>
            <span className={styles.titleAccent}>{HERO.titleAccent}</span>
          </h1>

          <p className={styles.subtitle}>{HERO.subtitle}</p>

          <div className={styles.ctaRow}>
            <Button variant="brand" size="lg">
              <Sparkles size={18} aria-hidden /> {HERO.primaryCta}
            </Button>
            <Button variant="brandGhost" size="lg">{HERO.secondaryCta}</Button>
          </div>

          <div className={styles.proof}>
              {/*
                Plain coloured discs, not initials. The originals carried the
                initials of four invented people; showing real customers'
                instead would publish who booked on a public page.
              */}
              <span className={styles.avatars} aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={styles.avatar} data-i={i} />
                ))}
              </span>
              <span className={styles.rating}>
                {/* Filled to the rounded score, so the stars and the number
                    cannot tell the visitor two different things. */}
                <span className={styles.stars} aria-hidden>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={13}
                      fill={i <= Math.round(rating) ? 'currentColor' : 'none'}
                      strokeWidth={i <= Math.round(rating) ? 0 : 1.5}
                    />
                  ))}
                </span>
                <span>
                  <strong>{rating.toFixed(1)}</strong> from {countLabel(families)} families
                </span>
              </span>
            </div>
        </div>

        {/* Skeletons only while the request is in flight; once it lands the
            real figure shows, zero included. */}
        {isLoading ? (
          <ul className={styles.statCards} aria-hidden>
            {[0, 1, 2].map((i) => (
              <li key={i} className={`${styles.statCard} ${styles.statSkeleton}`} />
            ))}
          </ul>
        ) : (
          <ul className={styles.statCards}>
            {cards.map((c) => (
              <li key={c.key} className={styles.statCard}>
                <span className={styles.statIcon}>
                  <c.Glyph size={18} />
                </span>
                <span>
                  <strong className={styles.statValue}>{c.value}</strong>
                  <span className={styles.statLabel}>{c.label}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
