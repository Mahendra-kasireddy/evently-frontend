import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Star, Award, Check, SearchX, Zap, CalendarX } from 'lucide-react';
import { EmptyState } from '@shared/components';
import type { PlanFilters, OrgTier, PlanDraft, PlanOrganizer, RecommendationArgs, RecommendationSort } from '../../types';
import { useGetPlanOrganizersQuery } from '../../service';
import styles from './FindOrganizers.module.css';

const TIER_CLASS: Record<OrgTier, string> = { Bronze: 'bronze', Silver: 'silver', Gold: 'gold', Platinum: 'platinum' };
const RATING_MIN: Record<string, number> = { '4.0+': 4.0, '4.5+': 4.5, '4.8+': 4.8 };

/** Sort controls → engine sort keys. */
const SORTS: { label: string; param: RecommendationSort }[] = [
  { label: 'Best match', param: 'best' },
  { label: 'Highest rating', param: 'rating' },
  { label: 'Lowest price', param: 'price' },
  { label: 'Most events', param: 'events' },
  { label: 'Fastest response', param: 'response' },
  { label: 'Nearest', param: 'nearest' },
];

export interface FindOrganizersProps {
  filters: PlanFilters;
  /** Plan wizard: fetch matched organizers scored against the draft. */
  draft?: PlanDraft;
  occasionLabel?: string;
  /** Discover/browse: use a pre-loaded organizer list instead of fetching. */
  organizers?: PlanOrganizer[];
  /** Wizard: select an organizer and advance to the Review step. */
  onSelectOrganizer?: (id: string) => void;
}

export function FindOrganizers({ filters, draft, organizers: passed, onSelectOrganizer }: FindOrganizersProps) {
  const navigate = useNavigate();

  const [tiers, setTiers] = useState<string[]>([]);
  const [rating, setRating] = useState<string>(''); // '' = any
  const [cats, setCats] = useState<string[]>([]);
  const [sortParam, setSortParam] = useState<RecommendationSort>('best');

  // Wizard mode: the backend engine does scoring + filtering + sorting.
  const args: RecommendationArgs = {
    categories: draft?.categories ?? [],
    occasion: draft?.occasionId,
    guests: draft?.guests,
    city: draft?.city,
    area: draft?.area,
    budget: draft?.budget,
    eventDate: draft?.eventDate,
    sort: sortParam,
    minRating: rating ? RATING_MIN[rating] : undefined,
    tiers: tiers.length ? tiers : undefined,
    requireCategories: cats.length ? cats.map((c) => c.toLowerCase()) : undefined,
  };
  const { data: fetched = [], isFetching } = useGetPlanOrganizersQuery(args, { skip: !!passed });

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  // Browse mode: filter + sort the passed list client-side (no plan context).
  const browseVisible = useMemo(() => {
    if (!passed) return [];
    let list = passed.slice();
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
    if (sortParam === 'price') list.sort((a, b) => (a.estMin ?? 0) - (b.estMin ?? 0));
    else if (sortParam === 'events') list.sort((a, b) => b.events - a.events);
    else if (sortParam === 'response') list.sort((a, b) => (a.responseHours ?? 99) - (b.responseHours ?? 99));
    else list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [passed, tiers, rating, cats, sortParam]);

  const visible = passed ? browseVisible : fetched;
  const isLoading = !passed && isFetching;
  const selectedId = draft?.selectedOrganizerId;

  const clearFilters = () => {
    setTiers([]);
    setRating('');
    setCats([]);
    setSortParam('best');
  };

  const chooseOrganizer = (organizerId: string) => {
    if (!draft || !onSelectOrganizer) {
      // No draft to attach the organizer to — send the customer to My Events,
      // where every request they have made is listed with its responses.
      navigate('/workspace');
      return;
    }
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
          {SORTS.map((sp) => (
            <button
              key={sp.param}
              type="button"
              className={`${styles.sort} ${sp.param === sortParam ? styles.sortOn : ''}`}
              onClick={() => setSortParam(sp.param)}
            >
              {sp.label}
            </button>
          ))}
        </div>

        {!isLoading && visible.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No organizers match your event yet"
            message={
              (passed ? passed.length : fetched.length) === 0
                ? 'We couldn’t find organizers for these services in your city. Try broadening your categories or checking back soon.'
                : 'No organizers match the filters you’ve applied. Clear a filter or two to see more matches.'
            }
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <div className={styles.grid}>
            {visible.map((o) => {
              const isSelected = selectedId === o.id;
              const unavailable = o.available === false;
              return (
                <article key={o.id} className={`${styles.card} ${unavailable ? styles.cardMuted : ''}`}>
                  <div className={styles.top}>
                    <span className={styles.avatar} style={{ backgroundColor: o.avatarColor }}>{o.initials}</span>
                    <div className={styles.idCol}>
                      <div className={styles.nameRow}>
                        <h3 className={styles.name}>{o.name}</h3>
                        {o.concierge ? (
                          <span className={styles.conciergePill}><Award size={11} /> Evently Managed</span>
                        ) : (
                          <span className={`${styles.badge} ${styles[TIER_CLASS[o.tier]]}`}><Award size={12} /> {o.tier}</span>
                        )}
                        {typeof o.score === 'number' && !o.concierge && (
                          <span className={styles.scorePill}><Zap size={11} /> {o.score}% match</span>
                        )}
                      </div>
                      <div className={styles.rating}>
                        <span className={styles.stars}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" strokeWidth={0} />)}</span>
                        <strong>{o.rating}</strong><span className={styles.muted}>({o.reviews})</span>
                      </div>
                      <p className={styles.meta}>{o.events} events · {o.location}</p>
                    </div>
                  </div>

                  <div className={styles.tags}>{o.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}</div>

                  {o.reasons && o.reasons.length > 0 ? (
                    <ul className={styles.reasons}>
                      {o.reasons.slice(0, 5).map((r) => (
                        <li key={r} className={styles.reason}><Check size={13} strokeWidth={3} className={styles.reasonIcon} /> {r}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className={styles.matchRow}>
                      <span className={styles.match}><Check size={14} strokeWidth={3} /> Matches {o.matches} of {o.total}</span>
                    </div>
                  )}

                  <div className={styles.estRow}>
                    {unavailable ? (
                      <span className={styles.unavail}><CalendarX size={13} /> Booked on your date</span>
                    ) : (
                      <span className={styles.est}><small>EST. RANGE</small><strong>{o.estRange}</strong></span>
                    )}
                  </div>

                  <div className={styles.actions}>
                    <button type="button" className={styles.view2} onClick={() => navigate(`/organizer/${o.id}`)}>View profile</button>
                    <button
                      type="button"
                      className={styles.quote}
                      onClick={() => chooseOrganizer(o.id)}
                      disabled={unavailable && !!draft}
                    >
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
