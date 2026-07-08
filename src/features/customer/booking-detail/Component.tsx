import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Calendar, MapPin, Wallet, ListChecks, History, Check, XCircle, LayoutDashboard,
} from 'lucide-react';
import { formatINR } from '@features/customer/quotes/transform';
import type { ApiBooking } from '@features/customer/booking/types';
import { STATUS_META, CANCELLABLE } from './constants';
import styles from './styles.module.css';

function dateLabel(iso?: string): string {
  if (!iso) return 'TBC';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function timelineDate(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export interface BookingDetailComponentProps {
  booking: ApiBooking;
  isCancelling: boolean;
  onCancel: () => void;
}

const CLOSED = new Set(['cancelled', 'rejected']);

export function Component({ booking: b, isCancelling, onCancel }: BookingDetailComponentProps) {
  const navigate = useNavigate();
  const status = STATUS_META[b.status];
  const canCancel = CANCELLABLE.includes(b.status);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <button type="button" className={styles.back} onClick={() => navigate(-1)} aria-label="Back">
            <ChevronLeft size={18} />
          </button>
          <span className={styles.avatar} style={{ backgroundColor: b.organizer?.avatarColor ?? '#7c5bd6' }}>
            {b.organizer?.initials ?? '★'}
          </span>
          <div className={styles.heroInfo}>
            <span className={styles.ref}>{b.ref}</span>
            <h1 className={styles.title}>{b.title}</h1>
            <p className={styles.sub}>{b.organizer?.name ?? 'Organizer'} · {b.daysToGo} days to go</p>
          </div>
          <span className={`${styles.badge} ${styles[status.cls]}`}>{status.label}</span>
        </section>

        <div className={styles.grid}>
          <div>
            <section className={styles.panel}>
              <h3 className={styles.panelTitle}><LayoutDashboard size={17} /> Booking details</h3>
              <ul className={styles.rows}>
                <li className={styles.row}>
                  <span className={styles.rIcon}><Calendar size={16} /></span>
                  <div className={styles.rText}><small>Event date</small><strong>{dateLabel(b.eventDate)}</strong></div>
                </li>
                <li className={styles.row}>
                  <span className={styles.rIcon}><MapPin size={16} /></span>
                  <div className={styles.rText}><small>Location</small><strong>{b.location || 'TBC'}</strong></div>
                </li>
                <li className={styles.row}>
                  <span className={styles.rIcon}><ListChecks size={16} /></span>
                  <div className={styles.rText}><small>Occasion</small><strong>{b.occasion || '—'}</strong></div>
                </li>
              </ul>

              <div style={{ marginTop: 16 }}>
                <div className={styles.bar}><span className={styles.fill} style={{ width: `${b.progress}%` }} /></div>
                <ul className={styles.steps}>
                  {b.steps.map((s) => (
                    <li key={s.label} className={`${styles.step} ${s.done ? '' : styles.stepMuted}`}>
                      <span className={`${styles.stepDot} ${s.done ? styles.stepDone : ''}`}>{s.done && <Check size={11} strokeWidth={3} />}</span>
                      {s.label}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className={styles.panel} style={{ marginTop: 20 }}>
              <h3 className={styles.panelTitle}><History size={17} /> Booking timeline</h3>
              <ul className={styles.timeline}>
                {b.timeline.map((e, i) => (
                  <li key={`${e.status}-${i}`} className={styles.tItem}>
                    <span className={`${styles.tDot} ${CLOSED.has(e.status) ? styles.tDotMuted : ''}`} />
                    <div className={styles.tBody}>
                      <span className={styles.tLabel}>{e.label}</span>
                      {e.note && <span className={styles.tNote}>{e.note}</span>}
                      {timelineDate(e.at) && <span className={styles.tAt}>{timelineDate(e.at)}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className={styles.panel}>
            <h3 className={styles.panelTitle}><Wallet size={17} /> Payment</h3>
            <div className={styles.amountBox}>
              <div className={styles.amtRow}><span>Advance (30%)</span><strong>{formatINR(b.advanceAmount)}</strong></div>
              <div className={styles.amtRow}><span>Balance later</span><strong>{formatINR(b.balanceAmount)}</strong></div>
              <div className={`${styles.amtRow} ${styles.amtGrand}`}><span>Grand total</span><strong>{formatINR(b.amount)}</strong></div>
            </div>

            <button type="button" className={styles.cta} onClick={() => navigate('/workspace')}>
              <LayoutDashboard size={16} /> Go to workspace
            </button>

            {canCancel && (
              <button type="button" className={styles.cancel} onClick={onCancel} disabled={isCancelling}>
                <XCircle size={15} /> {isCancelling ? 'Cancelling…' : 'Cancel booking'}
              </button>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
