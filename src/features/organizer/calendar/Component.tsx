import { useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Download, Plus } from 'lucide-react';
import { Btn, BtnLink, Card, Notice, formatInr } from '@shared/partner';
import {
  BOOKING_STATUS_LABEL,
  CALENDAR_COPY as COPY,
  CALENDAR_VIEWS,
  WEEKDAYS,
} from './constants';
import type { CalendarDay, CalendarView } from './types';
import styles from './styles.module.css';

export interface CalendarComponentProps {
  viewMonth: Date;
  visibleDays: CalendarDay[];
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  selectedIso: string | null;
  onSelectDay: (iso: string) => void;
  selectedDay: CalendarDay | null;
  onToggleBlocked: (iso: string, blocked: boolean) => void;
  isToggling: boolean;
  onBlockRange: (from: string, to: string) => Promise<boolean>;
  isBlockingRange: boolean;
  rangeError: string | null;
  onExportIcal: () => void;
  canExport: boolean;
}

export function Component({
  viewMonth,
  visibleDays,
  view,
  onViewChange,
  onPrevMonth,
  onNextMonth,
  selectedIso,
  onSelectDay,
  selectedDay,
  onToggleBlocked,
  isToggling,
  onBlockRange,
  isBlockingRange,
  rangeError,
  onExportIcal,
  canExport,
}: CalendarComponentProps) {
  const [rangeOpen, setRangeOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const monthLabel = viewMonth.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <h2 className={styles.month}>{monthLabel}</h2>
        <div className={styles.monthNav}>
          <button type="button" onClick={onPrevMonth} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={onNextMonth} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className={styles.barActions}>
          <div className={styles.segment} role="tablist" aria-label="Calendar view">
            {CALENDAR_VIEWS.map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={v === view}
                className={`${styles.segmentBtn} ${v === view ? styles.segmentOn : ''}`}
                onClick={() => onViewChange(v)}
              >
                {v}
              </button>
            ))}
          </div>
          <Btn kind="outline" sm icon={<Plus size={14} />} onClick={() => setRangeOpen((o) => !o)}>
            {COPY.blockRange}
          </Btn>
          <Btn
            kind="outline"
            sm
            icon={<Download size={14} />}
            onClick={onExportIcal}
            disabled={!canExport}
            title={canExport ? COPY.exportReady : COPY.exportEmpty}
          >
            {COPY.exportIcal}
          </Btn>
        </div>
      </div>

      {rangeOpen && (
        <Card className={styles.rangePanel}>
          <form
            className={styles.rangeForm}
            onSubmit={(e) => {
              e.preventDefault();
              void onBlockRange(from, to).then((done) => {
                if (done) {
                  setRangeOpen(false);
                  setFrom('');
                  setTo('');
                }
              });
            }}
          >
            <label className={styles.rangeField}>
              <span>{COPY.rangeFrom}</span>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} required />
            </label>
            <label className={styles.rangeField}>
              <span>{COPY.rangeTo}</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} required />
            </label>
            <Btn type="submit" sm disabled={isBlockingRange}>
              {isBlockingRange ? 'Blocking…' : COPY.rangeApply}
            </Btn>
            <Btn kind="ghost" sm onClick={() => setRangeOpen(false)}>
              {COPY.rangeCancel}
            </Btn>
          </form>
        </Card>
      )}

      {rangeError && (
        <Notice tone="amber" icon={<AlertCircle size={15} />}>
          {rangeError}
        </Notice>
      )}

      <div className={styles.layout}>
        <Card className={styles.gridCard}>
          <div className={styles.weekdays}>
            {WEEKDAYS.map((w, i) => (
              <span key={`wd-${i}`} className={styles.weekday}>
                {w}
              </span>
            ))}
          </div>
          <div className={styles.grid}>
            {visibleDays.map((d) => (
              <button
                key={d.iso}
                type="button"
                className={`${styles.day} ${styles[d.status]} ${d.iso === selectedIso ? styles.selected : ''}`}
                disabled={!d.inMonth}
                aria-label={d.inMonth ? `${d.iso} — ${d.status}` : undefined}
                onClick={() => onSelectDay(d.iso)}
              >
                {d.inMonth && <span className={styles.dayNum}>{d.date.getUTCDate()}</span>}
                {d.status === 'booked' && <span className={styles.dayTag}>{COPY.booked}</span>}
              </button>
            ))}
          </div>
        </Card>

        <aside className={styles.rail}>
          <Card className={styles.detailCard}>
            {!selectedDay ? (
              <p className={styles.hint}>{COPY.hint}</p>
            ) : (
              <>
                <div className={styles.detailHead}>
                  <span
                    className={`${styles.dateTile} ${selectedDay.status !== 'booked' ? styles.dateTileMuted : ''}`}
                  >
                    {selectedDay.date.getUTCDate()}
                  </span>
                  <div className={styles.detailTitle}>
                    <strong>
                      {selectedDay.booking?.title ??
                        (selectedDay.status === 'blocked'
                          ? COPY.blocked
                          : selectedDay.status === 'past'
                            ? 'Past date'
                            : COPY.available)}
                    </strong>
                    <span className={styles.detailSub}>
                      {selectedDay.booking
                        ? [COPY.booked, selectedDay.booking.location].filter(Boolean).join(' · ')
                        : selectedDay.iso}
                    </span>
                  </div>
                </div>

                {selectedDay.booking ? (
                  <>
                    <dl className={styles.rows}>
                      <div className={styles.row}>
                        <dt>{COPY.customer}</dt>
                        <dd>{selectedDay.booking.customerName || '—'}</dd>
                      </div>
                      <div className={styles.row}>
                        <dt>{COPY.value}</dt>
                        <dd>{formatInr(selectedDay.booking.amount)}</dd>
                      </div>
                      <div className={styles.row}>
                        <dt>{COPY.status}</dt>
                        <dd>{BOOKING_STATUS_LABEL[selectedDay.booking.status]}</dd>
                      </div>
                    </dl>
                    <BtnLink
                      kind="outline"
                      sm
                      full
                      to={`/organizer/events/${selectedDay.booking.bookingId}`}
                      className={styles.viewBtn}
                    >
                      {COPY.viewEvent}
                    </BtnLink>
                  </>
                ) : selectedDay.status === 'past' ? (
                  <p className={styles.hint}>{COPY.pastDate}</p>
                ) : (
                  <Btn
                    kind="outline"
                    sm
                    full
                    className={styles.viewBtn}
                    disabled={isToggling}
                    onClick={() => onToggleBlocked(selectedDay.iso, selectedDay.status !== 'blocked')}
                  >
                    {selectedDay.status === 'blocked' ? COPY.unblockThis : COPY.blockThis}
                  </Btn>
                )}
              </>
            )}
          </Card>

          <div className={styles.legend}>
            <span>
              <i className={styles.swBooked} /> {COPY.booked}
            </span>
            <span>
              <i className={styles.swBlocked} /> {COPY.blocked}
            </span>
            <span>
              <i className={styles.swAvailable} /> {COPY.available}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Component;
