import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Star, Award, Check, SearchX } from 'lucide-react';
import { EmptyState } from '@shared/components';
import type { PlanFilters, OrgTier, PlanDraft, PlanOrganizer } from '../../types';
import { useGetPlanOrganizersQuery } from '../../service';
import styles from './FindOrganizers.module.css';

const TIER_CLASS: Record<OrgTier, string> = { Bronze: 'bronze', Silver: 'silver', Gold: 'gold', Platinum: 'platinum' };
const RATING_MIN: Record<string, number> = { '4.0+': 4.0, '4.5+': 4.5, '4.8+': 4.8 };

export interface FindOrganizersProps {
  filters: PlanFilters;
  /** Plan wizard: fetch matched organizers by the draft's categories. */
  draft?: PlanDraft;
  occasionLabel?: string;
  /** Discover/browse: use a pre-loaded organizer list instead of fetching. */
  organizers?: PlanOrganizer[];
  /** Wizard: select an organizer and advance to the Review step. */
  onSelectOrganizer?: (id: string) => void;
}

export function FindOrganizers({ filters, draft, organizers: passed, onSelectOrganizer }: FindOrganizersProps) {
  const navigate = useNavigate();
  const { data: fetched = [], isLoading } = useGetPlanOrganizersQuery(
    { categories: draft?.categories ?? [], occasion: draft?.occasionId, guests: draft?.guests, city: draft?.city, budget: draft?.budget },
    { skip: !!passed }, // don't fetch when a list is supplied
  );
  const organizers = passed ?? fetched;

  const [tiers, setTiers] = useState<string[]>([]);
  const [rating, setRating] = useState<string>(''); // '' = any
  const [cats, setCats] = useState<string[]>([]);
  const [sort, setSort] = useState(filters.sorts[0] ?? 'Sort: Rating');

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  // Filters actually filter + sort the real organizer list.
  const visible = useMemo(() => {
    let list = organizers.slice();
    if (tiers.length) list = list.filter((o) => tiers.includes(o.tier));
    if (rating) list = list.filter((o) => o.rating >= (RATING_MIN[rating] ?? 0));
    if (cats.length) {
      list = list.filter((o) =>
        o.tags.some((t) => {
          const tw = t.toLowerCase();
          return cats.some((c) => {
            const cw = c.toLowerCase();
            return tw.includes(cw) || cw.includes(tw);
          });
        }),
      );
    }
    if (sort.includes('Price')) list.sort((a, b) => a.estRange.localeCompare(b.estRange));
    else if (sort.includes('events')) list.sort((a, b) => b.events - a.events);
    else list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [organizers, tiers, rating, cats, sort]);

  const selectedId = draft?.selectedOrganizerId;

  const chooseOrganizer = (organizerId: string) => {
    // Browse mode (no wizard draft): jump straight to the quotes screen.
    if (!draft || !onSelectOrganizer) {
      navigate('/quotes');
      return;
    }
    // Wizard mode: remember the pick and advance to Review — the plan and quote
    // are created transactionally there, so nothing is persisted prematurely.
    onSelectOrganizer(organizerId);
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.filters}>
        <div className={styles.fHead}><SlidersHorizontal size={18} /> Filters</div>

        <p className={styles.fLabel}>BADGE TIER</p>
        {filters.tiers.map((t) => (
          <label key={t} className={styles.check}>
            <input type="checkbox" checked={tiers.includes(t)} onChange={() => toggle(tiers, setTiers, t)} /> {t}
          </label>
        ))}

        <p className={styles.fLabel}>MINIMUM RATING</p>
        <div className={styles.ratings}>
          {filters.ratings.map((r) => (
            <button
              key={r}
              type="button"
              className={`${styles.rating} ${r === rating ? styles.ratingOn : ''}`}
              onClick={() => setRating(r === rating ? '' : r)}
            >
              {r}
            </button>
          ))}
        </div>

        <p className={styles.fLabel}>CATEGORIES</p>
        {filters.categories.map((c) => (
          <label key={c} className={styles.check}>
            <input type="checkbox" checked={cats.includes(c)} onChange={() => toggle(cats, setCats, c)} /> {c}
          </label>
        ))}
      </aside>

      <div className={styles.results}>
        <div className={styles.resHead}>
          <h2 className={styles.count}>
            {isLoading ? 'Finding organizers…' : `${visible.length} organizers match your event`}
          </h2>
        </div>
        <div className={styles.sorts}>
          {filters.sorts.map((sp) => (
            <button key={sp} type="button" className={`${styles.sort} ${sp === sort ? styles.sortOn : ''}`} onClick={() => setSort(sp)}>{sp}</button>
          ))}
        </div>

        {!isLoading && visible.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No organizers match your event yet"
            message={
              organizers.length === 0
                ? 'We couldn’t find organizers for these services in your city. Try broadening your categories or checking back soon.'
                : 'No organizers match the filters you’ve applied. Clear a filter or two to see more matches.'
            }
            {...(organizers.length > 0
              ? {
                  actionLabel: 'Clear filters',
                  onAction: () => {
                    setTiers([]);
                    setRating('');
                    setCats([]);
                  },
                }
              : {})}
          />
        ) : (
          <div className={styles.grid}>
            {visible.map((o) => {
              const isSelected = selectedId === o.id;
              return (
                <article key={o.id} className={styles.card}>
                  <div className={styles.top}>
                    <span className={styles.avatar} style={{ backgroundColor: o.avatarColor }}>{o.initials}</span>
                    <div className={styles.idCol}>
                      <div className={styles.nameRow}>
                        <h3 className={styles.name}>{o.name}</h3>
                        <span className={`${styles.badge} ${styles[TIER_CLASS[o.tier]]}`}><Award size={12} /> {o.tier}</span>
                      </div>
                      <div className={styles.rating}>
                        <span className={styles.stars}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" strokeWidth={0} />)}</span>
                        <strong>{o.rating}</strong><span className={styles.muted}>({o.reviews})</span>
                      </div>
                      <p className={styles.meta}>{o.events} events · {o.location}</p>
                    </div>
                  </div>
                  <div className={styles.tags}>{o.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}</div>
                  <div className={styles.matchRow}>
                    <span className={styles.match}><Check size={14} strokeWidth={3} /> Matches {o.matches} of {o.total}</span>
                    <span className={styles.est}><small>EST. RANGE</small><strong>{o.estRange}</strong></span>
                  </div>
                  <div className={styles.actions}>
                    <button type="button" className={styles.view2} onClick={() => navigate(`/organizer/${o.id}`)}>View profile</button>
                    <button type="button" className={styles.quote} onClick={() => chooseOrganizer(o.id)}>
                      {draft && onSelectOrganizer ? (isSelected ? 'Selected · Review' : 'Select & review') : 'Get Quote'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
