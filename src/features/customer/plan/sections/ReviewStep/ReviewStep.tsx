import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Users, Wallet, ListChecks, Sparkles, PartyPopper,
  Pencil, ShieldCheck, AlertCircle, CheckCircle2, Send, Star,
} from 'lucide-react';
import type { PlanData, PlanDraft } from '../../types';
import { useGetPlanOrganizersQuery, useCreatePlanMutation, usePlanRequestQuoteMutation } from '../../service';
import { draftToUpsert } from '../../hooks/usePlan';
import styles from './ReviewStep.module.css';

export interface ReviewStepProps {
  data: PlanData;
  draft: PlanDraft;
  occasionLabel: string;
  onEdit: (step: number) => void;
}

type Phase = 'idle' | 'saving' | 'quoting';

export function ReviewStep({ data, draft, occasionLabel, onEdit }: ReviewStepProps) {
  const navigate = useNavigate();

  // Reuse the cached recommendations to resolve the recommended + selected orgs.
  const { data: organizers = [] } = useGetPlanOrganizersQuery({
    categories: draft.categories, occasion: draft.occasionId, guests: draft.guests, city: draft.city, budget: draft.budget,
  });
  const recommended = organizers[0];
  const selected = organizers.find((o) => o.id === draft.selectedOrganizerId);

  const [createPlan] = useCreatePlanMutation();
  const [requestQuote] = usePlanRequestQuoteMutation();

  // Once the plan is persisted we keep its id so a retry after a failed quote
  // request never creates a duplicate plan — the customer keeps their data.
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);

  const busy = phase !== 'idle';
  const planSaved = savedPlanId !== null;

  /** Pull the real server detail out of a normalized API error for the UI. */
  const detailOf = (err: unknown): string => {
    const e = err as { status?: number; message?: string } | undefined;
    if (!e) return '';
    const parts: string[] = [];
    if (e.message) parts.push(e.message);
    if (e.status) parts.push(`(${e.status})`);
    return parts.join(' ');
  };

  const submit = async () => {
    setError(null);
    // Priority 1 — plan must persist before any quote is created.
    let planId = savedPlanId;
    if (!planId) {
      try {
        setPhase('saving');
        const plan = await createPlan(draftToUpsert(draft)).unwrap();
        planId = plan.id;
        setSavedPlanId(plan.id);
      } catch (err) {
        setPhase('idle');
        const detail = detailOf(err);
        setError(
          detail
            ? `Couldn’t save your plan: ${detail}. Nothing was submitted.`
            : 'We couldn’t save your plan. Nothing was submitted — please try again.',
        );
        return; // Do NOT continue to the quote request.
      }
    }

    // Plan is saved. Now request the quote; on failure the plan is preserved.
    try {
      setPhase('quoting');
      await requestQuote({
        organizerId: draft.selectedOrganizerId,
        occasion: occasionLabel,
        when: draft.eventDate,
        where: [draft.area, draft.city].filter(Boolean).join(', '),
        guests: draft.guests,
      }).unwrap();
      navigate('/quotes');
    } catch (err) {
      setPhase('idle');
      const detail = detailOf(err);
      setError(
        detail
          ? `Your plan is saved, but the quote request failed: ${detail}. You can retry.`
          : 'Your plan is saved, but the quote request didn’t go through. You can retry without losing anything.',
      );
    }
  };

  const catTitles = draft.categories
    .map((id) => data.categories.find((c) => c.id === id)?.title ?? id)
    .filter(Boolean);
  const dateLabel = draft.eventDate
    ? new Date(draft.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Not set';
  const location = [draft.area, draft.city].filter(Boolean).join(', ') || 'Not set';

  const detailRows: Array<{ Icon: typeof Calendar; label: string; value: string; muted?: boolean }> = [
    { Icon: PartyPopper, label: 'Occasion', value: occasionLabel },
    { Icon: Calendar, label: 'Event date', value: dateLabel, muted: !draft.eventDate },
    { Icon: MapPin, label: 'City & area', value: location, muted: !draft.city && !draft.area },
    { Icon: Users, label: 'Guest count', value: draft.guests ? `${draft.guests} guests` : 'Not set', muted: !draft.guests },
    { Icon: Wallet, label: 'Budget', value: draft.budget || 'Not specified', muted: !draft.budget },
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        <div className={styles.col}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>Event details</h3>
              <button type="button" className={styles.edit} onClick={() => onEdit(0)}><Pencil size={13} /> Edit</button>
            </div>
            <ul className={styles.rows}>
              {detailRows.map((r) => (
                <li key={r.label} className={styles.row}>
                  <span className={styles.rIcon}><r.Icon size={16} /></span>
                  <div className={styles.rText}>
                    <small>{r.label}</small>
                    <strong className={r.muted ? styles.muted : ''}>{r.value}</strong>
                  </div>
                </li>
              ))}
              <li className={styles.row}>
                <span className={styles.rIcon}><Sparkles size={16} /></span>
                <div className={styles.rText}>
                  <small>Special requests</small>
                  <strong className={draft.ideas ? '' : styles.muted}>{draft.ideas || 'None added'}</strong>
                </div>
              </li>
            </ul>
          </section>

          <section className={styles.panel} style={{ marginTop: 18 }}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>Selected categories</h3>
              <button type="button" className={styles.edit} onClick={() => onEdit(1)}><Pencil size={13} /> Edit</button>
            </div>
            {catTitles.length ? (
              <div className={styles.chips}>
                {catTitles.map((c) => <span key={c} className={styles.chip}><ListChecks size={12} /> {c}</span>)}
              </div>
            ) : (
              <p className={styles.muted} style={{ margin: 0, fontSize: '0.9rem' }}>No categories selected yet.</p>
            )}
          </section>

          <section className={styles.panel} style={{ marginTop: 18 }}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>Organizer</h3>
              <button type="button" className={styles.edit} onClick={() => onEdit(2)}><Pencil size={13} /> Change</button>
            </div>
            {selected ? (
              <div className={styles.org}>
                <span className={styles.avatar} style={{ backgroundColor: selected.avatarColor }}>{selected.initials}</span>
                <div className={styles.orgMeta}>
                  <span className={styles.orgName}>{selected.name}</span>
                  <span className={styles.orgSub}><Star size={12} fill="currentColor" strokeWidth={0} /> {selected.rating} · {selected.tier} · {selected.location}</span>
                </div>
                <span className={styles.orgTag}>Selected</span>
              </div>
            ) : (
              <p className={styles.muted} style={{ margin: 0, fontSize: '0.9rem' }}>No organizer selected — go back and pick one.</p>
            )}
            {recommended && (!selected || recommended.id !== selected.id) && (
              <div className={styles.org} style={{ marginTop: 14 }}>
                <span className={styles.avatar} style={{ backgroundColor: recommended.avatarColor }}>{recommended.initials}</span>
                <div className={styles.orgMeta}>
                  <span className={styles.orgName}>{recommended.name}</span>
                  <span className={styles.orgSub}><Star size={12} fill="currentColor" strokeWidth={0} /> {recommended.rating} · {recommended.tier} · {recommended.location}</span>
                </div>
                <span className={styles.orgTag}>Top match</span>
              </div>
            )}
          </section>
        </div>

        <aside className={styles.submitCard}>
          <h3 className={styles.submitTitle}>Ready to submit?</h3>
          <p className={styles.submitText}>
            We’ll save your plan and send a quote request to {selected ? selected.name : 'your organizer'}. You’ll get a
            tailored quote within a day.
          </p>

          {planSaved && !error && (
            <span className={styles.saved}><CheckCircle2 size={15} /> Plan saved</span>
          )}
          {error && (
            <div className={styles.error} role="alert">
              <AlertCircle size={16} className={styles.errIcon} />
              <span>{error}</span>
            </div>
          )}

          <button type="button" className={styles.submit} onClick={submit} disabled={busy || !selected}>
            <Send size={17} />
            {phase === 'saving' ? 'Saving your plan…'
              : phase === 'quoting' ? 'Requesting quote…'
              : planSaved ? 'Retry quote request'
              : 'Submit plan & request quote'}
          </button>
          <p className={styles.footnote}><ShieldCheck size={13} /> {data.footnote}</p>
        </aside>
      </div>
    </div>
  );
}
