import { Star, Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@app/hooks';
import type { TopOrganizers as TopOrganizersData, OrganizerTier } from '../../types';
import { useRequestQuoteFromOrganizerMutation } from '../../quotes.service';
import { selectHeroDraft } from '../../service';
import styles from './TopOrganizers.module.css';

function tierClass(tier: OrganizerTier): string {
  if (tier === 'Gold') return styles.gold ?? '';
  if (tier === 'Silver') return styles.silver ?? '';
  return styles.platinum ?? '';
}

export interface TopOrganizersProps {
  data: TopOrganizersData;
}

export function TopOrganizers({ data }: TopOrganizersProps) {
  // Organizers + copy arrive via props from the aggregated home feed.
  const organizers = data.organizers;
  const navigate = useNavigate();
  const draft = useAppSelector(selectHeroDraft);
  const [requestQuote, { isLoading: isRequesting }] = useRequestQuoteFromOrganizerMutation();

  const getQuote = async (organizerId: string) => {
    try {
      await requestQuote({ organizerId, draft }).unwrap();
      navigate('/quotes');
    } catch {
      /* mutation state surfaces the error */
    }
  };

  return (
    <section className={styles.section}>
      <header className={styles.head}>
        <h2 className={styles.title}>{data.title}</h2>
        <button type="button" className={styles.seeAll} onClick={() => navigate('/discover')}>
          {data.seeAllLabel} <ChevronRight size={15} />
        </button>
      </header>

      <div className={styles.grid}>
        {organizers.map((o) => (
          <article key={o.id} className={styles.card}>
            <div className={styles.top}>
              <span className={styles.avatar} style={{ backgroundColor: o.avatarColor }}>{o.initials}</span>
              <div className={styles.idCol}>
                <h3 className={styles.name}>{o.name}</h3>
                <span className={`${styles.badge} ${tierClass(o.tier)}`}><Award size={13} /> {o.tier}</span>
              </div>
            </div>

            <div className={styles.rating}>
              <span className={styles.stars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
                ))}
              </span>
              <strong>{o.rating}</strong>
              <span className={styles.muted}>({o.reviews})</span>
              <span className={styles.dot}>·</span>
              <span className={styles.muted}>{o.events} events</span>
            </div>

            <div className={styles.tags}>
              {o.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.view}
                onClick={() => navigate(`/organizer/${o.id}`)}
              >
                View Profile
              </button>
              <button
                type="button"
                className={styles.quote}
                onClick={() => getQuote(o.id)}
                disabled={isRequesting}
              >
                Get quote
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
