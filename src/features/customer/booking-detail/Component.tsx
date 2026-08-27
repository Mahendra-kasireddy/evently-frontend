import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, CalendarDays, MapPin, PartyPopper, Wallet, History, Check,
  XCircle, LayoutDashboard, Clock, AlertTriangle,
} from 'lucide-react';
import { formatINR } from '@features/customer/quotes/transform';
import type { ApiBooking } from '@features/customer/booking/types';
import {
  STATUS_META, PAYMENT_META, CANCELLABLE, CLOSED, WORKSPACE_READY,
  PARENT_ROUTE, PARENT_LABEL, nextStepCopy,
} from './constants';
import styles from './styles.module.css';

function dateLabel(iso?: string | null): string {
  if (!iso) return 'To be confirmed';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'To be confirmed';
  return d.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function stampLabel(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function countdown(days: number, closed: boolean): string {
  if (closed || typeof days !== 'number' || Number.isNaN(days) || days < 0) return '';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days to go`;
}

export interface BookingDetailComponentProps {
  booking: ApiBooking;
  isCancelling: boolean;
  onCancel: () => void;
}

export function Component({ booking: b, isCancelling, onCancel }: BookingDetailComponentProps) {
  const navigate = useNavigate();
  const status = STATUS_META[b.status] ?? { label: b.status || 'Unknown', cls: 'placed' };
  const payment = PAYMENT_META[b.paymentStatus] ?? PAYMENT_META.unpaid;
  const closed = CLOSED.includes(b.status);
  const canCancel = CANCELLABLE.includes(b.status);
  const workspaceReady = WORKSPACE_READY.includes(b.status);
  const next = nextStepCopy(b);
  const away = countdown(b.daysToGo, closed);
  const steps = b.steps ?? [];
  const currentStep = steps.findIndex((s) => !s.done);
  const paidLabel = b.amountPaid > 0 ? formatINR(b.amountPaid) : null;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Same back affordance as every other screen inside My Events. */}
        <button type="button" className={styles.back} onClick={() => navigate(PARENT_ROUTE)}>
          <ChevronLeft size={16} /> {PARENT_LABEL}
        </button>

        {/* 1 event name · 2 booking status · 3 payment status ------------- */}
        <section className={styles.hero}>
          <span className={styles.ref}>{b.ref}</span>
          <h1 className={styles.title}>{b.title}</h1>

          <div className={styles.organizer}>
            <span
              className={styles.avatar}
              style={{ backgroundColor: b.organizer?.avatarColor ?? '#7c5bd6' }}
            >
              {b.organizer?.initials ?? '★'}
            </span>
            <span className={styles.organizerName}>{b.organizer?.name ?? 'Organizer'}</span>
            {away && (
              <span className={styles.away}>
                <Clock size={13} /> {away}
              </span>
            )}
          </div>

          <div className={styles.chips}>
            <span className={`${styles.chip} ${styles[status.cls]}`}>{status.label}</span>
            <span className={`${styles.chip} ${styles[payment.cls]}`}>
              {payment.cls === 'paid' && <Check size={12} strokeWidth={3} />}
              {payment.label}
              {paidLabel && payment.cls === 'paid' ? ` · ${paidLabel}` : ''}
            </span>
          </div>
        </section>

        {/* What happens next — the question the old screen never answered. */}
        <section className={`${styles.next} ${closed ? styles.nextClosed : ''}`}>
          <span className={styles.nextIcon}>
            {closed ? <AlertTriangle size={18} /> : <Clock size={18} />}
          </span>
          <div className={styles.nextText}>
            <strong>{next.title}</strong>
            <span>{next.body}</span>
          </div>
        </section>

        {/* Progress rail ------------------------------------------------- */}
        {!closed && steps.length > 0 && (
          <section className={styles.panel}>
            <ol className={styles.rail}>
              {steps.map((s, i) => (
                <li
                  key={s.label}
                  className={`${styles.railStep} ${s.done ? styles.railDone : ''} ${
                    i === currentStep ? styles.railCurrent : ''
                  }`}
                >
                  <span className={styles.railDot}>
                    {s.done && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className={styles.railLabel}>{s.label}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className={styles.grid}>
          <div className={styles.col}>
            {/* 4 date · 6 venue · occasion ------------------------------- */}
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Event details</h2>
              <ul className={styles.rows}>
                <li className={styles.row}>
                  <span className={styles.rIcon}><CalendarDays size={16} /></span>
                  <div className={styles.rText}>
                    <small>Date</small>
                    <strong>{dateLabel(b.eventDate)}</strong>
                  </div>
                </li>
                <li className={styles.row}>
                  <span className={styles.rIcon}><MapPin size={16} /></span>
                  <div className={styles.rText}>
                    <small>Venue</small>
                    <strong>{b.location || 'To be confirmed'}</strong>
                  </div>
                </li>
                <li className={styles.row}>
                  <span className={styles.rIcon}><PartyPopper size={16} /></span>
                  <div className={styles.rText}>
                    <small>Occasion</small>
                    <strong>{b.occasion || '—'}</strong>
                  </div>
                </li>
              </ul>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>
                <History size={16} /> Booking timeline
              </h2>
              <ul className={styles.timeline}>
                {(b.timeline ?? []).map((e, i) => (
                  <li key={`${e.status}-${i}`} className={styles.tItem}>
                    <span
                      className={`${styles.tDot} ${
                        CLOSED.includes(e.status as ApiBooking['status']) ? styles.tDotMuted : ''
                      }`}
                    />
                    <div className={styles.tBody}>
                      <span className={styles.tLabel}>{e.label}</span>
                      {e.note && <span className={styles.tNote}>{e.note}</span>}
                      {stampLabel(e.at) && <span className={styles.tAt}>{stampLabel(e.at)}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* 7 payment summary · 8 next action --------------------------- */}
          <aside className={styles.col}>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>
                <Wallet size={16} /> Payment
              </h2>
              <ul className={styles.amounts}>
                <li className={styles.amtRow}>
                  <span>
                    Advance ({b.advancePercentage || 30}%)
                    {b.paymentStatus !== 'unpaid' && (
                      <em className={styles.paidTag}>
                        <Check size={11} strokeWidth={3} /> Paid
                        {stampLabel(b.advancePaidAt) ? ` ${stampLabel(b.advancePaidAt)}` : ''}
                      </em>
                    )}
                  </span>
                  <strong>{formatINR(b.advanceAmount)}</strong>
                </li>
                <li className={styles.amtRow}>
                  <span>
                    Balance
                    <em className={styles.dueTag}>due after the event</em>
                  </span>
                  <strong>{formatINR(b.balanceAmount)}</strong>
                </li>
                <li className={`${styles.amtRow} ${styles.amtGrand}`}>
                  <span>Grand total</span>
                  <strong>{formatINR(b.amount)}</strong>
                </li>
              </ul>

              {workspaceReady && (
                <button
                  type="button"
                  className={styles.cta}
                  onClick={() => navigate(`/workspace/booked/${b.id}`)}
                >
                  <LayoutDashboard size={16} /> Open event workspace
                </button>
              )}

              {canCancel && (
                <button
                  type="button"
                  className={styles.cancel}
                  onClick={onCancel}
                  disabled={isCancelling}
                >
                  <XCircle size={15} /> {isCancelling ? 'Cancelling…' : 'Cancel booking'}
                </button>
              )}

              {closed && (
                <button
                  type="button"
                  className={styles.cta}
                  onClick={() => navigate('/plan')}
                >
                  Plan another event
                </button>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
