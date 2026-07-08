import { MapPin, Users, Wallet, ListChecks, ChevronRight, FilePlus2, FileText } from 'lucide-react';
import type { PlanSubmission, PlanStatus } from '../../types';
import styles from './WorkspaceMain.module.css';

const STATUS_LABEL: Record<PlanStatus, string> = {
  draft: 'Draft', submitted: 'Submitted', quoted: 'Quoted', booked: 'Booked', cancelled: 'Cancelled',
};
const STATUS_CLASS: Record<PlanStatus, string> = {
  draft: 'draft', submitted: 'submitted', quoted: 'quoted', booked: 'booked', cancelled: 'cancelled',
};

const OCCASION_LABEL: Record<string, string> = {
  wedding: 'Wedding', birthday: 'Birthday', housewarming: 'Housewarming',
  naming: 'Naming', anniversary: 'Anniversary', corporate: 'Corporate',
};

function occasionLabel(key: string) {
  return OCCASION_LABEL[key] ?? (key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Event');
}

function dateLabel(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export interface WorkspaceMainProps {
  plans: PlanSubmission[];
  onResume: () => void;
  onStartPlan: () => void;
}

function PlanCard({ plan, onResume }: { plan: PlanSubmission; onResume: () => void }) {
  const isDraft = plan.status === 'draft';
  const updated = dateLabel(plan.updatedAt);
  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.titleWrap}>
          <h4 className={styles.title}>{occasionLabel(plan.occasion)}</h4>
          {plan.planCode && <span className={styles.code}>{plan.planCode}</span>}
        </div>
        <span className={`${styles.badge} ${styles[STATUS_CLASS[plan.status]]}`}>{STATUS_LABEL[plan.status]}</span>
      </div>

      <div className={styles.metaRow}>
        {(plan.city || plan.area) && (
          <span className={styles.meta}><MapPin size={13} /> {[plan.area, plan.city].filter(Boolean).join(', ')}</span>
        )}
        {plan.guests && <span className={styles.meta}><Users size={13} /> {plan.guests} guests</span>}
        {plan.budget && <span className={styles.meta}><Wallet size={13} /> {plan.budget}</span>}
        {plan.categories.length > 0 && (
          <span className={styles.meta}><ListChecks size={13} /> {plan.categories.length} services</span>
        )}
      </div>

      <div className={styles.cardFoot}>
        <span className={styles.updated}>{updated ? `Updated ${updated}` : 'Not saved yet'}</span>
        {isDraft && (
          <button type="button" className={styles.resume} onClick={onResume}>
            Resume <ChevronRight size={14} />
          </button>
        )}
      </div>
    </article>
  );
}

export function WorkspaceMain({ plans, onResume, onStartPlan }: WorkspaceMainProps) {
  const drafts = plans.filter((p) => p.status === 'draft');
  const history = plans.filter((p) => p.status !== 'draft');

  return (
    <div className={styles.main}>
      <section className={styles.block}>
        <div className={styles.blockHead}>
          <h3 className={styles.blockTitle}><FilePlus2 size={17} /> Draft plans</h3>
          <button type="button" className={styles.link} onClick={onStartPlan}>New plan</button>
        </div>
        {drafts.length ? (
          <div className={styles.list}>
            {drafts.map((p) => <PlanCard key={p.id} plan={p} onResume={onResume} />)}
          </div>
        ) : (
          <p className={styles.emptyLine}>No drafts in progress. Start a new plan whenever you’re ready.</p>
        )}
      </section>

      <section className={styles.block}>
        <div className={styles.blockHead}>
          <h3 className={styles.blockTitle}><FileText size={17} /> Submitted plans & history</h3>
        </div>
        {history.length ? (
          <div className={styles.list}>
            {history.map((p) => <PlanCard key={p.id} plan={p} onResume={onResume} />)}
          </div>
        ) : (
          <p className={styles.emptyLine}>Nothing submitted yet. Submit a plan to request quotes from organizers.</p>
        )}
      </section>
    </div>
  );
}
