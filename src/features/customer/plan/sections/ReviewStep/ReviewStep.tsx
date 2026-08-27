import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Users, Wallet, ListChecks, Sparkles, PartyPopper,
  Pencil, ShieldCheck, AlertCircle, CheckCircle2, Send, Star,
} from 'lucide-react';
import { AuthModal } from '@shared/components';
import { useAuth } from '@app/auth';
import type { PlanData, PlanDraft } from '../../types';
import {
  useGetPlanOrganizersQuery,
  useCreatePlanMutation,
  usePlanRequestQuoteMutation,
  useSavePlanDraftMutation,
  useUpdatePlanMutation,
} from '../../service';
import { draftToUpsert } from '../../hooks/usePlan';
import { composeWhere } from '../../where';
import styles from './ReviewStep.module.css';

export interface ReviewStepProps {
  /** Set when correcting an already-submitted plan rather than starting one. */
  editingPlanId: string;
  data: PlanData;
  draft: PlanDraft;
  occasionLabel: string;
  onEdit: (step: number) => void;
}

type Phase = 'idle' | 'saving' | 'quoting';

export function ReviewStep({ data, draft, editingPlanId, occasionLabel, onEdit }: ReviewStepProps) {
  const navigate = useNavigate();
  const { status } = useAuth();

  // Reuse the cached recommendations to resolve the recommended + selected orgs.
  const { data: organizers = [] } = useGetPlanOrganizersQuery({
    categories: draft.categories, occasion: draft.occasionId, guests: draft.guests, city: draft.city, budget: draft.budget,
  });
  const recommended = organizers[0];
  const selected = organizers.find((o) => o.id === draft.selectedOrganizerId);

  const [createPlan] = useCreatePlanMutation();
  const [saveDraft] = useSavePlanDraftMutation();
  const [updatePlan] = useUpdatePlanMutation();
  const [requestQuote] = usePlanRequestQuoteMutation();

  // Set once the quote request has actually reached an organizer, so a retry
  // after a later failure never sends a second request.
  const [quotedPlanId, setQuotedPlanId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  // Sign-in happens in a dialog over this step, so the wizard's answers stay on
  // screen and the submit continues by itself once the number is verified.
  const [authOpen, setAuthOpen] = useState(false);

  const busy = phase !== 'idle';
  const planSaved = quotedPlanId !== null;

  /** Pull the real server detail out of a normalized API error for the UI. */
  const detailOf = (err: unknown): string => {
    const e = err as { status?: number; message?: string } | undefined;
    if (!e) return '';
    const parts: string[] = [];
    if (e.message) parts.push(e.message);
    if (e.status) parts.push(`(${e.status})`);
    return parts.join(' ');
  };

  /** Click handler: an anonymous planner verifies their number first. */
  const onSubmitClick = () => {
    setError(null);
    if (status !== 'authenticated') {
      setAuthOpen(true);
      return;
    }
    void submit();
  };

  /**
   * Save, request, then submit — in that order.
   *
   * The order is the whole point. This used to call `createPlan` first, which
   * stamps the plan SUBMITTED with a plan code; when the quote request then
   * failed the customer was left with a plan reading "Submitted" that no
   * organizer had ever received, and every retry after a page reload minted
   * another one. Persisting as a draft first means nothing is lost, and
   * promoting only after the request lands means "Submitted" always says
   * something true.
   */
  const submit = async () => {
    setError(null);

    /*
     * 1. Persist. Correcting an existing plan writes back to that record;
     *    otherwise this upserts the customer's single live draft. Either way it
     *    cannot accumulate records however many times it is retried, which is
     *    what produced two identical "Submitted" plans before.
     */
    /*
     * The saved plan's id is carried into the quote request below, so the
     * request knows which plan it answers. `submit` promotes this same draft
     * rather than minting a second record, so the id stays valid afterwards.
     */
    let planId = editingPlanId ?? '';
    try {
      setPhase('saving');
      if (editingPlanId) {
        await updatePlan({ id: editingPlanId, body: draftToUpsert(draft) }).unwrap();
      } else {
        const saved = await saveDraft(draftToUpsert(draft)).unwrap();
        planId = saved.id;
      }
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

    // 2. Reach the organizer. A failure here leaves the plan a draft, which is
    //    honest — and it stays editable from My Events.
    if (!quotedPlanId) {
      try {
        setPhase('quoting');
        await requestQuote({
          organizerId: draft.selectedOrganizerId,
          ...(planId ? { planId } : {}),
          occasion: occasionLabel,
          when: draft.eventDate,
          where: composeWhere(draft.area, draft.city),
          guests: draft.guests,
          budget: draft.budget,
          categories: catTitles,
          ideas: draft.ideas,
        }).unwrap();
      } catch (err) {
        setPhase('idle');
        const detail = detailOf(err);
        setError(
          detail
            ? `Your plan is saved as a draft, but the request didn’t reach the organizer: ${detail}. You can retry.`
            : 'Your plan is saved as a draft, but the request didn’t reach the organizer. You can retry without losing anything.',
        );
        return;
      }
    }

    // 3. Only now is it genuinely submitted. An edited plan is already a
    //    record of its own and was updated in step 1, so it needs no promotion.
    try {
      if (editingPlanId) {
        setQuotedPlanId(editingPlanId);
        navigate('/workspace');
        return;
      }
      const plan = await createPlan(draftToUpsert(draft)).unwrap();
      setQuotedPlanId(plan.id);
      // My Events is the hub: the new request appears there as "waiting for
      // organizers to reply", and is where the customer returns to compare.
      navigate('/workspace');
    } catch (err) {
      setPhase('idle');
      // The organizer has the request; only the status stamp failed. Said
      // plainly, because the customer must not send it a second time.
      const detail = detailOf(err);
      setError(
        `Your request reached the organizer, but we couldn’t mark the plan submitted${
          detail ? `: ${detail}` : ''
        }. Don’t resend — check My Events in a moment.`,
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

          <button type="button" className={styles.submit} onClick={onSubmitClick} disabled={busy || !selected}>
            <Send size={17} />
            {phase === 'saving' ? 'Saving your plan…'
              : phase === 'quoting' ? 'Requesting quote…'
              : planSaved ? 'Retry quote request'
              : 'Submit plan & request quote'}
          </button>
          <p className={styles.footnote}><ShieldCheck size={13} /> {data.footnote}</p>
        </aside>
      </div>

      <AuthModal
        open={authOpen}
        reason="to submit this plan"
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          // Continue the submission the customer already asked for.
          void submit();
        }}
      />
    </div>
  );
}
